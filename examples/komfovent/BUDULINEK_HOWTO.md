# HOWTO: Komfovent C4 with the budulinek Arduino gateway

Alternative to the Waveshare gateway from [HOWTO.md](HOWTO.md): an open-source Modbus TCP ↔ RTU gateway built from an Arduino, a WIZnet Ethernet module and an RS485 module, running [budulinek/arduino-modbus-rtu-tcp-gateway](https://github.com/budulinek/arduino-modbus-rtu-tcp-gateway). The wall panel stays connected.

> **Status: not tested on the Komfovent yet.** Everything below follows from the gateway's source code and the measurements made with the Waveshare gateway (panel polls ID 254 once per second, the bus is idle ~96 % of the time, the unit answers within ~30 ms). Fill in the [test log](#8-test-log) when trying it.

- Home Assistant configuration and the Komfovent Card are the same as in [HOWTO.md](HOWTO.md) – only the gateway changes, it takes over the Waveshare IP.
- Rough hardware cost 15–25 €.

## Contents

1. [Why this gateway](#1-why-this-gateway)
2. [Hardware](#2-hardware)
3. [Wiring](#3-wiring)
4. [Firmware](#4-firmware)
5. [Gateway settings](#5-gateway-settings)
6. [Test](#6-test)
7. [Troubleshooting](#7-troubleshooting)
8. [Test log](#8-test-log)

## 1. Why this gateway

| | Waveshare RS485 TO POE ETH (B) | budulinek gateway |
| --- | --- | --- |
| Software | closed | open source, settings in a web UI and in `advanced_settings.h` |
| Waiting for an idle bus | *RS485 bus conflict detection* (only with *Multi-host non-storage type*) | built in: every received byte postpones the next transmission by the *Inter-frame Delay* |
| Panel traffic | forwarded to the TCP client, pymodbus logs `got id=254, Skipping` | dropped; only a valid response (CRC) from the queried ID while a request is pending is forwarded |
| Diagnostics | none | Modbus statistics (responded / invalid response / timeout), slave scan 1–247 after boot, raw RTU request from the browser |
| Power | PoE or 6–36 V | regulated 5 V (DC-DC from the panel's 20 V) |
| RS485 isolation | yes | no (fine when powered from the same unit) |
| TCP connections | several | 4 sockets on a Nano (Home Assistant needs one) |

## 2. Hardware

| Part | Note |
| --- | --- |
| Arduino Nano (ATmega328) + W5500 module, or one ATmega328 + W5500 board (e.g. Keyestudio) | Nano/Uno/Mega are supported; ENC28J60 Ethernet does **not** work. ESP32 is not supported by this firmware. |
| TTL → RS485 module with **automatic direction control** (MAX13487, "XY-017", "XY-485") | Avoid the bare MAX485 modules with DE/RE pins. Some modules swap TXD/RXD. |
| DC-DC step-down 20 V → 5 V (MP1584, LM2596, …) | The gateway needs a regulated 5 V supply, max 5.5 V. Do not feed 20 V to the Nano's VIN. |
| RJ45 splitter/coupler and cable | Tapped in parallel to the panel cable. |

## 3. Wiring

J1 numbering as in the Komfovent drawing (see [HOWTO.md – Wiring](HOWTO.md#2-wiring), checked with a multimeter: pin 3 ≈ +20 V against pin 6).

```
C4 J1 (RJ45)             Gateway
───────────────────────────────────────────────────────────────
Pin 3  +20 V  ──► DC-DC IN+ ──► 5 V ──► Nano 5V, RS485 VCC, W5500 (5 V input)*
Pin 6  GND    ──► DC-DC IN− = common GND (Nano, RS485, W5500)
Pin 4  A      ──► RS485 module A
Pin 5  B      ──► RS485 module B

RS485 module TXD / RXD ──► Nano D0 (RX) / D1 (TX)   (swap if nothing arrives)
W5500 SPI: CS → D10, MOSI → D11, MISO → D12, SCK → D13, RST → D7 (optional, power-on reset fix)
```

\* A W5500 module without its own regulator needs 3.3 V.

- Set the DC-DC output to 5.0 V **before** connecting the Nano.
- On a Nano the RS485 serial port is the USB port: **disconnect the RS485 module and J1 while uploading firmware.**

## 4. Firmware

1. Download the repository, open `arduino-modbus-rtu-tcp-gateway/arduino-modbus-rtu-tcp-gateway.ino` in the Arduino IDE.
2. Library manager: install **Ethernet**, **CircularBuffer**, **StreamLib**.
3. In `advanced_settings.h` set the defaults for the Komfovent (they can also be changed later in the web UI):

   ```cpp
   #define DEFAULT_STATIC_IP { 192, 168, 100, 200 }   // the Waveshare address, HA YAML stays unchanged
   #define DEFAULT_GATEWAY   { 192, 168, 100, 1 }
   const uint16_t DEFAULT_BAUD_RATE = 192;            // 19200 (value is baud / 100)
   const byte DEFAULT_SERIAL_CONFIG = SERIAL_8E1;     // already the default, C4 is fixed at 8E1
   const byte DEFAULT_FRAME_DELAY = 50;               // ms of bus silence before sending (see below)
   const uint16_t DEFAULT_RESPONSE_TIMEPOUT = 500;    // ms
   const byte DEFAULT_ATTEMPTS = 3;
   ```

   With an auto-direction module leave `RS485_CONTROL_PIN` as it is (pin 6 stays unused).
4. If the sketch does not fit into the Nano's flash, comment out `#define ENABLE_EXTENDED_WEBUI` and `#define ENABLE_DHCP`.
5. Board *Arduino Nano* (try *ATmega328P (Old Bootloader)* if the upload fails), upload.

Settings live in EEPROM; *Tools → Load Default Settings* in the web UI restores the values from `advanced_settings.h`.

## 5. Gateway settings

Keep the Waveshare disconnected (same IP), plug the gateway into the LAN and open `http://192.168.100.200` (factory default without step 4: `http://192.168.1.254`).

| Page | Setting | Value |
| --- | --- | --- |
| IP Settings | Static IP / Submask / Gateway | 192.168.100.200 / 255.255.255.0 / 192.168.100.1 |
| TCP/UDP Settings | Modbus TCP Port | 502 |
| | Modbus Mode | **Modbus TCP/UDP** (not RTU over TCP) |
| | Modbus TCP Idle Timeout | 600 s (longer than the Home Assistant scan interval) |
| RTU Settings | Baud Rate / Data Bits / Parity / Stop Bits | **19200 / 8 / Even / 1** |
| | Inter-frame Delay | **50 ms** |
| | Response Timeout | 500 ms |
| | Attempts | 3 |

**Why 50 ms Inter-frame Delay:** every byte the gateway receives – including the panel's requests and the unit's answers to them – postpones its next transmission by this delay. 50 ms is longer than the unit's answer to the panel (~30 ms), so the gateway never talks between a panel request and its response, and much shorter than the ~950 ms of silence per second. The field is one byte, so at most 255 ms.

**Direction switching:** auto-direction RS485 modules need time to switch from sending to receiving (up to ~100 ms on slow modules, see the gateway's README). The C4 answers after ~15–30 ms; if responses get lost, use a fast module (MAX13487) or one with DE/RE on pin 6.

## 6. Test

1. **Boot scan** – after power-up the gateway scans IDs 1–247 (two dummy requests per ID, ~50 s of bus traffic; it waits for the idle bus like any request). *Modbus Status → Modbus Slaves* should list **0x14** (= 20) as *Slave Responded*. The unit answers the dummy request with an exception, which still counts as a response. ID 254 is outside the scan range.
2. **Raw request** – *Modbus Status → Modbus RTU Request*: `14 03 03 E8 00 01` (ID 20, read register 1001 = Season). The response starts with `14 03 02`.
3. **Scripts** from [`tools/`](tools), with the panel connected:

   ```bash
   python tools/komfovent_test.py 192.168.100.200
   python tools/komfovent_test.py 192.168.100.200 --id 20 --loop 300
   ```

   Compare the load test with the Waveshare result (99.7 %).
4. **Statistics** – *Modbus Status → Modbus Statistics*: *Invalid RTU Response* grows all the time – that is the dropped panel traffic, not an error. Watch *Response Timeout* and *Slave Failed to Respond* instead.
5. **Home Assistant** – no YAML change needed (same IP, `type: tcp`, `slave: 20`). The `pymodbus.logging: error` logger line is no longer needed, because the gateway does not forward the panel's frames.
6. Check that the wall panel shows no communication error.

## 7. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Web UI not reachable | Wrong IP, W5500 not initialised after power-up | Try 192.168.1.254; wire RST → D7 (see the gateway's *Ethernet Power On Reset Issue*) |
| Upload fails | RS485 module on D0/D1, wrong bootloader | Disconnect RS485 and J1 during upload; try *Old Bootloader* |
| RTU Data TX grows, RX stays 0 | TXD/RXD swapped or A/B swapped | Swap TXD/RXD on the module, then A/B |
| Only *Invalid RTU Response*, nothing responds | Parity/baud wrong | 19200 8E1 (fixed on the C4) |
| *Response Timeout* while the bus is fine | Module switches direction too slowly | Faster module (MAX13487) or DE/RE on pin 6 |
| Panel shows communication errors | Collisions | Increase Inter-frame Delay (e.g. 80 ms), lengthen the Home Assistant scan intervals |
| Home Assistant connection drops | All sockets in use (4 on a Nano) | Close other Modbus clients (test scripts, VirCom) |

## 8. Test log

| Date | Hardware | Firmware / settings | Boot scan | Load test (`--loop 300`) | Panel OK | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |
