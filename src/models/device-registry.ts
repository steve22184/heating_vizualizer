import type { AddonSpec } from "./addons.js";
import type { AddonConfig, DeviceDefinition, PortDefinition, SchemaNode } from "./schema.js";

export const TANK_TEMPERATURE_SLOTS = ["top", "upper", "middle", "lower", "bottom"];
export const BOILER_TEMPERATURE_SLOTS = ["top", "middle", "bottom"];

const ALARM: AddonSpec = { type: "alarm", max: 1 };
const MODE: AddonSpec = { type: "mode", max: 1 };
const SETPOINT: AddonSpec = { type: "setpoint", max: 1 };
const values = (max: number): AddonSpec => ({ type: "value", max });
const temperatures = (...slots: string[]): AddonSpec => ({ type: "temperature", max: slots.length, slots });

/** Ports sit on the same 10-point grid devices snap to, so pipes between them can run straight. */
export const PORT_GRID = 10;
const snapPort = (value: number): number => Math.round(value / PORT_GRID) * PORT_GRID;

export const VALVE_3WAY: DeviceDefinition = {
  type: "valve_3way",
  labelKey: "devices.valve_3way.name",
  width: 80,
  height: 80,
  ports: [
    {
      id: "in",
      labelKey: "devices.valve_3way.ports.in",
      kind: "inlet",
      position: { x: 0, y: 40 },
    },
    {
      id: "out_a",
      labelKey: "devices.valve_3way.ports.out_a",
      kind: "outlet",
      position: { x: 80, y: 40 },
    },
    {
      id: "out_b",
      labelKey: "devices.valve_3way.ports.out_b",
      kind: "outlet",
      position: { x: 40, y: 80 },
    },
  ],
  addons: [values(1), ALARM],
};

const TANK_WIDTH = 100;
export const TANK_DEFAULT_VOLUME = 200;
export const TANK_SCALE_MIN = 0.5;
export const TANK_SCALE_MAX = 2;
/** DHW tank with two coils is drawn 20 % larger so the extra ports fit. */
export const TANK_2COIL_SCALE = 1.2;
const TANK_MIN_HEIGHT = 100;
const TANK_MAX_HEIGHT = 300;

/** Schematic height: doubling the volume adds a fixed step, so 1000 l does not dwarf the schema. */
export function tankHeight(volume: number | undefined): number {
  const liters = volume && volume > 0 ? volume : TANK_DEFAULT_VOLUME;
  const height = 110 + 38 * Math.log2(liters / 50);
  return Math.round(Math.min(TANK_MAX_HEIGHT, Math.max(TANK_MIN_HEIGHT, height)));
}

/** Size factor of a tank node, kept in a usable range. */
export function tankScale(node: SchemaNode): number {
  const scale = Number(node.scale ?? 1);
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.min(TANK_SCALE_MAX, Math.max(TANK_SCALE_MIN, scale));
}

// Ports top to bottom; each side is spread evenly over the tank height.
const TANK_LEFT_PORTS = ["source_in", "coil_in", "coil_out", "coil2_in", "coil2_out", "source_out"];
const TANK_RIGHT_PORTS = ["hot_out", "supply_out", "circulation_in", "return_in", "cold_in"];
const TANK_OUTLETS = new Set(["source_out", "coil_out", "coil2_out", "hot_out", "hot_out2", "supply_out"]);
const TANK_PORT_TOP = 0.15;
const TANK_PORT_SPAN = 0.7;

