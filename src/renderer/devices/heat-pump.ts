import { svg } from "lit";
import type { DeviceDefinition } from "../../models/schema.js";
import { TANK_DUAL_WIDEN, TANK_STUB, TANK_TEMPERATURE_SLOTS } from "../../models/device-registry.js";
import type { Translator } from "../../i18n/translations.js";
import type { NodeVisualState } from "../../utils/entity.js";
import {
  DEFROST_COLOR,
  HEATER_ACTIVE_COLOR,
  RETURN_COLOR,
  SUPPLY_COLOR,
  addonStates,
  frameStroke,
  frameWidth,
  heaterStates,
  operationColor,
  renderHeaterCoil,
  renderHeatingRod,
  renderPorts,
  renderTemperatureBands,
  renderValueLabel,
  temperatureColor,
  temperatureSlots,
  type DeviceExtras,
  type ResolvedAddon,
} from "./common.js";
import { heatPumpFan, heatPumpPerformance } from "./heat-pump-state.js";

const OUTDOOR_UNIT_ROWS = 6;
/** Slots shown first on the small drawing; the detail shows everything. */
const ROW_PRIORITY = ["supply", "return", "outdoor"];

interface ValueRow {
  label: string;
  text: string;
  color?: string;
}

/** Value lines of the outdoor unit: key temperatures, the COP, then the remaining values. */
export function outdoorUnitRows(addons: ResolvedAddon[], t: Translator, showCop = true): ValueRow[] {
  const bound = addons.filter(
    (a) => a.config.entity_id && !a.config.hidden && (a.config.type === "temperature" || a.config.type === "value")
  );
  const rank = (a: ResolvedAddon): number => {
    const i = a.config.type === "temperature" ? ROW_PRIORITY.indexOf(a.config.slot ?? "") : -1;
    return i < 0 ? ROW_PRIORITY.length : i;
  };
  const rows: ValueRow[] = [...bound]
    .sort((a, b) => rank(a) - rank(b))
    .map((a) => ({
      label: a.config.name ?? (a.config.slot ? t.t(`slots.${a.config.slot}`) : ""),
      text: a.state.value ?? "—",
      color: a.config.type === "temperature" ? temperatureColor(a.state.numeric) : undefined,
    }));
  const hasCopSensor = bound.some((a) => a.config.type === "value" && a.config.slot === "cop");
  // Hidden flow and power still feed the COP.
  const { cop } = heatPumpPerformance(addons);
  if (showCop && cop !== undefined && !hasCopSensor) {
    const key = Math.min(rows.length, bound.filter((a) => rank(a) < ROW_PRIORITY.length).length);
    const cop1 = new Intl.NumberFormat(t.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(cop);
    rows.splice(key, 0, { label: t.t("slots.cop"), text: `COP ${cop1}` });
  }
  return rows.slice(0, OUTDOOR_UNIT_ROWS);
}
import { renderExtraDevice } from "./extra.js";

// Horizontal tank geometry is designed for a width of 100 and scaled with the tank width.
const TANK_BASE_WIDTH = 100;
const TANK_LEFT = TANK_STUB;
const TANK_RIGHT = 86;
const COIL_DEPTH = 32;
const COIL_PITCH = 8;
// Electric immersion heater in the tank is drawn 1.7 times its original size.
const TANK_HEATER_SCALE = 1.7;
// Dual-coil tank: coils stand 1 mm off the wall and are 1.5 mm narrower (about 3.3 units per mm).
const COIL_SHIFT = 3;
const COIL_NARROW = 5;

/** Heat exchanger coil from its supply port down to its return port. */
function coilPath(y1: number, y2: number, wall: number, depth: number, dir: 1 | -1, shift = 0): string {
  const turns = Math.max(2, Math.floor((y2 - y1) / COIL_PITCH));
  const step = (y2 - y1) / turns;
  // The coil starts at the wall, runs in by `shift` and zigzags from there.
  const x = (offset: number): number => wall + dir * (shift + offset);
  let d = `M ${wall} ${y1}`;
  if (shift) d += ` L ${x(0)} ${y1}`;
  for (let i = 1; i < turns; i++) {
    d += ` L ${x(i % 2 ? depth : 4)} ${y1 + i * step}`;
  }
  if (shift) d += ` L ${x(0)} ${y2}`;
  return `${d} L ${wall} ${y2}`;
}

function renderTank(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState,
  slots: Map<string, NodeVisualState>,
  heaters: NodeVisualState[]
): ReturnType<typeof svg> {
  const stroke = state.active
    ? "#4caf50"
    : selected
      ? "var(--primary-color, #03a9f4)"
      : "var(--divider-color, #888)";
  const strokeWidth = selected ? 2.5 : 1.5;
  // The dual-coil tank has ports on its top and bottom edge and a body widened by TANK_DUAL_WIDEN.
  const edgePorts = def.ports.some((p) => p.position.y === 0 || p.position.y === def.height);
  const widen = edgePorts ? TANK_DUAL_WIDEN : 0;
  const k = (def.width - widen) / TANK_BASE_WIDTH;
  const tankLeft = TANK_LEFT * k;
  const tankRight = def.width - (TANK_BASE_WIDTH - TANK_RIGHT) * k;
  // Top and bottom ports get a pipe stub as long as the side ones.
  const bodyTop = edgePorts ? tankLeft : 10;
  const bodyBottom = def.height - (edgePorts ? tankLeft : 4);
  const top = bodyTop + 6;
  const bottom = bodyBottom - 6;
  const step = (bottom - top - 36) / (TANK_TEMPERATURE_SLOTS.length - 1);
  const sensors = TANK_TEMPERATURE_SLOTS.map((slot, i) => ({ y: top + 18 + i * step, state: slots.get(slot) }))
    .filter((s): s is { y: number; state: NodeVisualState } => s.state !== undefined);
  const portY = (id: string): number | undefined => def.ports.find((p) => p.id === id)?.position.y;
  const portX = (id: string): number | undefined => def.ports.find((p) => p.id === id)?.position.x;
  const coils = [["coil_in", "coil_out"], ["coil2_in", "coil2_out"]]
    .map(([a, b]) => ({ ya: portY(a), yb: portY(b), onRight: portX(a) === def.width }))
    .filter((c): c is { ya: number; yb: number; onRight: boolean } => c.ya !== undefined && c.yb !== undefined)
    // The coil is drawn top to bottom whichever end is the supply.
    .map((c) => ({ y1: Math.min(c.ya, c.yb), y2: Math.max(c.ya, c.yb), onRight: c.onRight }));
  // One coil on each wall: they share the tank width instead of overlapping.
  const dual = coils.length === 2 && coils[0].onRight !== coils[1].onRight;
  const coilShift = dual ? COIL_SHIFT : 0;
  const coilDepth = dual ? (tankRight - tankLeft) / 2 - 5 - COIL_SHIFT - COIL_NARROW : COIL_DEPTH * k;
  // Heaters sit between the sensor positions so they never cover a temperature label.
  const sensorY = (i: number): number => top + 18 + i * step;
  // Dual-coil tank: the first heater sits midway between the middle outlet and the lower right port.
  const midOutlet = portY("supply_out");
  const lowerRight = portY("coil2_in");
  const firstHeater =
    dual && midOutlet !== undefined && lowerRight !== undefined ? (midOutlet + lowerRight) / 2 : sensorY(3) + step / 2;
  const heaterY = [firstHeater, sensorY(1) + step / 2];

  return svg`
    <g class="device device-tank">
      ${def.ports.map((p) => {
        // Ports on the top or bottom edge connect to the tank body vertically.
        const vertical = p.position.y === 0 || p.position.y === def.height;
        const x2 = vertical ? p.position.x : p.position.x === 0 ? tankLeft : tankRight;
        const y2 = vertical ? (p.position.y === 0 ? bodyTop : bodyBottom) : p.position.y;
        return svg`<line x1="${p.position.x}" y1="${p.position.y}" x2="${x2}" y2="${y2}"
          stroke="var(--divider-color, #888)" stroke-width="2" />`;
      })}
      <rect x="${tankLeft}" y="${bodyTop}" width="${tankRight - tankLeft}" height="${bodyBottom - bodyTop}" rx="12"
        fill="var(--card-background-color, #1c1c1c)" stroke="${stroke}" stroke-width="${strokeWidth}" />
      ${renderTemperatureBands(tankLeft + 3, tankRight - tankLeft - 6, top, bottom, sensors)}
      ${sensors.map((sensor) => svg`<circle cx="${tankLeft + 4}" cy="${sensor.y}" r="3" fill="${temperatureColor(sensor.state.numeric)}" />`)}
      ${coils.map(({ y1, y2, onRight }, i) => svg`
        <path class="coil" d="${onRight ? coilPath(y1, y2, tankRight, coilDepth, -1, coilShift) : coilPath(y1, y2, tankLeft, coilDepth, 1, coilShift)}" fill="none" stroke="${SUPPLY_COLOR}"
          stroke-width="2" stroke-linejoin="round" opacity="${i === 0 ? 0.85 : 0.65}" />
      `)}
      ${heaters.slice(0, 2).map((heater, i) => renderHeatingRod(tankRight, heaterY[i], 30 * k * TANK_HEATER_SCALE, heater, TANK_HEATER_SCALE))}
      ${sensors.map((sensor) => renderValueLabel((tankLeft + tankRight) / 2 + 8 * k, sensor.y + 4, sensor.state, true))}
      ${renderPorts(def, t)}
    </g>
  `;
}

function renderManifold(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState,
  channels: NodeVisualState[]
): ReturnType<typeof svg> {
  const stroke = state.active
    ? "#4caf50"
    : selected
      ? "var(--primary-color, #03a9f4)"
      : "var(--divider-color, #888)";
  const strokeWidth = selected ? 2.5 : 1.5;
  const barWidth = def.width - 8;
  const loops = def.ports.filter((p) => p.id.startsWith("loop_") && p.kind === "outlet");

  return svg`
    <g class="device device-manifold">
      <rect x="2" y="18" width="${def.width - 4}" height="94" rx="6"
        fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="4 3" />
      <rect x="4" y="22" width="${barWidth}" height="16" rx="4"
        fill="var(--card-background-color, #1c1c1c)" stroke="${SUPPLY_COLOR}" stroke-width="2" />
      <rect x="4" y="92" width="${barWidth}" height="16" rx="4"
        fill="var(--card-background-color, #1c1c1c)" stroke="${RETURN_COLOR}" stroke-width="2" />
      ${loops.map((port, i) => {
        const x = port.position.x;
        const active = channels[i]?.active ?? false;
        return svg`
          <line x1="${x}" y1="0" x2="${x}" y2="22" stroke="${SUPPLY_COLOR}" stroke-width="2" />
          <rect class="actuator ${active ? "active" : ""}" x="${x - 7}" y="6" width="14" height="11" rx="2"
            fill="${active ? "#4caf50" : "var(--card-background-color, #1c1c1c)"}"
            stroke="${active ? "#4caf50" : "var(--divider-color, #888)"}" stroke-width="1.5" />
          <line x1="${x}" y1="108" x2="${x}" y2="${def.height}" stroke="${RETURN_COLOR}" stroke-width="2" />
          <text x="${x}" y="69" text-anchor="middle" class="device-label">${i + 1}</text>
        `;
      })}
      ${renderPorts(def, t)}
    </g>
  `;
}

function renderValve3Way(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState
): ReturnType<typeof svg> {
  const stroke = state.active
    ? "#4caf50"
    : selected
      ? "var(--primary-color, #03a9f4)"
      : "var(--divider-color, #888)";
  const strokeWidth = selected ? 2.5 : 1.5;
  const active = "#4caf50";
  const neutral = "var(--divider-color, #888)";
  const fill = "var(--card-background-color, #1c1c1c)";
  const branchA = state.valveBranch === "a";
  const branchB = state.valveBranch === "b";
  // Standard 3-way valve symbol: three seats meeting in the middle, actuator on top.
  return svg`
    <g class="device device-valve-3way">
      <path d="M 0 40 H 14" stroke="${neutral}" stroke-width="2" />
      <path d="M 66 40 H 80" stroke="${branchA ? active : neutral}" stroke-width="2" />
      <path d="M 40 66 V 80" stroke="${branchB ? active : neutral}" stroke-width="2" />
      <path d="M 40 40 V 18" stroke="${stroke}" stroke-width="1.5" />
      <rect x="30" y="6" width="20" height="12" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
      <polygon points="14,28 14,52 40,40" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
      <polygon points="66,28 66,52 40,40" fill="${branchA ? active : fill}" fill-opacity="${branchA ? 0.8 : 1}"
        stroke="${branchA ? active : stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
      <polygon points="28,66 52,66 40,40" fill="${branchB ? active : fill}" fill-opacity="${branchB ? 0.8 : 1}"
        stroke="${branchB ? active : stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
      <text x="72" y="33" text-anchor="middle" class="device-label">A</text>
      <text x="50" y="77" text-anchor="middle" class="device-label">B</text>
      ${renderPorts(def, t)}
    </g>
  `;
}

function renderElectricHeater(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState
): ReturnType<typeof svg> {
  const stroke = state.active
    ? HEATER_ACTIVE_COLOR
    : selected
      ? "var(--primary-color, #03a9f4)"
      : "var(--divider-color, #888)";
  const strokeWidth = selected ? 2.5 : 1.5;
  return svg`
    <g class="device device-electric-heater">
      <rect x="10" y="12" width="${def.width - 20}" height="${def.height - 24}" rx="8"
        fill="var(--card-background-color, #1c1c1c)" stroke="${stroke}" stroke-width="${strokeWidth}" />
      ${renderHeaterCoil(24, def.height / 2 + 4, def.width - 48, state)}
      ${renderPorts(def, t)}
    </g>
  `;
}

function renderJunction(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState
): ReturnType<typeof svg> {
  const stroke = state.active
    ? "#4caf50"
    : selected
      ? "var(--primary-color, #03a9f4)"
      : "var(--divider-color, #888)";
  const strokeWidth = selected ? 2.5 : 1.5;
  const mid = def.width / 2;
  return svg`
    <g class="device device-junction">
      ${def.ports.map((p) => svg`
        <line x1="${p.position.x}" y1="${p.position.y}" x2="${mid}" y2="${mid}"
          stroke="var(--divider-color, #888)" stroke-width="3" stroke-linecap="round" />
      `)}
      <circle cx="${mid}" cy="${mid}" r="4.5" fill="${stroke}" stroke="${stroke}" stroke-width="${strokeWidth}" />
      ${renderPorts(def, t)}
    </g>
  `;
}

function renderCirculationPump(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState
): ReturnType<typeof svg> {
  const stroke = state.active
    ? "#4caf50"
    : selected
      ? "var(--primary-color, #03a9f4)"
      : "var(--divider-color, #888)";
  const strokeWidth = selected ? 2.5 : 1.5;
  const c = def.width / 2;
  const r = 16;
  // Equilateral triangle pointing in the flow direction; its centroid is the circle center.
  const triangle = [0, 120, 240]
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      return `${Math.round((c + r * Math.cos(rad)) * 10) / 10},${Math.round((c + r * Math.sin(rad)) * 10) / 10}`;
    })
    .join(" ");
  return svg`
    <g class="device device-circulation-pump">
      <path d="M 0 ${c} H ${c - 26} M ${c + 26} ${c} H ${def.width}" stroke="var(--divider-color, #888)" stroke-width="2" />
      <circle
        cx="${c}" cy="${c}" r="26"
        fill="var(--card-background-color, #1c1c1c)"
        stroke="${stroke}" stroke-width="${strokeWidth}"
      />
      <g class="impeller ${state.active ? "spinning" : ""}">
        <!-- Invisible circle keeps the bounding box centered, so the rotation does not wobble. -->
        <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="none" />
        <polygon points="${triangle}" fill="var(--primary-color, #03a9f4)" fill-opacity="${state.active ? 0.85 : 0.35}"
          stroke="var(--primary-color, #03a9f4)" stroke-width="1.5" stroke-linejoin="round" />
      </g>
      ${renderPorts(def, t)}
    </g>
  `;
}

