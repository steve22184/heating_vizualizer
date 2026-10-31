import { svg } from "lit";
import type { AddonType } from "../../models/addons.js";
import type { AddonConfig, DeviceDefinition, PortDefinition } from "../../models/schema.js";
import type { Translator } from "../../i18n/translations.js";
import type { NodeVisualState, Operation } from "../../utils/entity.js";

export type SvgResult = ReturnType<typeof svg>;

export interface ResolvedAddon {
  config: AddonConfig;
  state: NodeVisualState;
  /** Position in the node's add-on list. */
  index?: number;
}

/** Node-specific states beyond the main binding. */
export interface DeviceExtras {
  addons?: ResolvedAddon[];
  /** Heat pump: no computed COP line. */
  hideCop?: boolean;
}

export function addonStates(extras: DeviceExtras, type: AddonType): NodeVisualState[] {
  return (extras.addons ?? []).filter((a) => a.config.type === type).map((a) => a.state);
}

export function temperatureSlots(extras: DeviceExtras): Map<string, NodeVisualState> {
  const slots = new Map<string, NodeVisualState>();
  for (const addon of extras.addons ?? []) {
    if (addon.config.type === "temperature" && addon.config.slot) slots.set(addon.config.slot, addon.state);
  }
  return slots;
}

/** Combined state of all electric heaters of a device; undefined when none is bound. */
export function heaterState(extras: DeviceExtras): NodeVisualState | undefined {
  const heaters = heaterStates(extras);
  if (!heaters.length) return undefined;
  return { active: heaters.some((h) => h.active) };
}

/** All electric heaters of a device; without entity they are drawn as off. */
export function heaterStates(extras: DeviceExtras): NodeVisualState[] {
  return (extras.addons ?? []).filter((a) => a.config.type === "electric_heater").map((a) => a.state);
}

const SPIN_MIN_S = 0.25;
const SPIN_MAX_S = 4;

/** Animation period from a speed: percent, or rpm shown at a tenth of the real speed so it stays visible. */
export function spinDuration(state: NodeVisualState): number | undefined {
  const value = state.numeric;
  if (value === undefined || value <= 0) return undefined;
  const revPerSecond = state.unit === "%" ? 0.25 + (1.75 * Math.min(value, 100)) / 100 : value / 600;
  return Math.round(Math.min(SPIN_MAX_S, Math.max(SPIN_MIN_S, 1 / revPerSecond)) * 100) / 100;
}

/** On/off add-ons bound to a number (rpm, W, %) run while the number is above zero. */
export function withNumericActivity(config: AddonConfig, state: NodeVisualState): NodeVisualState {
  if (config.active_state !== undefined || state.numeric === undefined) return state;
  return { ...state, active: state.numeric > 0 };
}

export function isAddonActive(extras: DeviceExtras, type: AddonType): boolean {
  return addonStates(extras, type).some((s) => s.active);
}

/** Add-ons that show a device is working when it has no state entity of its own. */
const ACTIVITY_ADDONS: AddonType[] = ["pump", "fan", "electric_heater", "loop"];

export function activeFromAddons(addons: ResolvedAddon[]): boolean {
  return addons.some((a) => a.config.entity_id && ACTIVITY_ADDONS.includes(a.config.type) && a.state.active);
}

/** Immersion heater entering through the right wall at `wallX`, glowing while active. */
export function renderHeatingRod(wallX: number, y: number, length: number, heater: NodeVisualState): SvgResult {
  const color = heater.active ? HEATER_ACTIVE_COLOR : NEUTRAL_STROKE;
  return svg`
    <g class="heating-rod ${heater.active ? "active" : ""}">
      <title>${heater.label ?? ""}</title>
      <rect x="${wallX - 4}" y="${y - 6}" width="8" height="12" rx="2" fill="${CARD_FILL}" stroke="${color}" stroke-width="1.5" />
      ${renderHeaterCoil(wallX - 4 - length, y + 4, length, heater)}
    </g>
  `;
}

/** Horizontal bands colored by the nearest sensor, from `top` to `bottom` of a tank. */
export function renderTemperatureBands(
  x: number,
  width: number,
  top: number,
  bottom: number,
  sensors: { y: number; state: NodeVisualState }[]
): SvgResult[] {
  return sensors.map((sensor, i) => {
    const y0 = i === 0 ? top : (sensors[i - 1].y + sensor.y) / 2;
    const y1 = i === sensors.length - 1 ? bottom : (sensor.y + sensors[i + 1].y) / 2;
    return svg`<rect class="water" x="${x}" y="${y0}" width="${width}" height="${y1 - y0}"
      fill="${temperatureColor(sensor.state.numeric)}" opacity="0.3" />`;
  });
}

