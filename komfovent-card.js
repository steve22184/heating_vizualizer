/**
 * Komfovent Card – visualization and control of a Komfovent C4 ventilation unit
 * Styled like the Heating Visualizer Card (dark SVG schema, colored ducts, animated flow).
 *
 * Installation: copy to <config>/www/komfovent-card.js
 *   Settings → Dashboards → ⋮ → Resources → /local/komfovent-card.js (JavaScript module)
 *
 * Card:
 *   type: custom:komfovent-card
 *   name: Ventilation            # optional (default: translated title)
 *   show_controls: true          # optional
 *   show_schedule: true          # optional, weekly schedule (registers 1300–1362)
 *   modbus_hub: komfovent_c4     # optional, hub name for writing the schedule
 *   modbus_slave: 20             # optional, Modbus ID of the unit
 *   language: sk                 # optional, sk | en (default: Home Assistant language)
 *   entities:                    # optional – only entities named differently
 *     supply_temp: sensor.komfovent_supply_air_temp
 *
 * The DOM is built once and only updated afterwards, so buttons keep working while
 * Home Assistant pushes new states and the animations do not restart.
 */

const VERSION = "1.5.0";
// Fixed language of this build: null = follow Home Assistant (or `language:` in the card config).
// komfovent-card_sk.js / komfovent-card_en.js are generated from this file with "sk" / "en".
const FORCE_LANG = null;

const DEFAULT_ENTITIES = {
  power: "switch.komfovent_power",
  boost: "switch.komfovent_ovr_boost",
  boost_remaining: "sensor.komfovent_ovr_time_remaining",
  season: "select.komfovent_season",
  level: "select.komfovent_ventilation_level",
  level_current: "sensor.komfovent_ventilation_level_current",
  mode: "select.komfovent_control_mode",
  setpoint: "number.komfovent_temp_setpoint",
  supply_temp: "sensor.komfovent_supply_air_temp",
  recuperator: "sensor.komfovent_recuperator_level",
  heater: "sensor.komfovent_electric_heater_level",
  supply_fan: "sensor.komfovent_supply_fan_current",
  exhaust_fan: "sensor.komfovent_exhaust_fan_current",
  fans_running: "binary_sensor.komfovent_fans_running",
  alarm: "sensor.komfovent_alarm_status",
  clock: "sensor.komfovent_clock",
  schedule_times: "sensor.komfovent_schedule_times",
  schedule_levels: "sensor.komfovent_schedule_levels",
  // C4.1-style panel
  block_1000: "sensor.komfovent_block_1000",
  block_1100: "sensor.komfovent_block_1100",
  block_1200: "sensor.komfovent_block_1200",
  water_temp: "sensor.komfovent_water_temp",
  water_heating: "sensor.komfovent_water_heating_level",
  water_cooling: "sensor.komfovent_water_cooling_level",
  alarm_code: "sensor.komfovent_alarm_stop_code",
  date: "sensor.komfovent_date",
  drift: "sensor.komfovent_clock_drift",
  sync_script: "script.komfovent_sync_clock",
};

// unique_id of the template entities (komfovent_2_template.yaml) -> expected entity_id.
// Used by "Fix entities" in Settings when a migration left entities with a _2 suffix.
const TEMPLATE_UIDS = {
  komfovent_season_select: "select.komfovent_season",
  komfovent_vent_level_select: "select.komfovent_ventilation_level",
  komfovent_control_mode_select: "select.komfovent_control_mode",
  komfovent_setpoint_number: "number.komfovent_temp_setpoint",
  komfovent_ovr_time_number: "number.komfovent_ovr_time_set",
  komfovent_fans_running: "binary_sensor.komfovent_fans_running",
  komfovent_power_mismatch: "binary_sensor.komfovent_power_mismatch",
  komfovent_t_supply_temp: "sensor.komfovent_supply_air_temp",
  komfovent_t_setpoint_temp: "sensor.komfovent_setpoint_temp",
  komfovent_t_temp_correction: "sensor.komfovent_temp_correction",
  komfovent_t_water_temp: "sensor.komfovent_water_temp",
  komfovent_t_recuperator_level: "sensor.komfovent_recuperator_level",
  komfovent_t_el_heater_level: "sensor.komfovent_electric_heater_level",
  komfovent_t_water_heating_level: "sensor.komfovent_water_heating_level",
  komfovent_t_water_cooling_level: "sensor.komfovent_water_cooling_level",
  komfovent_t_alarm_warnings: "sensor.komfovent_alarm_warnings",
  komfovent_t_alarm_stop_flags: "sensor.komfovent_alarm_stop_flags",
  komfovent_t_alarm_stop_code: "sensor.komfovent_alarm_stop_code",
  komfovent_clock: "sensor.komfovent_clock",
  komfovent_date: "sensor.komfovent_date",
  komfovent_clock_drift: "sensor.komfovent_clock_drift",
  komfovent_t_vent_level_current: "sensor.komfovent_ventilation_level_current",
  komfovent_t_supply_fan: "sensor.komfovent_supply_fan_current",
  komfovent_t_exhaust_fan: "sensor.komfovent_exhaust_fan_current",
  komfovent_t_ovr_remaining: "sensor.komfovent_ovr_time_remaining",
  komfovent_t_intake_l1: "sensor.komfovent_intake_fan_level_1",
  komfovent_t_intake_l2: "sensor.komfovent_intake_fan_level_2",
  komfovent_t_intake_l3: "sensor.komfovent_intake_fan_level_3",
  komfovent_t_intake_l4: "sensor.komfovent_intake_fan_level_4",
  komfovent_t_exhaust_l1: "sensor.komfovent_exhaust_fan_level_1",
  komfovent_t_exhaust_l2: "sensor.komfovent_exhaust_fan_level_2",
  komfovent_t_exhaust_l3: "sensor.komfovent_exhaust_fan_level_3",
  komfovent_t_exhaust_l4: "sensor.komfovent_exhaust_fan_level_4",
  komfovent_alarm_status: "sensor.komfovent_alarm_status",
};