function tankPortIds(node: SchemaNode): Set<string> {
  const count = (type: string): number => node.addons?.filter((a) => a.type === type).length ?? 0;
  const ids = new Set<string>();
  if (count("direct_source")) ["source_in", "source_out"].forEach((id) => ids.add(id));
  if (count("heat_exchanger") >= 1) ["coil_in", "coil_out"].forEach((id) => ids.add(id));
  if (count("heat_exchanger") >= 2) ["coil2_in", "coil2_out"].forEach((id) => ids.add(id));
  if (count("dhw")) ["hot_out", "cold_in"].forEach((id) => ids.add(id));
  if (count("dhw") && node.variant === TANK_DUAL_COIL) {
    ids.delete("cold_in");
    ids.add("hot_out2");
  }
  if (count("direct_heating")) ["supply_out", "return_in"].forEach((id) => ids.add(id));
  if (count("circulation")) ids.add("circulation_in");
  return ids;
}

export const TANK_DUAL_COIL = "dual_coil";
/** Length of the pipe stub between a port and the tank body at a 100 wide tank; scales with the tank. */
export const TANK_STUB = 14;
/** The dual-coil body is this much wider than the plain tank (20 on each side) so the top ports sit on its flat edge. */
export const TANK_DUAL_WIDEN = 40;
/** ... and this much taller (10 at the top and bottom), on top of the longer stubs. */
export const TANK_DUAL_EXTEND = 20;
const COLD_PORTS = new Set(["coil_out", "coil2_in", "return_in"]);

/**
 * Dual-coil layout: the left coil is the heating coil (supply at the top, return at the bottom); the right
 * coil heats domestic hot water flow-through (cold water in at the bottom, hot water out at the top).
 * Tank outlets sit on the top edge, the heating outlet in the middle of the right wall, the return at the bottom edge.
 */
function dualCoilPorts(ids: Set<string>, width: number, height: number): PortDefinition[] {
  // Colors follow the medium: heating coil supply red, return blue; the right coil takes cold water in, gives hot water out.
  const port = (id: string, x: number, y: number): PortDefinition => ({
    id,
    labelKey: `devices.tank.ports.${id}`,
    kind: TANK_OUTLETS.has(id) ? "outlet" : "inlet",
    tone: COLD_PORTS.has(id) ? "cold" : "hot",
    position: { x, y },
  });
  const upper = snapPort(height * TANK_PORT_TOP);
  const lower = snapPort(height * (TANK_PORT_TOP + TANK_PORT_SPAN));
  // Top and bottom ports keep their distance from the body edge: 20 beyond the stub plus a fifth of the plain width.
  const inset = snapPort((width - TANK_DUAL_WIDEN) * 0.2) + 20;
  const left = inset;
  const right = width - inset;
  const layout: [string, number, number][] = [
    ["hot_out", left, 0],
    ["hot_out2", right, 0],
    ["coil_in", 0, upper],
    ["source_in", 0, snapPort(height * 0.4)],
    ["source_out", 0, snapPort(height * 0.6)],
    ["coil_out", 0, lower],
    ["coil2_out", width, upper],
    ["supply_out", width, snapPort(height * 0.5)],
    ["circulation_in", width, snapPort(height * 0.68)],
    ["coil2_in", width, lower],
    ["return_in", right, height],
  ];
  return layout.filter(([id]) => ids.has(id)).map(([id, x, y]) => port(id, x, y));
}

function spreadPorts(ids: string[], x: number, height: number): PortDefinition[] {
  return ids.map((id, i) => ({
    id,
    labelKey: `devices.tank.ports.${id}`,
    kind: TANK_OUTLETS.has(id) ? "outlet" : "inlet",
    position: {
      x,
      y: snapPort(height * (ids.length === 1 ? 0.5 : TANK_PORT_TOP + (TANK_PORT_SPAN * i) / (ids.length - 1))),
    },
  }));
}

/** A tank with a DHW module is a DHW tank, otherwise a buffer tank. */
export function tankRole(node: SchemaNode): "tank_dhw" | "tank_buffer" {
  return node.addons?.some((a) => a.type === "dhw") ? "tank_dhw" : "tank_buffer";
}