function renderFloorHeating(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState
): ReturnType<typeof svg> {
  const stroke = state.active
    ? "#4caf50"
    : selected
      ? "var(--primary-color, #03a9f4)"
      : "var(--divider-color, #888)";
  const strokeWidth = selected ? 2.5 : 1.5;
  return svg`
    <g class="device device-floor-heating">
      <rect
        x="10" y="14" width="120" height="52" rx="8"
        fill="var(--card-background-color, #1c1c1c)"
        stroke="${stroke}" stroke-width="${strokeWidth}"
      />
      <path d="M 20 40 C 35 30, 50 50, 65 40 C 80 30, 95 50, 110 40 C 115 37, 120 37, 126 40"
        fill="none" stroke="var(--primary-color, #03a9f4)" stroke-width="2" />
      ${renderPorts(def, t)}
    </g>
  `;
}

function renderMixingValve(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState
): ReturnType<typeof svg> {
  const stroke = selected ? "var(--primary-color, #03a9f4)" : "var(--divider-color, #888)";
  const strokeWidth = selected ? 2.5 : 1.5;
  const position = state.position;
  const mixedColor =
    position === undefined ? "var(--divider-color, #888)" : `hsl(${Math.round(210 * (1 - position / 100))}, 75%, 55%)`;

  return svg`
    <g class="device device-mixing-valve">
      <line x1="0" y1="70" x2="22" y2="70" stroke="${SUPPLY_COLOR}" stroke-width="3" />
      <line x1="50" y1="96" x2="50" y2="${def.height}" stroke="${RETURN_COLOR}" stroke-width="3" />
      <line x1="78" y1="70" x2="${def.width}" y2="70" stroke="${mixedColor}" stroke-width="3" />
      <path d="M 22 56 L 50 70 L 22 84 Z M 78 56 L 50 70 L 78 84 Z M 36 98 L 50 70 L 64 98 Z"
        fill="var(--card-background-color, #1c1c1c)" stroke="${stroke}" stroke-width="${strokeWidth}"
        stroke-linejoin="round" />
      <line x1="50" y1="36" x2="50" y2="70" stroke="${stroke}" stroke-width="2" />
      <rect x="28" y="10" width="44" height="26" rx="4"
        fill="var(--card-background-color, #1c1c1c)" stroke="${stroke}" stroke-width="${strokeWidth}" />
      ${position === undefined
        ? svg``
        : svg`<rect x="30" y="12" width="${(40 * position) / 100}" height="22" rx="3" fill="${mixedColor}" opacity="0.35" />`}
      <text x="50" y="27" text-anchor="middle" class="device-value">
        ${position === undefined ? "—" : `${Math.round(position)} %`}
      </text>
      ${renderPorts(def, t)}
    </g>
  `;
}

