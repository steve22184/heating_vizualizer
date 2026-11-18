# Komfovent – configuration as Home Assistant packages

The same configuration as [`../komfovent_configuration.yaml`](../komfovent_configuration.yaml), split into two [packages](https://www.home-assistant.io/docs/configuration/packages/). Nothing has to be pasted into `configuration.yaml` or commented out, and the inline `automation:` / `script:` blocks merge with the UI automations in `automations.yaml` without a conflict.

| File | Content |
| --- | --- |
| `komfovent_1_modbus.yaml` | `modbus` hub (block sensors, power and boost switches), clock sync script, automations (alarm, daily clock sync) |
| `komfovent_2_template.yaml` | template selects, numbers, binary sensors and sensors that split the blocks and write through `modbus.write_register` |

## Installation

1. Add to `configuration.yaml` (keep everything else you have there):

   ```yaml
   homeassistant:
     packages: !include_dir_named packages

   # Waveshare forwards the panel traffic (ID 254) – hides pymodbus log spam
   logger:
     default: warning
     logs:
       pymodbus.logging: error
   ```

   If `homeassistant:` already exists (name, location, ...), add only the `packages:` line under it.
2. Create the folder `/config/packages` and change `host:` in `komfovent_1_modbus.yaml` to the IP of your gateway.
3. **New installation:** copy both files, check the configuration (Developer tools → YAML → Check configuration) and restart Home Assistant.

## Migrating from an older Komfovent configuration

The template sensors use the same names as the old modbus sensors. While the old entities exist, the new ones get a suffix (`sensor.komfovent_supply_air_temp_2`, `sensor.komfovent_intake_fan_level_1_8`, ...) and the card shows nothing.

1. **Back up first:** Settings → System → Backups.
2. Remove the old Komfovent `modbus:`, `template:` and `automation:` parts from `configuration.yaml`.
3. Copy **only** `komfovent_1_modbus.yaml` to `/config/packages` and restart.
4. Settings → Devices & services → Entities, search `komfovent`, delete everything shown as *Not provided* / unavailable.
5. Copy `komfovent_2_template.yaml` as well and restart.
6. Check `sensor.komfovent_block_1100` in Developer tools → States: it should hold 17 comma-separated numbers.

### Entities ended up with `_2` anyway

Run [`../tools/fix_entity_ids.js`](../tools/fix_entity_ids.js): open Home Assistant in the browser as an admin, press F12 → **Console**, type `allow pasting` if the browser asks for it, paste the whole file and press Enter. It removes the old registry entries and renames the template entities back to the expected IDs (only the 34 Komfovent template entities, matched by `unique_id`). Reload the page with Ctrl+F5.

To list all Komfovent entities with their state, paste this into Developer tools → Template:

```jinja
{% for s in states | selectattr('entity_id','search','komfovent') | sort(attribute='entity_id') %}
{{ s.entity_id }} = {{ s.state }}
{%- endfor %}
```

No entity should end with `_2` (names like `sensor.komfovent_exhaust_fan_level_2` are correct – that is level 2).