/** Buffer tank, DHW tank or combination: connections, coils and heaters are modules. */
export const TANK: DeviceDefinition = {
  type: "tank",
  labelKey: "devices.tank.name",
  width: TANK_WIDTH,
  height: tankHeight(undefined),
  ports: [],
  volume: true,
  variants: ["standard", TANK_DUAL_COIL],
  addons: [
    temperatures(...TANK_TEMPERATURE_SLOTS),
    values(2),
    { type: "electric_heater", max: 2 },
    { type: "pump", max: 1 },
    MODE,
    SETPOINT,
    ALARM,
    { type: "heat_exchanger", max: 2 },
    { type: "direct_source", max: 1 },
    { type: "direct_heating", max: 1 },
    { type: "dhw", max: 1 },
    { type: "circulation", max: 1 },
  ],
  resolve: (node) => {
    const scale = tankScale(node);
    // A scaled tank stays on the port grid so pipes between ports can run straight.
    const baseWidth = scale === 1 ? TANK_WIDTH : snapPort(TANK_WIDTH * scale);
    const width = baseWidth + (node.variant === TANK_DUAL_COIL ? TANK_DUAL_WIDEN : 0);
    const plainHeight = scale === 1 ? tankHeight(node.volume) : snapPort(tankHeight(node.volume) * scale);
    // Dual-coil: body 20 taller plus a side-stub-long pipe at the top and bottom, kept on the port grid.
    const height =
      node.variant === TANK_DUAL_COIL
        ? snapPort(plainHeight + TANK_DUAL_EXTEND + 2 * TANK_STUB * (baseWidth / TANK_WIDTH))
        : plainHeight;
    const ids = tankPortIds(node);
    return {
      ...TANK,
      labelKey: `devices.tank.${tankRole(node) === "tank_dhw" ? "name_dhw" : ids.size ? "name_buffer" : "name"}`,
      width,
      height,
      ports:
        node.variant === TANK_DUAL_COIL
          ? dualCoilPorts(ids, width, height)
          : [
              ...spreadPorts(TANK_LEFT_PORTS.filter((id) => ids.has(id)), 0, height),
              ...spreadPorts(TANK_RIGHT_PORTS.filter((id) => ids.has(id)), width, height),
            ],
    };
  },
};

const JUNCTION_SIZE = 20;
const JUNCTION_MID = JUNCTION_SIZE / 2;

/** Compact T-piece; its name is only shown when set. */
export const JUNCTION: DeviceDefinition = {
  type: "junction",
  labelKey: "devices.junction.name",
  width: JUNCTION_SIZE,
  height: JUNCTION_SIZE,
  hideLabel: true,
  variants: ["split", "merge"],
  ports: [
    { id: "in", labelKey: "devices.junction.ports.in", kind: "inlet", position: { x: 0, y: JUNCTION_MID } },
    { id: "out_top", labelKey: "devices.junction.ports.out_top", kind: "outlet", position: { x: JUNCTION_MID, y: 0 } },
    {
      id: "out_bottom",
      labelKey: "devices.junction.ports.out_bottom",
      kind: "outlet",
      position: { x: JUNCTION_MID, y: JUNCTION_SIZE },
    },
  ],
  // Merging two returns into one pipe: inlets from above and below, outlet to the right.
  resolve: (node) =>
    node.variant === "merge"
      ? {
          ...JUNCTION,
          ports: [
            { id: "in_top", labelKey: "devices.junction.ports.in_top", kind: "inlet", position: { x: JUNCTION_MID, y: 0 } },
            {
              id: "in_bottom",
              labelKey: "devices.junction.ports.in_bottom",
              kind: "inlet",
              position: { x: JUNCTION_MID, y: JUNCTION_SIZE },
            },
            { id: "out", labelKey: "devices.junction.ports.out", kind: "outlet", position: { x: JUNCTION_SIZE, y: JUNCTION_MID } },
          ],
        }
      : JUNCTION,
};