/**
 * Serpentine of pipe: vertical runs joined by round U-turns, starting at the cold inlet on the right and
 * returning to the warm outlet along the top edge. The two connectors sit 20 apart on the right side.
 */
function renderGroundCollector(def: DeviceDefinition, t: Translator, selected: boolean): ReturnType<typeof svg> {
  // The serpentine sits 7 lower, so the return line along the top has room above it.
  const shift = 7;
  const top = 16 + shift;
  const bottom = def.height - 16 + shift;
  const r = 8;
  const legs = [90, 74, 58, 42, 26];
  const cold = def.ports.find((p) => p.id === "cold_in")!.position;
  const hot = def.ports.find((p) => p.id === "hot_out")!.position;
  const path: string[] = [`M ${def.width} ${cold.y} L ${legs[0]} ${cold.y}`, `L ${legs[0]} ${top}`];
  legs.forEach((_x, i) => {
    if (i === legs.length - 1) return;
    const next = legs[i + 1];
    const atTop = i % 2 === 0;
    // Round U-turn between two legs: over the top, or under the bottom.
    path.push(`A ${r} ${r} 0 0 ${atTop ? 0 : 1} ${next} ${atTop ? top : bottom}`);
    path.push(`L ${next} ${atTop ? bottom : top}`);
  });
  // Return line along the top, with a rounded corner where it turns down from the last run.
  const lastX = legs[legs.length - 1];
  path.push(`L ${lastX} ${r}`, `A ${r} ${r} 0 0 1 ${lastX + r} 0`, `L ${def.width} 0`, `L ${hot.x} ${hot.y}`);
  const color = selected ? "var(--primary-color, #03a9f4)" : "#42a5f5";
  return svg`
    <g class="device device-ground-collector">
      <path d="${path.join(" ")}" fill="none" stroke="${color}" stroke-width="3"
        stroke-linejoin="round" stroke-linecap="round" />
      ${renderPorts(def, t)}
    </g>
  `;
}

