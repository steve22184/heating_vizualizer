#!/usr/bin/env python3
"""
Fake Komfovent C4 – simulátor jednotky
(inšpirované scripts/modbus_server.py z github.com/AlgMi/komfovent_c4)

Slúži dvom účelom:

A) TEST HOME ASSISTANTU BEZ JEDNOTKY (Modbus TCP)
     python fake_c4.py --tcp                 (počúva na porte 5020)
   V HA dočasne zmeň v modbus hube host na IP tohto PC a port na 5020.
   Ak entity ukazujú hodnoty, YAML (adresy, ID, dátové typy) je v poriadku.

B) TEST WAVESHARE + HA BEZ JEDNOTKY (Modbus RTU cez USB-RS485 prevodník)
     python fake_c4.py --serial COM5            (Windows)
     python fake_c4.py --serial /dev/ttyUSB0    (Linux)
   USB-RS485 prevodník pripoj na svorky Waveshare: A->TDA, B->TDB, GND->GND.
   Waveshare nechaj v režime "Modbus TCP to RTU", 19200 8E1.
   Ak HA / komfovent_test.py dostane odpovede, Waveshare aj HA fungujú
   a problém je čisto na strane jednotky (piny, A/B, parita, Modbus ID).

Odpovedá na Modbus ID z --ids (default 1, 20, 254); na iné ID mlčí ako skutočná
jednotka. Registre sú z dumpu skutočnej C4 (C4_registers.json, z AlgMi repa).
Kľúče v dumpe sú čísla registrov z manuálu (od 1); na zbernici sa adresuje
číslo - 1, rovnako ako na skutočnej jednotke. Podporuje funkcie 03, 06 a 16.
Neexistujúci register -> výnimka 02 (illegal address). Zápisy sa vypisujú.

Závislosti: žiadne pre --tcp; pre --serial: pip install pyserial
"""
import argparse
import asyncio
import json
import struct
import sys
import time
from pathlib import Path

NAMES = {
    1000: "Start/Stop", 1001: "Season", 1006: "Modbus address", 1100: "Vent level (manual)",
    1102: "Mode", 1111: "OVR enable", 1112: "OVR time", 1201: "Setpoint x10",
    1202: "Temp correction x10",
}


def log(msg: str) -> None:
    print(time.strftime("%H:%M:%S"), msg, flush=True)


def crc16(data: bytes) -> int:
    crc = 0xFFFF
    for b in data:
        crc ^= b
        for _ in range(8):
            crc = (crc >> 1) ^ 0xA001 if crc & 1 else crc >> 1
    return crc


class FakeC4:
    def __init__(self, dump: dict, ids: list[int]):
        # kľúč = číslo registra z manuálu (1-based)
        self.regs = {}
        for start, values in dump.items():
            for i, v in enumerate(values):
                self.regs[int(start) + i] = v & 0xFFFF
        self.ids = set(ids)

    def handle_pdu(self, uid: int, pdu: bytes) -> bytes | None:
        """Spracuje PDU (fc + dáta). Vráti odpoveď PDU alebo None (mlčať)."""
        if uid not in self.ids:
            return None
        fc = pdu[0]
        try:
            if fc == 0x03:
                addr, cnt = struct.unpack(">HH", pdu[1:5])
                regs = range(addr + 1, addr + 1 + cnt)
                if not 1 <= cnt <= 125 or any(r not in self.regs for r in regs):
                    log(f"ID{uid} READ  {addr + 1}..{addr + cnt}  -> výnimka 02 (neexistuje)")
                    return bytes([fc | 0x80, 0x02])
                log(f"ID{uid} READ  {addr + 1}..{addr + cnt}")
                return bytes([fc, cnt * 2]) + b"".join(struct.pack(">H", self.regs[r]) for r in regs)
            if fc == 0x06:
                addr, val = struct.unpack(">HH", pdu[1:5])
                reg = addr + 1
                if reg not in self.regs:
                    return bytes([fc | 0x80, 0x02])
                self.regs[reg] = val
                log(f"ID{uid} WRITE {reg} ({NAMES.get(reg, '?')}) = {val}")
                return pdu[:5]
            if fc == 0x10:
                addr, cnt, bc = struct.unpack(">HHB", pdu[1:6])
                vals = struct.unpack(f">{cnt}H", pdu[6:6 + bc])
                if any(addr + 1 + i not in self.regs for i in range(cnt)):
                    return bytes([fc | 0x80, 0x02])
                for i, v in enumerate(vals):
                    self.regs[addr + 1 + i] = v
                    log(f"ID{uid} WRITE {addr + 1 + i} ({NAMES.get(addr + 1 + i, '?')}) = {v}")
                return pdu[:5]
            return bytes([fc | 0x80, 0x01])          # illegal function
        except (struct.error, IndexError):
            return bytes([fc | 0x80, 0x03])          # illegal data value