export const CIRCULATION_PUMP: DeviceDefinition = {
  type: "circulation_pump",
  labelKey: "devices.circulation_pump.name",
  width: 80,
  height: 80,
  ports: [
    {
      id: "in",
      labelKey: "devices.circulation_pump.ports.in",
      kind: "inlet",
      position: { x: 0, y: 40 },
    },
    {
      id: "out",
      labelKey: "devices.circulation_pump.ports.out",
      kind: "outlet",
      position: { x: 80, y: 40 },
    },
  ],
  addons: [values(3), MODE, ALARM],
};

export const FLOOR_HEATING: DeviceDefinition = {
  type: "floor_heating",
  labelKey: "devices.floor_heating.name",
  width: 140,
  height: 80,
  ports: [
    {
      id: "in",
      labelKey: "devices.floor_heating.ports.in",
      kind: "inlet",
      position: { x: 0, y: 40 },
    },
    {
      id: "out",
      labelKey: "devices.floor_heating.ports.out",
      kind: "outlet",
      position: { x: 140, y: 40 },
    },
  ],
  addons: [temperatures("room", "floor"), { type: "actuator", max: 1 }, SETPOINT, { type: "window", max: 1 }],
};

export const MANIFOLD_LOOP_SPACING = 40;
export const MANIFOLD_LOOP_START = 50;
const MANIFOLD_HEIGHT = 130;
export const MANIFOLD_DEFAULT_LOOPS = 4;
const MANIFOLD_MAX_LOOPS = 12;

function manifoldDefinition(loops: number): DeviceDefinition {
  const loopPorts: PortDefinition[] = [];
  for (let i = 0; i < loops; i++) {
    const x = MANIFOLD_LOOP_START + i * MANIFOLD_LOOP_SPACING;
    const number = String(i + 1);
    loopPorts.push(
      {
        id: `loop_${number}_out`,
        labelKey: "devices.manifold.ports.loop_out",
        labelArgs: [number],
        kind: "outlet",
        position: { x, y: 0 },
      },
      {
        id: `loop_${number}_in`,
        labelKey: "devices.manifold.ports.loop_in",
        labelArgs: [number],
        kind: "inlet",
        position: { x, y: MANIFOLD_HEIGHT },
      }
    );
  }
  return {
    ...MANIFOLD,
    width: MANIFOLD_LOOP_START + loops * MANIFOLD_LOOP_SPACING - 10,
    ports: [...MANIFOLD.ports, ...loopPorts],
  };
}

export const MANIFOLD: DeviceDefinition = {
  type: "manifold",
  labelKey: "devices.manifold.name",
  width: 184,
  height: MANIFOLD_HEIGHT,
  ports: [
    {
      id: "supply_in",
      labelKey: "devices.manifold.ports.supply_in",
      kind: "inlet",
      position: { x: 0, y: 30 },
    },
    {
      id: "return_out",
      labelKey: "devices.manifold.ports.return_out",
      kind: "outlet",
      position: { x: 0, y: 100 },
    },
  ],
  addons: [
    { type: "loop", max: MANIFOLD_MAX_LOOPS },
    temperatures("supply", "return"),
    values(2),
    { type: "pump", max: 1 },
  ],
  resolve: (node) =>
    manifoldDefinition(Math.max(1, node.addons?.filter((a) => a.type === "loop").length ?? 0)),
};

export const MIXING_VALVE: DeviceDefinition = {
  type: "mixing_valve",
  labelKey: "devices.mixing_valve.name",
  width: 100,
  height: 110,
  ports: [
    {
      id: "hot_in",
      labelKey: "devices.mixing_valve.ports.hot_in",
      kind: "inlet",
      position: { x: 0, y: 70 },
    },
    {
      id: "return_in",
      labelKey: "devices.mixing_valve.ports.return_in",
      kind: "inlet",
      position: { x: 50, y: 110 },
    },
    {
      id: "mixed_out",
      labelKey: "devices.mixing_valve.ports.mixed_out",
      kind: "outlet",
      position: { x: 100, y: 70 },
    },
  ],
  addons: [temperatures("mixed", "return"), values(1), SETPOINT, ALARM],
};