const TEXTS = {
  sk: {
    title: "Rekuperácia",
    outside: "VONKU",
    inside: "VNÚTRI",
    outdoor_air: "Vonkajší vzduch",
    exhaust_air: "Odpadový vzduch",
    supply_air: "Prívod do miestností",
    extract_air: "Odvod z miestností",
    rotor: "Rekuperátor",
    bypass: "Bypass",
    bypass_open: "otvorený",
    bypass_closed: "zatvorený",
    heater: "Ohrev",
    supply: "Prívod",
    exhaust: "Odvod",
    setpoint: "Žiadaná",
    running: "Beží",
    stopped: "Stojí",
    level: "Stupeň",
    standby: "Pohotovosť",
    boost: "Boost",
    power: "Zapnutá",
    power_off: "Vypnutá",
    ventilation: "Vetranie",
    temperature: "Teplota",
    season: "Sezóna",
    summer: "Leto",
    winter: "Zima",
    manual: "Manuál",
    auto: "Auto",
    min: "min",
    auto_hint: "V režime Auto riadi stupeň týždenný program",
    schedule: "Týždenný program",
    schedule_hint: "platí v režime Auto",
    schedule_missing: "Chýbajú senzory programu (komfovent_schedule_times / _levels) – pozri HOWTO.",
    days: ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"],
    period: "Úsek",
    off: "Vyp",
    save: "Uložiť",
    copy_weekdays: "→ Po–Pi",
    copy_all: "→ Všetky",
    close: "Zavrieť",
    saving: "Ukladám…",
    saved: "Uložené",
    nothing: "Bez zmeny",
    bad_time: "Neplatný čas (HH:MM, 00:00–24:00, koniec po začiatku)",
    error: "Chyba zápisu",
    inactive_hint: "00:00–00:00 = úsek nepoužitý",
    tabs: { home: "Domov", overview: "Prehľad", schedule: "Program", functions: "Funkcie", settings: "Nastavenie" },
    modes: ["", "Mimo domu", "Doma", "Zvýšený výkon"],
    intensity: "Intenzita vetrania",
    flows: "Prietok vzduchu",
    heating: "Ohrev",
    cooling: "Chladenie",
    recovery: "Rekuperácia",
    fans: "Ventilátory",
    sched_on: "Program",
    ovr: "OVR funkcia",
    alarm_word: "Alarm",
    no_alarm: "Bez porúch",
    warnings: "Varovania",
    service_warning: "Servisný čas – skontroluj filtre (14B)",
    details: "Podrobné informácie",
    water_temp: "Teplota vody",
    water_heating: "Vodný ohrev",
    water_cooling: "Vodné chladenie",
    current_level: "Aktuálny stupeň",
    unit_time: "Čas jednotky",
    alarm_history: "História alarmov (30 dní, z HA)",
    load_history: "Načítať históriu",
    no_history: "Žiadne alarmy za posledných 30 dní",
    loading: "Načítavam…",
    shift: "Posun nastavenej hodnoty",
    shift_hint: "Posunie žiadanú teplotu o −9 až +9 °C v zadanom časovom okne (0 = vypnuté).",
    shift_value: "Posun",
    from: "Od",
    to: "Do",
    reload: "Načítať znova",
    duration: "Trvanie",
    ovr_hint: "Dočasný režim s vlastnou intenzitou ventilátorov (1–90 min).",
    ovr_level4: "Intenzita OVR = stupeň 4 (registre 1106/1110).",
    bad_value: "Neplatná hodnota",
    schedule_enabled: "Riadenie programom",
    sync: "Synchronizovať s HA",
    drift: "Odchýlka od HA",
    card_version: "Verzia karty",
    sync_started: "Synchronizácia spustená",
    fix_title: "Entity",
    fix_scan: "Skontrolovať entity",
    fix_apply: "Opraviť",
    fix_hint: "Opraví ID entít s príponou _2 po prechode na blokovú konfiguráciu (len template entity Komfovent).",
    fix_admin: "Oprava entít vyžaduje používateľa s právami administrátora.",
    fix_ok: "Všetky entity majú správne ID",
    fix_found: "nájdených",
    fix_plan: "Treba opraviť",
    fix_remove: "odstráni sa starý záznam",
    fix_done: "Opravené",
    fix_suffix: "Niektoré entity majú príponu _2 – oprav ich v záložke Nastavenie → Skontrolovať entity.",
    data_missing: "Chýbajú blokové senzory (komfovent_block_1000/1100/1200) – aktualizuj konfiguráciu HA.",
  },
  en: {
    title: "Ventilation",
    outside: "OUTSIDE",
    inside: "INSIDE",
    outdoor_air: "Outdoor air",
    exhaust_air: "Exhaust air",
    supply_air: "Supply to rooms",
    extract_air: "Extract from rooms",
    rotor: "Heat recovery",
    bypass: "Bypass",
    bypass_open: "open",
    bypass_closed: "closed",
    heater: "Heater",
    supply: "Supply",
    exhaust: "Exhaust",
    setpoint: "Setpoint",
    running: "Running",
    stopped: "Stopped",
    level: "Level",
    standby: "Standby",
    boost: "Boost",
    power: "On",
    power_off: "Off",
    ventilation: "Ventilation",
    temperature: "Temperature",
    season: "Season",
    summer: "Summer",
    winter: "Winter",
    manual: "Manual",
    auto: "Auto",
    min: "min",
    auto_hint: "In Auto mode the weekly schedule sets the level",
    schedule: "Weekly schedule",
    schedule_hint: "used in Auto mode",
    schedule_missing: "Schedule sensors missing (komfovent_schedule_times / _levels) – see HOWTO.",
    days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    period: "Period",
    off: "Off",
    save: "Save",
    copy_weekdays: "→ Mo–Fr",
    copy_all: "→ All",
    close: "Close",
    saving: "Saving…",
    saved: "Saved",
    nothing: "No change",
    bad_time: "Invalid time (HH:MM, 00:00–24:00, end after start)",
    error: "Write error",
    inactive_hint: "00:00–00:00 = period not used",
    tabs: { home: "Home", overview: "Overview", schedule: "Schedule", functions: "Functions", settings: "Settings" },
    modes: ["", "Away", "Home", "Boost"],
    intensity: "Ventilation intensity",
    flows: "Air flow",
    heating: "Heating",
    cooling: "Cooling",
    recovery: "Recovery",
    fans: "Fans",
    sched_on: "Schedule",
    ovr: "OVR function",
    alarm_word: "Alarm",
    no_alarm: "No faults",
    warnings: "Warnings",
    service_warning: "Service time – check the filters (14B)",
    details: "Detailed information",
    water_temp: "Water temperature",
    water_heating: "Water heating",
    water_cooling: "Water cooling",
    current_level: "Current level",
    unit_time: "Unit time",
    alarm_history: "Alarm history (30 days, from HA)",
    load_history: "Load history",
    no_history: "No alarms in the last 30 days",
    loading: "Loading…",
    shift: "Setpoint shift",
    shift_hint: "Shifts the setpoint by −9 to +9 °C within the time window (0 = off).",
    shift_value: "Shift",
    from: "From",
    to: "To",
    reload: "Reload",
    duration: "Duration",
    ovr_hint: "Temporary mode with its own fan intensity (1–90 min).",
    ovr_level4: "OVR intensity = level 4 (registers 1106/1110).",
    bad_value: "Invalid value",
    schedule_enabled: "Schedule control",
    sync: "Sync with HA",
    drift: "Drift from HA",
    card_version: "Card version",
    sync_started: "Sync started",
    fix_title: "Entities",
    fix_scan: "Check entities",
    fix_apply: "Fix",
    fix_hint: "Fixes entity IDs with a _2 suffix after migrating to the block configuration (Komfovent template entities only).",
    fix_admin: "Fixing entities requires an administrator user.",
    fix_ok: "All entity IDs are correct",
    fix_found: "found",
    fix_plan: "To fix",
    fix_remove: "the old entry will be removed",
    fix_done: "Fixed",
    fix_suffix: "Some entities have a _2 suffix – fix them in Settings → Check entities.",
    data_missing: "Block sensors missing (komfovent_block_1000/1100/1200) – update the HA configuration.",
  },
};

// Colors from the Heating Visualizer Card
const C = {
  outdoor: "#4dd0e1",
  extract: "#ffa726",
  exhaust: "#90a4ae",
  active: "#4caf50",
  heater: "#ff7043",
  heaterOff: "#b0bec5",
  alarm: "#db4437",
  neutral: "var(--divider-color, #888)",
};
const LEVEL_COLORS = ["#607d8b", "#4dd0e1", "#03a9f4", "#ff9800"];
const MODE_ICONS = ["", "mdi:home-export-outline", "mdi:home-outline", "mdi:fan-plus"];
const ALARM_NAMES = {
  3: "Rotor stop", 4: "Heater overheating", 9: "Supply sensor B1 fault", 19: "Air temp too low",
  20: "Air temp too high", 27: "Water temp low", 28: "Frost possibility",
};

/** Air temperature on the blue → red scale (10–30 °C). */
function airColor(t) {
  if (t === undefined || Number.isNaN(t)) return C.neutral;
  const f = Math.min(1, Math.max(0, (t - 10) / 20));
  return `hsl(${Math.round(220 * (1 - f))}, 75%, 55%)`;
}

const FLOW_LAYERS = [
  { dash: "16 24", opacity: 0.15 },
  { dash: "0 6 10 24", opacity: 0.35 },
  { dash: "0 11 5 24", opacity: 0.85 },
];

