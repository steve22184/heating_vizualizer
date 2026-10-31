import type { EntityNameConfig } from "../types/home-assistant.js";
import type { AddonSpec, AddonType } from "./addons.js";

export const SCHEMA_VERSION = 2;

export type PortKind = "inlet" | "outlet";

export interface PortDefinition {
  id: string;
  labelKey: string;
  /** Placeholder values for `labelKey`, e.g. the loop number. */
  labelArgs?: string[];
  kind: PortKind;
  /** Port circle color: `hot` (red) or `cold` (blue) where it differs from the port kind. */
  tone?: "hot" | "cold";
  /** Offset from node origin in device-local coordinates */
  position: { x: number; y: number };
}

export interface DeviceDefinition {
  type: string;
  labelKey: string;
  width: number;
  height: number;
  ports: PortDefinition[];
  addons?: AddonSpec[];
  /** Device shows its entity value: `only` = value display, `with_state` = value plus on/off. */
  valueDisplay?: "only" | "with_state";
  /** The node's `volume` (liters) sets the drawing size. */
  volume?: boolean;
  /** Alternative port layouts stored in the node's `variant`; the first one is the default. */
  variants?: string[];
  /** Small fittings show their name only when the user set one. */
  hideLabel?: boolean;
  /** Builds the node-specific geometry, e.g. from the number of loops. */
  resolve?: (node: SchemaNode) => DeviceDefinition;
}

/** Entity binding shared by devices and add-ons. */
export interface NodeStateBinding {
  entity_id?: string;
  active_state?: string;
  /** Attribute displayed instead of the state, e.g. `current_temperature`. */
  value_attribute?: string;
  mode_attribute?: string;
  branch_a_value?: string;
  branch_b_value?: string;
}

export interface AddonConfig extends NodeStateBinding {
  type: AddonType;
  slot?: string;
  name?: string;
  /** Loops only: optional room temperature. */
  temperature_entity_id?: string;
  /** Not drawn in the schema (badge, value line); the heat pump detail still shows it. */
  hidden?: boolean;
}

/** Home Assistant action (`more-info`, `toggle`, `navigate`, …), handed to the frontend unchanged. */
export interface ActionConfig {
  action: string;
  [key: string]: unknown;
}

export interface ActionBinding {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface SchemaNode extends NodeStateBinding, ActionBinding {
  id: string;
  type: string;
  /** Custom label; defaults to the translated device type name. */
  name?: string;
  /** Home Assistant device the entities of this device come from (e.g. the heat pump integration). */
  device_id?: string;
  position: { x: number; y: number };
  rotation?: number;
  /** Tanks: volume in liters. */
  volume?: number;
  /** Tanks: drawing size factor (1 = 100 %); ports and coils scale with it. */
  scale?: number;
  /** One of the device's `variants`, e.g. `merge` for a junction. */
  variant?: string;
  /** Heat pumps: corner of the card where the compact detail stays pinned. */
  detail_pin?: DetailPin;
  /** Heat pumps: width of the pinned detail in % of the schema width (default 40). */
  detail_size?: number;
  /** Heat pumps: no computed COP line on the outdoor unit. */
  hide_cop?: boolean;
  addons?: AddonConfig[];
}

export const DETAIL_PINS = ["top_left", "top_right", "bottom_left", "bottom_right"] as const;
export type DetailPin = (typeof DETAIL_PINS)[number];
export const DETAIL_SIZE_DEFAULT = 40;
export const DETAIL_SIZE_MIN = 15;
export const DETAIL_SIZE_MAX = 80;

/** Width of the pinned detail in % of the schema, kept in a usable range. */
export function pinnedSize(node: SchemaNode): number {
  const size = Number(node.detail_size ?? DETAIL_SIZE_DEFAULT);
  if (!Number.isFinite(size)) return DETAIL_SIZE_DEFAULT;
  return Math.min(DETAIL_SIZE_MAX, Math.max(DETAIL_SIZE_MIN, size));
}

export interface PortRef {
  nodeId: string;
  portId: string;
}

/** Pipe from an outlet to an inlet, both written as `node_id.port_id`. */
export interface Connection {
  from: string;
  to: string;
  /** Bend points drawn by the user, `[x, y]`; without it the pipe is routed automatically. */
  route?: [number, number][];
}

export function formatPortRef(ref: PortRef): string {
  return `${ref.nodeId}.${ref.portId}`;
}

export function parsePortRef(value: string): PortRef | undefined {
  const dot = value.lastIndexOf(".");
  if (dot <= 0 || dot === value.length - 1) return undefined;
  return { nodeId: value.slice(0, dot), portId: value.slice(dot + 1) };
}

export function connectionId(connection: Connection): string {
  return `${connection.from}>${connection.to}`;
}

export type OverlayConditionType = "state" | "numeric";

export interface OverlayStateRule {
  condition: OverlayConditionType;
  /** Defaults to the overlay entity. */
  entity?: string;
  state?: string;
  below?: number;
  above?: number;
  effect: {
    /** HA `ui_color` name (e.g. `red`, `primary`) or any CSS color. */
    color?: string;
    class?: string;
    visible?: boolean;
  };
}

export interface SchemaOverlay extends ActionBinding {
  id: string;
  position: { x: number; y: number };
  entity_id: string;
  /** Passed to `formatEntityName`. */
  name?: EntityNameConfig;
  template?: string;
  rules?: OverlayStateRule[];
}

export interface HeatingSchema {
  nodes: SchemaNode[];
  connections: Connection[];
  overlays: SchemaOverlay[];
}

export type PipeStyle = "orthogonal" | "curved";

export interface HeatingVisualizerConfig extends Partial<HeatingSchema> {
  type: string;
  schema_version?: number;
  /** Defaults to `orthogonal`. */
  pipe_style?: PipeStyle;
  /** Color pipes by medium; defaults to true. */
  pipe_colors?: boolean;
  /** Animate flowing water; defaults to true. */
  flow_animation?: boolean;
  /** Keys managed by the dashboard (grid_options, visibility, view_layout, …). */
  [key: string]: unknown;
}

export const EMPTY_SCHEMA: HeatingSchema = {
  nodes: [],
  connections: [],
  overlays: [],
};

export function schemaOf(config: HeatingVisualizerConfig): HeatingSchema {
  return {
    nodes: config.nodes ?? [],
    connections: config.connections ?? [],
    overlays: config.overlays ?? [],
  };
}

export function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
