import { css, html, svg, type TemplateResult } from "lit";
import type { Translator } from "../../i18n/translations.js";
import type { NodeVisualState, Operation } from "../../utils/entity.js";
import {
  ACTIVE_COLOR,
  ACCENT,
  CARD_FILL,
  DEFROST_COLOR,
  NEUTRAL_STROKE,
  RETURN_COLOR,
  SUPPLY_COLOR,
  operationColor,
  temperatureColor,
  type ResolvedAddon,
  type SvgResult,
} from "./common.js";
import { heatPumpFan, heatPumpPerformance, type HeatPumpPerformance } from "./heat-pump-state.js";

export interface DetailReading {
  label: string;
  text: string;
  numeric?: number;
  color?: string;
}

/** Everything the detail drawing shows, resolved from the heat pump node. */
export interface HeatPumpDetail {
  name: string;
  split: boolean;
  operation?: Operation;
  running: boolean;
  fan: { active: boolean; duration?: number; reading?: DetailReading };
  pump: { active: boolean; label: string };
  /** Undefined when the heat pump has no backup heater. */
  heater?: { active: boolean; label: string };
  compressorLabel: string;
  temperatures: Record<string, DetailReading>;
  values: Record<string, DetailReading>;
  setpoint?: DetailReading;
  performance: HeatPumpPerformance;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function heatPumpDetail(
  name: string,
  variant: string | undefined,
  state: NodeVisualState,
  addons: ResolvedAddon[],
  t: Translator
): HeatPumpDetail {
  const bound = addons.filter((a) => a.config.entity_id);
  const ofType = (type: string): ResolvedAddon[] => bound.filter((a) => a.config.type === type);
  const reading = (a: ResolvedAddon, fallback: string, temperature = false): DetailReading => ({
    label: a.config.name ?? fallback,
    text: a.state.value ?? "—",
    numeric: a.state.numeric,
    color: temperature ? temperatureColor(a.state.numeric) : undefined,
  });
  const slotLabel = (slot: string): string => capitalize(t.t(`slots.${slot}`));

  const temperatures: Record<string, DetailReading> = {};
  const values: Record<string, DetailReading> = {};
  for (const a of bound) {
    const slot = a.config.slot;
    if (!slot) continue;
    if (a.config.type === "temperature") temperatures[slot] = reading(a, slotLabel(slot), true);
    if (a.config.type === "value") values[slot] = reading(a, slotLabel(slot));
  }
  // A compressor add-on bound to the frequency stands in for the frequency value.
  const compressor = ofType("compressor")[0];
  if (!values.frequency && compressor?.state.numeric !== undefined) {
    values.frequency = { ...reading(compressor, slotLabel("frequency")), label: slotLabel("frequency") };
  }

  const fanAddon = ofType("fan")[0];
  const pump = ofType("pump")[0];
  const heaters = ofType("electric_heater");
  const setpoint = ofType("setpoint")[0];
  return {
    name,
    split: variant === "split",
    operation: state.operation,
    running: state.active,
    fan: {
      ...heatPumpFan(state, addons),
      reading: fanAddon ? reading(fanAddon, t.t("addons.fan.name")) : undefined,
    },
    pump: {
      active: pump ? pump.state.active : state.active,
      label: pump?.config.name ?? t.t("addons.pump.name"),
    },
    heater: heaters.length
      ? { active: heaters.some((h) => h.state.active), label: heaters[0].config.name ?? t.t("addons.electric_heater.name") }
      : undefined,
    compressorLabel: compressor?.config.name ?? t.t("addons.compressor.name"),
    temperatures,
    values,
    setpoint: setpoint ? reading(setpoint, t.t("addons.setpoint.name"), true) : undefined,
    performance: heatPumpPerformance(addons),
  };
}

const REFRIGERANT = { hot: "#ef5350", liquid: "#ffa726", mixed: "#80deea", gas: "#42a5f5" };
const FLOW_DASHES: [string, number][] = [
  ["16 24", 0.15],
  ["0 6 10 24", 0.35],
  ["0 11 5 24", 0.85],
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Seconds per dash period of the refrigerant: faster with a higher compressor frequency. */
function refrigerantSpeed(detail: HeatPumpDetail): number {
  const hz = detail.values.frequency?.numeric;
  return hz && hz > 0 ? Math.round(clamp(90 / hz, 0.5, 3) * 100) / 100 : 1.5;
}

function compressorSpeed(detail: HeatPumpDetail): number {
  const hz = detail.values.frequency?.numeric;
  return hz && hz > 0 ? Math.round(clamp(30 / hz, 0.15, 2) * 100) / 100 : 0.8;
}

function frameColor(detail: HeatPumpDetail): string {
  return operationColor(detail.operation) ?? (detail.running ? ACTIVE_COLOR : NEUTRAL_STROKE);
}

function flowLines(d: string, cls: string): SvgResult[] {
  return FLOW_DASHES.map(
    ([dash, opacity]) => svg`<path class="${cls}" d="${d}" stroke-dasharray="${dash}" stroke-opacity="${opacity}" />`
  );
}

const CHAR_WIDTH = 6.6;

function chip(
  x: number,
  y: number,
  reading: DetailReading | undefined,
  anchor: "start" | "middle" | "end" = "start"
): SvgResult {
  if (!reading) return svg``;
  const width = Math.max(reading.label.length, reading.text.length) * CHAR_WIDTH + 14;
  const x0 = anchor === "end" ? x - width : anchor === "middle" ? x - width / 2 : x;
  return svg`
    <g class="chip">
      <rect class="chip-bg" x="${x0}" y="${y - 13}" width="${width}" height="32" rx="6" />
      <text class="chip-label" x="${x0 + 7}" y="${y}">${reading.label}</text>
      <text class="chip-value" x="${x0 + 7}" y="${y + 14}" style="${reading.color ? `fill: ${reading.color}` : ""}">
        ${reading.text}
      </text>
    </g>
  `;
}

function fanBlades(cx: number, cy: number, scale: number, fan: HeatPumpDetail["fan"], defrost: boolean): SvgResult {
  const color = defrost ? DEFROST_COLOR : ACCENT;
  const blade = `M 0 0 C ${9 * scale} ${-16 * scale}, ${32 * scale} ${-22 * scale}, ${42 * scale} ${-9 * scale} C ${29 * scale} ${-3 * scale}, ${13 * scale} 0, 0 0 Z`;
  return svg`
    <g class="${fan.active ? "spin" : ""}" style="${fan.active ? `animation-duration: ${fan.duration ?? 1.6}s` : ""}">
      <circle cx="${cx}" cy="${cy}" r="${58 * scale}" fill="none" stroke="none" />
      ${[0, 90, 180, 270].map(
        (angle) => svg`<path d="${blade}" transform="translate(${cx} ${cy}) rotate(${angle})"
          fill="${color}" opacity="${fan.active ? 0.8 : 0.35}" />`
      )}
      <circle cx="${cx}" cy="${cy}" r="${7 * scale}" fill="${color}" />
    </g>
  `;
}

function compressorSpiral(cx: number, cy: number, scale: number, detail: HeatPumpDetail): SvgResult {
  const s = scale;
  const d = `M ${cx} ${cy} m ${-4 * s} 0 a ${4 * s} ${4 * s} 0 1 1 ${8 * s} 0 a ${9 * s} ${9 * s} 0 1 1 ${-18 * s} 0 a ${14 * s} ${14 * s} 0 1 1 ${28 * s} 0 a ${19 * s} ${19 * s} 0 1 1 ${-38 * s} 0 a ${24 * s} ${24 * s} 0 1 1 ${48 * s} 0`;
  return svg`
    <circle cx="${cx}" cy="${cy}" r="${48 * s}" fill="${CARD_FILL}" stroke="${detail.running ? ACTIVE_COLOR : NEUTRAL_STROKE}" stroke-width="2.5" />
    <g class="${detail.running ? "spin" : ""}" style="${detail.running ? `animation-duration: ${compressorSpeed(detail)}s` : ""}">
      <circle cx="${cx}" cy="${cy}" r="${30 * s}" fill="none" stroke="none" />
      <path d="${d}" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round" opacity="${detail.running ? 0.9 : 0.35}" />
    </g>
  `;
}

function pumpSymbol(cx: number, cy: number, r: number, active: boolean): SvgResult {
  const tri = [180, 300, 60]
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return `${Math.round((cx + r * 0.6 * Math.cos(rad)) * 10) / 10},${Math.round((cy + r * 0.6 * Math.sin(rad)) * 10) / 10}`;
    })
    .join(" ");
  return svg`
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${CARD_FILL}" stroke="${active ? ACTIVE_COLOR : NEUTRAL_STROKE}" stroke-width="2" />
    <g class="${active ? "spin" : ""}" style="${active ? "animation-duration: 1.1s" : ""}">
      <circle cx="${cx}" cy="${cy}" r="${r * 0.6}" fill="none" stroke="none" />
      <polygon points="${tri}" fill="${ACCENT}" fill-opacity="${active ? 0.85 : 0.35}" />
    </g>
  `;
}