const enc = (h, m) => h * 256 + m;
const dec = (v) => [v >> 8, v & 255];
const hhmm = (v) => {
  const [h, m] = dec(v);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
function parseTime(s) {
  const m = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(s || "");
  if (!m) return undefined;
  const h = +m[1];
  const mi = +m[2];
  if (h > 24 || mi > 59 || (h === 24 && mi !== 0)) return undefined;
  return enc(h, mi);
}
const minutes = (v) => (v >> 8) * 60 + (v & 255);

class KomfoventCard extends HTMLElement {
  setConfig(config) {
    this._config = {
      show_controls: true, // false hides the whole panel next to the schema
      show_schedule: true,
      modbus_hub: "komfovent_c4",
      modbus_slave: 20,
      ...config,
    };
    this._e = { ...DEFAULT_ENTITIES, ...(config.entities || {}) };
    this._sig = "";
    this._built = false;
    this._day = undefined;
    this._tab = this._tab || "home";
    this._intLevel = undefined;
    this._fnFilled = false;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    }
    if (this._hass) this._update(true);
  }

  set hass(hass) {
    this._hass = hass;
    const sig = Object.values(this._e)
      .map((id) => hass.states[id]?.state ?? "-")
      .join("|");
    if (sig !== this._sig || !this._built) {
      this._sig = sig;
      this._update();
    }
  }

  getCardSize() {
    return 10;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  static getStubConfig() {
    return {};
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  /** "sk" or "en": build constant, card option, then the Home Assistant language. */
  get _langCode() {
    const lang = FORCE_LANG || this._config?.language || this._hass?.locale?.language || this._hass?.language || "en";
    return lang.startsWith("sk") || lang.startsWith("cs") ? "sk" : "en";
  }
  get _t() {
    return TEXTS[this._langCode];
  }
  _st(key) {
    return this._hass?.states[this._e[key]];
  }
  _num(key) {
    const v = parseFloat(this._st(key)?.state);
    return Number.isNaN(v) ? undefined : v;
  }
  _is(key, state) {
    return this._st(key)?.state === state;
  }
  _fmt(v, digits = 1) {
    if (v === undefined) return "—";
    const lang = this._langCode === "sk" ? "sk" : this._hass?.locale?.language || "en";
    return v.toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  _q(sel) {
    return this.shadowRoot.querySelector(sel);
  }
  _call(domain, service, data) {
    return this._hass.callService(domain, service, data);
  }
  // ── fix entity IDs (suffix _2 after migration) ─────────────────────────────
  async _fixPlan() {
    const reg = await this._hass.callWS({ type: "config/entity_registry/list" });
    const byId = Object.fromEntries(reg.map((e) => [e.entity_id, e]));
    let found = 0;
    const plan = [];
    for (const e of reg) {
      const want = TEMPLATE_UIDS[e.unique_id];
      if (e.platform !== "template" || !want) continue;
      found++;
      if (e.entity_id !== want) plan.push({ from: e.entity_id, to: want, old: byId[want] });
    }
    return { found, plan };
  }
  async _fixScan() {
    const t = this._t;
    const msg = this._q("#fx-msg");
    const list = this._q("#fx-list");
    const btn = this._q("#fx-apply");
    btn.hidden = true;
    list.innerHTML = "";
    if (!this._hass.user?.is_admin) {
      msg.textContent = t.fix_admin;
      msg.className = "msg err";
      return;
    }
    try {
      const { found, plan } = await this._fixPlan();
      const total = Object.keys(TEMPLATE_UIDS).length;
      if (!plan.length) {
        msg.textContent = `✓ ${t.fix_ok} (${found}/${total} ${t.fix_found})`;
        msg.className = "msg ok";
        return;
      }
      list.innerHTML = plan
        .map((p) => `<div><code>${p.from}</code> → <code>${p.to}</code>${p.old ? ` <span class="hint">(${t.fix_remove})</span>` : ""}</div>`)
        .join("");
      msg.textContent = `${t.fix_plan}: ${plan.length}`;
      msg.className = "msg";
      btn.textContent = `${t.fix_apply} (${plan.length})`;
      btn.hidden = false;
    } catch (err) {
      msg.textContent = `${t.error}: ${err?.message || err}`;
      msg.className = "msg err";
    }
  }
  async _fixApply() {
    const t = this._t;
    const msg = this._q("#fx-msg");
    const btn = this._q("#fx-apply");
    btn.hidden = true;
    try {
      const { plan } = await this._fixPlan();
      let ok = 0;
      const errors = [];
      for (const p of plan) {
        try {
          if (p.old) await this._hass.callWS({ type: "config/entity_registry/remove", entity_id: p.to });
          await this._hass.callWS({ type: "config/entity_registry/update", entity_id: p.from, new_entity_id: p.to });
          ok++;
        } catch (err) {
          errors.push(`${p.from}: ${err?.message || err}`);
        }
      }
      this._q("#fx-list").innerHTML = errors.map((e) => `<div class="err">${e}</div>`).join("");
      msg.textContent = `${t.fix_done}: ${ok}/${plan.length}`;
      msg.className = errors.length ? "msg err" : "msg ok";
    } catch (err) {
      msg.textContent = `${t.error}: ${err?.message || err}`;
      msg.className = "msg err";
    }
  }

  _moreInfo(key) {
    const entityId = this._e[key];
    if (!entityId) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }
  /** Values of a block sensor (comma separated) as integers, or undefined. */
  _block(key, n) {
    const s = this._st(key);
    if (!s) return undefined;
    const arr = String(s.state).split(",").map((x) => parseInt(x, 10));
    return arr.length === n && arr.every((x) => !Number.isNaN(x)) ? arr : undefined;
  }

  /** Write [manualRegister, value] pairs one by one, report progress, refresh entities. */
  async _writeRegs(writes, msg, refreshKeys) {
    const t = this._t;
    if (!writes.length) {
      msg.textContent = t.nothing;
      msg.className = "msg";
      return true;
    }
    msg.textContent = `${t.saving} 0/${writes.length}`;
    msg.className = "msg";
    try {
      for (let i = 0; i < writes.length; i++) {
        const [reg, value] = writes[i];
        await this._call("modbus", "write_register", {
          hub: this._config.modbus_hub,
          slave: this._config.modbus_slave,
          address: reg - 1, // Home Assistant addresses are one lower than the manual
          value: value < 0 ? value + 65536 : value, // signed values as two's complement
        });
        msg.textContent = `${t.saving} ${i + 1}/${writes.length}`;
      }
      const ids = refreshKeys.map((k) => this._e[k]).filter(Boolean);
      if (ids.length) await this._call("homeassistant", "update_entity", { entity_id: ids });
      msg.textContent = `${t.saved} (${writes.length})`;
      msg.className = "msg ok";
      return true;
    } catch (err) {
      msg.textContent = `${t.error}: ${err?.message || err}`;
      msg.className = "msg err";
      return false;
    }
  }

  _schedule() {
    const parse = (key, n) => {
      const s = this._st(key);
      if (!s) return undefined;
      const arr = String(s.state).split(",").map((x) => parseInt(x, 10));
      return arr.length === n && arr.every((x) => !Number.isNaN(x)) ? arr : undefined;
    };
    const times = parse("schedule_times", 42);
    const levels = parse("schedule_levels", 21);
    return times && levels ? { times, levels } : undefined;
  }

  // ── actions ──────────────────────────────────────────────────────────────
  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset && (n.dataset.action || n.dataset.info));
    if (!el) return;
    if (el.dataset.info) return this._moreInfo(el.dataset.info);
    const a = el.dataset.action;
    const v = el.dataset.value;
    const pending = () => {
      el.classList.add("pending");
      setTimeout(() => el.classList.remove("pending"), 1500);
    };
    switch (a) {
      case "power":
      case "boost": {
        pending();
        this._call("switch", this._is(a, "on") ? "turn_off" : "turn_on", { entity_id: this._e[a] });
        break;
      }
      case "level":
        this.shadowRoot.querySelectorAll("#modes .mbtn").forEach((b) => b.classList.toggle("sel", b === el));
        pending();
        this._call("select", "select_option", { entity_id: this._e.level, option: v });
        break;
      case "season":
      case "mode": {
        el.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("sel", b === el));
        pending();
        this._call("select", "select_option", { entity_id: this._e[a], option: v });
        break;
      }
      case "tab":
        this._setTab(v);
        break;
      case "int-open":
        this._openIntensity(this._intLevel === +v ? undefined : +v);
        break;
      case "int-close":
        this._openIntensity(undefined);
        break;
      case "int-save":
        this._saveIntensity();
        break;
      case "shift-save":
        this._saveShift();
        break;
      case "ovr-save":
        this._saveOvr();
        break;
      case "fn-reload":
        this._fillFunctions();
        break;
      case "history":
        this._loadHistory();
        break;
      case "fix-scan":
        this._fixScan();
        break;
      case "fix-apply":
        this._fixApply();
        break;
      case "sync": {
        pending();
        const msg = this._q("#st-msg");
        this._call("script", "turn_on", { entity_id: this._e.sync_script }).then(
          () => {
            msg.textContent = this._t.sync_started;
            msg.className = "msg ok";
          },
          (err) => {
            msg.textContent = `${this._t.error}: ${err?.message || err}`;
            msg.className = "msg err";
          }
        );
        break;
      }
      case "sp":
        this._stepSetpoint(parseFloat(v));
        break;
      case "day":
        this._openDay(this._day === +v ? undefined : +v);
        break;
      case "sched-save":
        this._saveSchedule([this._day]);
        break;
      case "sched-weekdays":
        this._saveSchedule([0, 1, 2, 3, 4]);
        break;
      case "sched-all":
        this._saveSchedule([0, 1, 2, 3, 4, 5, 6]);
        break;
      case "sched-close":
        this._openDay(undefined);
        break;
    }
  }

  _stepSetpoint(delta) {
    const s = this._st("setpoint");
    if (!s) return;
    const min = parseFloat(s.attributes.min ?? 10);
    const max = parseFloat(s.attributes.max ?? 30);
    const base = this._pendingSetpoint ?? parseFloat(s.state);
    if (Number.isNaN(base)) return;
    this._pendingSetpoint = Math.min(max, Math.max(min, Math.round((base + delta) * 2) / 2));
    this._q("#sp-value").textContent = `${this._fmt(this._pendingSetpoint)} °C`;
    clearTimeout(this._spTimer);
    this._spTimer = setTimeout(() => {
      const value = this._pendingSetpoint;
      this._call("number", "set_value", { entity_id: this._e.setpoint, value }).finally(() => {
        this._pendingSetpoint = undefined;
      });
    }, 900);
  }

  _openDay(day) {
    this._day = day;
    const ed = this._q("#editor");
    this.shadowRoot.querySelectorAll(".day").forEach((b) => b.classList.toggle("sel", +b.dataset.value === day));
    if (day === undefined) {
      ed.hidden = true;
      return;
    }
    const sch = this._schedule();
    if (!sch) return;
    for (let p = 0; p < 3; p++) {
      this._q(`#s${p}`).value = hhmm(sch.times[day * 6 + p * 2]);
      this._q(`#e${p}`).value = hhmm(sch.times[day * 6 + p * 2 + 1]);
      this._q(`#l${p}`).value = String(sch.levels[day * 3 + p]);
    }
    this._q("#ed-title").textContent = this._t.days[day];
    this._q("#ed-msg").textContent = this._t.inactive_hint;
    this._q("#ed-msg").className = "msg";
    ed.hidden = false;
  }

  async _saveSchedule(days) {
    const t = this._t;
    const msg = this._q("#ed-msg");
    const sch = this._schedule();
    if (!sch || this._day === undefined) return;
    // values from the editor
    const vals = [];
    for (let p = 0; p < 3; p++) {
      const s = parseTime(this._q(`#s${p}`).value);
      const e = parseTime(this._q(`#e${p}`).value);
      const l = parseInt(this._q(`#l${p}`).value, 10);
      if (s === undefined || e === undefined || s === enc(24, 0) || (minutes(e) < minutes(s))) {
        msg.textContent = t.bad_time;
        msg.className = "msg err";
        return;
      }
      vals.push({ s, e, l });
    }
    // only registers that differ (manual numbering: times 1300 + d*6 + p*2, levels 1342 + d*3 + p)
    const writes = [];
    for (const d of days) {
      vals.forEach(({ s, e, l }, p) => {
        const ti = d * 6 + p * 2;
        if (sch.times[ti] !== s) writes.push([1300 + ti, s]);
        if (sch.times[ti + 1] !== e) writes.push([1301 + ti, e]);
        if (sch.levels[d * 3 + p] !== l) writes.push([1342 + d * 3 + p, l]);
      });
    }
    await this._writeRegs(writes, msg, ["schedule_times", "schedule_levels"]);
  }

  // ── C4.1 panel: tabs, intensity, functions, history ──────────────────────
  _setTab(tab) {
    this._tab = tab;
    this.shadowRoot.querySelectorAll(".tab").forEach((b) => b.classList.toggle("sel", b.dataset.value === tab));
    this.shadowRoot.querySelectorAll(".pane").forEach((p) => (p.hidden = p.dataset.pane !== tab));
    if (tab === "functions") this._fillFunctions();
  }

  _openIntensity(level) {
    this._intLevel = level;
    const ed = this._q("#int-ed");
    this.shadowRoot.querySelectorAll("#modes .gear").forEach((b) => b.classList.toggle("sel", +b.dataset.value === level));
    if (level === undefined) {
      ed.hidden = true;
      return;
    }
    const b = this._block("block_1100", 17);
    this._q("#int-title").textContent = `${this._t.flows} – ${this._t.modes[level]} (${this._t.level} ${level})`;
    this._q("#int-s").value = b ? b[2 + level] : "";
    this._q("#int-e").value = b ? b[6 + level] : "";
    this._q("#int-msg").textContent = "";
    ed.hidden = false;
  }

  _readPct(id) {
    const v = parseInt(this._q(id).value, 10);
    return v >= 20 && v <= 100 ? v : undefined;
  }

  async _saveIntensity() {
    const l = this._intLevel;
    const b = this._block("block_1100", 17);
    const msg = this._q("#int-msg");
    const s = this._readPct("#int-s");
    const e = this._readPct("#int-e");
    if (!l || !b || s === undefined || e === undefined) {
      msg.textContent = `${this._t.bad_value} (20–100 %)`;
      msg.className = "msg err";
      return;
    }
    const writes = [];
    if (b[2 + l] !== s) writes.push([1102 + l, s]); // intake level l: 1103..1105
    if (b[6 + l] !== e) writes.push([1106 + l, e]); // exhaust level l: 1107..1109
    await this._writeRegs(writes, msg, ["block_1100"]);
  }

  _fillFunctions() {
    const b2 = this._block("block_1200", 6);
    const b1 = this._block("block_1100", 17);
    if (b2) {
      this._q("#sh-v").value = (b2[2] / 10).toFixed(1);
      this._q("#sh-s").value = hhmm(b2[3]);
      this._q("#sh-e").value = hhmm(b2[4]);
    }
    if (b1) {
      this._q("#ov-t").value = b1[12];
      this._q("#ov-s").value = b1[6];
      this._q("#ov-e").value = b1[10];
    }
    this._fnFilled = !!(b1 && b2);
  }

  async _saveShift() {
    const b2 = this._block("block_1200", 6);
    const msg = this._q("#sh-msg");
    const v = Math.round(parseFloat(this._q("#sh-v").value) * 10);
    const s = parseTime(this._q("#sh-s").value);
    const e = parseTime(this._q("#sh-e").value);
    if (!b2 || Number.isNaN(v) || v < -90 || v > 90 || s === undefined || e === undefined) {
      msg.textContent = `${this._t.bad_value} (−9…+9 °C, HH:MM)`;
      msg.className = "msg err";
      return;
    }
    const writes = [];
    if (b2[2] !== v) writes.push([1202, v]);
    if (b2[3] !== s) writes.push([1203, s]);
    if (b2[4] !== e) writes.push([1204, e]);
    await this._writeRegs(writes, msg, ["block_1200"]);
  }

  async _saveOvr() {
    const b1 = this._block("block_1100", 17);
    const msg = this._q("#ov-msg");
    const tm = parseInt(this._q("#ov-t").value, 10);
    const s = this._readPct("#ov-s");
    const e = this._readPct("#ov-e");
    if (!b1 || !(tm >= 1 && tm <= 90) || s === undefined || e === undefined) {
      msg.textContent = `${this._t.bad_value} (1–90 min, 20–100 %)`;
      msg.className = "msg err";
      return;
    }
    const writes = [];
    if (b1[12] !== tm) writes.push([1112, tm]);
    if (b1[6] !== s) writes.push([1106, s]);
    if (b1[10] !== e) writes.push([1110, e]);
    await this._writeRegs(writes, msg, ["block_1100"]);
  }

  async _loadHistory() {
    const t = this._t;
    const out = this._q("#ov-hist");
    const id = this._e.alarm_code;
    out.textContent = t.loading;
    try {
      const res = await this._hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(Date.now() - 30 * 864e5).toISOString(),
        entity_ids: [id],
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
      const rows = (res[id] || [])
        .map((x) => ({
          code: parseInt(x.s ?? x.state, 10),
          ts: x.lu ?? x.lc ? (x.lu ?? x.lc) * 1000 : Date.parse(x.last_changed || x.last_updated),
        }))
        .filter((r) => r.code > 0)
        .reverse()
        .slice(0, 50);
      if (!rows.length) {
        out.textContent = t.no_history;
        return;
      }
      const lang = this._langCode === "sk" ? "sk" : this._hass.locale?.language || "en";
      out.innerHTML = rows
        .map(
          (r) => `<div class="hrow"><span>${new Date(r.ts).toLocaleString(lang, { dateStyle: "short", timeStyle: "short" })}</span>
            <b>${r.code}</b><span>${ALARM_NAMES[r.code] || t.alarm_word}</span></div>`
        )
        .join("");
    } catch (err) {
      out.textContent = `${t.error}: ${err?.message || err}`;
    }
  }

  // ── build once ───────────────────────────────────────────────────────────
  _build() {
    const t = this._t;
    const cfg = this._config;
    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card><div class="wrap">
        <div class="header">
          <div class="title">${cfg.name || t.title}</div>
          ${cfg.show_controls ? "" : this._pillsHtml()}
        </div>
        <div class="body">
          <div class="schema-wrap">${this._svgSkeleton(t)}</div>
          ${cfg.show_controls ? this._panelHtml(t) : ""}
        </div>
      </div></ha-card>`;
    this._built = true;
    if (this._config.show_controls) this._setTab(this._tab);
  }

  _pillsHtml() {
    return `<div class="pills">
      <span class="pill muted" id="p-clock" data-info="clock"></span>
      <span class="pill alarm" id="p-alarm" data-info="alarm" hidden></span>
      <span class="pill" id="p-status" data-info="fans_running"></span>
    </div>`;
  }

  _panelHtml(t) {
    const cfg = this._config;
    const seg = (id, action, items) =>
      `<div class="seg" id="${id}">${items
        .map(([v, label]) => `<button data-action="${action}" data-value="${v}">${label}</button>`)
        .join("")}</div>`;
    const levelOpts = [0, 1, 2, 3].map((l) => `<option value="${l}">${l === 0 ? t.off : `${t.level} ${l}`}</option>`).join("");
    const num = (id, min, max, step) =>
      `<input id="${id}" class="num" type="number" min="${min}" max="${max}" step="${step}" inputmode="decimal">`;
    const tabs = ["home", "overview", ...(cfg.show_schedule ? ["schedule"] : []), "functions", "settings"];
    const chip = (id, icon, label) =>
      `<span class="st" id="${id}"><ha-icon icon="${icon}"></ha-icon><span>${label}</span></span>`;

    return `<div class="side">
      <div class="ptop">${this._pillsHtml()}</div>
      <div class="tabs">${tabs.map((id) => `<button class="tab" data-action="tab" data-value="${id}">${t.tabs[id]}</button>`).join("")}</div>
      <div class="missing" id="data-missing" hidden>${t.data_missing}</div>
      <div class="missing" id="suffix-missing" hidden>${t.fix_suffix}</div>

      <div class="pane" data-pane="home">
        <div class="home-top">
          <div class="bigtemp" data-info="supply_temp"><span id="h-temp">—</span><small>${t.supply}</small></div>
          <div class="spbox">
            <span class="lbl">${t.setpoint}</span>
            <div class="stepper">
              <button data-action="sp" data-value="-0.5">−</button>
              <span id="sp-value" data-info="setpoint"></span>
              <button data-action="sp" data-value="0.5">+</button>
            </div>
          </div>
        </div>
        <div class="modes" id="modes">${[1, 2, 3]
          .map(
            (l) => `<div class="mode">
              <button class="mbtn" data-action="level" data-value="Level ${l}">
                <ha-icon icon="${MODE_ICONS[l]}"></ha-icon><span>${t.modes[l]}</span><small>${t.level} ${l}</small></button>
              <button class="gear" data-action="int-open" data-value="${l}" title="${t.intensity}">⚙</button></div>`
          )
          .join("")}</div>
        <div class="editor" id="int-ed" hidden>
          <div class="ed-title" id="int-title"></div>
          <div class="ed-row"><span class="lbl">${t.supply}</span>${num("int-s", 20, 100, 5)} %
            <span class="lbl">${t.exhaust}</span>${num("int-e", 20, 100, 5)} %</div>
          <div class="ed-btns"><button class="primary" data-action="int-save">${t.save}</button>
            <button data-action="int-close">${t.close}</button></div>
          <div class="msg" id="int-msg"></div>
        </div>
        <div class="crow">
          <button class="tg" id="b-power" data-action="power"><span class="ico">⏻</span><span class="txt"></span></button>
          <button class="tg" id="b-boost" data-action="boost"><span class="ico">🚀</span><span class="txt"></span></button>
          ${seg("seg-mode", "mode", [["Manual", t.manual], ["Auto", t.auto]])}
        </div>
        <div class="icons">
          ${chip("st-fans", "mdi:fan", t.fans)}${chip("st-rec", "mdi:recycle-variant", t.recovery)}
          ${chip("st-heat", "mdi:radiator", t.heating)}${chip("st-cool", "mdi:snowflake", t.cooling)}
          ${chip("st-sched", "mdi:calendar-clock", t.sched_on)}${chip("st-ovr", "mdi:rocket-launch", "OVR")}
          ${chip("st-alarm", "mdi:alert", t.alarm_word)}
        </div>
      </div>

      <div class="pane" data-pane="overview" hidden>
        <div class="alarmbox" id="ov-alarm" data-info="alarm"></div>
        <div class="sub">${t.details}</div>
        <div class="kv" id="ov-details"></div>
        <div class="sub">${t.alarm_history}</div>
        <div><button data-action="history">${t.load_history}</button></div>
        <div class="hist" id="ov-hist"></div>
      </div>

      ${
        cfg.show_schedule
          ? `<div class="pane sched" data-pane="schedule" hidden>
        <div class="sched-head"><span class="sub">${t.schedule}</span><span class="hint">${t.schedule_hint}</span></div>
        <div class="missing" id="sched-missing" hidden>${t.schedule_missing}</div>
        <div class="sgrid" id="sgrid">
          <span></span>
          <div class="scale">${[0, 3, 6, 9, 12, 15, 18, 21, 24]
            .map((h) => `<span style="left:${(h / 24) * 100}%">${h}</span>`)
            .join("")}</div>
          ${t.days
            .map(
              (d, i) =>
                `<button class="day" data-action="day" data-value="${i}">${d}</button>
                 <div class="bar" id="bar${i}" data-action="day" data-value="${i}"></div>`
            )
            .join("")}
        </div>
        <div class="legend">${[1, 2, 3]
          .map((l) => `<span><i style="background:${LEVEL_COLORS[l]}"></i>${t.modes[l]}</span>`)
          .join("")}<span><i style="background:${LEVEL_COLORS[0]}"></i>${t.off}</span></div>
        <div class="editor" id="editor" hidden>
          <div class="ed-title" id="ed-title"></div>
          ${[0, 1, 2]
            .map(
              (p) => `<div class="ed-row"><span class="lbl">${t.period} ${p + 1}</span>
              <input id="s${p}" class="tm" inputmode="numeric" maxlength="5"> –
              <input id="e${p}" class="tm" inputmode="numeric" maxlength="5">
              <select id="l${p}">${levelOpts}</select></div>`
            )
            .join("")}
          <div class="ed-btns">
            <button class="primary" data-action="sched-save">${t.save}</button>
            <button data-action="sched-weekdays">${t.copy_weekdays}</button>
            <button data-action="sched-all">${t.copy_all}</button>
            <button data-action="sched-close">${t.close}</button>
          </div>
          <div class="msg" id="ed-msg"></div>
        </div>
      </div>`
          : ""
      }

      <div class="pane" data-pane="functions" hidden>
        <div class="fbox">
          <div class="sub">${t.shift}</div>
          <div class="hint">${t.shift_hint}</div>
          <div class="ed-row"><span class="lbl">${t.shift_value}</span>${num("sh-v", -9, 9, 0.5)} °C
            <span class="lbl">${t.from}</span><input id="sh-s" class="tm" inputmode="numeric" maxlength="5">
            <span class="lbl">${t.to}</span><input id="sh-e" class="tm" inputmode="numeric" maxlength="5"></div>
          <div class="ed-btns"><button class="primary" data-action="shift-save">${t.save}</button>
            <button data-action="fn-reload">${t.reload}</button></div>
          <div class="msg" id="sh-msg"></div>
        </div>
        <div class="fbox">
          <div class="sub">${t.ovr}</div>
          <div class="hint">${t.ovr_hint}</div>
          <div class="crow"><button class="tg" id="b-boost2" data-action="boost"><span class="ico">🚀</span><span class="txt"></span></button></div>
          <div class="ed-row"><span class="lbl">${t.duration}</span>${num("ov-t", 1, 90, 1)} ${t.min}</div>
          <div class="ed-row"><span class="lbl">${t.supply}</span>${num("ov-s", 20, 100, 5)} %
            <span class="lbl">${t.exhaust}</span>${num("ov-e", 20, 100, 5)} %</div>
          <div class="hint">${t.ovr_level4}</div>
          <div class="ed-btns"><button class="primary" data-action="ovr-save">${t.save}</button></div>
          <div class="msg" id="ov-msg"></div>
        </div>
      </div>

      <div class="pane" data-pane="settings" hidden>
        <div class="kv">
          <span>${t.season}</span><span>${seg("seg-season", "season", [["Summer", "☀ " + t.summer], ["Winter", "❄ " + t.winter]])}</span>
          <span>${t.schedule_enabled}</span><span>${seg("seg-mode2", "mode", [["Manual", t.manual], ["Auto", t.auto]])}</span>
          <span>${t.unit_time}</span><span><span id="st-time"></span> <button data-action="sync">${t.sync}</button></span>
          <span>${t.drift}</span><span id="st-drift"></span>
          <span>Modbus ID</span><span id="st-id"></span>
          <span>${t.card_version}</span><span>${VERSION}</span>
        </div>
        <div class="msg" id="st-msg"></div>
        <div class="fbox">
          <div class="sub">${t.fix_title}</div>
          <div class="hint">${t.fix_hint}</div>
          <div class="ed-btns"><button data-action="fix-scan">${t.fix_scan}</button>
            <button class="primary" data-action="fix-apply" id="fx-apply" hidden></button></div>
          <div class="fx-list" id="fx-list"></div>
          <div class="msg" id="fx-msg"></div>
        </div>
      </div>
    </div>`;
  }

  _svgSkeleton(t) {
    const yS = 120;
    const yE = 250;
    const rx = 300;
    const flows = (i) =>
      `<g id="flow${i}">${FLOW_LAYERS.map(
        (l) => `<path class="flow" style="stroke-dasharray:${l.dash};opacity:${l.opacity}"/>`
      ).join("")}</g>`;
    // counterflow plate exchanger: hexagon centred at (rx, 185)
    const hx = 70; // half width
    const hy = 70; // half height
    const hw = 35; // half width of the flat top/bottom edge
    const hex = [[rx - hx, 185], [rx - hw, 185 - hy], [rx + hw, 185 - hy], [rx + hx, 185], [rx + hw, 185 + hy], [rx - hw, 185 + hy]];
    // x where a horizontal line at y crosses the left slanted edges
    const edgeX = (y) => rx - hw - ((hx - hw) * Math.abs(y - 185 + (y < 185 ? hy : -hy))) / hy;
    const inL = Math.round(edgeX(yS));
    const inR = Math.round(2 * rx - edgeX(yS));
    // cross flow: outdoor (top left) -> supply (bottom right), extract (top right) -> exhaust (bottom left)
    const ducts = [
      `M 20 ${yS} L ${inL} ${yS}`,
      `M ${inR} ${yE} L 736 ${yE}`,
      `M 740 ${yS} L ${inR} ${yS}`,
      `M ${inL} ${yE} L 16 ${yE}`,
    ];
    const plates = Array.from({ length: 9 }, (_, i) => {
      const y = 185 - 48 + i * 12;
      const x0 = edgeX(y) + 6;
      return `<line x1="${x0.toFixed(1)}" y1="${y}" x2="${(2 * rx - x0).toFixed(1)}" y2="${y}"/>`;
    }).join("");
    const byY = 90; // bypass duct height
    const byR = rx + hx + 14; // right leg of the bypass, between exchanger and supply fan
    const bypassD = `M ${inL - 22} ${yS} L ${inL - 22} ${byY} L ${byR} ${byY} L ${byR} ${yE}`;
    const blade = (a) => `<path d="M0 0 C 4 -6, 10 -14, 2 -16 C -4 -16, -4 -6, 0 0 Z" transform="rotate(${a})"/>`;
    const fan = (id, cx, cy, info) => `<g class="fan" id="${id}" data-info="${info}" transform="translate(${cx},${cy})">
        <circle r="24" class="fan-ring"/><g transform="scale(1.2)"><g class="blades">${blade(0)}${blade(120)}${blade(240)}</g></g>
        <circle r="3.6" class="hub"/><text y="42" text-anchor="middle" class="device-label"></text></g>`;
    const filter = (x, y) => `<g class="filter" transform="translate(${x},${y}) scale(1.2)">
        <rect x="-7" y="-16" width="14" height="32" rx="2"/><path d="M-7 -12 L7 -8 L-7 -4 L7 0 L-7 4 L7 8 L-7 12"/></g>`;
    const arrow = (id, x, y, dir) =>
      `<path id="${id}" d="M ${x - 7 * dir} ${y - 7} L ${x + 5 * dir} ${y} L ${x - 7 * dir} ${y + 7} Z"/>`;
    const chip = (id, info) =>
      `<g class="chip" id="${id}" data-info="${info}"><rect height="22" rx="4"/><text y="15" text-anchor="middle"></text></g>`;

    return `
    <svg viewBox="0 0 760 330" class="schema" role="img" aria-label="Komfovent">
      <defs>
        <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${C.active}" flood-opacity="0.6"/></filter>
        <filter id="glowAlarm" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${C.alarm}" flood-opacity="0.6"/></filter>
        <filter id="heat"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="${C.heater}"/></filter>
      </defs>
      <line x1="110" y1="40" x2="110" y2="322" class="wall"/>
      <text x="100" y="52" text-anchor="end" class="zone">${t.outside}</text>
      <text x="120" y="52" class="zone">${t.inside}</text>
      <rect id="unit" x="170" y="56" width="420" height="254" rx="10" class="unit"/>
      <g class="bypass" id="bypass" data-info="recuperator">
        <path d="${bypassD}" class="bypass-duct"/>
        <path d="${bypassD}" class="flow bypass-flow" id="bypass-flow" style="stroke-dasharray:6 14"/>
        <g transform="translate(${rx},${byY})"><circle r="3" class="damper-pin"/>
          <line id="damper" x1="0" y1="-11" x2="0" y2="11" class="damper"/></g>
        <text x="${rx}" y="${byY - 13}" text-anchor="middle" class="device-label" id="bypass-lbl"></text>
      </g>
      ${ducts.map((d, i) => `<path id="duct${i}" d="${d}" class="duct"/>${flows(i)}`).join("")}
      ${arrow("arr0", 150, yS, 1)}${arrow("arr1", 742, yE, 1)}${arrow("arr2", 650, yS, -1)}${arrow("arr3", 13, yE, -1)}
      <text x="22" y="${yS - 14}" class="device-label">${t.outdoor_air}</text>
      <text x="22" y="${yE + 24}" class="device-label">${t.exhaust_air}</text>
      <text x="738" y="${yE + 24}" text-anchor="end" class="device-label">${t.supply_air}</text>
      <text x="738" y="${yS - 14}" text-anchor="end" class="device-label">${t.extract_air}</text>
      ${filter(205, yS)}${filter(555, yS)}
      <g class="hex" id="rotor" data-info="recuperator">
        <polygon points="${hex.map((p) => p.join(",")).join(" ")}" class="hex-bg"/>
        <g class="plates">${plates}</g>
        <path d="M ${inL} ${yS} L ${inR} ${yE}" class="xpath" id="xp-s"/>
        <path d="M ${inR} ${yS} L ${inL} ${yE}" class="xpath" id="xp-e"/>
        <rect x="${rx - 24}" y="173" width="48" height="22" rx="4" class="hex-val-bg"/>
        <text x="${rx}" y="189" text-anchor="middle" class="device-value" id="rotor-val"></text>
        <text x="${rx}" y="${185 + hy + 16}" text-anchor="middle" class="device-label">${t.rotor}</text>
      </g>
      ${fan("fan-s", 430, yE, "supply_fan")}
      ${fan("fan-e", 212, yE, "exhaust_fan")}
      <g class="heater" data-info="heater" transform="translate(510,${yE})">
        <rect x="-26" y="-18" width="52" height="36" rx="4" class="heater-box"/>
        <path id="coil" d="M-20 0 L-15 -9 L-8 9 L-1 -9 L6 9 L13 -9 L20 0" class="coil"/>
        <text y="38" text-anchor="middle" class="device-label" id="heater-lbl"></text>
      </g>
      ${chip("chip-supply", "supply_temp")}
      ${chip("chip-sp", "setpoint")}
    </svg>`;
  }

  // ── update in place ──────────────────────────────────────────────────────
  _update(rebuild = false) {
    if (!this._hass || !this._config) return;
    const lang = this._langCode;
    if (rebuild || !this._built || lang !== this._lang) {
      this._lang = lang;
      this._build();
    }
    const t = this._t;
    const powerOn = this._is("power", "on");
    const fans = this._st("fans_running");
    const running = fans ? fans.state === "on" : powerOn;
    const supplyT = this._num("supply_temp");
    const setpoint = this._pendingSetpoint ?? this._num("setpoint");
    const supplyFan = this._num("supply_fan") ?? 0;
    const exhaustFan = this._num("exhaust_fan") ?? 0;
    const rotor = this._num("recuperator") ?? 0;
    const heater = this._num("heater") ?? 0;
    const levelCur = this._num("level_current");
    const boostOn = this._is("boost", "on");
    const boostLeft = this._num("boost_remaining");
    const alarmSt = this._st("alarm")?.state;
    const alarm = alarmSt && !["OK", "unknown", "unavailable"].includes(alarmSt) ? alarmSt : null;
    const clock = this._st("clock")?.state;

    // header
    let status = running ? t.running : t.stopped;
    if (levelCur !== undefined && running)
      status += " · " + (levelCur === 0 ? t.standby : levelCur === 4 ? t.boost : `${t.level} ${levelCur}`);
    if (boostOn) status += ` · ${t.boost}${boostLeft ? ` ${Math.round(boostLeft)} ${t.min}` : ""}`;
    const pStatus = this._q("#p-status");
    pStatus.textContent = status;
    pStatus.classList.toggle("on", running);
    const pClock = this._q("#p-clock");
    pClock.hidden = !clock || clock === "unknown" || clock === "unavailable";
    pClock.textContent = `🕒 ${clock}`;
    const pAlarm = this._q("#p-alarm");
    pAlarm.hidden = !alarm;
    pAlarm.textContent = `⚠ ${alarm}`;

    this._updateSvg({ t, running, supplyT, setpoint, supplyFan, exhaustFan, rotor, heater, alarm });
    if (this._config.show_controls) {
      this._updatePanel({ t, powerOn, boostOn, boostLeft, setpoint, supplyT, supplyFan, exhaustFan, rotor, heater, running, alarm, levelCur });
      if (this._config.show_schedule) this._updateSchedule();
    }
  }

  _updateSvg({ t, running, supplyT, setpoint, supplyFan, exhaustFan, rotor, heater, alarm }) {
    const supplyCol = airColor(supplyT);
    const unit = this._q("#unit");
    unit.style.stroke = alarm ? C.alarm : running ? C.active : C.neutral;
    unit.setAttribute("filter", alarm ? "url(#glowAlarm)" : running ? "url(#glow)" : "");

    const cols = [C.outdoor, supplyCol, C.extract, C.exhaust];
    const pcts = [supplyFan, supplyFan, exhaustFan, exhaustFan];
    cols.forEach((col, i) => {
      const duct = this._q(`#duct${i}`);
      duct.style.stroke = col;
      this._q(`#arr${i}`).style.fill = col;
      const g = this._q(`#flow${i}`);
      const on = running && pcts[i] > 0;
      g.style.display = on ? "" : "none";
      const dur = `${Math.min(4, Math.max(0.5, (1.2 * 60) / (pcts[i] || 1))).toFixed(2)}s`;
      g.querySelectorAll("path").forEach((p) => {
        p.setAttribute("d", duct.getAttribute("d"));
        if (p.style.animationDuration !== dur) p.style.animationDuration = dur;
      });
    });

    const setFan = (id, pct, label) => {
      const f = this._q(id);
      const on = running && pct > 0;
      f.classList.toggle("on", on);
      const dur = `${Math.min(6, Math.max(0.4, 60 / (pct || 1))).toFixed(2)}s`;
      const blades = f.querySelector(".blades");
      if (blades.style.animationDuration !== dur) blades.style.animationDuration = dur;
      f.querySelector("text").textContent = label;
    };
    setFan("#fan-s", supplyFan, `${t.supply} ${Math.round(supplyFan)} %`);
    setFan("#fan-e", exhaustFan, `${t.exhaust} ${Math.round(exhaustFan)} %`);

    // plate exchanger + on/off bypass: recovery level below 50 % = bypass open
    const bypassOpen = running && rotor < 50;
    this._q("#xp-s").style.stroke = supplyCol;
    this._q("#xp-e").style.stroke = C.extract;
    this._q("#rotor").classList.toggle("on", running && rotor > 0);
    this._q("#rotor-val").textContent = `${Math.round(rotor)} %`;
    const bp = this._q("#bypass");
    bp.classList.toggle("open", bypassOpen);
    this._q("#damper").setAttribute("transform", bypassOpen ? "rotate(90)" : "");
    this._q("#bypass-flow").style.display = bypassOpen && supplyFan > 0 ? "" : "none";
    this._q("#bypass-lbl").textContent = `${t.bypass}: ${bypassOpen ? t.bypass_open : t.bypass_closed}`;

    const coil = this._q("#coil");
    coil.style.stroke = heater > 0 ? C.heater : C.heaterOff;
    coil.setAttribute("filter", heater > 0 ? "url(#heat)" : "");
    this._q("#heater-lbl").textContent = `${t.heater} ${Math.round(heater)} %`;

    // chips share their left edge at x
    const chip = (id, x, y, text, color) => {
      const g = this._q(id);
      const w = Math.max(44, text.length * 7 + 14);
      g.setAttribute("transform", `translate(${x},${y - 11})`);
      g.querySelector("rect").setAttribute("width", w);
      const tx = g.querySelector("text");
      tx.setAttribute("x", w / 2);
      tx.textContent = text;
      tx.style.fill = color || "";
    };
    chip("#chip-supply", 604, 150, `${t.supply} ${this._fmt(supplyT)} °C`, supplyCol);
    chip("#chip-sp", 604, 178, `${t.setpoint} ${this._fmt(setpoint)} °C`);
  }

  _updatePanel({ t, powerOn, boostOn, boostLeft, setpoint, supplyT, supplyFan, exhaustFan, rotor, heater, running, alarm, levelCur }) {
    const b1000 = this._block("block_1000", 14);
    const b1100 = this._block("block_1100", 17);
    const b1200 = this._block("block_1200", 6);
    this._q("#data-missing").hidden = !!(b1000 && b1100 && b1200);
    const suffixed = ["supply_temp", "supply_fan", "exhaust_fan", "recuperator", "heater"].some(
      (k) => !this._st(k) || this._st(k).state === "unavailable" ? !!this._hass.states[`${this._e[k]}_2`] : false
    );
    this._q("#suffix-missing").hidden = !suffixed;
    const mode = this._st("mode")?.state;
    const fmtPct = (v) => (v === undefined ? "—" : `${Math.round(v)} %`);

    // home
    this._q("#h-temp").textContent = supplyT === undefined ? "—" : `${this._fmt(supplyT)}°`;
    this._q("#h-temp").style.color = airColor(supplyT);
    if (this._pendingSetpoint === undefined) this._q("#sp-value").textContent = `${this._fmt(setpoint)} °C`;
    const level = this._st("level")?.state;
    this.shadowRoot.querySelectorAll("#modes .mbtn").forEach((b) => b.classList.toggle("sel", b.dataset.value === level));
    const modes = this._q("#modes");
    modes.classList.toggle("dim", mode === "Auto");
    modes.title = mode === "Auto" ? t.auto_hint : "";
    for (const id of ["#b-power"]) {
      const bp = this._q(id);
      bp.classList.toggle("on", powerOn);
      bp.querySelector(".txt").textContent = powerOn ? t.power : t.power_off;
    }
    for (const id of ["#b-boost", "#b-boost2"]) {
      const bb = this._q(id);
      bb.classList.toggle("boost", boostOn);
      bb.querySelector(".txt").textContent = `${id === "#b-boost" ? t.boost : t.ovr}${boostOn && boostLeft ? ` · ${Math.round(boostLeft)} ${t.min}` : ""}`;
    }
    const mark = (id, state) =>
      this.shadowRoot.querySelectorAll(`#${id} button`).forEach((b) => b.classList.toggle("sel", b.dataset.value === state));
    mark("seg-mode", mode);
    mark("seg-mode2", mode);
    mark("seg-season", this._st("season")?.state);
    const waterHeat = this._num("water_heating") ?? 0;
    const waterCool = this._num("water_cooling") ?? 0;
    const on = (id, v) => this._q(id).classList.toggle("on", !!v);
    on("#st-fans", running);
    on("#st-rec", running && rotor > 0);
    on("#st-heat", heater > 0 || waterHeat > 0);
    on("#st-cool", waterCool > 0);
    on("#st-sched", mode === "Auto");
    on("#st-ovr", boostOn);
    this._q("#st-alarm").classList.toggle("alarm", !!alarm);

    // overview
    const code = this._num("alarm_code");
    const warn = b1000 ? b1000[7] : undefined;
    const ab = this._q("#ov-alarm");
    ab.classList.toggle("bad", !!alarm);
    ab.innerHTML = alarm
      ? `<b>⚠ ${alarm}</b> <span class="hint">(${t.alarm_word} ${code ?? "?"})</span>`
      : `<b>✓ ${t.no_alarm}</b>`;
    if (warn) {
      ab.innerHTML += `<div class="hint">${t.warnings}: 0x${warn.toString(16).toUpperCase().padStart(4, "0")}${
        warn & 0x2000 ? ` – ${t.service_warning}` : ""
      }</div>`;
    }
    const waterT = this._num("water_temp");
    const rows = [
      [t.supply_air, supplyT === undefined ? "—" : `${this._fmt(supplyT)} °C`, "supply_temp"],
      [t.setpoint, `${this._fmt(setpoint)} °C`, "setpoint"],
      ...(waterT !== undefined ? [[t.water_temp, `${this._fmt(waterT)} °C`, "water_temp"]] : []),
      [`${t.supply} – ${t.fans.toLowerCase()}`, fmtPct(supplyFan), "supply_fan"],
      [`${t.exhaust} – ${t.fans.toLowerCase()}`, fmtPct(exhaustFan), "exhaust_fan"],
      [t.rotor, fmtPct(rotor), "recuperator"],
      [t.bypass, running && rotor < 50 ? t.bypass_open : t.bypass_closed, "recuperator"],
      [t.heater, fmtPct(heater), "heater"],
      [t.water_heating, fmtPct(this._num("water_heating")), "water_heating"],
      [t.water_cooling, fmtPct(this._num("water_cooling")), "water_cooling"],
      [t.current_level, levelCur === undefined ? "—" : levelCur === 0 ? t.standby : levelCur === 4 ? "OVR" : `${levelCur}`, "level_current"],
      [t.unit_time, `${this._st("clock")?.state ?? "—"} · ${this._st("date")?.state ?? ""}`, "clock"],
    ];
    this._q("#ov-details").innerHTML = rows
      .map(([k, v, info]) => `<span>${k}</span><span class="val" data-info="${info}">${v}</span>`)
      .join("");

    // functions – fill the inputs once the data is there (not while the user edits)
    if (this._tab === "functions" && !this._fnFilled) this._fillFunctions();

    // settings
    this._q("#st-time").textContent = `${this._st("clock")?.state ?? "—"} · ${this._st("date")?.state ?? ""}`;
    const drift = this._num("drift");
    this._q("#st-drift").textContent = drift === undefined ? "—" : `${drift > 0 ? "+" : ""}${drift} ${t.min}`;
    this._q("#st-id").textContent = b1000 ? b1000[6] : "—";
    if (this._intLevel !== undefined && !this._q("#int-s").value && b1100) this._openIntensity(this._intLevel);
    void b1200;
  }

  _updateSchedule() {
    const sch = this._schedule();
    this._q("#sched-missing").hidden = !!sch;
    this._q("#sgrid").style.display = sch ? "" : "none";
    if (!sch) return;
    const now = new Date();
    const today = (now.getDay() + 6) % 7;
    const nowPct = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
    for (let d = 0; d < 7; d++) {
      let html = "";
      for (let p = 0; p < 3; p++) {
        const s = minutes(sch.times[d * 6 + p * 2]);
        const e = minutes(sch.times[d * 6 + p * 2 + 1]);
        if (e <= s) continue;
        const l = sch.levels[d * 3 + p];
        const w = ((e - s) / 1440) * 100;
        html += `<i class="sg" style="left:${(s / 1440) * 100}%;width:${w}%;background:${LEVEL_COLORS[l] || LEVEL_COLORS[0]}"
          title="${hhmm(sch.times[d * 6 + p * 2])}–${hhmm(sch.times[d * 6 + p * 2 + 1])} · ${l}">${w > 6 ? l : ""}</i>`;
      }
      if (d === today) html += `<b class="now" style="left:${nowPct}%"></b>`;
      this._q(`#bar${d}`).innerHTML = html;
    }
  }
}

