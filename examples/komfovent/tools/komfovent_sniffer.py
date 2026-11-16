#!/usr/bin/env python3
"""
Komfovent C4 – passive RS485 bus sniffer through a Waveshare RS485 TO POE ETH (B)

The script SENDS NOTHING – it only listens, so panel <-> unit traffic is not disturbed.

WAVESHARE SETUP (web page / VirCom):
  - Protocol / Transfer protocol:  None   (transparent, NOT "Modbus TCP to RTU")
  - Work mode: TCP Server, port 502 (or another one – pass it with --port)
  - Serial: 19200, 8, Even, 1
  - Set "Max Interval" / packet interval as small as possible (e.g. 3 ms),
    otherwise the gateway merges frames into one TCP packet and timing gets coarse.
  - Disable the Home Assistant Modbus hub meanwhile (the gateway accepts few TCP clients).
  - Keep the wall panel CONNECTED – that is the point.

Usage (plain Python 3.8+, no libraries):
  python komfovent_sniffer.py 192.168.1.200
  python komfovent_sniffer.py 192.168.1.200 --time 300 --csv log.csv
  python komfovent_sniffer.py 192.168.1.200 --quiet      # statistics only
Stop with Ctrl+C or after --time; statistics are printed at the end.
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
    """Time a frame occupies the bus, in seconds."""
    return nbytes * BITS_PER_CHAR / BAUD


def candidate_lengths(buf: bytes):
    """Possible lengths of a Modbus RTU frame starting at buf[0] (request or response)."""
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
    """Length of a valid frame, None = need more data, -1 = drop a byte (resync)."""
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
    return (f"  {name:<44} min {min(v):7.1f}  median {statistics.median(v):7.1f}  "
            f"mean {statistics.mean(v):7.1f}  max {max(v):7.1f} {unit}  (n={len(v)})")


def main():
    ap = argparse.ArgumentParser(description="Passive Modbus RTU sniffer through a Waveshare gateway (transparent mode)")
    ap.add_argument("host")
    ap.add_argument("--port", type=int, default=502)
    ap.add_argument("--time", type=float, default=0, help="duration in s (0 = until Ctrl+C)")
    ap.add_argument("--csv", help="save all frames to CSV")
    ap.add_argument("--quiet", action="store_true", help="do not print individual frames")
    args = ap.parse_args()

    try:
        sock = socket.create_connection((args.host, args.port), timeout=5)
    except OSError as e:
        sys.exit(f"Cannot connect to {args.host}:{args.port}: {e}")
    sock.settimeout(0.5)
    print(f"Connected to {args.host}:{args.port} – listening (sending nothing). Ctrl+C = stop.\n")

    csv_w = None
    if args.csv:
        csv_f = open(args.csv, "w", newline="", encoding="utf-8")
        csv_w = csv.writer(csv_f)
        csv_w.writerow(["t_s", "dir", "id", "fc", "len", "desc", "hex"])

    buf = bytearray()
    times = []                    # arrival time of each byte in buf
    t0 = time.monotonic()
    pending = None                # last request without a response: (t, frame)
    last_frame_end = None         # (t, frame, is_req) of the last frame
    junk = 0
    frames = {"req": 0, "rsp": 0}
    per_id = {}
    req_periods = {}              # uid -> [period between requests]
    last_req_t = {}
    latencies = []                # request -> response
    gaps = []                     # estimated bus silence between a response and the next request
    unanswered = 0

    try:
        while True:
            if args.time and time.monotonic() - t0 > args.time:
                break
            try:
                chunk = sock.recv(1024)
                if not chunk:
                    print("Connection closed by the gateway.")
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
                t = times[n - 1]          # arrival time of the frame end
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
                    if last_frame_end and not last_frame_end[2]:   # previous frame was a response
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
    print(f"STATISTICS  ({dur:.1f} s)")
    print(f"  requests: {frames['req']}   responses: {frames['rsp']}   unanswered: {unanswered}   "
          f"dropped bytes (CRC error/noise): {junk}")
    print(f"  requests per Modbus ID: {per_id}")
    for uid, per in req_periods.items():
        print(fmt_stats(f"request period for ID {uid}", per))
    print(fmt_stats("unit response time (request -> response)", latencies))
    print(fmt_stats("bus silence (response -> next request)", gaps))

    print("\nASSESSMENT")
    if frames["req"] == 0 and junk == 0:
        print("  No data. Check: gateway protocol 'None', panel connected, A/B, 19200 baud.")
    elif frames["req"] == 0 and junk > 0:
        print("  Data arrives but no valid frame -> A/B swapped or wrong baud/parity (C4: 19200 8E1).")
    else:
        if junk > frames["req"]:
            print("  Many dropped bytes – noise, wrong parity or merged frames (lower Max Interval).")
        if gaps:
            med = statistics.median(gaps) * 1000
            if med > 200:
                print(f"  Typically ~{med:.0f} ms of silence between panel requests -> a second master that waits "
                      "for an idle bus (gateway bus conflict detection, 20–50 ms) should work well.")
            elif med > 30:
                print(f"  Silence ~{med:.0f} ms – tight. Waiting for an idle bus is possible but will collide sometimes.")
            else:
                print(f"  Only ~{med:.0f} ms of silence – the bus is almost always busy, a real proxy (2 ports) is needed.")
        print("  Note: times come from TCP packet arrival; accuracy depends on the gateway settings (± a few ms).")


if __name__ == "__main__":
    main()