function renderOutdoorUnit(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState,
  extras: DeviceExtras
): ReturnType<typeof svg> {
  const stroke = operationColor(state.operation) ?? frameStroke(state, selected);
  const strokeWidth = frameWidth(selected);
  // v2 has connections on both sides and the fan centred; the original housing keeps the fan on the left.
  const v2 = def.ports.some((p) => p.id === "v2_in_left");
  const cx = v2 ? def.width / 2 : 58;
  const cy = v2 ? def.height / 2 : 60;
  const blade = "M 0 0 C 6 -10, 20 -14, 26 -6 C 18 -2, 8 0, 0 0 Z";
  const defrost = state.operation === "defrost";
  const top = v2 ? cy - 40 : cy - 44;
  const fan = heatPumpFan(state, extras.addons ?? []);
  const fanColor = defrost ? DEFROST_COLOR : "var(--primary-color, #03a9f4)";
  const heaters = (extras.addons ?? [])
    .filter((a) => a.config.type === "electric_heater" && !a.config.hidden)
    .map((a) => a.state);
  const rows = outdoorUnitRows(extras.addons ?? [], t, !extras.hideCop);

  return svg`
    <g class="device device-outdoor-unit">
      <rect x="10" y="12" width="${def.width - 20}" height="${def.height - 24}" rx="6"
        fill="var(--card-background-color, #1c1c1c)" stroke="${stroke}" stroke-width="${strokeWidth}" />
      <circle cx="${cx}" cy="${cy}" r="${v2 ? 30 : 34}" fill="none" stroke="${defrost ? fanColor : "var(--divider-color, #888)"}" stroke-width="1.5" />
      <g class="fan ${fan.active ? "spinning" : ""}" style="${fan.duration ? `animation-duration: ${fan.duration}s` : ""}">
        ${[0, 90, 180, 270].map((angle) => svg`
          <path d="${blade}" transform="translate(${cx} ${cy}) rotate(${angle})"
            fill="${fanColor}" opacity="0.75" />
        `)}
        <circle cx="${cx}" cy="${cy}" r="5" fill="${fanColor}" />
      </g>
      ${defrost
        ? svg`<path class="defrost" d="M ${cx} ${top} v 14 M ${cx - 6} ${top + 4} l 12 6 M ${cx - 6} ${top + 10} l 12 -6"
            stroke="${fanColor}" stroke-width="2" stroke-linecap="round" />`
        : svg``}
      ${rows.map((row, i) => svg`
        <text x="${v2 ? cx + 36 : 104}" y="${v2 ? cy - 30 + i * 13 : 30 + i * 15}" class="device-value" style="${row.color ? `fill: ${row.color}` : ""}">
          <title>${row.label}</title>${row.text}
        </text>
      `)}
      ${heaters.slice(0, 3).map((heater, i) => svg`
        <g class="heating-rod ${heater.active ? "active" : ""}">
          ${renderHeaterCoil(24 + i * 34, def.height - 18, 26, heater)}
        </g>
      `)}
      ${renderPorts(def, t)}
    </g>
  `;
}