const STYLE = `
  :host { display: block; }
  ha-card { display: block; padding: 10px 12px 12px; overflow: hidden; }
  .wrap { container-type: inline-size; color: var(--primary-text-color, #e1e1e1); }
  .header { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 0 2px 4px; }
  .title { font-size: var(--ha-font-size-l, 17px); font-weight: var(--ha-font-weight-medium, 500); color: var(--primary-text-color, #e1e1e1); }
  .pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .pill { font-size: 12px; padding: 2px 9px; border-radius: 12px; border: 1px solid var(--divider-color, #444);
    color: var(--secondary-text-color, #9b9b9b); cursor: pointer; white-space: nowrap; }
  .pill.on { color: #4caf50; border-color: #4caf50; }
  .pill.alarm { color: #fff; background: var(--error-color, #db4437); border-color: transparent; }
  [hidden] { display: none !important; }

  .body { display: grid; gap: 12px; }
  svg.schema { display: block; width: 100%; height: auto; max-height: min(46vh, 460px); font-family: inherit; }
  .side { width: 100%; max-width: 640px; justify-self: center; }
  .ptop { display: flex; justify-content: flex-end; }
  .wall { stroke: var(--divider-color, #666); stroke-width: 2; stroke-dasharray: 6 6; }
  .zone { fill: var(--secondary-text-color, #9b9b9b); font-size: 11px; letter-spacing: 1px; }
  .unit { fill: var(--card-background-color, #1c1c1c); stroke-width: 2; }
  .duct { fill: none; stroke-width: 7; stroke-linecap: round; }
  .flow { fill: none; stroke: #fff; stroke-width: 2.5; pointer-events: none; animation: flow 1.2s linear infinite; }
  @keyframes flow { to { stroke-dashoffset: -40; } }
  .device-label { fill: var(--primary-text-color, #e0e0e0); font-size: 11px; pointer-events: none; }
  .device-value { fill: var(--primary-text-color, #e0e0e0); font-size: 12px; font-weight: 500; pointer-events: none; }
  .filter rect { fill: var(--card-background-color, #1c1c1c); stroke: var(--secondary-text-color, #9b9b9b); stroke-width: 1.5; }
  .filter path { fill: none; stroke: var(--secondary-text-color, #9b9b9b); stroke-width: 1.2; }
  .hex, .bypass, .fan, .heater, .chip { cursor: pointer; }
  .hex-bg { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 2; stroke-linejoin: round; }
  .plates line { stroke: #78909c; stroke-width: 1.2; }
  .hex.on .hex-bg { stroke: #4caf50; }
  .hex.on .plates line { stroke: #4caf50; opacity: 0.8; }
  .xpath { fill: none; stroke-width: 3; opacity: 0.55; stroke-linecap: round; pointer-events: none; }
  .hex-val-bg { fill: var(--card-background-color, #1c1c1c); }
  .bypass-duct { fill: none; stroke: var(--divider-color, #666); stroke-width: 4; stroke-linejoin: round; stroke-dasharray: 2 4; }
  .bypass.open .bypass-duct { stroke: #8fb3d9; stroke-dasharray: none; }
  .bypass-flow { stroke-width: 1.6; }
  .damper { stroke: #ff9800; stroke-width: 3; stroke-linecap: round; transition: transform .4s; }
  .damper-pin { fill: #ff9800; }
  .wheel, .blades { transform-box: fill-box; transform-origin: center; }
  .fan-ring { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 2; }
  .fan.on .fan-ring { stroke: #4caf50; }
  .blades path { fill: #78909c; }
  .fan.on .blades path { fill: #03a9f4; }
  .fan.on .blades { animation: spin 1.6s linear infinite; }
  .hub { fill: var(--primary-text-color, #e0e0e0); }
  @keyframes spin { to { transform: rotate(360deg); } }
  .heater-box { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 1.5; }
  .coil { fill: none; stroke-width: 2; stroke-linejoin: round; }
  .chip rect { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #555); stroke-width: 1; }
  .chip text { fill: var(--primary-text-color, #e1e1e1); font-size: 12px; }
  @media (prefers-reduced-motion: reduce) { .flow, .blades { animation: none !important; } }

  .side { display: grid; gap: 12px; align-content: start; }
  button { font: inherit; font-size: 15.5px; color: var(--primary-text-color, #e1e1e1); background: transparent; cursor: pointer;
    border: 1px solid var(--divider-color, #555); border-radius: 7px; padding: 5px 12px; line-height: 1.3;
    touch-action: manipulation; user-select: none; -webkit-tap-highlight-color: transparent; }
  button:hover { border-color: var(--primary-color, #03a9f4); }
  button:active { transform: scale(0.97); }
  button.pending { opacity: 0.6; }
  .controls { display: grid; gap: 8px; }
  .crow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .lbl { color: var(--secondary-text-color, #9b9b9b); font-size: 12px; }
  .tg { display: inline-flex; align-items: center; gap: 6px; }
  .tg.on { border-color: #4caf50; color: #4caf50; background: rgba(76,175,80,.10); }
  .tg.boost { border-color: #ff7043; color: #ff7043; background: rgba(255,112,67,.10); }
  .ico { font-size: 17px; }
  .seg { display: inline-flex; }
  .seg button { border-radius: 0; margin-left: -1px; min-width: 41px; }
  .seg button:first-child { border-radius: 7px 0 0 7px; margin-left: 0; }
  .seg button:last-child { border-radius: 0 7px 7px 0; }
  .seg button.sel { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
  .seg.dim button.sel { opacity: .55; }
  .stepper { display: inline-flex; align-items: center; gap: 4px; }
  .stepper button { width: 36px; padding: 2px 0; font-size: 18px; }
  .stepper span { min-width: 64px; text-align: center; font-size: 15px; font-weight: 500; color: var(--primary-text-color, #e1e1e1); cursor: pointer; }

  .sched { display: grid; gap: 6px; border-top: 1px solid var(--divider-color, #333); padding-top: 8px; }
  .sched-head { display: flex; align-items: baseline; gap: 8px; }
  .sub { font-size: 14px; font-weight: 500; color: var(--primary-text-color, #e1e1e1); }
  .hint, .missing { font-size: 11px; color: var(--secondary-text-color, #9b9b9b); }
  .sgrid { display: grid; grid-template-columns: 36px 1fr; gap: 3px 6px; align-items: center; }
  .scale { position: relative; height: 13px; font-size: 10px; color: var(--secondary-text-color, #9b9b9b); }
  .scale span { position: absolute; transform: translateX(-50%); }
  .scale span:first-child { transform: none; }
  .scale span:last-child { transform: translateX(-100%); }
  .day { padding: 1px 0; font-size: 13px; border-color: transparent; color: var(--secondary-text-color, #9b9b9b); }
  .day.sel { border-color: var(--primary-color, #03a9f4); color: var(--primary-text-color, #e1e1e1); }
  .bar { position: relative; height: 16px; border-radius: 3px; cursor: pointer;
    background: repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 1px, transparent 1px calc(100% / 8)), rgba(255,255,255,.03); }
  .sg { position: absolute; top: 2px; bottom: 2px; border-radius: 2px; font-size: 10px; font-style: normal; color: #111;
    display: flex; align-items: center; justify-content: center; font-weight: 600; pointer-events: none; }
  .now { position: absolute; top: -2px; bottom: -2px; width: 2px; background: #fff; border-radius: 1px; pointer-events: none; }
  .legend { display: flex; gap: 10px; flex-wrap: wrap; font-size: 11px; color: var(--secondary-text-color, #9b9b9b); padding-left: 36px; }
  .legend i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; vertical-align: -1px; }
  .editor { display: grid; gap: 6px; padding: 8px; border: 1px solid var(--divider-color, #444); border-radius: 8px; }
  .ed-title { font-size: 13px; font-weight: 500; color: var(--primary-text-color, #e1e1e1); }
  .ed-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; color: var(--secondary-text-color, #9b9b9b); }
  .ed-row .lbl { min-width: 48px; }
  input.tm, select { font: inherit; font-size: 13px; color: var(--primary-text-color, #e1e1e1);
    background: var(--card-background-color, #1c1c1c); border: 1px solid var(--divider-color, #555); border-radius: 6px; padding: 3px 6px; }
  input.tm { width: 52px; text-align: center; }
  .ed-btns { display: flex; gap: 6px; flex-wrap: wrap; }
  .fx-list { font-size: 12px; display: grid; gap: 2px; margin: 6px 0; overflow-wrap: anywhere; }
  .fx-list code { font-size: 11.5px; }
  .fx-list .err { color: var(--error-color, #db4437); }
  button.primary { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
  .msg { font-size: 11px; color: var(--secondary-text-color, #9b9b9b); min-height: 14px; }
  .msg.ok { color: #4caf50; }
  .msg.err { color: var(--error-color, #db4437); }

  /* C4.1-style panel */
  .tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--divider-color, #333); flex-wrap: wrap; }
  .tab { border: none; border-bottom: 2px solid transparent; border-radius: 0; padding: 7px 12px; color: var(--secondary-text-color, #9b9b9b); }
  .tab.sel { color: var(--primary-text-color, #e1e1e1); border-bottom-color: var(--primary-color, #03a9f4); }
  .pane { display: grid; gap: 10px; align-content: start; }
  .pane.sched { border-top: none; padding-top: 0; }
  .home-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .bigtemp { display: flex; align-items: baseline; gap: 8px; cursor: pointer; }
  .bigtemp span { font-size: 42px; font-weight: 300; line-height: 1; }
  .bigtemp small, .mbtn small { color: var(--secondary-text-color, #9b9b9b); font-size: 11px; }
  .spbox { display: grid; gap: 2px; justify-items: end; }
  .modes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .mode { position: relative; }
  .mbtn { width: 100%; display: grid; justify-items: center; gap: 2px; padding: 8px 4px; border-radius: 10px; font-size: 13px; }
  .mbtn ha-icon { --mdc-icon-size: 26px; }
  .mbtn.sel { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
  .mbtn.sel small { color: rgba(255,255,255,.8); }
  .modes.dim .mbtn.sel { opacity: .55; }
  .gear { position: absolute; top: 3px; right: 3px; border: none; padding: 0 4px; font-size: 14px; color: var(--secondary-text-color, #9b9b9b); }
  .gear.sel { color: var(--primary-color, #03a9f4); }
  .mbtn.sel + .gear { color: rgba(255,255,255,.85); }
  .icons { display: flex; flex-wrap: wrap; gap: 6px; }
  .st { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; padding: 2px 8px; border-radius: 10px;
    border: 1px solid var(--divider-color, #444); color: var(--secondary-text-color, #9b9b9b); opacity: .45; }
  .st ha-icon { --mdc-icon-size: 15px; }
  .st.on { opacity: 1; color: #4caf50; border-color: #4caf50; }
  .st.alarm { opacity: 1; color: #fff; background: var(--error-color, #db4437); border-color: transparent; }
  .alarmbox { padding: 8px 10px; border-radius: 8px; border: 1px solid #4caf50; color: #4caf50; cursor: pointer; }
  .alarmbox.bad { border-color: var(--error-color, #db4437); color: var(--error-color, #db4437); }
  .kv { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; font-size: 13px; align-items: center; }
  .kv > span:nth-child(odd) { color: var(--secondary-text-color, #9b9b9b); }
  .kv .val { cursor: pointer; }
  .hist { display: grid; gap: 2px; font-size: 12px; max-height: 180px; overflow: auto; color: var(--secondary-text-color, #9b9b9b); }
  .hrow { display: grid; grid-template-columns: auto 34px 1fr; gap: 8px; }
  .hrow b { color: var(--error-color, #db4437); }
  .fbox { display: grid; gap: 6px; padding: 8px; border: 1px solid var(--divider-color, #333); border-radius: 8px; }
  input.num { width: 58px; text-align: center; font: inherit; font-size: 13px; color: var(--primary-text-color, #e1e1e1);
    background: var(--card-background-color, #1c1c1c); border: 1px solid var(--divider-color, #555); border-radius: 6px; padding: 3px 4px; }
`;

if (customElements.get("komfovent-card")) {
  // another build (e.g. _sk and _en) is already loaded – keep only one resource in Home Assistant
  console.warn("komfovent-card is already defined – load only one of komfovent-card*.js");
} else {
customElements.define("komfovent-card", KomfoventCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "komfovent-card",
  name: "Komfovent",
  description: "Komfovent C4 ventilation unit – schema and a C4.1-style control panel",
  preview: true,
});
}
console.info(`%c KOMFOVENT-CARD %c ${VERSION}${FORCE_LANG ? ` (${FORCE_LANG})` : ""} `, "background:#03a9f4;color:#fff", "background:#333;color:#fff");