export const ELECTRIC_HEATER: DeviceDefinition = {
  type: "electric_heater",
  labelKey: "devices.electric_heater.name",
  width: 120,
  height: 60,
  ports: [
    {
      id: "in",
      labelKey: "devices.electric_heater.ports.in",
      kind: "inlet",
      position: { x: 0, y: 30 },
    },
    {
      id: "out",
      labelKey: "devices.electric_heater.ports.out",
      kind: "outlet",
      position: { x: 120, y: 30 },
    },
  ],
  addons: [temperatures("inlet", "outlet"), values(2), MODE, ALARM],
};

/** Heat pump sensors; besides the water side they describe the refrigerant circuit shown in the detail. */
export const HEAT_PUMP_TEMPERATURE_SLOTS = [
  "supply",
  "return",
  "evaporator",
  "outdoor",
  "hx_outlet",
  "suction",
  "discharge",
  "refrigerant_gas",
  "refrigerant_liquid",
  "inverter",
];
export const HEAT_PUMP_VALUE_SLOTS = [
  "frequency",
  "compressor_current",
  "high_pressure",
  "low_pressure",
  "voltage",
  "current",
  "power",
  "flow",
  "heat_output",
  "cop",
];

export const HEAT_PUMP_V2 = "v2";

/** v2 of the heat pump: 150 x 225, fan in the middle, connections on both sides. */
function heatPumpV2Definition(): DeviceDefinition {
  const width = 150;
  const height = 225;
  // Connectors on both sides, 50 apart; the pair is centred on the taller housing.
  const coolantIn = "devices.heat_pump.ports.coolant_in";
  const coolantOut = "devices.heat_pump.ports.coolant_out";
  return {
    ...HEAT_PUMP,
    width,
    height,
    ports: [
      { id: "hot_out", labelKey: coolantIn, kind: "outlet", position: { x: width, y: 90 } },
      { id: "cold_in", labelKey: coolantOut, kind: "inlet", position: { x: width, y: 140 } },
      { id: "hot_out_left", labelKey: coolantIn, kind: "outlet", position: { x: 0, y: 90 } },
      { id: "cold_in_left", labelKey: coolantOut, kind: "inlet", position: { x: 0, y: 140 } },
    ],
  };
}

export const HEAT_PUMP: DeviceDefinition = {
  type: "heat_pump",
  labelKey: "devices.heat_pump.name",
  width: 170,
  height: 120,
  // Only changes the detail drawing: one housing, or outdoor and indoor unit.
  variants: ["monoblock", "split"],
  resolve: (node) => (node.variant === HEAT_PUMP_V2 ? heatPumpV2Definition() : HEAT_PUMP),
  ports: [
    {
      id: "hot_out",
      labelKey: "devices.heat_pump.ports.hot_out",
      kind: "outlet",
      position: { x: 170, y: 40 },
    },
    {
      id: "cold_in",
      labelKey: "devices.heat_pump.ports.cold_in",
      kind: "inlet",
      position: { x: 170, y: 90 },
    },
  ],
  addons: [
    temperatures(...HEAT_PUMP_TEMPERATURE_SLOTS),
    { type: "value", max: 12, slots: HEAT_PUMP_VALUE_SLOTS, slotsOptional: true },
    { type: "electric_heater", max: 3 },
    { type: "pump", max: 1 },
    { type: "fan", max: 1 },
    { type: "compressor", max: 1 },
    { type: "operation", max: 4, slots: ["status", "heating", "dhw", "cooling"] },
    MODE,
    SETPOINT,
    { type: "defrost", max: 1 },
    ALARM,
  ],
};

