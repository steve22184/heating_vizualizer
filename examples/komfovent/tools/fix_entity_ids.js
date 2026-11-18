/* global document, console */
// Komfovent: fix entity IDs after migrating to the block-reading configuration.
// When old entities still hold the original IDs, the new template entities get a suffix
// (sensor.komfovent_supply_air_temp_2, ..._1_8). This script removes the old registry entries
// and renames the template entities back to the IDs the card and automations expect.
// Only template entities with the unique_ids below are touched.
//
// Run: open Home Assistant in the browser as an admin, press F12 -> Console,
// type "allow pasting" if the browser asks for it, paste this whole file and press Enter.
// Then reload the page with Ctrl+F5.
(async () => {
  const hass = document.querySelector("home-assistant").hass;
  // unique_id (from komfovent_2_template.yaml) -> expected entity_id
  const expected = {
    "komfovent_season_select": "select.komfovent_season",
    "komfovent_vent_level_select": "select.komfovent_ventilation_level",
    "komfovent_control_mode_select": "select.komfovent_control_mode",
    "komfovent_setpoint_number": "number.komfovent_temp_setpoint",
    "komfovent_ovr_time_number": "number.komfovent_ovr_time_set",
    "komfovent_fans_running": "binary_sensor.komfovent_fans_running",
    "komfovent_power_mismatch": "binary_sensor.komfovent_power_mismatch",
    "komfovent_t_supply_temp": "sensor.komfovent_supply_air_temp",
    "komfovent_t_setpoint_temp": "sensor.komfovent_setpoint_temp",
    "komfovent_t_temp_correction": "sensor.komfovent_temp_correction",
    "komfovent_t_water_temp": "sensor.komfovent_water_temp",
    "komfovent_t_recuperator_level": "sensor.komfovent_recuperator_level",
    "komfovent_t_el_heater_level": "sensor.komfovent_electric_heater_level",
    "komfovent_t_water_heating_level": "sensor.komfovent_water_heating_level",
    "komfovent_t_water_cooling_level": "sensor.komfovent_water_cooling_level",
    "komfovent_t_alarm_warnings": "sensor.komfovent_alarm_warnings",
    "komfovent_t_alarm_stop_flags": "sensor.komfovent_alarm_stop_flags",
    "komfovent_t_alarm_stop_code": "sensor.komfovent_alarm_stop_code",
    "komfovent_clock": "sensor.komfovent_clock",
    "komfovent_date": "sensor.komfovent_date",
    "komfovent_clock_drift": "sensor.komfovent_clock_drift",
    "komfovent_t_vent_level_current": "sensor.komfovent_ventilation_level_current",
    "komfovent_t_supply_fan": "sensor.komfovent_supply_fan_current",
    "komfovent_t_exhaust_fan": "sensor.komfovent_exhaust_fan_current",
    "komfovent_t_ovr_remaining": "sensor.komfovent_ovr_time_remaining",
    "komfovent_t_intake_l1": "sensor.komfovent_intake_fan_level_1",
    "komfovent_t_intake_l2": "sensor.komfovent_intake_fan_level_2",
    "komfovent_t_intake_l3": "sensor.komfovent_intake_fan_level_3",
    "komfovent_t_intake_l4": "sensor.komfovent_intake_fan_level_4",
    "komfovent_t_exhaust_l1": "sensor.komfovent_exhaust_fan_level_1",
    "komfovent_t_exhaust_l2": "sensor.komfovent_exhaust_fan_level_2",
    "komfovent_t_exhaust_l3": "sensor.komfovent_exhaust_fan_level_3",
    "komfovent_t_exhaust_l4": "sensor.komfovent_exhaust_fan_level_4",
    "komfovent_alarm_status": "sensor.komfovent_alarm_status",
  };
  const reg = await hass.callWS({ type: "config/entity_registry/list" });
  const byId = Object.fromEntries(reg.map((e) => [e.entity_id, e]));
  let changed = 0;
  for (const e of reg) {
    const want = expected[e.unique_id];
    if (e.platform !== "template" || !want || e.entity_id === want) continue;
    try {
      const old = byId[want];
      if (old) {
        await hass.callWS({ type: "config/entity_registry/remove", entity_id: want });
        console.log("removed old:", want, `(${old.platform})`);
      }
      await hass.callWS({ type: "config/entity_registry/update", entity_id: e.entity_id, new_entity_id: want });
      console.log("renamed:", e.entity_id, "->", want);
      changed++;
    } catch (err) {
      console.error("failed:", e.entity_id, err);
    }
  }
  console.log(changed ? `DONE – ${changed} entities fixed, reload the page (Ctrl+F5).` : "Nothing to fix – all entity IDs are correct.");
})();
