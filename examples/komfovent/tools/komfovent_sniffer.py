#!/usr/bin/env python3
"""
Komfovent C4 – pasívny odpočúvač RS485 zbernice cez Waveshare RS485 to POE ETH (B)

Skript NIČ NEVYSIELA – iba počúva, takže komunikáciu panel <-> jednotka neruší.

PRÍPRAVA WAVESHARE (webové rozhranie / Vircom):
  - Protocol / Transfer protocol:  None   (transparentný režim, NIE "Modbus TCP to RTU")
  - Work mode: TCP Server, port 502 (alebo iný – zadaj cez --port)
  - Serial: 19200, 8, Even, 1
  - Ak má nastavenie typu "packet interval / frame gap / packing time",
    daj ho čo najmenšie (napr. 1–5 ms) – inak Waveshare zlepí viac rámcov
    do jedného TCP paketu a časy budú menej presné.
  - V HA dočasne vypni modbus (Waveshare často prijme len 1 TCP klienta).
  - Ovládací panel nechaj ZAPOJENÝ – o to ide.

Spustenie (stačí čistý Python 3.8+, žiadne knižnice):
  python komfovent_sniffer.py 192.168.100.200
  python komfovent_sniffer.py 192.168.100.200 --time 300 --csv log.csv
  python komfovent_sniffer.py 192.168.100.200 --quiet      # len štatistika
Ukončenie: Ctrl+C alebo po uplynutí --time. Na konci vypíše štatistiku.
"""
import argparse
import csv
import socket
import statistics
import sys
import time

BAUD = 19200
BITS_PER_CHAR = 11          # 1 start + 8 data + 1 parity + 1 stop (8E1)
MAX_FRAME = 256


def crc16(data: bytes) -> int:
    crc = 0xFFFF
    for b in data:
        crc ^= b
        for _ in range(8):
            crc = (crc >> 1) ^ 0xA001 if crc & 1 else crc >> 1
    return crc


def crc_ok(frame: bytes) -> bool:
    return len(frame) >= 4 and crc16(frame[:-2]) == (frame[-2] | frame[-1] << 8)


def airtime(nbytes: int) -> float:
    """Čas vysielania rámca na zbernici v sekundách."""
    return nbytes * BITS_PER_CHAR / BAUD


def candidate_lengths(buf: bytes):
    """Možné dĺžky Modbus RTU rámca začínajúceho na buf[0] (request aj response)."""
    fc = buf[1]
    if fc & 0x80:
        return [5]                              # exception response
    if fc in (1, 2, 3, 4):
        c = [8]                                 # request
        if len(buf) >= 3:
            c.append(5 + buf[2])                # response: id fc bc data.. crc
        return c
    if fc in (5, 6):
        return [8]                              # request aj echo response
    if fc in (15, 16):
        c = [8]                                 # response
        if len(buf) >= 7:
            c.append(9 + buf[6])                # request: id fc addr cnt bc data.. crc
        return c
    return []


def try_parse(buf: bytes):
    """Vráti dĺžku platného rámca, None = treba viac dát, -1 = zahoď bajt (resync)."""
    if len(buf) < 4:
        return None
    cands = sorted(set(candidate_lengths(buf)))
    if not cands:
        return -1
    for n in cands:
        if n <= len(buf) and crc_ok(buf[:n]):
            return n
    if max(cands) <= len(buf) or len(buf) > MAX_FRAME:
        return -1
    return None