function inlineSensor(type: string): DeviceDefinition {
  return {
    type,
    labelKey: `devices.${type}.name`,
    width: 80,
    height: 44,
    ports: [
      { id: "in", labelKey: "devices.inline.ports.in", kind: "inlet", position: { x: 0, y: 30 } },
      { id: "out", labelKey: "devices.inline.ports.out", kind: "outlet", position: { x: 80, y: 30 } },
    ],
    valueDisplay: "only",
  };
}

/** Temperature, pressure, flow or energy – the icon follows the entity's device class. */
export const PIPE_SENSOR = inlineSensor("pipe_sensor");

/** Informational element without pipe connections. */
export const OUTDOOR_TEMPERATURE: DeviceDefinition = {
  type: "outdoor_temperature",
  labelKey: "devices.outdoor_temperature.name",
  width: 100,
  height: 50,
  valueDisplay: "only",
  ports: [],
  addons: [values(1)],
};

/** Boiler-like heat source with supply/return on the right side. */
function heatSource(type: string): DeviceDefinition {
  return {
    type,
    labelKey: `devices.${type}.name`,
    width: 100,
    height: 130,
    valueDisplay: "with_state",
    ports: [
      {
        id: "supply_out",
        labelKey: "devices.heat_source.ports.supply_out",
        kind: "outlet",
        position: { x: 100, y: 30 },
      },
      {
        id: "return_in",
        labelKey: "devices.heat_source.ports.return_in",
        kind: "inlet",
        position: { x: 100, y: 100 },
      },
    ],
  };
}

// Fuel type is intentionally not modelled: Home Assistant cannot observe it.
export const HEATING_BOILER: DeviceDefinition = {
  ...heatSource("heating_boiler"),
  addons: [temperatures("supply", "return"), values(4), { type: "pump", max: 1 }, MODE, SETPOINT, ALARM],
};

export const SOLAR_COLLECTOR: DeviceDefinition = {
  type: "solar_collector",
  labelKey: "devices.solar_collector.name",
  width: 150,
  height: 100,
  valueDisplay: "with_state",
  ports: [
    {
      id: "hot_out",
      labelKey: "devices.solar_collector.ports.hot_out",
      kind: "outlet",
      position: { x: 150, y: 20 },
    },
    {
      id: "cold_in",
      labelKey: "devices.solar_collector.ports.cold_in",
      kind: "inlet",
      position: { x: 150, y: 80 },
    },
  ],
  addons: [temperatures("collector"), values(2), { type: "pump", max: 1 }, ALARM],
};

/** Primary circuit on the left, secondary circuit on the right. */
function fourPort(type: string, width: number, height: number): DeviceDefinition {
  const port = (id: string, kind: "inlet" | "outlet", x: number, y: number): PortDefinition => ({
    id,
    labelKey: `devices.four_port.ports.${id}`,
    kind,
    position: { x, y },
  });
  return {
    type,
    labelKey: `devices.${type}.name`,
    width,
    height,
    ports: [
      port("primary_in", "inlet", 0, 30),
      port("primary_out", "outlet", 0, height - 30),
      port("secondary_out", "outlet", width, 30),
      port("secondary_in", "inlet", width, height - 30),
    ],
  };
}

const CIRCUIT_TEMPERATURES = temperatures("primary_supply", "primary_return", "secondary_supply", "secondary_return");

export const HYDRAULIC_SEPARATOR: DeviceDefinition = {
  ...fourPort("hydraulic_separator", 80, 160),
  valueDisplay: "only",
  addons: [CIRCUIT_TEMPERATURES, values(2)],
};
export const PLATE_HEAT_EXCHANGER: DeviceDefinition = {
  ...fourPort("plate_heat_exchanger", 100, 120),
  addons: [CIRCUIT_TEMPERATURES, values(2)],
};

export const EXPANSION_VESSEL: DeviceDefinition = {
  type: "expansion_vessel",
  labelKey: "devices.expansion_vessel.name",
  width: 80,
  height: 110,
  valueDisplay: "only",
  ports: [
    {
      id: "connection",
      labelKey: "devices.expansion_vessel.ports.connection",
      kind: "inlet",
      position: { x: 40, y: 110 },
    },
  ],
  addons: [values(1), ALARM],
};

