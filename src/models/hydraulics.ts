import { getNodeDefinition, tankRole } from "./device-registry.js";
import { connectionId, formatPortRef, parsePortRef, type HeatingSchema, type SchemaNode } from "./schema.js";

/** What flows in a pipe; decides its color. */
export type Medium = "supply" | "return" | "hot_water" | "cold_water";

const TERMINAL: Record<string, Medium> = { in: "supply", out: "return" };
const FOUR_PORT: Record<string, Medium> = {
  primary_in: "supply",
  primary_out: "return",
  secondary_out: "supply",
  secondary_in: "return",
};

/** Ports that fix the medium; devices without an entry pass the medium of their pipes on. */
const PORT_MEDIA: Record<string, Record<string, Medium>> = {
  heat_pump: { hot_out: "supply", cold_in: "return", hot_out_left: "supply", cold_in_left: "return" },
  heating_boiler: { supply_out: "supply", return_in: "return" },
  solar_collector: { hot_out: "supply", cold_in: "return" },
  tank: {
    source_in: "supply",
    source_out: "return",
    coil_in: "supply",
    coil_out: "return",
    coil2_in: "supply",
    coil2_out: "return",
    supply_out: "supply",
    return_in: "return",
    hot_out: "hot_water",
    cold_in: "cold_water",
    circulation_in: "hot_water",
  },
  manifold: { supply_in: "supply", return_out: "return" },
  floor_heating: TERMINAL,
  radiator: TERMINAL,
  fancoil: TERMINAL,
  mixing_valve: { hot_in: "supply", return_in: "return", mixed_out: "supply" },
  hydraulic_separator: FOUR_PORT,
  plate_heat_exchanger: FOUR_PORT,
  electric_heater: { out: "supply" },
  water_supply: { out: "cold_water" },
  dhw_outlet: { in: "hot_water" },
};

const LOOP_PORT = /^loop_(\d+)_(in|out)$/;

/** Dual-coil tank: the second coil heats domestic water flow-through; its tank outlets carry hot water. */
const DUAL_COIL_MEDIA: Record<string, Medium> = {
  coil2_in: "cold_water",
  coil2_out: "hot_water",
  hot_out2: "hot_water",
};

function portMedium(node: SchemaNode, portId: string): Medium | undefined {
  if (node.type === "tank" && node.variant === "dual_coil" && DUAL_COIL_MEDIA[portId]) return DUAL_COIL_MEDIA[portId];
  if (node.type === "manifold") {
    const loop = LOOP_PORT.exec(portId);
    if (loop) return loop[2] === "out" ? "supply" : "return";
  }
  return PORT_MEDIA[node.type]?.[portId];
}

/** Medium of every pipe, keyed by `connectionId`; pipes that cannot be classified are left out. */
export function pipeMedia(schema: HeatingSchema): Map<string, Medium> {
  const nodes = new Map(schema.nodes.map((n) => [n.id, n]));
  const media = new Map<string, Medium>();
  const byNode = new Map<string, string[]>();

  for (const c of schema.connections) {
    const from = parsePortRef(c.from);
    const to = parsePortRef(c.to);
    const fromNode = from && nodes.get(from.nodeId);
    const toNode = to && nodes.get(to.nodeId);
    if (!from || !to || !fromNode || !toNode) continue;
    const id = connectionId(c);
    const medium = portMedium(fromNode, from.portId) ?? portMedium(toNode, to.portId);
    if (medium) media.set(id, medium);
    for (const nodeId of [from.nodeId, to.nodeId]) byNode.set(nodeId, [...(byNode.get(nodeId) ?? []), id]);
  }

  // Pumps, valves and junctions carry the medium of the pipes around them.
  const passThrough = schema.nodes.filter((n) => !PORT_MEDIA[n.type]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of passThrough) {
      const pipes = byNode.get(node.id) ?? [];
      const known = pipes.map((id) => media.get(id)).find((m) => m !== undefined);
      if (!known) continue;
      for (const id of pipes) {
        if (!media.has(id)) {
          media.set(id, known);
          changed = true;
        }
      }
    }
  }
  return media;
}

/** Runtime facts about a device that decide where water can flow. */
export interface FlowNodeState {
  active: boolean;
  valveBranch?: "a" | "b";
  /** A pump add-on is running. */
  pumpActive?: boolean;
  /** A pump add-on has an entity, so it alone decides whether the device moves water. */
  pumpBound?: boolean;
  /** Manifold loops in order; `false` = closed. */
  loops?: boolean[];
}

/** Devices that move water while they are active. */
const MOVERS = new Set(["circulation_pump", "heat_pump", "heating_boiler", "solar_collector"]);

const TANK_FLOW: Record<string, string[]> = {
  coil_in: ["coil_out"],
  coil2_in: ["coil2_out"],
  source_in: ["source_out"],
  return_in: ["supply_out"],
  cold_in: ["hot_out"],
  circulation_in: ["hot_out"],
};
const FOUR_PORT_FLOW: Record<string, string[]> = {
  primary_in: ["primary_out"],
  secondary_in: ["secondary_out"],
};

