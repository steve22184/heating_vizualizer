/**
 * Komfovent Card – vizualizácia a ovládanie rekuperačnej jednotky Komfovent C4
 * Vzhľad zladený s Heating Visualizer Card (tmavé SVG, farebné potrubia, animovaný prúd).
 *
 * Inštalácia: skopíruj do <config>/www/komfovent-card.js
 *   Nastavenia → Dashboardy → ⋮ → Zdroje → /local/komfovent-card.js (JavaScript module)
 *
 * Karta:
 *   type: custom:komfovent-card
 *   name: Rekuperácia            # voliteľné
 *   show_controls: true          # voliteľné
 *   entities:                    # voliteľné – len ak sa tvoje entity volajú inak
 *     supply_temp: sensor.komfovent_supply_air_temp
 */

const VERSION = "1.0.0";

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
  water_temp: "sensor.komfovent_water_temp",
  recuperator: "sensor.komfovent_recuperator_level",
  heater: "sensor.komfovent_electric_heater_level",
  supply_fan: "sensor.komfovent_supply_fan_current",
  exhaust_fan: "sensor.komfovent_exhaust_fan_current",
  fans_running: "binary_sensor.komfovent_fans_running",
  alarm: "sensor.komfovent_alarm_status",
  clock: "sensor.komfovent_clock",
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
    filter: "Filter",
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
    mode: "Režim",
    manual: "Manuál",
    auto: "Auto",
    alarm_ok: "OK",
    min: "min",
    unavailable: "nedostupné",
    auto_hint: "V režime Auto riadi stupeň týždenný program",
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
    filter: "Filter",
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
    mode: "Mode",
    manual: "Manual",
    auto: "Auto",
    alarm_ok: "OK",
    min: "min",
    unavailable: "unavailable",
    auto_hint: "In Auto mode the weekly schedule sets the level",
  },
};

// Farby z Heating Visualizer Card
const C = {
  outdoor: "#4dd0e1", // studená voda / čerstvý vzduch
  extract: "#ffa726", // teplý odvod
  exhaust: "#90a4ae",
  active: "#4caf50",
  heater: "#ff7043",
  heaterOff: "#b0bec5",
  alarm: "var(--error-color, #db4437)",
  neutral: "var(--divider-color, #888)",
  accent: "var(--primary-color, #03a9f4)",
  card: "var(--card-background-color, #1c1c1c)",
};

/** Teplota vzduchu na stupnici modrá → červená (10–30 °C). */
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