def describe(frame: bytes, is_req: bool) -> str:
    uid, fc = frame[0], frame[1]
    if fc & 0x80:
        return f"EXCEPTION fc={fc & 0x7F:02X} code={frame[2]}"
    if is_req:
        if fc in (3, 4):
            a = (frame[2] << 8 | frame[3]) + 1
            n = frame[4] << 8 | frame[5]
            return f"READ  {a}..{a + n - 1} ({n} reg)"
        if fc == 6:
            a = (frame[2] << 8 | frame[3]) + 1
            v = frame[4] << 8 | frame[5]
            return f"WRITE {a} = {v}"
        if fc == 16:
            a = (frame[2] << 8 | frame[3]) + 1
            n = frame[4] << 8 | frame[5]
            vals = [frame[7 + 2 * i] << 8 | frame[8 + 2 * i] for i in range(n)]
            return f"WRITE {a}..{a + n - 1} = {vals}"
    else:
        if fc in (3, 4):
            bc = frame[2]
            vals = [frame[3 + 2 * i] << 8 | frame[4 + 2 * i] for i in range(bc // 2)]
            return f"DATA  {vals}"
        if fc in (6, 16):
            return "ACK"
    return f"fc={fc:02X} {frame.hex()}"


def fmt_stats(name, values, unit="ms", scale=1000):
    if not values:
        return f"  {name:<44} —"
    v = [x * scale for x in values]
    return (f"  {name:<44} min {min(v):7.1f}  medián {statistics.median(v):7.1f}  "
            f"priemer {statistics.mean(v):7.1f}  max {max(v):7.1f} {unit}  (n={len(v)})")


def main():
    ap = argparse.ArgumentParser(description="Pasívny Modbus RTU odpočúvač cez Waveshare (transparentný režim)")
    ap.add_argument("host")
    ap.add_argument("--port", type=int, default=502)
    ap.add_argument("--time", type=float, default=0, help="dĺžka merania v s (0 = do Ctrl+C)")
    ap.add_argument("--csv", help="uložiť všetky rámce do CSV")
    ap.add_argument("--quiet", action="store_true", help="nevypisovať jednotlivé rámce")
    args = ap.parse_args()

    try:
        sock = socket.create_connection((args.host, args.port), timeout=5)
    except OSError as e:
        sys.exit(f"Neviem sa pripojiť na {args.host}:{args.port}: {e}")
    sock.settimeout(0.5)
    print(f"Pripojené na {args.host}:{args.port} – počúvam (nič nevysielam). Ctrl+C = koniec.\n")

    csv_w = None
    if args.csv:
        csv_f = open(args.csv, "w", newline="", encoding="utf-8")
        csv_w = csv.writer(csv_f)
        csv_w.writerow(["t_s", "dir", "id", "fc", "len", "desc", "hex"])

    buf = bytearray()
    times = []                    # čas prijatia pre každý bajt v buf
    t0 = time.monotonic()
    pending = None                # posledná otázka bez odpovede: (t, frame)
    last_frame_end = None         # (t, frame) posledného rámca
    junk = 0
    frames = {"req": 0, "rsp": 0}
    per_id = {}
    req_periods = {}              # uid -> [perióda medzi otázkami]
    last_req_t = {}
    latencies = []                # otázka -> odpoveď
    gaps = []                     # odhad ticha na zbernici medzi koncom odpovede a ďalšou otázkou
    unanswered = 0

    try:
        while True:
            if args.time and time.monotonic() - t0 > args.time:
                break
            try:
                chunk = sock.recv(1024)
                if not chunk:
                    print("Spojenie ukončené Waveshare-om.")
                    break
                now = time.monotonic() - t0
                buf += chunk
                times += [now] * len(chunk)
            except socket.timeout:
                pass

            while True:
                n = try_parse(bytes(buf))
                if n is None:
                    break
                if n == -1:
                    del buf[0]
                    del times[0]
                    junk += 1
                    continue
                frame = bytes(buf[:n])
                t = times[n - 1]          # čas prijatia konca rámca
                del buf[:n]
                del times[:n]
                uid, fc = frame[0], frame[1]

                # request vs response
                if pending and pending[1][0] == uid and (pending[1][1] & 0x7F) == (fc & 0x7F) and \
                        (fc & 0x80 or fc in (5, 6, 15, 16) or (fc in (1, 2, 3, 4) and n % 2 == 1)):
                    is_req = False
                elif fc in (1, 2, 3, 4):
                    is_req = (n == 8)
                elif fc in (15, 16):
                    is_req = (n != 8)
                else:
                    is_req = not fc & 0x80

                if is_req:
                    frames["req"] += 1
                    per_id[uid] = per_id.get(uid, 0) + 1
                    if pending:
                        unanswered += 1
                    if uid in last_req_t:
                        req_periods.setdefault(uid, []).append(t - last_req_t[uid])
                    last_req_t[uid] = t
                    if last_frame_end and not last_frame_end[2]:   # predchádzala odpoveď
                        gap = (t - airtime(n)) - last_frame_end[0]
                        if gap >= 0:
                            gaps.append(gap)
                    pending = (t, frame)
                    tag = "REQ"
                    extra = ""
                else:
                    frames["rsp"] += 1
                    lat = t - pending[0] if pending else None
                    if lat is not None:
                        latencies.append(lat)
                    pending = None
                    tag = "RSP"
                    extra = f"  (+{lat * 1000:.0f} ms)" if lat is not None else ""

                last_frame_end = (t, frame, is_req)
                desc = describe(frame, is_req)
                if not args.quiet:
                    print(f"{t:9.3f}  {tag}  ID{uid:<3} FC{fc:02X}  {desc}{extra}")
                if csv_w:
                    csv_w.writerow([f"{t:.4f}", tag, uid, fc, n, desc, frame.hex()])
    except KeyboardInterrupt:
        pass
    finally:
        sock.close()
        if csv_w:
            csv_f.close()

    dur = time.monotonic() - t0
    print("\n" + "=" * 100)
    print(f"ŠTATISTIKA  (meranie {dur:.1f} s)")
    print(f"  otázky: {frames['req']}   odpovede: {frames['rsp']}   bez odpovede: {unanswered}   "
          f"zahodené bajty (chyba CRC/šum): {junk}")
    print(f"  otázky podľa Modbus ID: {per_id}")
    for uid, per in req_periods.items():
        print(fmt_stats(f"perióda otázok pre ID {uid}", per))
    print(fmt_stats("odozva jednotky (otázka -> odpoveď)", latencies))
    print(fmt_stats("ticho na zbernici (odpoveď -> ďalšia otázka)", gaps))

    print("\nVYHODNOTENIE")
    if frames["req"] == 0 and junk == 0:
        print("  Žiadne dáta. Skontroluj: Waveshare v režime 'None', panel zapojený, A/B, baud 19200.")
    elif frames["req"] == 0 and junk > 0:
        print("  Prichádzajú dáta, ale žiadny platný rámec -> zlý baud/parita (skús 8N1) alebo prehodené A/B.")
    else:
        if junk > frames["req"]:
            print("  Veľa zahodených bajtov – možno rušenie, zlá parita alebo zlepené rámce (zníž packet interval).")
        if gaps:
            med = statistics.median(gaps) * 1000
            if med > 200:
                print(f"  Medzi otázkami panelu je typicky ~{med:.0f} ms ticha -> druhý master s čakaním na voľnú "
                      "zbernicu (napr. budulinek gateway, frame delay 20–50 ms) má dobrú šancu fungovať.")
            elif med > 30:
                print(f"  Ticho ~{med:.0f} ms – tesné. Proxy/čakanie na voľnú zbernicu možné, ale bude občas kolidovať.")
            else:
                print(f"  Ticho len ~{med:.0f} ms – zbernica je takmer stále obsadená, treba skutočný proxy (2 porty).")
        print("  Pozn.: časy sú merané podľa príchodu TCP paketov, presnosť závisí od nastavenia Waveshare (±pár ms).")


if __name__ == "__main__":
    main()