/** Refrigerant colors swap while defrosting, when the circuit runs backwards. */
function refrigerantColors(defrost: boolean): { suction: string; discharge: string; liquid: string; mixed: string } {
  return defrost
    ? { suction: REFRIGERANT.hot, discharge: REFRIGERANT.gas, liquid: REFRIGERANT.mixed, mixed: REFRIGERANT.liquid }
    : { suction: REFRIGERANT.gas, discharge: REFRIGERANT.hot, liquid: REFRIGERANT.liquid, mixed: REFRIGERANT.mixed };
}

function formatNumber(t: Translator, value: number, digits: number): string {
  return new Intl.NumberFormat(t.language, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

/** Short text for screen readers: operation and every reading. */
export function detailDescription(detail: HeatPumpDetail, t: Translator): string {
  const parts = [
    detail.name,
    detail.operation ? t.t(`operation.${detail.operation}`) : undefined,
    ...Object.values(detail.temperatures).map((r) => `${r.label}: ${r.text}`),
    ...Object.values(detail.values).map((r) => `${r.label}: ${r.text}`),
    detail.performance.cop !== undefined ? `COP ${formatNumber(t, detail.performance.cop, 1)}` : undefined,
  ];
  return parts.filter(Boolean).join("; ");
}

// Full drawing, 960 × 540: outdoor air, evaporator and fan on the left, compressor in the middle,
// plate heat exchanger and the water side on the right.
const SUCTION = "M 120 120 V 96 H 410 V 170 H 432";
const DISCHARGE = "M 528 170 H 610 V 150 H 946";
const LIQUID = "M 946 360 H 600 V 440 H 362";
const MIXED = "M 318 440 H 120 V 400";

function bottomBar(detail: HeatPumpDetail, t: Translator): SvgResult {
  const { values, performance } = detail;
  const electric = [values.voltage, values.current, values.power].filter((r): r is DetailReading => r !== undefined);
  const heat = values.heat_output?.text ?? (performance.heatKw !== undefined ? `${formatNumber(t, performance.heatKw, 2)} kW` : undefined);
  const cop = performance.cop !== undefined ? formatNumber(t, performance.cop, 1) : undefined;
  const water = [
    values.flow?.text,
    performance.deltaT !== undefined ? `ΔT ${formatNumber(t, performance.deltaT, 1)} K` : undefined,
  ].filter(Boolean);
  return svg`
    <line x1="26" y1="492" x2="934" y2="492" stroke="${NEUTRAL_STROKE}" stroke-opacity="0.5" />
    ${electric.length
      ? svg`<text class="chip-label" x="26" y="524">⚡ ${t.t("detail.unit")}</text>
          <text class="chip-value" x="100" y="524">${electric.map((r) => r.text).join(" · ")}</text>`
      : svg``}
    ${heat
      ? svg`<text class="chip-label" x="420" y="524">${t.t("detail.heat_output")}</text>
          <text class="chip-value" x="500" y="524">${heat}</text>`
      : svg``}
    ${cop || performance.powerKw !== undefined
      ? svg`<text class="chip-label" x="640" y="524">COP</text>
          <text class="chip-value" x="672" y="524" style="fill: ${cop ? ACTIVE_COLOR : NEUTRAL_STROKE}">${cop ?? "—"}</text>`
      : svg``}
    ${water.length ? svg`<text class="chip-label" x="940" y="524" text-anchor="end">${water.join(" · ")}</text>` : svg``}
  `;
}

function renderFull(detail: HeatPumpDetail, t: Translator): TemplateResult {
  const { temperatures: temp, values } = detail;
  const defrost = detail.operation === "defrost";
  const color = frameColor(detail);
  const ref = refrigerantColors(defrost);
  const operationText = detail.operation ? `${defrost ? "❄ " : ""}${t.t(`operation.${detail.operation}`)}` : undefined;
  const pillX = 26 + detail.name.length * 8.6 + 14;
  const electrical = [values.voltage?.text, values.compressor_current?.text].filter(Boolean);

  return html`
    <svg class="hp-detail ${defrost ? "reverse" : ""}" viewBox="0 0 960 540" role="img"
      aria-label="${detailDescription(detail, t)}" style="--ref-speed: ${refrigerantSpeed(detail)}s">
      ${detail.split
        ? svg`
          <rect x="14" y="54" width="606" height="452" rx="16" fill="none" stroke="${color}" stroke-width="2.5" />
          <rect x="640" y="54" width="306" height="452" rx="16" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="8 5" />
          <text class="chip-label" x="610" y="74" text-anchor="end">${t.t("detail.outdoor_unit")}</text>
          <text class="chip-label" x="936" y="496" text-anchor="end">${t.t("detail.indoor_unit")}</text>`
        : svg`<rect x="14" y="54" width="932" height="452" rx="16" fill="none" stroke="${color}" stroke-width="2.5" />`}
      <text class="title" x="26" y="36">${detail.name}</text>
      ${operationText
        ? svg`
          <rect x="${pillX}" y="20" width="${operationText.length * 8 + 22}" height="24" rx="12"
            fill="${color}" fill-opacity="0.2" stroke="${color}" />
          <text class="pill" x="${pillX + 11}" y="36" style="fill: ${color}">${operationText}</text>`
        : svg``}

      ${chip(26, 70, temp.outdoor)}
      <rect x="74" y="120" width="92" height="280" rx="6" fill="${defrost ? DEFROST_COLOR : CARD_FILL}"
        fill-opacity="${defrost ? 0.18 : 1}" stroke="${NEUTRAL_STROKE}" />
      ${Array.from({ length: 13 }, (_, i) => svg`<line x1="${82 + i * 6.5}" y1="128" x2="${82 + i * 6.5}" y2="392" stroke="${NEUTRAL_STROKE}" stroke-opacity="0.6" />`)}
      <text class="chip-label" x="120" y="416" text-anchor="middle">${capitalize(t.t("slots.evaporator"))}</text>
      ${defrost ? svg`<text x="120" y="268" text-anchor="middle" style="fill: ${DEFROST_COLOR}; font-size: 34px">❄</text>` : svg``}
      ${chip(120, 470, temp.evaporator, "middle")}

      <path class="ref" d="${SUCTION}" stroke="${ref.suction}" />
      <path class="ref" d="${DISCHARGE}" stroke="${ref.discharge}" />
      <path class="ref" d="${LIQUID}" stroke="${ref.liquid}" />
      <path class="ref" d="${MIXED}" stroke="${ref.mixed}" />
      ${detail.running ? [SUCTION, DISCHARGE, LIQUID, MIXED].map((d) => flowLines(d, "ref-flow")) : svg``}

      ${chip(250, 70, temp.suction, "middle")}
      ${chip(355, 70, values.low_pressure, "middle")}
      ${chip(detail.split ? 560 : 612, 196, values.high_pressure, "middle")}
      ${chip(detail.split ? 560 : 612, 112, temp.discharge, "middle")}

      ${compressorSpiral(480, 170, 1, detail)}
      <text class="chip-label" x="480" y="236" text-anchor="middle">${detail.compressorLabel}</text>
      ${chip(430, 270, values.frequency ? { ...values.frequency, color: detail.running ? ACTIVE_COLOR : undefined } : undefined)}
      ${chip(430, 310, electrical.length ? { label: t.t("detail.voltage_current"), text: electrical.join(" · ") } : undefined)}
      ${chip(432, 360, temp.inverter)}

      <path d="M 318 428 L 340 440 L 318 452 Z M 362 428 L 340 440 L 362 452 Z" fill="${CARD_FILL}" stroke="${NEUTRAL_STROKE}" stroke-width="1.5" />
      <text class="chip-label" x="340" y="470" text-anchor="middle">${t.t("detail.expansion_valve")}</text>
      ${detail.split ? chip(652, 470, temp.refrigerant_liquid) : chip(648, 470, temp.refrigerant_liquid, "middle")}
      ${chip(700, 70, temp.refrigerant_gas, "middle")}

      ${chip(880, 404, temp.return, "middle")}
      ${chip(800, 196, temp.hx_outlet)}
      ${chip(940, 72, temp.supply, "end")}
      ${chip(940, 262, detail.setpoint, "end")}

      ${bottomBar(detail, t)}
    </svg>
  `;
}

// Compact drawing, 480 × 300, for the pinned window: a simple circuit and four large readings.
const C_SUCTION = "M 124 90 H 212";
const C_DISCHARGE = "M 268 90 H 340";
const C_LIQUID = "M 340 165 H 252";
const C_MIXED = "M 228 165 H 124";
const C_SUPPLY = "M 380 85 H 470";
const C_RETURN = "M 470 160 H 444 M 420 160 H 380";
const TILE_LABEL_CHARS = 14;

function compactTiles(detail: HeatPumpDetail, t: Translator): DetailReading[] {
  const { temperatures: temp, values, performance } = detail;
  const last: DetailReading | undefined =
    performance.cop !== undefined
      ? { label: "COP", text: formatNumber(t, performance.cop, 1), color: ACTIVE_COLOR }
      : (values.power ?? detail.setpoint);
  return [temp.outdoor, temp.hx_outlet ?? temp.supply, temp.return, last].filter(
    (r): r is DetailReading => r !== undefined
  );
}

function renderCompact(detail: HeatPumpDetail, t: Translator): TemplateResult {
  const defrost = detail.operation === "defrost";
  const color = frameColor(detail);
  const ref = refrigerantColors(defrost);
  const header = detail.operation ? `${defrost ? "❄ " : ""}${t.t(`operation.${detail.operation}`)}` : detail.name;
  const frequency = detail.values.frequency;
  const tiles = compactTiles(detail, t);

  return html`
    <svg class="hp-detail compact ${defrost ? "reverse" : ""}" viewBox="0 0 480 300" aria-hidden="true"
      style="--ref-speed: ${refrigerantSpeed(detail)}s">
      <rect x="3" y="3" width="474" height="294" rx="14" fill="${CARD_FILL}" stroke="${color}" stroke-width="3" />
      <rect x="14" y="12" width="${header.length * 10 + 26}" height="32" rx="16" fill="${color}" fill-opacity="0.2" stroke="${color}" />
      <text class="compact-header" x="27" y="34" style="fill: ${color}">${header}</text>
      ${frequency
        ? svg`<text class="compact-header" x="466" y="34" text-anchor="end"
            style="fill: ${detail.running ? ACTIVE_COLOR : "var(--secondary-text-color, #9b9b9b)"}">${frequency.text}</text>`
        : svg``}

      <rect x="24" y="62" width="100" height="120" rx="8" fill="${defrost ? DEFROST_COLOR : CARD_FILL}"
        fill-opacity="${defrost ? 0.18 : 1}" stroke="${NEUTRAL_STROKE}" />
      ${fanBlades(74, 122, 0.8, detail.fan, defrost)}
      <path class="ref" d="${C_SUCTION}" stroke="${ref.suction}" />
      <path class="ref" d="${C_DISCHARGE}" stroke="${ref.discharge}" />
      <path class="ref" d="${C_LIQUID}" stroke="${ref.liquid}" />
      <path class="ref" d="${C_MIXED}" stroke="${ref.mixed}" />
      ${detail.running ? [C_SUCTION, C_DISCHARGE, C_LIQUID, C_MIXED].map((d) => flowLines(d, "ref-flow")) : svg``}
      ${compressorSpiral(240, 90, 0.6, detail)}
      <path d="M 228 157 L 240 165 L 228 173 Z M 252 157 L 240 165 L 252 173 Z" fill="${CARD_FILL}" stroke="${NEUTRAL_STROKE}" stroke-width="1.5" />
      <rect x="340" y="62" width="40" height="120" rx="5" fill="${CARD_FILL}" stroke="${NEUTRAL_STROKE}" stroke-width="1.5" />
      ${Array.from({ length: 5 }, (_, i) => svg`<path d="M 344 ${78 + i * 22} l 16 8 l 16 -8" fill="none"
        stroke="${i % 2 ? REFRIGERANT.hot : RETURN_COLOR}" stroke-width="1.5" opacity="0.7" />`)}
      <path class="water" d="${C_SUPPLY}" stroke="${SUPPLY_COLOR}" />
      <path class="water" d="${C_RETURN}" stroke="${RETURN_COLOR}" />
      ${detail.pump.active ? [C_SUPPLY, C_RETURN].map((d) => flowLines(d, "water-flow")) : svg``}
      ${pumpSymbol(432, 160, 12, detail.pump.active)}

      ${tiles.map((tile, i) => {
        const x = 12 + i * 116;
        const label = tile.label.length > TILE_LABEL_CHARS ? `${tile.label.slice(0, TILE_LABEL_CHARS - 1)}…` : tile.label;
        return svg`
          <rect class="chip-bg" x="${x}" y="196" width="108" height="90" rx="10" />
          <text class="tile-label" x="${x + 10}" y="224">${label}</text>
          <text class="tile-value" x="${x + 10}" y="264" style="${tile.color ? `fill: ${tile.color}` : ""}">${tile.text}</text>
        `;
      })}
    </svg>
  `;
}

/** Inside view of the heat pump: the full drawing, or the compact one for the pinned window. */
export function renderHeatPumpDetail(detail: HeatPumpDetail, t: Translator, compact = false): TemplateResult {
  return compact ? renderCompact(detail, t) : renderFull(detail, t);
}

export const detailStyles = css`
  .hp-detail {
    display: block;
    width: 100%;
    height: auto;
    min-height: 0;
    background: none;
  }
  .hp-detail .title {
    fill: var(--primary-text-color, #e1e1e1);
    font-size: 15px;
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .hp-detail .pill {
    font-size: 13px;
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .hp-detail .chip-bg {
    fill: var(--card-background-color, #1c1c1c);
    stroke: var(--divider-color, #3a3a3a);
    stroke-width: 1;
  }
  .hp-detail .chip-label,
  .hp-detail .tile-label {
    fill: var(--secondary-text-color, #9b9b9b);
    font-size: 11px;
  }
  .hp-detail .chip-value,
  .hp-detail .tile-value {
    fill: var(--primary-text-color, #e1e1e1);
    font-size: 12px;
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .hp-detail .tile-label {
    font-size: 15px;
  }
  .hp-detail .tile-value {
    font-size: 26px;
  }
  .hp-detail .compact-header {
    font-size: 19px;
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .hp-detail .ref,
  .hp-detail .water {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .hp-detail .ref {
    stroke-width: 3.5;
  }
  .hp-detail .water {
    stroke-width: 5;
  }
  .hp-detail .ref-flow,
  .hp-detail .water-flow {
    fill: none;
    stroke: #fff;
    stroke-linejoin: round;
    animation: flow linear infinite;
  }
  .hp-detail .ref-flow {
    stroke-width: 2;
    animation-duration: var(--ref-speed, 1.5s);
  }
  .hp-detail .water-flow {
    stroke-width: 2.5;
    animation-duration: 1.2s;
  }
  .hp-detail.reverse .ref-flow {
    animation-direction: reverse;
  }
  .hp-detail .spin {
    transform-box: fill-box;
    transform-origin: center;
    animation: spin linear infinite;
  }
  .hp-detail .heater.on {
    filter: drop-shadow(0 0 3px #ff7043);
  }
  @media (prefers-reduced-motion: reduce) {
    .hp-detail .ref-flow,
    .hp-detail .water-flow,
    .hp-detail .spin {
      animation: none;
    }
  }
`;