export const SUPPLY_COLOR = "#ef5350";
export const RETURN_COLOR = "#42a5f5";
export const ACTIVE_COLOR = "#4caf50";
export const HEATER_ACTIVE_COLOR = "#ff7043";
export const DEFROST_COLOR = "#4fc3f7";
export const CARD_FILL = "var(--card-background-color, #1c1c1c)";
export const NEUTRAL_STROKE = "var(--divider-color, #888)";
export const ACCENT = "var(--primary-color, #03a9f4)";

/** Home Assistant state colors where they exist; idle has none. */
const OPERATION_COLORS: Record<Operation, string | undefined> = {
  heating: "var(--state-climate-heat-color, #ff8100)",
  dhw: "var(--deep-orange-color, #ff6f22)",
  cooling: "var(--state-climate-cool-color, #2b9af9)",
  defrost: DEFROST_COLOR,
  idle: undefined,
};

export function operationColor(operation: Operation | undefined): string | undefined {
  return operation ? OPERATION_COLORS[operation] : undefined;
}

/** Temperatures mapped onto the blue → red scale. */
const TEMP_COLD = 20;
const TEMP_HOT = 60;

export function temperatureColor(value: number | undefined): string {
  if (value === undefined) return NEUTRAL_STROKE;
  const f = Math.min(1, Math.max(0, (value - TEMP_COLD) / (TEMP_HOT - TEMP_COLD)));
  return `hsl(${Math.round(220 * (1 - f))}, 75%, 50%)`;
}

export function frameStroke(state: NodeVisualState, selected: boolean, activeColor = ACTIVE_COLOR): string {
  if (state.active) return activeColor;
  return selected ? ACCENT : NEUTRAL_STROKE;
}

export function frameWidth(selected: boolean): number {
  return selected ? 2.5 : 1.5;
}

export function renderPorts(def: DeviceDefinition, t: Translator): SvgResult[] {
  return def.ports.map((port: PortDefinition) => svg`
    <circle
      class="port port-${port.kind}"
      data-port-id="${port.id}"
      cx="${port.position.x}" cy="${port.position.y}" r="5"
      fill="${CARD_FILL}"
      stroke="${(port.tone ?? (port.kind === "inlet" ? "cold" : "hot")) === "cold" ? "#4fc3f7" : "#ff8a65"}"
      stroke-width="2"
    ><title>${t.t(port.labelKey, ...(port.labelArgs ?? []))}</title></circle>
  `);
}

/** Zig-zag heating element; glows when the bound entity is active. */
export function renderHeaterCoil(x: number, y: number, width: number, heater: NodeVisualState): SvgResult {
  const steps = 6;
  const step = width / steps;
  let d = `M ${x} ${y}`;
  for (let i = 1; i <= steps; i++) {
    d += ` L ${x + i * step} ${y + (i % 2 === 0 ? 0 : -8)}`;
  }
  const color = heater.active ? HEATER_ACTIVE_COLOR : NEUTRAL_STROKE;
  return svg`
    <path class="heater ${heater.active ? "active" : ""}" d="${d}" fill="none"
      stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
  `;
}

/** Short pipe stubs from each port towards the device body. */
export function renderPortStubs(def: DeviceDefinition, length: number): SvgResult[] {
  return def.ports.map((p) => {
    const { x, y } = p.position;
    const dx = x === 0 ? length : x === def.width ? -length : 0;
    const dy = y === 0 ? length : y === def.height ? -length : 0;
    return svg`<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke="${NEUTRAL_STROKE}" stroke-width="2" />`;
  });
}

/** Value text shown only for numeric states, e.g. a temperature. */
export function numericValue(state: NodeVisualState): string | undefined {
  return state.numeric !== undefined || state.fromAttribute ? state.value : undefined;
}

/** Value on a small background so it stays readable over drawings; optional temperature color. */
export function renderValueLabel(x: number, y: number, state: NodeVisualState, colorByTemperature = false): SvgResult {
  const text = state.value ?? "—";
  const width = text.length * 6.5 + 8;
  const style = colorByTemperature && state.numeric !== undefined ? `fill: ${temperatureColor(state.numeric)}` : "";
  return svg`
    <rect x="${x - width / 2}" y="${y - 11}" width="${width}" height="15" rx="3" fill="${CARD_FILL}" opacity="0.85" />
    <text x="${x}" y="${y}" text-anchor="middle" class="device-value" style="${style}">
      <title>${state.label ?? ""}</title>${text}
    </text>
  `;
}
