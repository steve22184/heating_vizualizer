# Komfovent C4 – Modbus integration and dashboard card

Home Assistant setup for a Komfovent RECU-300VEB-R-EC-C4 ventilation unit (C4 controller) over RS485 / Modbus RTU through a Modbus TCP gateway, with the wall panel still connected – plus a dashboard card with the unit schema, controls and a weekly schedule.

![Komfovent Card](preview.svg)

## Files

| File | What it is |
| --- | --- |
| [`HOWTO_WAVESHARE.md`](HOWTO_WAVESHARE.md) | Step by step with the **Waveshare RS485 TO POE ETH (B)** gateway: wiring, sniffing the bus, VirCom settings, finding the Modbus ID, Home Assistant and the card. **Tested.** |
| [`HOWTO_BUDULINEK.md`](HOWTO_BUDULINEK.md) | Step by step with the open-source **budulinek Arduino gateway**: parts, wiring, firmware, web UI settings, tests, Home Assistant and the card. **Tested** with an Arduino Mega 2560 + W5100 shield + XY-485. |
| `komfovent_configuration.yaml` | `modbus`, `template`, `script` and `automation` blocks for `configuration.yaml` (comments in Slovak): sensors, switches, writable selects/numbers (template entities calling `modbus.write_register`), weekly schedule, alarm notification and daily clock sync. |
| [`packages/`](packages/) | The same configuration split into two Home Assistant packages (`komfovent_1_modbus.yaml`, `komfovent_2_template.yaml`), with migration steps and a fix for entities that ended up with `_2`. |
| `komfovent-card.yaml` | Dashboard card using [`komfovent-card.js`](../../komfovent-card.js). |
| [`rotary-exchanger/`](rotary-exchanger/) | Archived card variant with a **rotary heat exchanger** (card 1.3.0, element `komfovent-card-rotary`), kept for units with a rotor. |
| `tools/` | `komfovent_sniffer.py` (passive bus sniffer), `fix_entity_ids.js` (renames `_2` entities after a migration), `komfovent_test.py` (ID scan and load test), `fake_c4.py` + `C4_registers.json` (C4 simulator over TCP or RTU). |

The examples use **192.168.1.200** for the gateway – replace it with a free address in your LAN.

### One configuration for both gateways

`komfovent_configuration.yaml` works unchanged with the Waveshare and with the budulinek gateway – only `host` changes to the IP of the gateway in use (`type: tcp`, Modbus ID 20, register blocks and the card stay the same). The gateway itself has to be set up like this:

| | Waveshare RS485 TO POE ETH (B) | budulinek gateway |
| --- | --- | --- |
| Mode | Transfer Protocol **Modbus_TCP Protocol** | Modbus Mode **Modbus TCP/UDP** |
| Waiting for an idle bus | Gateway Type **Multi-host non-storage** + RS485 bus conflict detection **50 ms** | Inter-frame Delay **50 ms** |
| RS485 | 19200 8E1 | 19200 8E1 |
| Logger filter `pymodbus.logging: error` | recommended (the gateway forwards the panel traffic) | not needed |

Connect only **one** gateway to J1 at a time – the panel plus two gateways would be three masters on the bus.

## The unit (verified)

- **J1** RJ45 on the unit, numbering as in the Komfovent drawing (pins counted on the plug of the panel cable): pin 3 +20 V DC (panel supply), pin 4 A, pin 5 B, pin 6 GND.
- **Serial:** 19200 baud, 8 data bits, even parity, 1 stop bit – fixed.
- **Modbus ID of the unit: 20** (register 1006, range 1–100). The wall panel is a Modbus master and polls **ID 254** (registers 10900–10909) once per second; the unit answers within ~30 ms and the bus is idle about 96 % of the time. Do not use 254 from Home Assistant.
- **Addresses:** the C4 manual numbers registers from 1, Home Assistant sends 0-based addresses – every address in the YAML is one lower (1000 → 999).
- A second Modbus master (the gateway) on the panel bus works when it **waits for an idle bus** before sending.
- **Keep the request rate low:** at about one request per second from the second master the panel starts showing dashes; one request every 2 s or less is fine. The example configuration reads three register blocks (~0.15 requests/s).

## Choosing a gateway

| | Waveshare RS485 TO POE ETH (B) | budulinek Arduino gateway |
| --- | --- | --- |
| Status with this unit | tested, 99.7 % successful reads with the panel connected | tested (Arduino Mega 2560 + Ethernet shield W5100 + XY-485), 99.7 % successful reads |
| Hardware | ready-made DIN-rail device | Arduino Nano/Uno/Mega + W5100/W5500 (module or shield) + auto-direction RS485 module, self-built |
| Software | closed firmware, Windows tool VirCom or web page | open source, web UI, defaults in `advanced_settings.h` |
| Power | PoE or 6–36 V DC (also directly from J1 pin 3) | regulated 5 V – DC-DC converter from J1 pin 3 |
| RS485 isolation | yes | no (fine when powered from the same unit) |
| Waiting for an idle bus | *RS485 bus conflict detection*, kept only with gateway type *Multi-host non-storage* | built in: every received byte postpones sending by the *Inter-frame Delay* |
| Panel traffic | forwarded to the TCP client – pymodbus logs `got id=254, Skipping` (hidden with a logger filter) | dropped, only the answer to the pending request is forwarded |
| Sniffing the bus | yes (transparent mode + `komfovent_sniffer.py`) | no transparent mode |
| Diagnostics | none | statistics (responded / invalid / timeout), slave scan 1–247 after boot, raw RTU requests from the browser |
| TCP connections | several | 4 sockets on a Nano |