export const SAFETY_VALVE: DeviceDefinition = {
  type: "safety_valve",
  labelKey: "devices.safety_valve.name",
  width: 70,
  height: 90,
  ports: [
    {
      id: "in",
      labelKey: "devices.safety_valve.ports.in",
      kind: "inlet",
      position: { x: 30, y: 90 },
    },
    {
      id: "discharge",
      labelKey: "devices.safety_valve.ports.discharge",
      kind: "outlet",
      position: { x: 70, y: 60 },
    },
  ],
  addons: [ALARM],
};

export const ZONE_VALVE: DeviceDefinition = {
  type: "zone_valve",
  labelKey: "devices.zone_valve.name",
  width: 80,
  height: 70,
  ports: [
    { id: "in", labelKey: "devices.inline.ports.in", kind: "inlet", position: { x: 0, y: 50 } },
    { id: "out", labelKey: "devices.inline.ports.out", kind: "outlet", position: { x: 80, y: 50 } },
  ],
  addons: [temperatures("room"), ALARM],
};

/** Room terminal unit with supply/return at the bottom corners. */
function terminalUnit(type: string): DeviceDefinition {
  return {
    type,
    labelKey: `devices.${type}.name`,
    width: 130,
    height: 80,
    valueDisplay: "with_state",
    ports: [
      { id: "in", labelKey: "devices.terminal.ports.in", kind: "inlet", position: { x: 0, y: 70 } },
      { id: "out", labelKey: "devices.terminal.ports.out", kind: "outlet", position: { x: 130, y: 70 } },
    ],
  };
}

export const RADIATOR: DeviceDefinition = {
  ...terminalUnit("radiator"),
  addons: [temperatures("room"), { type: "actuator", max: 1 }, SETPOINT, ALARM, { type: "window", max: 1 }],
};
export const FANCOIL: DeviceDefinition = {
  ...terminalUnit("fancoil"),
  addons: [
    temperatures("room", "supply"),
    { type: "actuator", max: 1 },
    { type: "fan", max: 1 },
    MODE,
    SETPOINT,
    ALARM,
  ],
};

/** Cold water from the mains, e.g. to refill a DHW tank. */
export const WATER_SUPPLY: DeviceDefinition = {
  type: "water_supply",
  labelKey: "devices.water_supply.name",
  width: 80,
  height: 60,
  ports: [{ id: "out", labelKey: "devices.inline.ports.out", kind: "outlet", position: { x: 80, y: 30 } }],
  addons: [values(2), ALARM],
};

/** Hot water taps (bathroom, kitchen). */
export const DHW_OUTLET: DeviceDefinition = {
  type: "dhw_outlet",
  labelKey: "devices.dhw_outlet.name",
  width: 80,
  height: 60,
  ports: [{ id: "in", labelKey: "devices.inline.ports.in", kind: "inlet", position: { x: 0, y: 30 } }],
  addons: [values(2)],
};

/** Ground collector: a triple loop of pipe between a cold inlet (blue) and a warm outlet (red). */
export const GROUND_COLLECTOR: DeviceDefinition = {
  type: "ground_collector",
  labelKey: "devices.ground_collector.name",
  width: 100,
  height: 70,
  // The pipe covers x 26–100, so the name is centred on that and lifted 2 mm.
  labelOffset: { x: 63, y: 7 },
  ports: [
    { id: "hot_out", labelKey: "devices.ground_collector.ports.hot_out", kind: "outlet", tone: "hot", position: { x: 100, y: 10 } },
    { id: "cold_in", labelKey: "devices.ground_collector.ports.cold_in", kind: "inlet", tone: "cold", position: { x: 100, y: 60 } },
  ],
  addons: [],
};