# ── Modbus TCP ────────────────────────────────────────────────────────────────

async def tcp_client(dev: FakeC4, reader, writer):
    peer = writer.get_extra_info("peername")
    log(f"TCP klient pripojený: {peer}")
    try:
        while True:
            hdr = await reader.readexactly(7)
            tid, proto, length, uid = struct.unpack(">HHHB", hdr)
            pdu = await reader.readexactly(length - 1)
            resp = dev.handle_pdu(uid, pdu)
            if resp is None:
                continue                              # mlčíme -> klient dostane timeout
            writer.write(struct.pack(">HHHB", tid, proto, len(resp) + 1, uid) + resp)
            await writer.drain()
    except (asyncio.IncompleteReadError, ConnectionError):
        pass
    finally:
        log(f"TCP klient odpojený: {peer}")
        writer.close()


async def run_tcp(dev: FakeC4, host: str, port: int):
    server = await asyncio.start_server(lambda r, w: tcp_client(dev, r, w), host, port)
    log(f"Fake C4 – Modbus TCP na {host}:{port}, ID {sorted(dev.ids)}  (Ctrl+C = koniec)")
    async with server:
        await server.serve_forever()


# ── Modbus RTU (sériová linka) ────────────────────────────────────────────────

def run_serial(dev: FakeC4, port: str, baud: int, parity: str):
    try:
        import serial
    except ImportError:
        sys.exit("Pre --serial treba: pip install pyserial")
    char_t = 11 / baud
    gap = max(3.5 * char_t, 0.00175)                 # koniec rámca podľa Modbus RTU
    ser = serial.Serial(port, baud, bytesize=8, parity=parity, stopbits=1, timeout=gap)
    log(f"Fake C4 – Modbus RTU na {port}, {baud} 8{parity}1, ID {sorted(dev.ids)}  (Ctrl+C = koniec)")
    buf = bytearray()
    while True:
        chunk = ser.read(256)
        if chunk:
            buf += chunk
            continue
        if not buf:
            continue
        frame, buf = bytes(buf), bytearray()         # ticho -> koniec rámca
        if len(frame) < 4 or crc16(frame[:-2]) != (frame[-2] | frame[-1] << 8):
            log(f"zlý rámec / CRC ({len(frame)} B): {frame.hex()}  -> skontroluj baud/paritu/A-B")
            continue
        resp = dev.handle_pdu(frame[0], frame[1:-2])
        if resp is None:
            continue
        out = bytes([frame[0]]) + resp
        c = crc16(out)
        ser.write(out + bytes([c & 0xFF, c >> 8]))
        ser.flush()


def main():
    ap = argparse.ArgumentParser(description="Fake Komfovent C4 (Modbus TCP alebo RTU)")
    mode = ap.add_mutually_exclusive_group(required=True)
    mode.add_argument("--tcp", action="store_true", help="Modbus TCP server")
    mode.add_argument("--serial", metavar="PORT", help="Modbus RTU na sériovom porte (USB-RS485)")
    ap.add_argument("--host", default="0.0.0.0")
    ap.add_argument("--port", type=int, default=5020, help="TCP port (default 5020)")
    ap.add_argument("--baud", type=int, default=19200)
    ap.add_argument("--parity", default="E", choices=["E", "N", "O"])
    ap.add_argument("--ids", default="1,20,254", help="Modbus ID, na ktoré odpovedať (čiarkou)")
    ap.add_argument("--input", default=str(Path(__file__).with_name("C4_registers.json")))
    args = ap.parse_args()

    try:
        dump = json.loads(Path(args.input).read_text())
    except (OSError, json.JSONDecodeError) as e:
        sys.exit(f"Neviem načítať dump {args.input}: {e}")
    dev = FakeC4(dump, [int(x) for x in args.ids.split(",")])

    try:
        if args.tcp:
            asyncio.run(run_tcp(dev, args.host, args.port))
        else:
            run_serial(dev, args.serial, args.baud, args.parity)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