**Waveshare – pros:** works out of the box and is proven with this unit, isolated RS485, PoE, transparent mode for sniffing and diagnosing the wiring. **Cons:** closed firmware, configuration needs Windows (VirCom), some VirCom options silently do not stick (bus conflict detection with the simple gateway type), forwards the panel traffic into the Home Assistant log.

**budulinek – pros:** open source and cheap, a clean Home Assistant log, built-in statistics and slave scan show at once whether the wiring and the ID are right, settings in a browser on any OS. **Cons:** has to be built and flashed, needs a 5 V DC-DC converter, no isolation, no transparent mode for sniffing, Ethernet power-on reset issue on some W5x00 modules, sensitive to a weak power supply (W5x00 drops off the network).

## Komfovent Card

The card comes in three files in the repository root – load **exactly one** of them as a resource:

| File | Language |
| --- | --- |
| `komfovent-card_sk.js` | always Slovak |
| `komfovent-card_en.js` | always English |
| `komfovent-card.js` | follows the Home Assistant language (or `language: sk` / `en` in the card config) |

`komfovent-card_sk.js` and `komfovent-card_en.js` are generated from `komfovent-card.js` with `npm run build:komfovent`. The card title comes from `name:` in the card YAML if set.

It is a separate card in the Heating Visualizer style:

- schema of the unit with animated air flow, spinning fans, counterflow plate heat exchanger with the recovery level and an on/off summer bypass (open when the recovery level is below 50 %; verify on your unit), heater glow and the supply duct colored by temperature;
- below it a panel modelled on the Komfovent **C4.1** touch panel, with tabs:
  - **Home** – supply temperature, setpoint, the three modes *Away / Home / Boost* (levels 1–3) with an editor for the supply/extract intensity of each mode (registers 1103–1109), power, OVR boost, manual/auto and status icons;
  - **Overview** – current alarm and warnings (0x2000 = service time), detailed values, alarm history of the last 30 days from the Home Assistant recorder;
  - **Schedule** – weekly schedule (registers 1300–1362) with an editor for the three periods of each day;
  - **Functions** – setpoint shift −9…+9 °C in a time window (1202–1204) and the OVR function: duration (1112) and intensity (1106/1110, level 4);
  - **Settings** – season, schedule control, unit clock with *Sync with HA*, Modbus ID;
- the panel sits centred below the schema and the card fits a full-height dashboard without scrolling.

Settings tab: season, schedule on/off, unit clock with sync, Modbus ID and **Check entities** – fixes entity IDs that got a `_2` suffix after migrating to the block configuration (needs an administrator user).

Installation: copy it to `<config>/www/`, add `/local/komfovent-card_sk.js?v=1.5.1` as a **JavaScript module** resource (raise the version with every update, the browser caches the file), reload with Ctrl+F5 and add `type: custom:komfovent-card`.

## Register reference

| Register (manual) | Meaning | Access |
| --- | --- | --- |
| 1000 | Start/Stop (1/0) | R/W |
| 1001 | Season (1 winter, 0 summer) | R/W |
| 1002 | Time, hour·256 + minute (8:05 = 0x0805) | R/W |
| 1003 / 1004 / 1005 | Weekday 1–7 / month·256 + day / year | R/W |
| 1006 | Modbus address 1–100 | R/W |
| 1007 / 1008 / 1009 | Warnings / stop flags / stop code | R |
| 1010–1013 | Heat recovery, electric heater, water heating, water cooling % | R |
| 1100 / 1101 / 1102 | Ventilation level set 1–3 / current 0–4 / mode (0 manual, 1 auto) | R/W / R / R/W |
| 1103–1110 | Intake / exhaust fan intensity for levels 1–4 | R/W |
| 1111 / 1112 / 1113 | OVR (boost) enable / time 1–90 min / remaining | R/W / R/W / R |
| 1114 / 1115 / 1116 | Fans running / supply fan % / exhaust fan % | R |
| 1200 / 1201 / 1202 | Supply temp / setpoint / correction, ×10 °C | R / R/W / R/W |
| 1205 | Water temp ×10 °C | R |
| 1300–1341 | Schedule times: Mon1 start, Mon1 stop, Mon2 …, Sun3 stop (hour·256 + minute, 24:00 = 0x1800) | R/W |
| 1342–1362 | Schedule levels: Mon1, Mon2, Mon3, Tue1, … Sun3 (0–3) | R/W |
| 10900–10909 | Undocumented block read by the panel (setpoint, supply temp, time, …) | R |

## Sources

Komfovent *Modbus registers of C4 controller*; [AlgMi/komfovent_c4](https://github.com/AlgMi/komfovent_c4) (direct RS485 connection, panel address 254; `tools/C4_registers.json` is its MIT-licensed register dump, © Lenno Nagel); [maxlarin63/KVent-HA](https://github.com/maxlarin63/KVent-HA) (1-based addressing, register 1000 glitch); [budulinek/arduino-modbus-rtu-tcp-gateway](https://github.com/budulinek/arduino-modbus-rtu-tcp-gateway); [Waveshare RS485 TO POE ETH (B) wiki](https://www.waveshare.com/wiki/RS485_TO_POE_ETH_(B)).
