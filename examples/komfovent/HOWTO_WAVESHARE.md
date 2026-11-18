# HOWTO: Komfovent C4 with a Waveshare gateway

Step-by-step from wiring a Waveshare RS485 TO POE ETH (B) gateway to the C4 controller up to the Komfovent Card on a dashboard. The wall panel stays connected and keeps working.

![Komfovent Card](preview.svg)

- **Tested on** Komfovent RECU-300VEB-R-EC-C4, Waveshare RS485 TO POE ETH (B) firmware V1.523, Home Assistant 2026.11.
- **Result** – reading and writing over Modbus TCP with the panel on the same bus, 99.7 % successful reads.
- Unit facts (pinout, serial settings, Modbus ID, register map) and how this gateway compares to others are in the [README](README.md).
- Helper scripts are in [`tools/`](tools); they need Python 3.8+ (`komfovent_test.py` also `pip install pymodbus`).

## Contents

1. [What you need](#1-what-you-need)
2. [Wiring](#2-wiring)
3. [Listen to the bus first](#3-listen-to-the-bus-first)
4. [Switch the gateway to Modbus TCP](#4-switch-the-gateway-to-modbus-tcp)
5. [Find the Modbus ID and test](#5-find-the-modbus-id-and-test)
6. [Home Assistant configuration](#6-home-assistant-configuration)
7. [Komfovent Card](#7-komfovent-card)
8. [Troubleshooting](#8-troubleshooting)
9. [Reference](#9-reference)

## 1. What you need

| Item | Note |
| --- | --- |
| Waveshare RS485 TO POE ETH (B) | Isolated RS485, power over PoE or 6–36 V DC. Other Modbus TCP ↔ RTU gateways work too, but the VirCom settings below are Waveshare specific. |
| Cable with an RJ45 plug | Tapped in parallel to the panel cable, e.g. with an RJ45 coupler/splitter. |
| Multimeter | To check pins before connecting anything. |
| Windows PC with [VirCom](https://files.waveshare.com/upload/4/42/VirCom_en.rar) | Gateway configuration (the web page at the gateway IP has fewer options). |

## 2. Wiring

The C4 talks to its wall panel over RS485 on the RJ45 connector **J1**. The Komfovent drawing numbers the pins on the **plug** of the panel cable – count them the same way, a mirrored count swaps A/B and moves GND.

| J1 pin | Signal | Waveshare terminal |
| --- | --- | --- |
| 3 | +20 V DC (panel supply) | power + (optional, PoE works as well) |
| 4 | A (D+) | A / TDA (+) |
| 5 | B (D−) | B / TDB (−) |
| 6 | GND | power GND |
| 1, 2, 7, 8 | – | – |

**Check before connecting** (all against pin 6):

- pin 3 ≈ +20 V,
- pins 4 and 5 only a few volts (≈1–4 V), A slightly higher than B and flickering while the panel talks,
- 20 V on pin 4 or 5 means the count is wrong – do not connect the gateway.

Leave the gateway's earth terminal (⏚) unconnected. Komfovent requires a separate GND wire only above 10 m; the isolated RS485 side follows the bus on its own. Connect it to pin 6 only if the bus stays unreliable after everything else is right.

## 3. Listen to the bus first

Before sending anything, prove the wiring by listening to the panel. The gateway only receives in this mode, so the panel is not disturbed.

**VirCom** → *Auto Search* → select the gateway → *Edit Device*:

| Field | Value |
| --- | --- |
| IP Mode / IP Address | Static, a free address in your LAN (examples here: **192.168.1.200**) |
| Work Mode | TCP Server, port 502 |
| Baud Rate / Data Bits / Parity / Stop Bits | **19200 / 8 / Even / 1** (fixed on the C4) |
| Flow Control | None |
| Transfer Protocol | **None** (transparent) |
| Framing Rule → Max Interval | **3 ms** (frames are not merged) |

*Modify Setting*, wait for the restart, close VirCom and disable the Home Assistant Modbus hub (the gateway accepts few TCP clients). Then:

```bash
python tools/komfovent_sniffer.py 192.168.1.200 --time 120 --csv log.csv
```

| Sniffer shows | Meaning | Next step |
| --- | --- | --- |
| `REQ ID254 FC03 READ 10900..10909` and `RSP ID254 …` once per second | Wiring and 8E1 are right | Continue with step 4 |
| Only discarded bytes, no valid frame | A/B swapped | Swap A and B |
| Nothing at all | Gateway does not hear the bus | Check pin count, GND, middle pair 4/5 |

What we saw: the panel polls **ID 254** once per second (10 registers, ~19 ms of bus time, the unit answers within ~30 ms), so the bus is idle about 96 % of the time – enough room for Home Assistant.

## 4. Switch the gateway to Modbus TCP


**VirCom** → *Edit Device*:

- Transfer Protocol: **Modbus_TCP Protocol**, Max Interval stays 3 ms.
- *More Advanced Settings*:
  - Modbus Gateway Type: **Multi-host non-storage type** (this also ticks *Enable RS485 Multi-Host*, keep it),
  - ☑ **Enable RS485 bus conflict detection**, *Send data only when RS485 bus is idle for* **50 ms**.

*OK* → *Modify Setting*, then reopen the dialog and check that both boxes are still ticked. With *Simple Modbus TCP to RTU* the conflict detection box does not stay ticked on firmware V1.523.

Why 50 ms: longer than the unit's answer to the panel (so the gateway never talks between a panel request and its response), much shorter than the ~950 ms of silence per second.

## 5. Find the Modbus ID and test

Keep the panel connected, close VirCom.

```bash
pip install pymodbus
python tools/komfovent_test.py 192.168.1.200
```

The script tries IDs 1, 20, 254, … and reads registers 1000, **1006** (the unit's Modbus address), 1200 and 1201. Our unit answered on **20** (register 1006 = 20) and on 254 (the panel's address).

- Use the ID from register 1006 in Home Assistant, **never 254** – the gateway also forwards the unit's answers to the panel, and with ID 254 they could be taken for Home Assistant's answers.
- Load test with the panel connected:

  ```bash
  python tools/komfovent_test.py 192.168.1.200 --id 20 --loop 300
  ```

  Expect a few tenths of a percent of errors at most; Home Assistant repeats a failed read.

No unit at hand? `tools/fake_c4.py --tcp` serves a register dump of a real C4 as Modbus TCP on port 5020 (point Home Assistant at it to test the YAML), `--serial COM5` does the same as Modbus RTU through a USB-RS485 adapter wired to the gateway (tests gateway + Home Assistant without the unit).

## 6. Home Assistant configuration

Add the blocks from [`komfovent_configuration.yaml`](komfovent_configuration.yaml) to `configuration.yaml` (merge them with existing `template:`, `script:` and `automation:` sections instead of adding second ones). Set `host` to the gateway IP and `slave:` to your ID if it is not 20. The same file works with the budulinek gateway as well – only `host` changes (see the [README](README.md#one-configuration-for-both-gateways)).

Things the file takes care of:

- **Addresses are one lower** than in the C4 manual: manual 1000 → `address: 999`.
- **Few requests** – the wall panel shows dashes instead of values once a second master asks about once per second (one request every 2 s is fine). The configuration therefore reads the unit in three blocks (`sensor.komfovent_block_1000`, `_1100`, `_1200`: registers 1000–1013, 1100–1116, 1200–1205) and template sensors with the old names split the values – about 0.15 requests per second in total. Migrating from single sensors: see the header of the YAML (load it once without the `template:` part, delete the old entities shown as *Not provided*, then enable the `template:` part).
- The Modbus integration has **no `select` or `number` platform**; season, ventilation level, mode, setpoint and boost time are template `select`/`number` entities that call `modbus.write_register`.
- `binary_sensor.komfovent_fans_running` comes from register 1114. Register 1000 sometimes reports *Stop* while the fans run; `binary_sensor.komfovent_power_mismatch` turns on when the two disagree for 2 minutes.
- **Clock sync** – `script.komfovent_sync_clock` writes time, weekday, month/day and year (registers 1002–1005) from Home Assistant; an automation runs it every day at 03:17 and whenever `sensor.komfovent_clock_drift` exceeds ±2 min for 10 minutes (covers DST changes).
- Alarm notification from the stop code (register 1009).
- **Weekly schedule** – `sensor.komfovent_schedule_times` (registers 1300–1341) and `sensor.komfovent_schedule_levels` (1342–1362) read each block in one request (`data_type: custom`, `structure: ">42H"` / `">21H"`, **`precision: 0`** – with decimals the 42 values exceed the 255 character state limit and the sensor stays unknown); the state is a comma separated list the card decodes.

Hide the gateway's forwarded panel traffic in the log (pymodbus logs every skipped frame as `request ask for id=20 but got id=254`):

```yaml
logger:
  default: warning
  logs:
    pymodbus.logging: error
```

Check the configuration (Developer tools → YAML → *Check configuration*), restart and verify that the entities have values, then change `number.komfovent_temp_setpoint` and watch the panel follow. Run the script *Komfovent: Synchronizovať hodiny* (`script.komfovent_sync_clock`) once by hand.

## 7. Komfovent Card

1. Copy one card file to `<config>/www/`: [`komfovent-card_sk.js`](../../komfovent-card_sk.js) (Slovak), [`komfovent-card_en.js`](../../komfovent-card_en.js) (English) or [`komfovent-card.js`](../../komfovent-card.js) (follows the Home Assistant language). Load only one of them.
2. Settings → Dashboards → ⋮ → **Resources** → add `/local/komfovent-card_sk.js?v=1.3.0` as **JavaScript module** (change the version for every update, otherwise the browser keeps the old file).
3. Reload the browser with **Ctrl+F5**.
4. Add the card from [`komfovent-card.yaml`](komfovent-card.yaml):

   ```yaml
   type: custom:komfovent-card
   ```

On cards wider than about 820 px the schema and the controls sit side by side and the schema height is limited, so a panel/full-width dashboard fits the screen without a scrollbar; on phones everything stacks.

The schema shows outdoor air → filter → rotary heat exchanger → supply fan → heater → rooms and extract → filter → heat exchanger → exhaust fan → outside. Air flow is animated with the fan speed, fans and the rotor spin with their level, the heater glows while heating and the supply duct takes the color of the supply temperature. Tapping any part opens more info. Below are controls for power, boost (with remaining minutes), ventilation level 1–3 (dimmed in Auto mode, the weekly schedule decides there), setpoint in 0.5 °C steps (sent 0.9 s after the last click), season and mode. Entities named differently go under `entities:`.

**C4.1-style panel** (version 1.2.0+): the controls sit in tabs modelled on the Komfovent C4.1 touch panel – *Home* (temperature, setpoint, modes Away/Home/Boost with ⚙ for the supply/extract intensity of each mode, power, OVR, manual/auto, status icons), *Overview* (alarm, warnings, detailed values, alarm history from the recorder), *Schedule*, *Functions* (setpoint shift, OVR duration and intensity) and *Settings* (season, schedule control, clock sync, Modbus ID). The new functions read the block sensors and write with `modbus.write_register` – no extra Home Assistant entities are needed. Registers 1106/1110 (OVR intensity = level 4) and the time format of 1203/1204 follow the C4 register map and still have to be confirmed on a real unit.

**Weekly schedule** (used in Auto mode): seven 24-hour bars with the three periods of each day colored by ventilation level and a marker at the current time. Tap a day to edit start/end (`HH:MM`, `24:00` allowed as end, `00:00–00:00` = unused) and level of its three periods, then *Save*, *→ Mo–Fr* or *→ All*. The card writes only the registers that changed (`modbus.write_register`, hub `modbus_hub`, ID `modbus_slave`) and refreshes the two schedule sensors.

The card builds its DOM once and only updates values afterwards, so buttons react on the first click even while Home Assistant pushes new states, and the animations do not restart.

## 8. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| No ID 1–254 answers, gateway sends correctly | Wrong pins (mirrored count) | Count as in the Komfovent drawing, measure 20 V on pin 3 |
| Sniffer gets bytes but no frames | A/B swapped | Swap A and B (serial settings are fixed at 8E1) |
| Sniffer gets nothing in transparent mode | Transfer Protocol still `Modbus_TCP Protocol` | Set *None* while sniffing |
| Whole Modbus hub missing in Home Assistant | `selects:` / `numbers:` under `modbus:` | Use the template entities from the example |
| Values are from the neighbouring register | 1-based manual addresses used directly | Subtract 1 |
| Log full of `got id=254, Skipping` | Gateway forwards panel traffic | `pymodbus.logging: error` (harmless) |
| Conflict detection unticks itself | Gateway type *Simple Modbus TCP to RTU* | Use *Multi-host non-storage type* |
| Card missing after a Home Assistant restart | Old frontend cached | Ctrl+F5, or a version in the resource URL (`/local/komfovent-card_sk.js?v=1.3.0`) |
| Card shows *Schedule sensors missing* | Schedule sensors not configured | Add *Komfovent Schedule Times / Levels* from the example configuration |
| Buttons need a long press (card 1.0.0) | The card re-rendered on every state update | Update to `komfovent-card.js` 1.1.0+ and reload with Ctrl+F5 |

## 9. Reference

Register map, verified unit facts and sources: see the [README](README.md#register-reference).