const ALL_DEVICES: DeviceDefinition[] = [
  HEAT_PUMP,
  GROUND_COLLECTOR,
  HEATING_BOILER,
  SOLAR_COLLECTOR,
  TANK,
  HYDRAULIC_SEPARATOR,
  PLATE_HEAT_EXCHANGER,
  EXPANSION_VESSEL,
  SAFETY_VALVE,
  VALVE_3WAY,
  MIXING_VALVE,
  ZONE_VALVE,
  CIRCULATION_PUMP,
  MANIFOLD,
  FLOOR_HEATING,
  RADIATOR,
  FANCOIL,
  ELECTRIC_HEATER,
  JUNCTION,
  PIPE_SENSOR,
  OUTDOOR_TEMPERATURE,
  WATER_SUPPLY,
  DHW_OUTLET,
];

export const DEVICE_TYPES: string[] = ALL_DEVICES.map((d) => d.type);

/** Entry of the "add device" list: a device type, possibly with modules already added. */
export interface DevicePreset {
  id: string;
  type: string;
  labelKey: string;
  addons?: AddonConfig[];
  /** Initial `scale` of the new node. */
  scale?: number;
  /** Initial `variant` of the new node. */
  variant?: string;
}

const TANK_PRESETS: DevicePreset[] = [
  {
    id: "tank_buffer",
    type: TANK.type,
    labelKey: "devices.tank.name_buffer",
    addons: [{ type: "direct_source" }, { type: "direct_heating" }],
  },
  {
    id: "tank_dhw",
    type: TANK.type,
    labelKey: "devices.tank.name_dhw",
    addons: [{ type: "heat_exchanger" }, { type: "dhw" }],
  },
  {
    id: "tank_dhw_2coil",
    type: TANK.type,
    labelKey: "devices.tank.name_dhw_2coil",
    addons: [{ type: "heat_exchanger" }, { type: "heat_exchanger" }, { type: "dhw" }, { type: "direct_heating" }],
    scale: TANK_2COIL_SCALE,
    variant: TANK_DUAL_COIL,
  },
];

const HEAT_PUMP_PRESETS: DevicePreset[] = [
  { id: HEAT_PUMP.type, type: HEAT_PUMP.type, labelKey: "devices.heat_pump.name" },
  { id: "heat_pump_v2", type: HEAT_PUMP.type, labelKey: "devices.heat_pump.name_v2", variant: HEAT_PUMP_V2 },
];

export const DEVICE_PRESETS: DevicePreset[] = ALL_DEVICES.flatMap((d) => {
  if (d.type === TANK.type) return TANK_PRESETS;
  if (d.type === HEAT_PUMP.type) return HEAT_PUMP_PRESETS;
  return [{ id: d.type, type: d.type, labelKey: d.labelKey }];
});

export function getPreset(id: string): DevicePreset | undefined {
  return DEVICE_PRESETS.find((p) => p.id === id);
}

/** Preset a node corresponds to; tanks are told apart by their modules. */
export function presetOf(node: SchemaNode): string {
  return node.type === TANK.type ? tankRole(node) : node.type;
}

const REGISTRY = new Map<string, DeviceDefinition>(ALL_DEVICES.map((d) => [d.type, d]));

export function getDeviceDefinition(type: string): DeviceDefinition | undefined {
  return REGISTRY.get(type);
}

/** Definition with node-specific geometry (loop count, extra heat exchanger, …). */
export function getNodeDefinition(node: SchemaNode): DeviceDefinition | undefined {
  const def = REGISTRY.get(node.type);
  return def?.resolve ? def.resolve(node) : def;
}

export function getRegisteredDeviceTypes(): string[] {
  return [...REGISTRY.keys()];
}

export function getAllDeviceDefinitions(): DeviceDefinition[] {
  return [...REGISTRY.values()];
}

export function registerDevice(definition: DeviceDefinition): void {
  REGISTRY.set(definition.type, definition);
}
