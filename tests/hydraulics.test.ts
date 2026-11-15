import { describe, expect, it } from "vitest";
import { dhwValveBranch, flowingConnections, pipeMedia, type FlowNodeState } from "../src/models/hydraulics.js";
import { connectionId, type HeatingSchema } from "../src/models/schema.js";
import { instantiateTemplate, SCHEMA_TEMPLATES } from "../src/models/templates.js";

function template(id: string): HeatingSchema {
  const tpl = SCHEMA_TEMPLATES.find((t) => t.id === id)!;
  const empty: HeatingSchema = { nodes: [], connections: [], overlays: [] };
  return { ...empty, ...instantiateTemplate(tpl, empty, (local) => local) };
}

const pipe = (from: string, to: string): string => connectionId({ from, to });

describe("pipeMedia", () => {
  it("colors heating supply and return, passing through valves and pumps", () => {
    const media = pipeMedia(template("heat_pump_dhw_floor"));
    expect(media.get(pipe("hp.hot_out", "valve.in"))).toBe("supply");
    expect(media.get(pipe("valve.out_a", "dhw.coil_in"))).toBe("supply");
    expect(media.get(pipe("valve.out_b", "pump.in"))).toBe("supply");
    expect(media.get(pipe("dhw.coil_out", "hp.cold_in"))).toBe("return");
    expect(media.get(pipe("manifold.return_out", "hp.cold_in"))).toBe("return");
  });

  it("tells hot and cold water apart", () => {
    const schema: HeatingSchema = {
      nodes: [
        { id: "mains", type: "water_supply", position: { x: 0, y: 0 } },
        { id: "dhw", type: "tank", position: { x: 0, y: 0 }, addons: [{ type: "dhw" }] },
        { id: "tap", type: "dhw_outlet", position: { x: 0, y: 0 } },
      ],
      connections: [
        { from: "mains.out", to: "dhw.cold_in" },
        { from: "dhw.hot_out", to: "tap.in" },
      ],
      overlays: [],
    };
    const media = pipeMedia(schema);
    expect(media.get(pipe("mains.out", "dhw.cold_in"))).toBe("cold_water");
    expect(media.get(pipe("dhw.hot_out", "tap.in"))).toBe("hot_water");
  });
});

describe("flowingConnections", () => {
  const schema = template("heat_pump_dhw_floor");
  const states =
    (overrides: Record<string, FlowNodeState>) =>
    (node: { id: string }): FlowNodeState =>
      overrides[node.id] ?? { active: false };

  it("follows the active branch of the 3-way valve back to the heat pump", () => {
    const flowing = flowingConnections(schema, states({ hp: { active: true }, valve: { active: false, valveBranch: "a" } }));
    expect([...flowing].sort()).toEqual(
      [pipe("hp.hot_out", "valve.in"), pipe("valve.out_a", "dhw.coil_in"), pipe("dhw.coil_out", "hp.cold_in")].sort()
    );
  });

  it("flows through the floor heating on branch B and stops when the heat pump is off", () => {
    const branchB = flowingConnections(schema, states({ hp: { active: true }, valve: { active: false, valveBranch: "b" } }));
    expect(branchB.has(pipe("pump.out", "manifold.supply_in"))).toBe(true);
    expect(branchB.has(pipe("manifold.return_out", "hp.cold_in"))).toBe(true);
    expect(branchB.has(pipe("valve.out_a", "dhw.coil_in"))).toBe(false);

    expect(flowingConnections(schema, states({})).size).toBe(0);
  });

  it("is stopped by closed manifold loops", () => {
    const closed = flowingConnections(
      schema,
      states({ pump: { active: true }, manifold: { active: false, loops: [false, false, false, false] } })
    );
    expect(closed.has(pipe("pump.out", "manifold.supply_in"))).toBe(true);
    expect(closed.has(pipe("manifold.return_out", "hp.cold_in"))).toBe(false);
  });

  it("runs cold water into the tank while a hot water tap is open", () => {
    const water: HeatingSchema = {
      nodes: [
        { id: "mains", type: "water_supply", position: { x: 0, y: 0 } },
        { id: "dhw", type: "tank", position: { x: 0, y: 0 }, addons: [{ type: "dhw" }] },
        { id: "tap", type: "dhw_outlet", position: { x: 0, y: 0 } },
      ],
      connections: [
        { from: "mains.out", to: "dhw.cold_in" },
        { from: "dhw.hot_out", to: "tap.in" },
      ],
      overlays: [],
    };
    expect(flowingConnections(water, states({})).size).toBe(0);
    expect(flowingConnections(water, states({ tap: { active: true } })).size).toBe(2);
  });

  it("lets a bound pump add-on decide instead of the device state", () => {
    const stopped = flowingConnections(
      schema,
      states({ hp: { active: true, pumpBound: true, pumpActive: false }, valve: { active: false, valveBranch: "a" } })
    );
    expect(stopped.size).toBe(0);
    const running = flowingConnections(
      schema,
      states({ hp: { active: false, pumpBound: true, pumpActive: true }, valve: { active: false, valveBranch: "a" } })
    );
    expect(running.has(pipe("hp.hot_out", "valve.in"))).toBe(true);
  });
});

