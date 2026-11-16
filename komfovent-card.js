/**
 * Komfovent Card – visualization and control of a Komfovent C4 ventilation unit
 * Styled like the Heating Visualizer Card (dark SVG schema, colored ducts, animated flow).
 *
 * Installation: copy to <config>/www/komfovent-card.js
 *   Settings → Dashboards → ⋮ → Resources → /local/komfovent-card.js (JavaScript module)
 *
 * Card:
 *   type: custom:komfovent-card
 *   name: Rekuperácia            # optional
 *   show_controls: true          # optional
 *   show_schedule: true          # optional, weekly schedule (registers 1300–1362)
 *   modbus_hub: komfovent_c4     # optional, hub name for writing the schedule
 *   modbus_slave: 20             # optional, Modbus ID of the unit
 *   entities:                    # optional – only entities named differently
 *     supply_temp: sensor.komfovent_supply_air_temp
 *
 * The DOM is built once and only updated afterwards, so buttons keep working while
 * Home Assistant pushes new states and the animations do not restart.
 */

const VERSION = "1.1.0";

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
      show_controls: true,
      show_schedule: true,
      modbus_hub: "komfovent_c4",
      modbus_slave: 20,
      ...config,
    };
    this._e = { ...DEFAULT_ENTITIES, ...(config.entities || {}) };
    this._sig = "";
    this._built = false;
    this._day = undefined;
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
    return { name: "Rekuperácia" };
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  get _t() {
    const lang = this._hass?.locale?.language || this._hass?.language || "en";
    return TEXTS[lang.startsWith("sk") || lang.startsWith("cs") ? "sk" : "en"];
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
    const lang = this._hass?.locale?.language || this._hass?.language || "sk";
    return v.toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  _q(sel) {
    return this.shadowRoot.querySelector(sel);
  }
  _call(domain, service, data) {
    return this._hass.callService(domain, service, data);
  }
  _moreInfo(key) {
    const entityId = this._e[key];
    if (!entityId) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
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
      case "season":
      case "mode": {
        el.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("sel", b === el));
        pending();
        this._call("select", "select_option", { entity_id: this._e[a], option: v });
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
    if (!writes.length) {
      msg.textContent = t.nothing;
      msg.className = "msg";
      return;
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
          value,
        });
        msg.textContent = `${t.saving} ${i + 1}/${writes.length}`;
      }
      await this._call("homeassistant", "update_entity", {
        entity_id: [this._e.schedule_times, this._e.schedule_levels],
      });
      msg.textContent = `${t.saved} (${writes.length})`;
      msg.className = "msg ok";
    } catch (err) {
      msg.textContent = `${t.error}: ${err?.message || err}`;
      msg.className = "msg err";
    }
  }

  // ── build once ───────────────────────────────────────────────────────────
  _build() {
    const t = this._t;
    const cfg = this._config;
    const seg = (id, action, items) =>
      `<div class="seg" id="${id}">${items
        .map(([v, label]) => `<button data-action="${action}" data-value="${v}">${label}</button>`)
        .join("")}</div>`;
    const levelOpts = [0, 1, 2, 3].map((l) => `<option value="${l}">${l === 0 ? t.off : `${t.level} ${l}`}</option>`).join("");

    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card><div class="wrap">
        <div class="header">
          <div class="title">${cfg.name || t.title}</div>
          <div class="pills">
            <span class="pill muted" id="p-clock" data-info="clock"></span>
            <span class="pill alarm" id="p-alarm" data-info="alarm" hidden></span>
            <span class="pill" id="p-status" data-info="fans_running"></span>
          </div>
        </div>
        <div class="body">
          <div class="schema-wrap">${this._svgSkeleton(t)}</div>
          ${
            cfg.show_controls || cfg.show_schedule
              ? `<div class="side">
            ${
              cfg.show_controls
                ? `<div class="controls">
              <div class="crow">
                <button class="tg" id="b-power" data-action="power"><span class="ico">⏻</span><span class="txt"></span></button>
                <button class="tg" id="b-boost" data-action="boost"><span class="ico">🚀</span><span class="txt"></span></button>
                ${seg("seg-mode", "mode", [["Manual", t.manual], ["Auto", t.auto]])}
              </div>
              <div class="crow">
                <span class="lbl">${t.ventilation}</span>
                ${seg("seg-level", "level", [["Level 1", "1"], ["Level 2", "2"], ["Level 3", "3"]])}
                <span class="lbl">${t.temperature}</span>
                <div class="stepper">
                  <button data-action="sp" data-value="-0.5">−</button>
                  <span id="sp-value" data-info="setpoint"></span>
                  <button data-action="sp" data-value="0.5">+</button>
                </div>
              </div>
              <div class="crow">
                <span class="lbl">${t.season}</span>
                ${seg("seg-season", "season", [["Summer", "☀ " + t.summer], ["Winter", "❄ " + t.winter]])}
              </div>
            </div>`
                : ""
            }
            ${
              cfg.show_schedule
                ? `<div class="sched">
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
                .map((l) => `<span><i style="background:${LEVEL_COLORS[l]}"></i>${t.level} ${l}</span>`)
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
          </div>`
              : ""
          }
        </div>
      </div></ha-card>`;
    this._built = true;
  }

  _svgSkeleton(t) {
    const yS = 120;
    const yE = 250;
    const rx = 300;
    const flows = (i) =>
      `<g id="flow${i}">${FLOW_LAYERS.map(
        (l) => `<path class="flow" style="stroke-dasharray:${l.dash};opacity:${l.opacity}"/>`
      ).join("")}</g>`;
    const ducts = [
      `M 20 ${yS} L ${rx - 70} ${yS}`,
      `M ${rx + 70} ${yS} L 736 ${yS}`,
      `M 740 ${yE} L ${rx + 70} ${yE}`,
      `M ${rx - 70} ${yE} L 16 ${yE}`,
    ];
    const blade = (a) => `<path d="M0 0 C 4 -6, 10 -14, 2 -16 C -4 -16, -4 -6, 0 0 Z" transform="rotate(${a})"/>`;
    const fan = (id, cx, cy, info) => `<g class="fan" id="${id}" data-info="${info}" transform="translate(${cx},${cy})">
        <circle r="20" class="fan-ring"/><g class="blades">${blade(0)}${blade(120)}${blade(240)}</g>
        <circle r="3" class="hub"/><text y="38" text-anchor="middle" class="device-label"></text></g>`;
    const filter = (x, y) => `<g class="filter" transform="translate(${x},${y})">
        <rect x="-7" y="-16" width="14" height="32" rx="2"/><path d="M-7 -12 L7 -8 L-7 -4 L7 0 L-7 4 L7 8 L-7 12"/></g>`;
    const arrow = (id, x, y, dir) =>
      `<path id="${id}" d="M ${x - 7 * dir} ${y - 7} L ${x + 5 * dir} ${y} L ${x - 7 * dir} ${y + 7} Z"/>`;
    const spokes = Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return `<line x1="0" y1="0" x2="${(64 * Math.cos(a)).toFixed(1)}" y2="${(64 * Math.sin(a)).toFixed(1)}"/>`;
    }).join("");
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
      <rect id="unit" x="170" y="70" width="420" height="226" rx="10" class="unit"/>
      ${ducts.map((d, i) => `<path id="duct${i}" d="${d}" class="duct"/>${flows(i)}`).join("")}
      ${arrow("arr0", 150, yS, 1)}${arrow("arr1", 742, yS, 1)}${arrow("arr2", 650, yE, -1)}${arrow("arr3", 13, yE, -1)}
      <text x="22" y="${yS - 14}" class="device-label">${t.outdoor_air}</text>
      <text x="22" y="${yE + 24}" class="device-label">${t.exhaust_air}</text>
      <text x="738" y="${yS - 14}" text-anchor="end" class="device-label">${t.supply_air}</text>
      <text x="738" y="${yE + 24}" text-anchor="end" class="device-label">${t.extract_air}</text>
      ${filter(205, yS)}${filter(555, yE)}
      <g class="rotor" id="rotor" data-info="recuperator" transform="translate(${rx},185)">
        <circle r="70" class="rotor-bg"/>
        <g class="wheel"><circle r="64" class="rotor-rim"/>${spokes}</g>
        <circle r="24" class="rotor-hub"/>
        <text y="5" text-anchor="middle" class="device-value" id="rotor-val"></text>
        <text y="88" text-anchor="middle" class="device-label">${t.rotor}</text>
      </g>
      ${fan("fan-s", 420, yS, "supply_fan")}
      ${fan("fan-e", 225, yE, "exhaust_fan")}
      <g class="heater" data-info="heater" transform="translate(500,${yS})">
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
    const lang = this._hass.locale?.language || this._hass.language;
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
    if (this._config.show_controls) this._updateControls(t, powerOn, boostOn, boostLeft, setpoint);
    if (this._config.show_schedule) this._updateSchedule();
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

    const r = this._q("#rotor");
    r.classList.toggle("on", running && rotor > 0);
    const rdur = `${Math.min(10, Math.max(1.2, 120 / (rotor || 1))).toFixed(2)}s`;
    const wheel = r.querySelector(".wheel");
    if (wheel.style.animationDuration !== rdur) wheel.style.animationDuration = rdur;
    this._q("#rotor-val").textContent = `${Math.round(rotor)} %`;

    const coil = this._q("#coil");
    coil.style.stroke = heater > 0 ? C.heater : C.heaterOff;
    coil.setAttribute("filter", heater > 0 ? "url(#heat)" : "");
    this._q("#heater-lbl").textContent = `${t.heater} ${Math.round(heater)} %`;

    const chip = (id, x, y, text, color) => {
      const g = this._q(id);
      const w = Math.max(44, text.length * 7 + 14);
      g.setAttribute("transform", `translate(${x - w / 2},${y - 11})`);
      g.querySelector("rect").setAttribute("width", w);
      const tx = g.querySelector("text");
      tx.setAttribute("x", w / 2);
      tx.textContent = text;
      tx.style.fill = color || "";
    };
    chip("#chip-supply", 660, 150, `${t.supply} ${this._fmt(supplyT)} °C`, supplyCol);
    chip("#chip-sp", 660, 178, `${t.setpoint} ${this._fmt(setpoint)} °C`);
  }

  _updateControls(t, powerOn, boostOn, boostLeft, setpoint) {
    const bp = this._q("#b-power");
    bp.classList.toggle("on", powerOn);
    bp.querySelector(".txt").textContent = powerOn ? t.power : t.power_off;
    const bb = this._q("#b-boost");
    bb.classList.toggle("boost", boostOn);
    bb.querySelector(".txt").textContent = `${t.boost}${boostOn && boostLeft ? ` ${Math.round(boostLeft)} ${t.min}` : ""}`;
    const mark = (id, state) =>
      this.shadowRoot.querySelectorAll(`#${id} button`).forEach((b) => b.classList.toggle("sel", b.dataset.value === state));
    const mode = this._st("mode")?.state;
    mark("seg-level", this._st("level")?.state);
    mark("seg-season", this._st("season")?.state);
    mark("seg-mode", mode);
    const lvl = this._q("#seg-level");
    lvl.classList.toggle("dim", mode === "Auto");
    lvl.title = mode === "Auto" ? t.auto_hint : "";
    if (this._pendingSetpoint === undefined) this._q("#sp-value").textContent = `${this._fmt(setpoint)} °C`;
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
  .wrap { container-type: inline-size; }
  .header { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 0 2px 4px; }
  .title { font-size: var(--ha-font-size-l, 17px); font-weight: var(--ha-font-weight-medium, 500); color: var(--primary-text-color, #e1e1e1); }
  .pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .pill { font-size: 12px; padding: 2px 9px; border-radius: 12px; border: 1px solid var(--divider-color, #444);
    color: var(--secondary-text-color, #9b9b9b); cursor: pointer; white-space: nowrap; }
  .pill.on { color: #4caf50; border-color: #4caf50; }
  .pill.alarm { color: #fff; background: var(--error-color, #db4437); border-color: transparent; }
  [hidden] { display: none !important; }

  .body { display: grid; gap: 10px; }
  svg.schema { display: block; width: 100%; height: auto; max-height: 44vh; font-family: inherit; }
  @container (min-width: 820px) {
    .body { grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr); align-items: start; gap: 16px; }
    svg.schema { max-height: min(62vh, 520px); }
  }
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
  .rotor, .fan, .heater, .chip { cursor: pointer; }
  .rotor-bg { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 2; }
  .rotor-rim { fill: none; stroke: #78909c; stroke-width: 2; }
  .wheel line { stroke: #78909c; stroke-width: 1.5; }
  .rotor.on .rotor-rim, .rotor.on .wheel line { stroke: #4caf50; }
  .rotor-hub { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 1.5; }
  .wheel, .blades { transform-box: fill-box; transform-origin: center; }
  .rotor.on .wheel { animation: spin 4s linear infinite; }
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
  @media (prefers-reduced-motion: reduce) { .flow, .wheel, .blades { animation: none !important; } }

  .side { display: grid; gap: 12px; align-content: start; }
  button { font: inherit; font-size: 13px; color: var(--primary-text-color, #e1e1e1); background: transparent; cursor: pointer;
    border: 1px solid var(--divider-color, #555); border-radius: 6px; padding: 4px 10px; line-height: 1.3;
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
  .ico { font-size: 14px; }
  .seg { display: inline-flex; }
  .seg button { border-radius: 0; margin-left: -1px; min-width: 34px; }
  .seg button:first-child { border-radius: 6px 0 0 6px; margin-left: 0; }
  .seg button:last-child { border-radius: 0 6px 6px 0; }
  .seg button.sel { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
  .seg.dim button.sel { opacity: .55; }
  .stepper { display: inline-flex; align-items: center; gap: 4px; }
  .stepper button { width: 30px; padding: 2px 0; font-size: 15px; }
  .stepper span { min-width: 64px; text-align: center; font-size: 15px; font-weight: 500; color: var(--primary-text-color, #e1e1e1); cursor: pointer; }

  .sched { display: grid; gap: 6px; border-top: 1px solid var(--divider-color, #333); padding-top: 8px; }
  .sched-head { display: flex; align-items: baseline; gap: 8px; }
  .sub { font-size: 14px; font-weight: 500; color: var(--primary-text-color, #e1e1e1); }
  .hint, .missing { font-size: 11px; color: var(--secondary-text-color, #9b9b9b); }
  .sgrid { display: grid; grid-template-columns: 30px 1fr; gap: 3px 6px; align-items: center; }
  .scale { position: relative; height: 13px; font-size: 10px; color: var(--secondary-text-color, #9b9b9b); }
  .scale span { position: absolute; transform: translateX(-50%); }
  .scale span:first-child { transform: none; }
  .scale span:last-child { transform: translateX(-100%); }
  .day { padding: 1px 0; font-size: 11px; border-color: transparent; color: var(--secondary-text-color, #9b9b9b); }
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
  button.primary { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
  .msg { font-size: 11px; color: var(--secondary-text-color, #9b9b9b); min-height: 14px; }
  .msg.ok { color: #4caf50; }
  .msg.err { color: var(--error-color, #db4437); }
`;

customElements.define("komfovent-card", KomfoventCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "komfovent-card",
  name: "Komfovent",
  description: "Komfovent C4 ventilation unit – schema, controls and weekly schedule",
  preview: true,
});
console.info(`%c KOMFOVENT-CARD %c ${VERSION} `, "background:#03a9f4;color:#fff", "background:#333;color:#fff");