type InlineSensorIcon = "temperature" | "flow" | "pressure" | "energy" | "generic";

const DEVICE_CLASS_ICONS: Record<string, InlineSensorIcon> = {
  temperature: "temperature",
  pressure: "pressure",
  volume_flow_rate: "flow",
  energy: "energy",
  power: "energy",
};

function sensorIcon(state: NodeVisualState): InlineSensorIcon {
  const byClass = state.deviceClass ? DEVICE_CLASS_ICONS[state.deviceClass] : undefined;
  if (byClass) return byClass;
  return state.unit?.includes("°") ? "temperature" : "generic";
}

function inlineSensorIcon(icon: InlineSensorIcon, cx: number, cy: number): string {
  switch (icon) {
    case "temperature":
      return `M ${cx - 1.5} ${cy + 2} V ${cy - 6} A 1.5 1.5 0 0 1 ${cx + 1.5} ${cy - 6} V ${cy + 2} M ${cx - 3} ${cy + 4.5} A 3 3 0 1 0 ${cx + 3} ${cy + 4.5} A 3 3 0 1 0 ${cx - 3} ${cy + 4.5}`;
    case "flow":
      return `M ${cx - 6} ${cy} L ${cx + 5} ${cy} M ${cx + 1} ${cy - 4} L ${cx + 5} ${cy} L ${cx + 1} ${cy + 4}`;
    case "pressure":
      return `M ${cx - 6} ${cy + 3} A 6 6 0 1 1 ${cx + 6} ${cy + 3} M ${cx} ${cy + 1} L ${cx + 4} ${cy - 4}`;
    case "energy":
      return `M ${cx + 1} ${cy - 7} L ${cx - 4} ${cy + 1} L ${cx} ${cy + 1} L ${cx - 1} ${cy + 7} L ${cx + 4} ${cy - 1} L ${cx} ${cy - 1} Z`;
    case "generic":
      return `M ${cx - 3} ${cy} A 3 3 0 1 0 ${cx + 3} ${cy} A 3 3 0 1 0 ${cx - 3} ${cy} Z`;
  }
}

