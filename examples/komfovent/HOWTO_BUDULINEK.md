# HOWTO: Komfovent C4 with the budulinek Arduino gateway

Step-by-step from building an open-source Modbus TCP ↔ RTU gateway ([budulinek/arduino-modbus-rtu-tcp-gateway](https://github.com/budulinek/arduino-modbus-rtu-tcp-gateway): Arduino + WIZnet Ethernet + RS485 module) and wiring it to the C4 controller up to the Komfovent Card on a dashboard. The wall panel stays connected and keeps working.

![Komfovent Card](preview.svg)

> **Status: not tested on the Komfovent yet.** The steps follow from the gateway's source code and from measurements on the unit's bus: the panel polls ID 254 once per second, the bus is idle about 96 % of the time and the unit answers within ~30 ms. Fill in the [test log](#10-test-log) when trying it.

- Unit facts (pinout, serial settings, Modbus ID, register map) and how this gateway compares to others are in the [README](README.md).
- Helper scripts are in [`tools/`](tools); they need Python 3.8+ (`komfovent_test.py` also `pip install pymodbus`).
- Rough hardware cost 15–25 €.

## Contents

1. [What you need](#1-what-you-need)
2. [Wiring](#2-wiring)
3. [Firmware](#3-firmware)
4. [Gateway settings](#4-gateway-settings)
5. [Find the Modbus ID and test](#5-find-the-modbus-id-and-test)
6. [Home Assistant configuration](#6-home-assistant-configuration)
7. [Komfovent Card](#7-komfovent-card)
8. [Troubleshooting](#8-troubleshooting)
9. [Reference](#9-reference)
10. [Test log](#10-test-log)

## 1. What you need

| Part | Note |
| --- | --- |
| Arduino Nano (ATmega328) + W5500 module, or one ATmega328 + W5500 board (e.g. Keyestudio) | Nano, Uno and Mega are supported; ENC28J60 Ethernet does **not** work, ESP32 is not supported by this firmware. |
| TTL → RS485 module with **automatic direction control** (MAX13487, "XY-017", "XY-485") | Avoid bare MAX485 modules with DE/RE pins. Some modules swap TXD/RXD. |
| DC-DC step-down 20 V → 5 V (MP1584, LM2596, …) | The gateway needs a regulated 5 V supply, max 5.5 V. Do not feed 20 V to the Nano's VIN. |
| Cable with an RJ45 plug | Tapped in parallel to the panel cable, e.g. with an RJ45 coupler/splitter. |
| Multimeter | To check pins and the DC-DC output before connecting anything. |
| PC with the Arduino IDE and a USB cable | To flash the firmware. |

## 2. Wiring

The C4 talks to its wall panel over RS485 on the RJ45 connector **J1**. The Komfovent drawing numbers the pins on the **plug** of the panel cable – count them the same way, a mirrored count swaps A/B and moves GND.

| J1 pin | Signal | Gateway |
| --- | --- | --- |
| 3 | +20 V DC (panel supply) | DC-DC input + |
| 4 | A (D+) | RS485 module A |
| 5 | B (D−) | RS485 module B |
| 6 | GND | DC-DC input −, common GND |
| 1, 2, 7, 8 | – | – |

```
DC-DC 5 V out ──► Nano 5V, RS485 module VCC, W5500 (5 V input)*
RS485 module TXD / RXD ──► Nano D0 (RX) / D1 (TX)   (swap if nothing arrives)
W5500 SPI: CS → D10, MOSI → D11, MISO → D12, SCK → D13, RST → D7 (optional, power-on reset fix)
```

\* A W5500 module without its own regulator needs 3.3 V.

**Check before connecting** (all against pin 6):

- pin 3 ≈ +20 V,
- pins 4 and 5 only a few volts (≈1–4 V), A slightly higher than B and flickering while the panel talks,
- 20 V on pin 4 or 5 means the count is wrong – do not connect anything,
- DC-DC output set to 5.0 V **before** the Nano is connected.

On a Nano the RS485 serial port is the USB port: **disconnect the RS485 module and J1 while uploading firmware.**

## 3. Firmware

1. Download the repository and open `arduino-modbus-rtu-tcp-gateway/arduino-modbus-rtu-tcp-gateway.ino` in the Arduino IDE.
2. Library manager: install **Ethernet**, **CircularBuffer** and **StreamLib**.
3. Set the defaults for the Komfovent in `advanced_settings.h` (they can be changed later in the web UI as well):

   ```cpp
   #define DEFAULT_STATIC_IP { 192, 168, 1, 200 }   // a free address in your LAN
   #define DEFAULT_GATEWAY   { 192, 168, 1, 1 }
   const uint16_t DEFAULT_BAUD_RATE = 192;          // 19200 (value is baud / 100)
   const byte DEFAULT_SERIAL_CONFIG = SERIAL_8E1;   // already the default, the C4 is fixed at 8E1
   const byte DEFAULT_FRAME_DELAY = 50;             // ms of bus silence before sending (see step 4)
   const uint16_t DEFAULT_RESPONSE_TIMEPOUT = 500;  // ms
   const byte DEFAULT_ATTEMPTS = 3;
   ```

   With an auto-direction module leave `RS485_CONTROL_PIN` as it is (pin 6 stays unused).
4. If the sketch does not fit into the Nano's flash, comment out `#define ENABLE_EXTENDED_WEBUI` and `#define ENABLE_DHCP`.
5. Board *Arduino Nano* (try *ATmega328P (Old Bootloader)* if the upload fails) and upload.

Settings are stored in EEPROM; *Tools → Load Default Settings* in the web UI restores the values from `advanced_settings.h`.

## 4. Gateway settings

Plug the gateway into the LAN and open `http://192.168.1.200` (factory default without step 3: `http://192.168.1.254`).

| Page | Setting | Value |
| --- | --- | --- |
| IP Settings | Static IP / Submask / Gateway | 192.168.1.200 / 255.255.255.0 / 192.168.1.1 |
| TCP/UDP Settings | Modbus TCP Port | 502 |
| | Modbus Mode | **Modbus TCP/UDP** (not RTU over TCP) |
| | Modbus TCP Idle Timeout | 600 s (longer than the Home Assistant scan interval) |
| RTU Settings | Baud Rate / Data Bits / Parity / Stop Bits | **19200 / 8 / Even / 1** |
| | Inter-frame Delay | **50 ms** |
| | Response Timeout | 500 ms |
| | Attempts | 3 |

**Why 50 ms Inter-frame Delay:** every byte the gateway receives – including the panel's requests and the unit's answers to them – postpones its next transmission by this delay. 50 ms is longer than the unit's answer to the panel (~30 ms), so the gateway never talks between a panel request and its response, and much shorter than the ~950 ms of silence per second. The field is one byte, so at most 255 ms.

**Panel traffic:** the gateway forwards a frame to Home Assistant only when it has a valid CRC, comes from the ID that was just queried and a request is pending. The panel's requests (ID 254) and the unit's answers to them are dropped.

**Direction switching:** auto-direction RS485 modules need time to switch from sending to receiving (up to ~100 ms on slow modules, see the gateway's README). The C4 answers after ~15–30 ms; if responses get lost, use a fast module (MAX13487) or one with DE/RE on pin 6.

## 5. Find the Modbus ID and test

Keep the panel connected.

1. **Boot scan** – after power-up the gateway scans IDs 1–247 (two dummy requests per ID, ~50 s of bus traffic; it waits for an idle bus like any other request). *Modbus Status → Modbus Slaves* should list **0x14** (= 20) as *Slave Responded*. The unit answers the dummy request with an exception, which still counts as a response. ID 254 (the panel's address) is outside the scan range – never use it from Home Assistant.
2. **Raw request** – *Modbus Status → Modbus RTU Request*: `14 03 03 E8 00 01` (ID 20, read register 1001 = season). The response starts with `14 03 02`.
3. **Scripts**:

   ```bash
   pip install pymodbus
   python tools/komfovent_test.py 192.168.1.200
   python tools/komfovent_test.py 192.168.1.200 --id 20 --loop 300
   ```

   The first one tries IDs 1, 20, 254, … and reads register **1006** (the unit's Modbus address). The load test makes 300 reads with the panel connected; expect a few tenths of a percent of errors at most, Home Assistant repeats a failed read.
4. **Statistics** – *Modbus Status → Modbus Statistics*: *Invalid RTU Response* grows all the time – that is the dropped panel traffic, not an error. Watch *Response Timeout* and *Slave Failed to Respond* instead.
5. Check that the wall panel shows no communication error.

No unit at hand? `tools/fake_c4.py --tcp` serves a register dump of a real C4 as Modbus TCP on port 5020 (point Home Assistant at it to test the YAML), `--serial COM5` does the same as Modbus RTU through a USB-RS485 adapter wired to the gateway's RS485 module (tests gateway + Home Assistant without the unit).

## 6. Home Assistant configuration

Add the blocks from [`komfovent_configuration.yaml`](komfovent_configuration.yaml) to `configuration.yaml` (merge them with existing `template:`, `script:` and `automation:` sections instead of adding second ones). Set `host` to the gateway IP and `slave:` to your ID if it is not 20.

Things the file takes care of:

- **Addresses are one lower** than in the C4 manual: manual 1000 → `address: 999`.
- The Modbus integration has **no `select` or `number` platform**; season, ventilation level, mode, setpoint and boost time are template `select`/`number` entities that call `modbus.write_register`.
- `binary_sensor.komfovent_fans_running` comes from register 1114. Register 1000 sometimes reports *Stop* while the fans run; `binary_sensor.komfovent_power_mismatch` turns on when the two disagree for 2 minutes.
- **Clock sync** – `script.komfovent_sync_clock` writes time, weekday, month/day and year (registers 1002–1005) from Home Assistant; an automation runs it every day at 03:17 and whenever `sensor.komfovent_clock_drift` exceeds ±2 min for 10 minutes (covers DST changes).
- Alarm notification from the stop code (register 1009).
- **Weekly schedule** – `sensor.komfovent_schedule_times` (registers 1300–1341) and `sensor.komfovent_schedule_levels` (1342–1362) read each block in one request (`data_type: custom`, `structure: ">42H"` / `">21H"`, **`precision: 0`** – with decimals the 42 values exceed the 255 character state limit and the sensor stays unknown); the state is a comma separated list the card decodes.

The gateway does not forward the panel's frames, so no logger filter for pymodbus is needed.

Check the configuration (Developer tools → YAML → *Check configuration*), restart and verify that the entities have values, then change `number.komfovent_temp_setpoint` and watch the panel follow. Run the script *Komfovent: Synchronizovať hodiny* (`script.komfovent_sync_clock`) once by hand.

## 7. Komfovent Card

1. Copy [`komfovent-card.js`](../../komfovent-card.js) to `<config>/www/`.
2. Settings → Dashboards → ⋮ → **Resources** → add `/local/komfovent-card.js?v=1.1.1` as **JavaScript module** (change the version for every update, otherwise the browser keeps the old file).
3. Reload the browser with **Ctrl+F5**.
4. Add the card from [`komfovent-card.yaml`](komfovent-card.yaml):

   ```yaml
   type: custom:komfovent-card
   ```

On cards wider than about 820 px the schema and the controls sit side by side and the schema height is limited, so a full-width dashboard fits the screen without a scrollbar; on phones everything stacks.

The schema shows outdoor air → filter → rotary heat exchanger → supply fan → heater → rooms and extract → filter → heat exchanger → exhaust fan → outside. Air flow is animated with the fan speed, fans and the rotor spin with their level, the heater glows while heating and the supply duct takes the color of the supply temperature. Tapping any part opens more info. Next to it are controls for power, boost (with remaining minutes), ventilation level 1–3 (dimmed in Auto mode, the weekly schedule decides there), setpoint in 0.5 °C steps (sent 0.9 s after the last click), season and mode. Entities named differently go under `entities:`.

**Weekly schedule** (used in Auto mode): seven 24-hour bars with the three periods of each day colored by ventilation level and a marker at the current time. Tap a day to edit start/end (`HH:MM`, `24:00` allowed as end, `00:00–00:00` = unused) and level of its three periods, then *Save*, *→ Mo–Fr* or *→ All*. The card writes only the registers that changed (`modbus.write_register`, hub `modbus_hub`, ID `modbus_slave`) and refreshes the two schedule sensors.

## 8. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Web UI not reachable | Wrong IP, W5500 not initialised after power-up | Try 192.168.1.254; wire RST → D7 (see the gateway's *Ethernet Power On Reset Issue*) |
| Upload fails | RS485 module on D0/D1, wrong bootloader | Disconnect RS485 and J1 during upload; try *Old Bootloader* |
| RTU Data TX grows, RX stays 0 | TXD/RXD or A/B swapped | Swap TXD/RXD on the module, then A/B |
| Only *Invalid RTU Response*, nothing responds | Wrong pins, parity or baud | Check the J1 count; 19200 8E1 (fixed on the C4) |
| *Response Timeout* although the wiring is right | Module switches direction too slowly | Faster module (MAX13487) or DE/RE on pin 6 |
| Panel shows communication errors | Collisions | Increase the Inter-frame Delay (e.g. 80 ms), lengthen the Home Assistant scan intervals |
| Home Assistant connection drops | All sockets in use (4 on a Nano) | Close other Modbus clients (test scripts) |
| Whole Modbus hub missing in Home Assistant | `selects:` / `numbers:` under `modbus:` | Use the template entities from the example |
| Values are from the neighbouring register | 1-based manual addresses used directly | Subtract 1 |
| Schedule sensors stay unknown | Default precision with decimals | `precision: 0` on both schedule sensors |
| Old card after an update | Browser cache | New version in the resource URL, Ctrl+F5 |

## 9. Reference

Register map, verified unit facts and sources: see the [README](README.md#register-reference).

## 10. Test log

| Date | Hardware | Firmware / settings | Boot scan | Load test (`--loop 300`) | Panel OK | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |
