#!/usr/bin/env python3
"""
Komfovent C4 – test Modbus komunikácie cez Waveshare RS485 to POE ETH (B)

Inštalácia:  pip install pymodbus
Waveshare:   Transfer Protocol = Modbus_TCP Protocol (brána TCP -> RTU), 19200 8E1

1) Hľadanie ID (skúsi viac ID, prečíta 1000, 1006 = Modbus adresa, 1200, 1201):
     python komfovent_test.py 192.168.100.200

2) Záťažový test s pripojeným panelom (percento chýb / kolízií):
     python komfovent_test.py 192.168.100.200 --id 20 --loop 300
   (300 čítaní, jedno každé 0,5 s – vypíše úspešnosť a časy odozvy)

Adresy v tomto skripte sú podľa manuálu C4 (1-based), na zbernicu sa posiela
adresa - 1, rovnako ako v opravenom HA YAML.
"""
import argparse
import statistics
import sys
import time

from pymodbus.client import ModbusTcpClient

IDS = [1, 20, 254, 2, 3, 4, 5, 10, 100]
REGS = [("Start/Stop (1=beží)", 1000), ("Modbus adresa (reg 1006)", 1006),
        ("Teplota prívodu x10", 1200), ("Žiadaná teplota x10", 1201)]


def read(client, doc_addr, count, unit):
    """Číta holding registre podľa čísla z manuálu. Kompatibilné s pymodbus 3.0–3.16."""
    addr = doc_addr - 1
    try:
        return client.read_holding_registers(addr, count=count, device_id=unit)
    except TypeError:
        return client.read_holding_registers(addr, count=count, slave=unit)


def scan(client):
    found = []
    for unit in IDS:
        print(f"\n--- Modbus ID {unit} ---")
        ok = False
        for name, reg in REGS:
            try:
                rr = read(client, reg, 1, unit)
            except Exception as e:
                print(f"  {reg} {name}: timeout – ID {unit} neodpovedá, preskakujem")
                break
            if rr.isError():
                # odpoveď s výnimkou = jednotka počuje (komunikácia OK), len zlá adresa/ID
                print(f"  {reg} {name}: {rr}")
            else:
                ok = True
                v = rr.registers[0]
                extra = f"  = {v / 10:.1f} °C" if reg in (1200, 1201) else ""
                print(f"  *** {reg} {name}: {v}{extra}")
        if ok:
            found.append(unit)
    print("\n" + "=" * 60)
    if found:
        print(f"Jednotka odpovedá na ID: {found}")
        print("Do HA YAML daj 'slave:' = hodnota registra 1006 (ak odpovedá), inak prvé nájdené ID.")
    else:
        print("Žiadne ID neodpovedalo. Skontroluj Transfer Protocol = Modbus_TCP Protocol,")
        print("či nie je k Waveshare pripojený iný klient (HA, VirCom) a kabeláž.")


def loop(client, unit, n, interval):
    ok, err, lat = 0, 0, []
    print(f"Záťažový test: ID {unit}, {n} čítaní 1000..1001 každých {interval} s (Ctrl+C = koniec)\n")
    try:
        for i in range(1, n + 1):
            t0 = time.monotonic()
            try:
                rr = read(client, 1000, 2, unit)
                good = not rr.isError()
            except Exception:
                good = False
            dt = (time.monotonic() - t0) * 1000
            if good:
                ok += 1
                lat.append(dt)
            else:
                err += 1
                print(f"  #{i}: CHYBA ({dt:.0f} ms)")
            if i % 20 == 0:
                print(f"  {i}/{n}  OK {ok}  chyby {err}  ({100 * err / i:.1f} %)")
            time.sleep(interval)
    except KeyboardInterrupt:
        pass
    total = ok + err
    print("\n" + "=" * 60)
    if total:
        print(f"Úspešnosť: {ok}/{total}  ({100 * ok / total:.1f} %),  chyby {100 * err / total:.1f} %")
    if lat:
        print(f"Odozva OK čítaní: min {min(lat):.0f}  medián {statistics.median(lat):.0f}  "
              f"max {max(lat):.0f} ms")


def main():
    ap = argparse.ArgumentParser(description="Test Modbus komunikácie s Komfovent C4")
    ap.add_argument("host", nargs="?", default="192.168.100.200")
    ap.add_argument("--port", type=int, default=502)
    ap.add_argument("--id", type=int, help="Modbus ID pre záťažový test")
    ap.add_argument("--loop", type=int, default=0, help="počet čítaní v záťažovom teste")
    ap.add_argument("--interval", type=float, default=0.5, help="interval medzi čítaniami (s)")
    args = ap.parse_args()

    client = ModbusTcpClient(args.host, port=args.port, timeout=2, retries=0)
    if not client.connect():
        sys.exit(f"Neviem sa pripojiť na {args.host}:{args.port} – skontroluj IP, alebo či nie je "
                 f"pripojený iný klient (VirCom, HA).")
    try:
        if args.loop:
            if args.id is None:
                sys.exit("Pre --loop zadaj aj --id")
            loop(client, args.id, args.loop, args.interval)
        else:
            scan(client)
    finally:
        client.close()


if __name__ == "__main__":
    main()