describe("mixing switching valve", () => {
  // Floor circuit: the pump pushes water through the tank, which feeds circuit A (upper outlet) and
  // circuit B (heating outlet) of the switching valve; the common port leads back to the pump.
  const loop: HeatingSchema = {
    nodes: [
      {
        id: "tank",
        type: "tank",
        variant: "dual_coil",
        position: { x: 0, y: 0 },
        addons: [{ type: "heat_exchanger" }, { type: "heat_exchanger" }, { type: "dhw" }, { type: "direct_heating" }],
      },
      { id: "sw", type: "switching_valve", position: { x: 0, y: 0 } },
      { id: "pump", type: "circulation_pump", position: { x: 0, y: 0 } },
    ],
    connections: [
      { from: "pump.out", to: "tank.return_in" },
      { from: "tank.hot_out2", to: "sw.out_a" },
      { from: "tank.supply_out", to: "sw.out_b" },
      { from: "sw.in", to: "pump.in" },
    ],
    overlays: [],
  };
  const states =
    (branch: "a" | "b" | undefined) =>
    (node: { id: string }): FlowNodeState =>
      node.id === "pump" ? { active: true } : node.id === "sw" ? { active: false, valveBranch: branch } : { active: false };

  it("animates only the pipe from the circuit the valve is switched to", () => {
    const a = flowingConnections(loop, states("a"));
    expect(a.has(pipe("tank.hot_out2", "sw.out_a"))).toBe(true);
    expect(a.has(pipe("tank.supply_out", "sw.out_b"))).toBe(false);
    expect(a.has(pipe("sw.in", "pump.in"))).toBe(true);

    const b = flowingConnections(loop, states("b"));
    expect(b.has(pipe("tank.hot_out2", "sw.out_a"))).toBe(false);
    expect(b.has(pipe("tank.supply_out", "sw.out_b"))).toBe(true);
    expect(b.has(pipe("sw.in", "pump.in"))).toBe(true);
  });

  it("keeps both circuits flowing while the position is unknown", () => {
    const unknown = flowingConnections(loop, states(undefined));
    expect(unknown.has(pipe("tank.hot_out2", "sw.out_a"))).toBe(true);
    expect(unknown.has(pipe("tank.supply_out", "sw.out_b"))).toBe(true);
  });
});

describe("dhwValveBranch", () => {
  it("finds the valve branch that heats the hot water tank", () => {
    expect(dhwValveBranch(template("heat_pump_dhw_floor"), "hp")).toEqual({ valveId: "valve", branch: "a" });
  });

  it("is undefined without a 3-way valve", () => {
    expect(dhwValveBranch(template("heat_pump_floor"), "hp")).toBeUndefined();
  });
});
