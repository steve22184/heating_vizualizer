#!/usr/bin/env python3
"""
Komfovent C4 – Modbus communication test through a Waveshare RS485 TO POE ETH (B)

Install:     pip install pymodbus
Waveshare:   Transfer Protocol = Modbus_TCP Protocol (TCP -> RTU gateway), 19200 8E1

1) Find the ID (tries several IDs, reads 1000, 1006 = Modbus address, 1200, 1201):
     python komfovent_test.py 192.168.1.200

2) Load test with the panel connected (error / collision rate):
     python komfovent_test.py 192.168.1.200 --id 20 --loop 300
   (300 reads, one every 0.5 s – prints success rate and response times)

Addresses in this script follow the C4 manual (1-based); the wire address is
adresa - 1, rovnako ako v opravenom HA YAML.
"""
import argparse
import statistics
import sys
import time

from pymodbus.client import ModbusTcpClient

IDS = [1, 20, 254, 2, 3, 4, 5, 10, 100]
REGS = [("Start/Stop (1=running)", 1000), ("Modbus address (reg 1006)", 1006),
        ("Supply temp x10", 1200), ("Setpoint x10", 1201)]


def read(client, doc_addr, count, unit):
    """Read holding registers by manual number. Works with pymodbus 3.0–3.16."""
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
                print(f"  {reg} {name}: timeout – ID {unit} does not answer, skipping")
                break
            if rr.isError():
                # exception response = the unit hears us (communication OK), only address/ID wrong
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
        print(f"The unit answers on ID: {found}")
        print("Use the value of register 1006 as 'slave:' in Home Assistant (never 254).")
    else:
        print("No ID answered. Check Transfer Protocol = Modbus_TCP Protocol,")
        print("that no other client (Home Assistant, VirCom) is connected, and the wiring.")


def loop(client, unit, n, interval):
    ok, err, lat = 0, 0, []
    print(f"Load test: ID {unit}, {n} reads of 1000..1001 every {interval} s (Ctrl+C = stop)\n")
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
                print(f"  #{i}: ERROR ({dt:.0f} ms)")
            if i % 20 == 0:
                print(f"  {i}/{n}  OK {ok}  errors {err}  ({100 * err / i:.1f} %)")
            time.sleep(interval)
    except KeyboardInterrupt:
        pass
    total = ok + err
    print("\n" + "=" * 60)
    if total:
        print(f"Success: {ok}/{total}  ({100 * ok / total:.1f} %),  errors {100 * err / total:.1f} %")
    if lat:
        print(f"Response time of OK reads: min {min(lat):.0f}  median {statistics.median(lat):.0f}  "
              f"max {max(lat):.0f} ms")


def main():
    ap = argparse.ArgumentParser(description="Modbus communication test for a Komfovent C4")
    ap.add_argument("host", nargs="?", default="192.168.1.200")
    ap.add_argument("--port", type=int, default=502)
    ap.add_argument("--id", type=int, help="Modbus ID for the load test")
    ap.add_argument("--loop", type=int, default=0, help="number of reads in the load test")
    ap.add_argument("--interval", type=float, default=0.5, help="interval between reads (s)")
    args = ap.parse_args()

    client = ModbusTcpClient(args.host, port=args.port, timeout=2, retries=0)
    if not client.connect():
        sys.exit(f"Cannot connect to {args.host}:{args.port} – check the IP and that no other "
                 f"client (VirCom, Home Assistant) is connected.")
    try:
        if args.loop:
            if args.id is None:
                sys.exit("--loop needs --id")
            loop(client, args.id, args.loop, args.interval)
        else:
            scan(client)
    finally:
        client.close()


if __name__ == "__main__":
    main()