/** Outlets water entering `inlet` can leave through. */
function outletsFrom(node: SchemaNode, inlet: string, state: FlowNodeState): string[] {
  const outlets = (getNodeDefinition(node)?.ports ?? []).filter((p) => p.kind === "outlet").map((p) => p.id);
  switch (node.type) {
    case "tank": {
      // Dual-coil tank: the return feeds both tank outlets and the heating outlet.
      const flow = node.variant === "dual_coil" && inlet === "return_in" ? ["supply_out", "hot_out", "hot_out2"] : TANK_FLOW[inlet];
      return (flow ?? []).filter((id) => outlets.includes(id));
    }
    case "hydraulic_separator":
    case "plate_heat_exchanger":
      return FOUR_PORT_FLOW[inlet] ?? [];
    case "valve_3way":
      return state.valveBranch ? [`out_${state.valveBranch}`] : outlets;
    case "zone_valve":
      return node.entity_id && !state.active ? [] : outlets;
    case "manifold": {
      if (LOOP_PORT.test(inlet)) return ["return_out"];
      const open = outlets.filter((id) => {
        const match = LOOP_PORT.exec(id);
        return match && state.loops?.[Number(match[1]) - 1] !== false;
      });
      // Loops drawn without pipes still carry water from the supply to the return bar.
      return open.length ? [...open, "return_out"] : [];
    }
    default:
      return outlets;
  }
}

/**
 * Pipes water flows through: from every running pump or heat source downstream along the pipes, only
 * through open valves and the active branch of 3-way valves. An open hot water tap makes the cold water
 * supply the source of its circuit.
 */
export function flowingConnections(
  schema: HeatingSchema,
  stateOf: (node: SchemaNode) => FlowNodeState
): Set<string> {
  const states = new Map(schema.nodes.map((n) => [n.id, stateOf(n)]));
  const nodes = new Map(schema.nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, typeof schema.connections>();
  for (const c of schema.connections) outgoing.set(c.from, [...(outgoing.get(c.from) ?? []), c]);

  const tapOpen = schema.nodes.some((n) => n.type === "dhw_outlet" && states.get(n.id)?.active);
  const movers = schema.nodes.filter((n) => {
    const state = states.get(n.id);
    if (n.type === "water_supply") return tapOpen;
    return (MOVERS.has(n.type) && state?.active && !state.pumpBound) || state?.pumpActive;
  });

  const flowing = new Set<string>();
  const queue = movers.flatMap((n) =>
    (getNodeDefinition(n)?.ports ?? []).filter((p) => p.kind === "outlet").map((p) => formatPortRef({ nodeId: n.id, portId: p.id }))
  );
  while (queue.length) {
    const ref = queue.pop() as string;
    for (const c of outgoing.get(ref) ?? []) {
      const id = connectionId(c);
      if (flowing.has(id)) continue;
      flowing.add(id);
      const to = parsePortRef(c.to);
      const node = to && nodes.get(to.nodeId);
      if (!to || !node) continue;
      const state = states.get(node.id) ?? { active: false };
      for (const outlet of outletsFrom(node, to.portId, state)) queue.push(formatPortRef({ nodeId: node.id, portId: outlet }));
    }
  }
  return flowing;
}

/** Visits devices downstream of `start` (port refs); `enter` returns false to stop at a device. */
function walkDownstream(
  schema: HeatingSchema,
  start: string[],
  enter: (node: SchemaNode, inlet: string) => boolean
): void {
  const nodes = new Map(schema.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const queue = [...start];
  while (queue.length) {
    const ref = queue.pop() as string;
    for (const c of schema.connections.filter((x) => x.from === ref)) {
      const to = parsePortRef(c.to);
      const node = to && nodes.get(to.nodeId);
      if (!to || !node || seen.has(c.to)) continue;
      seen.add(c.to);
      if (!enter(node, to.portId)) continue;
      for (const outlet of outletsFrom(node, to.portId, { active: true })) {
        queue.push(formatPortRef({ nodeId: node.id, portId: outlet }));
      }
    }
  }
}

const TANK_HEATING_INLETS = new Set(["coil_in", "coil2_in", "source_in"]);

/**
 * The first 3-way valve after a heat source and its branch that heats a hot water tank; undefined when
 * there is no valve or both (or neither) branches reach one.
 */
export function dhwValveBranch(
  schema: HeatingSchema,
  sourceId: string
): { valveId: string; branch: "a" | "b" } | undefined {
  const source = schema.nodes.find((n) => n.id === sourceId);
  if (!source) return undefined;
  const outlets = (getNodeDefinition(source)?.ports ?? [])
    .filter((p) => p.kind === "outlet")
    .map((p) => formatPortRef({ nodeId: sourceId, portId: p.id }));
  let valve: SchemaNode | undefined;
  walkDownstream(schema, outlets, (node) => {
    if (node.type === "valve_3way") valve ??= node;
    return !valve && node.id !== sourceId;
  });
  if (!valve) return undefined;
  const valveId = valve.id;

  const heatsDhw = (branch: "a" | "b"): boolean => {
    let found = false;
    walkDownstream(schema, [`${valveId}.out_${branch}`], (node, inlet) => {
      // In the dual-coil tank the second coil carries domestic water, not heating water.
      const heating = TANK_HEATING_INLETS.has(inlet) && !(node.variant === "dual_coil" && inlet === "coil2_in");
      if (node.type === "tank" && tankRole(node) === "tank_dhw" && heating) found = true;
      return !found && node.id !== sourceId && node.id !== valveId;
    });
    return found;
  };
  const a = heatsDhw("a");
  if (a === heatsDhw("b")) return undefined;
  return { valveId, branch: a ? "a" : "b" };
}