function renderInlineSensor(
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState
): ReturnType<typeof svg> {
  const icon = sensorIcon(state);
  const cx = def.width / 2;
  const cy = def.height - 14;
  const color = selected
    ? "var(--primary-color, #03a9f4)"
    : icon === "temperature"
      ? temperatureColor(state.numeric)
      : "var(--primary-color, #03a9f4)";
  const filled = icon === "energy" || icon === "generic";

  return svg`
    <g class="device device-inline-sensor">
      <line x1="0" y1="${cy}" x2="${def.width}" y2="${cy}" stroke="var(--divider-color, #888)" stroke-width="3" />
      <circle cx="${cx}" cy="${cy}" r="11" fill="var(--card-background-color, #1c1c1c)"
        stroke="${color}" stroke-width="${selected ? 2.5 : 2}" />
      <path d="${inlineSensorIcon(icon, cx, cy)}" fill="${filled ? color : "none"}"
        stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="${cx}" y="${cy - 17}" text-anchor="middle" class="device-value">${state.value ?? "—"}</text>
      ${renderPorts(def, t)}
    </g>
  `;
}

export function renderDeviceByType(
  type: string,
  def: DeviceDefinition,
  t: Translator,
  selected: boolean,
  state: NodeVisualState,
  extras: DeviceExtras = {}
): ReturnType<typeof svg> | undefined {
  switch (type) {
    case "heat_pump":
      return renderOutdoorUnit(def, t, selected, state, extras);
    case "ground_collector":
      return renderGroundCollector(def, t, selected);
    case "valve_3way":
      return renderValve3Way(def, t, selected, state);
    case "tank":
      return renderTank(def, t, selected, state, temperatureSlots(extras), heaterStates(extras));
    case "junction":
      return renderJunction(def, t, selected, state);
    case "circulation_pump":
      return renderCirculationPump(def, t, selected, state);
    case "floor_heating":
      return renderFloorHeating(def, t, selected, state);
    case "manifold":
      return renderManifold(def, t, selected, state, addonStates(extras, "loop"));
    case "mixing_valve":
      return renderMixingValve(def, t, selected, state);
    case "electric_heater":
      return renderElectricHeater(def, t, selected, state);
    case "pipe_sensor":
      return renderInlineSensor(def, t, selected, state);
    default:
      return renderExtraDevice(type, def, t, selected, state);
  }
}