class KomfoventCard extends HTMLElement {
  setConfig(config) {
    this._config = { show_controls: true, ...config };
    this._e = { ...DEFAULT_ENTITIES, ...(config.entities || {}) };
    this._sig = "";
    this._pendingSetpoint = undefined;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
      this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
    }
    if (this._hass) this._render(true);
  }

  set hass(hass) {
    this._hass = hass;
    const sig = Object.values(this._e)
      .map((id) => {
        const s = hass.states[id];
        return s ? s.state : "-";
      })
      .join("|");
    if (sig !== this._sig) {
      this._sig = sig;
      this._render();
    }
  }

  getCardSize() {
    return this._config && this._config.show_controls ? 9 : 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  static getStubConfig() {
    return { name: "Rekuperácia" };
  }

  // ── pomocné ──────────────────────────────────────────────────────────────
  get _t() {
    const lang = (this._hass && (this._hass.locale?.language || this._hass.language)) || "en";
    return TEXTS[lang.startsWith("sk") || lang.startsWith("cs") ? "sk" : "en"];
  }

  _st(key) {
    return this._hass && this._hass.states[this._e[key]];
  }

  _num(key) {
    const s = this._st(key);
    if (!s) return undefined;
    const v = parseFloat(s.state);
    return Number.isNaN(v) ? undefined : v;
  }

  _fmt(v, digits = 1) {
    if (v === undefined) return "—";
    const lang = this._hass?.locale?.language || this._hass?.language || "sk";
    return v.toLocaleString(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }

  _is(key, state) {
    const s = this._st(key);
    return !!s && s.state === state;
  }

  _callService(domain, service, data) {
    this._hass.callService(domain, service, data);
  }

  _moreInfo(key) {
    const entityId = this._e[key];
    if (!entityId) return;
    const ev = new Event("hass-more-info", { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  // ── akcie ────────────────────────────────────────────────────────────────
  _onClick(ev) {
    const el = ev.composedPath().find((n) => n.dataset && (n.dataset.action || n.dataset.info));
    if (!el) return;
    if (el.dataset.info) return this._moreInfo(el.dataset.info);
    const a = el.dataset.action;
    const val = el.dataset.value;
    if (a === "power") {
      this._callService("switch", this._is("power", "on") ? "turn_off" : "turn_on", { entity_id: this._e.power });
    } else if (a === "boost") {
      this._callService("switch", this._is("boost", "on") ? "turn_off" : "turn_on", { entity_id: this._e.boost });
    } else if (a === "level") {
      this._callService("select", "select_option", { entity_id: this._e.level, option: val });
    } else if (a === "season") {
      this._callService("select", "select_option", { entity_id: this._e.season, option: val });
    } else if (a === "mode") {
      this._callService("select", "select_option", { entity_id: this._e.mode, option: val });
    } else if (a === "sp") {
      this._stepSetpoint(parseFloat(val));
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
    const out = this.shadowRoot.querySelector("#sp-value");
    if (out) out.textContent = `${this._fmt(this._pendingSetpoint)} °C`;
    clearTimeout(this._spTimer);
    this._spTimer = setTimeout(() => {
      const value = this._pendingSetpoint;
      this._pendingSetpoint = undefined;
      this._callService("number", "set_value", { entity_id: this._e.setpoint, value });
    }, 900);
  }

  // ── vykreslenie ──────────────────────────────────────────────────────────
  _render() {
    if (!this._hass || !this._config) return;
    const t = this._t;
    const powerOn = this._is("power", "on");
    const fansState = this._st("fans_running");
    const running = fansState ? fansState.state === "on" : powerOn;
    const supplyT = this._num("supply_temp");
    const setpoint = this._pendingSetpoint ?? this._num("setpoint");
    const supplyFan = this._num("supply_fan") ?? 0;
    const exhaustFan = this._num("exhaust_fan") ?? 0;
    const rotor = this._num("recuperator") ?? 0;
    const heater = this._num("heater") ?? 0;
    const levelCur = this._num("level_current");
    const boostOn = this._is("boost", "on");
    const boostLeft = this._num("boost_remaining");
    const alarmState = this._st("alarm");
    const alarm = alarmState && !["OK", "unknown", "unavailable"].includes(alarmState.state) ? alarmState.state : null;
    const clock = this._st("clock")?.state;

    let status = running ? t.running : t.stopped;
    if (levelCur !== undefined && running) {
      status += " · " + (levelCur === 0 ? t.standby : levelCur === 4 ? t.boost : `${t.level} ${levelCur}`);
    }
    if (boostOn) status += ` · ${t.boost}${boostLeft ? ` ${Math.round(boostLeft)} ${t.min}` : ""}`;

    const name = this._config.name || t.title;
    const svg = this._svg({ t, running, supplyT, setpoint, supplyFan, exhaustFan, rotor, heater, alarm });

    this.shadowRoot.innerHTML = `
      <style>${STYLE}</style>
      <ha-card>
        <div class="header">
          <div class="title">${name}</div>
          <div class="pills">
            ${clock && clock !== "unknown" ? `<span class="pill muted" data-info="clock">🕒 ${clock}</span>` : ""}
            ${alarm ? `<span class="pill alarm" data-info="alarm">⚠ ${alarm}</span>` : ""}
            <span class="pill ${running ? "on" : ""}" data-info="fans_running">${status}</span>
          </div>
        </div>
        ${svg}
        ${this._config.show_controls ? this._controls(t, powerOn, boostOn, boostLeft, setpoint) : ""}
      </ha-card>`;
  }

  _controls(t, powerOn, boostOn, boostLeft, setpoint) {
    const level = this._st("level")?.state;
    const season = this._st("season")?.state;
    const mode = this._st("mode")?.state;
    const seg = (action, items, current, disabledHint) =>
      `<div class="seg ${disabledHint ? "dim" : ""}" ${disabledHint ? `title="${disabledHint}"` : ""}>${items
        .map(([v, label]) => `<button class="${v === current ? "sel" : ""}" data-action="${action}" data-value="${v}">${label}</button>`)
        .join("")}</div>`;
    return `
      <div class="controls">
        <div class="row">
          <button class="big ${powerOn ? "on" : ""}" data-action="power">
            <span class="ico">⏻</span>${powerOn ? t.power : t.power_off}</button>
          <button class="big ${boostOn ? "boost" : ""}" data-action="boost">
            <span class="ico">🚀</span>${t.boost}${boostOn && boostLeft ? ` · ${Math.round(boostLeft)} ${t.min}` : ""}</button>
        </div>
        <div class="row">
          <span class="lbl">${t.ventilation}</span>
          ${seg("level", [["Level 1", "1"], ["Level 2", "2"], ["Level 3", "3"]], level, mode === "Auto" ? t.auto_hint : "")}
        </div>
        <div class="row">
          <span class="lbl">${t.temperature}</span>
          <div class="stepper">
            <button data-action="sp" data-value="-0.5">−</button>
            <span id="sp-value" data-info="setpoint">${this._fmt(setpoint)} °C</span>
            <button data-action="sp" data-value="0.5">+</button>
          </div>
        </div>
        <div class="row">
          <span class="lbl">${t.season}</span>
          ${seg("season", [["Summer", "☀ " + t.summer], ["Winter", "❄ " + t.winter]], season)}
        </div>
        <div class="row">
          <span class="lbl">${t.mode}</span>
          ${seg("mode", [["Manual", t.manual], ["Auto", t.auto]], mode)}
        </div>
      </div>`;
  }

  _flow(d, pct, running, reverse = false) {
    if (!running || pct <= 0) return "";
    const dur = Math.min(4, Math.max(0.5, (1.2 * 60) / pct)).toFixed(2);
    return FLOW_LAYERS.map(
      (l) =>
        `<path d="${d}" class="flow" style="stroke-dasharray:${l.dash};opacity:${l.opacity};animation-duration:${dur}s;${
          reverse ? "animation-direction:reverse;" : ""
        }"/>`
    ).join("");
  }

  /** Šípka smeru prúdenia (dir 1 = doprava, -1 = doľava). */
  _arrow(x, y, dir, color) {
    return `<path d="M ${x - 7 * dir} ${y - 7} L ${x + 5 * dir} ${y} L ${x - 7 * dir} ${y + 7} Z" style="fill:${color}"/>`;
  }

  _chip(x, y, text, info, color) {
    const w = Math.max(44, text.length * 7 + 14);
    return `<g class="chip" data-info="${info}" transform="translate(${x - w / 2},${y - 11})">
      <rect width="${w}" height="22" rx="4"/>
      <text x="${w / 2}" y="15" text-anchor="middle" ${color ? `style="fill:${color}"` : ""}>${text}</text></g>`;
  }

  _fan(cx, cy, pct, running, info, label) {
    const on = running && pct > 0;
    const dur = on ? Math.min(6, Math.max(0.4, 60 / pct)).toFixed(2) : 0;
    const blade = (a) =>
      `<path d="M0 0 C 4 -6, 10 -14, 2 -16 C -4 -16, -4 -6, 0 0 Z" transform="rotate(${a})"/>`;
    return `<g class="fan ${on ? "on" : ""}" data-info="${info}" transform="translate(${cx},${cy})">
      <circle r="20" class="fan-ring"/>
      <g class="blades" ${on ? `style="animation-duration:${dur}s"` : ""}>${blade(0)}${blade(120)}${blade(240)}</g>
      <circle r="3" class="hub"/>
      <text y="38" text-anchor="middle" class="device-label">${label}</text>
    </g>`;
  }

  _filter(x, y) {
    return `<g class="filter" transform="translate(${x},${y})">
      <rect x="-7" y="-16" width="14" height="32" rx="2"/>
      <path d="M-7 -12 L7 -8 L-7 -4 L7 0 L-7 4 L7 8 L-7 12"/></g>`;
  }

  _svg({ t, running, supplyT, setpoint, supplyFan, exhaustFan, rotor, heater, alarm }) {
    const yS = 120; // prívodná vetva
    const yE = 250; // odvodná vetva
    const rotorX = 300;
    const supplyCol = airColor(supplyT);
    const unitStroke = alarm ? C.alarm : running ? C.active : C.neutral;
    const rotorOn = running && rotor > 0;
    const rotorDur = rotorOn ? Math.min(10, Math.max(1.2, 120 / rotor)).toFixed(2) : 0;
    const heaterOn = heater > 0;

    // potrubia: [d, farba, %ventilátora, smer]
    const ducts = [
      [`M 20 ${yS} L ${rotorX - 70} ${yS}`, C.outdoor, supplyFan],
      [`M ${rotorX + 70} ${yS} L 736 ${yS}`, supplyCol, supplyFan],
      [`M 740 ${yE} L ${rotorX + 70} ${yE}`, C.extract, exhaustFan],
      [`M ${rotorX - 70} ${yE} L 16 ${yE}`, C.exhaust, exhaustFan],
    ];

    const spokes = Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return `<line x1="0" y1="0" x2="${(64 * Math.cos(a)).toFixed(1)}" y2="${(64 * Math.sin(a)).toFixed(1)}"/>`;
    }).join("");

    return `
    <svg viewBox="0 0 760 340" class="schema" role="img" aria-label="Komfovent">
      <!-- stena -->
      <line x1="110" y1="44" x2="110" y2="326" class="wall"/>
      <text x="100" y="58" text-anchor="end" class="zone">${t.outside}</text>
      <text x="120" y="58" class="zone">${t.inside}</text>

      <!-- jednotka -->
      <rect x="170" y="72" width="420" height="226" rx="10" class="unit" style="stroke:${unitStroke}"
        ${running ? `filter="url(#glow)"` : ""}/>
      <defs>
        <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${alarm ? "#db4437" : C.active}" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- potrubia -->
      ${ducts
        .map(
          ([d, col, pct]) =>
            `<path d="${d}" class="duct" style="stroke:${col}"/>${this._flow(d, pct, running)}`
        )
        .join("")}
      ${this._arrow(150, yS, 1, C.outdoor)}
      ${this._arrow(742, yS, 1, supplyCol)}
      ${this._arrow(650, yE, -1, C.extract)}
      ${this._arrow(13, yE, -1, C.exhaust)}

      <!-- popisy vetiev -->
      <text x="22" y="${yS - 14}" class="device-label">${t.outdoor_air}</text>
      <text x="22" y="${yE + 24}" class="device-label">${t.exhaust_air}</text>
      <text x="738" y="${yS - 14}" text-anchor="end" class="device-label">${t.supply_air}</text>
      <text x="738" y="${yE + 24}" text-anchor="end" class="device-label">${t.extract_air}</text>

      <!-- filtre -->
      ${this._filter(205, yS)}
      ${this._filter(555, yE)}

      <!-- rotačný rekuperátor -->
      <g class="rotor ${rotorOn ? "on" : ""}" data-info="recuperator" transform="translate(${rotorX},185)">
        <circle r="70" class="rotor-bg"/>
        <g class="wheel" ${rotorOn ? `style="animation-duration:${rotorDur}s"` : ""}>
          <circle r="64" class="rotor-rim"/>${spokes}</g>
        <circle r="24" class="rotor-hub"/>
        <text y="5" text-anchor="middle" class="device-value">${Math.round(rotor)} %</text>
        <text y="88" text-anchor="middle" class="device-label">${t.rotor}</text>
      </g>

      <!-- ventilátory -->
      ${this._fan(420, yS, supplyFan, running, "supply_fan", `${t.supply} ${Math.round(supplyFan)} %`)}
      ${this._fan(225, yE, exhaustFan, running, "exhaust_fan", `${t.exhaust} ${Math.round(exhaustFan)} %`)}

      <!-- elektrický ohrev -->
      <g class="heater" data-info="heater" transform="translate(500,${yS})">
        <rect x="-26" y="-18" width="52" height="36" rx="4" class="heater-box"/>
        <path d="M-20 0 L-15 -9 L-8 9 L-1 -9 L6 9 L13 -9 L20 0" class="coil"
          style="stroke:${heaterOn ? C.heater : C.heaterOff}" ${heaterOn ? `filter="url(#heat)"` : ""}/>
        <defs><filter id="heat"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="${C.heater}"/></filter></defs>
        <text y="38" text-anchor="middle" class="device-label">${t.heater} ${Math.round(heater)} %</text>
      </g>

      <!-- hodnoty -->
      ${this._chip(660, yS + 30, `${t.supply} ${this._fmt(supplyT)} °C`, "supply_temp", supplyCol)}
      ${this._chip(660, yS + 58, `${t.setpoint} ${this._fmt(setpoint)} °C`, "setpoint")}
    </svg>`;
  }
}

const STYLE = `
  :host { display: block; }
  ha-card { padding: 12px 12px 14px; overflow: hidden; }
  .header { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 2px 4px 6px; }
  .title { font-size: var(--ha-font-size-l, 18px); font-weight: var(--ha-font-weight-medium, 500); color: var(--primary-text-color, #e1e1e1); }
  .pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .pill { font-size: 12px; padding: 3px 10px; border-radius: 12px; border: 1px solid var(--divider-color, #444);
    color: var(--secondary-text-color, #9b9b9b); cursor: pointer; white-space: nowrap; }
  .pill.on { color: #4caf50; border-color: #4caf50; }
  .pill.alarm { color: #fff; background: var(--error-color, #db4437); border-color: transparent; }
  .pill.muted { opacity: 0.85; }

  svg.schema { display: block; width: 100%; height: auto; font-family: inherit; }
  .wall { stroke: var(--divider-color, #666); stroke-width: 2; stroke-dasharray: 6 6; }
  .zone { fill: var(--secondary-text-color, #9b9b9b); font-size: 11px; letter-spacing: 1px; }
  .unit { fill: var(--card-background-color, #1c1c1c); stroke-width: 2; }
  .duct { fill: none; stroke-width: 7; stroke-linecap: round; opacity: 0.95; }
  .flow { fill: none; stroke: #fff; stroke-width: 2.5; pointer-events: none; animation: flow 1.2s linear infinite; }
  @keyframes flow { to { stroke-dashoffset: -40; } }
  .device-label { fill: var(--primary-text-color, #e0e0e0); font-size: var(--ha-font-size-xs, 11px); pointer-events: none; }
  .device-value { fill: var(--primary-text-color, #e0e0e0); font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-medium, 500); pointer-events: none; }

  .filter rect { fill: var(--card-background-color, #1c1c1c); stroke: var(--secondary-text-color, #9b9b9b); stroke-width: 1.5; }
  .filter path { fill: none; stroke: var(--secondary-text-color, #9b9b9b); stroke-width: 1.2; }

  .rotor { cursor: pointer; }
  .rotor-bg { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 2; }
  .rotor-rim { fill: none; stroke: #78909c; stroke-width: 2; }
  .wheel line { stroke: #78909c; stroke-width: 1.5; }
  .rotor.on .rotor-rim, .rotor.on .wheel line { stroke: #4caf50; }
  .rotor-hub { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 1.5; }
  .wheel, .blades { transform-box: fill-box; transform-origin: center; }
  .rotor.on .wheel { animation: spin 4s linear infinite; }

  .fan { cursor: pointer; }
  .fan-ring { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 2; }
  .fan.on .fan-ring { stroke: #4caf50; }
  .blades path { fill: #78909c; }
  .fan.on .blades path { fill: #03a9f4; }
  .fan.on .blades { animation: spin 1.6s linear infinite; }
  .hub { fill: var(--primary-text-color, #e0e0e0); }
  @keyframes spin { to { transform: rotate(360deg); } }

  .heater { cursor: pointer; }
  .heater-box { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #888); stroke-width: 1.5; }
  .coil { fill: none; stroke-width: 2; stroke-linejoin: round; }

  .chip { cursor: pointer; }
  .chip rect { fill: var(--card-background-color, #1c1c1c); stroke: var(--divider-color, #555); stroke-width: 1; }
  .chip text { fill: var(--primary-text-color, #e1e1e1); font-size: 12px; }

  @media (prefers-reduced-motion: reduce) { .flow, .wheel, .blades { animation: none !important; } }

  .controls { display: grid; gap: 10px; padding: 6px 4px 0; }
  .row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .row:first-child { display: grid; grid-template-columns: 1fr 1fr; }
  .lbl { min-width: 76px; color: var(--secondary-text-color, #9b9b9b); font-size: 13px; }
  button { font: inherit; color: var(--primary-text-color, #e1e1e1); background: transparent; cursor: pointer;
    border: 1px solid var(--divider-color, #555); border-radius: 8px; padding: 6px 12px; transition: all .15s; }
  button:hover { border-color: var(--primary-color, #03a9f4); }
  button.big { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; font-size: 14px; }
  button.big.on { border-color: #4caf50; color: #4caf50; background: rgba(76,175,80,.08); }
  button.big.boost { border-color: #ff7043; color: #ff7043; background: rgba(255,112,67,.08); }
  .ico { font-size: 16px; }
  .seg { display: inline-flex; flex: 1; }
  .seg button { flex: 1; border-radius: 0; margin-left: -1px; }
  .seg button:first-child { border-radius: 8px 0 0 8px; margin-left: 0; }
  .seg button:last-child { border-radius: 0 8px 8px 0; }
  .seg button.sel { background: var(--primary-color, #03a9f4); border-color: var(--primary-color, #03a9f4); color: #fff; }
  .seg.dim button.sel { opacity: .55; }
  .stepper { display: inline-flex; align-items: center; flex: 1; }
  .stepper button { width: 44px; font-size: 18px; padding: 4px 0; }
  .stepper span { flex: 1; text-align: center; font-size: 18px; font-weight: 500; color: var(--primary-text-color, #e1e1e1); cursor: pointer; }
`;

customElements.define("komfovent-card", KomfoventCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "komfovent-card",
  name: "Komfovent",
  description: "Rekuperačná jednotka Komfovent C4 – schéma a ovládanie",
  preview: true,
});
console.info(`%c KOMFOVENT-CARD %c ${VERSION} `, "background:#03a9f4;color:#fff", "background:#333;color:#fff");
