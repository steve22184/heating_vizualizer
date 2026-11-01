import { describe, expect, it } from "vitest";
import { ADDON_TYPES } from "../src/models/addons.js";
import {
  candidatePorts,
  connectedPortCount,
  invalidConnections,
  makeConnection,
  pruneNodeConnections,
  renumberLoops,
} from "../src/models/connections.js";
import { getAllDeviceDefinitions } from "../src/models/device-registry.js";
import type { HeatingSchema } from "../src/models/schema.js";
import en from "../src/translations/en.json";

const loops = (count: number) => Array.from({ length: count }, () => ({ type: "loop" as const }));

function schema(): HeatingSchema {
  return {
    nodes: [
      { id: "hp", type: "heat_pump", position: { x: 0, y: 0 } },
      { id: "m", type: "manifold", position: { x: 300, y: 0 }, addons: loops(3) },
      { id: "fh", type: "floor_heating", position: { x: 300, y: 300 } },
    ],
    connections: [],
    overlays: [],
  };
}

describe("connections", () => {
  it("orders ports from outlet to inlet", () => {
    const s = schema();
    expect(makeConnection(s, { nodeId: "m", portId: "supply_in" }, { nodeId: "hp", portId: "hot_out" })).toEqual({
      from: "hp.hot_out",
      to: "m.supply_in",
    });
    expect(makeConnection(s, { nodeId: "hp", portId: "hot_out" }, { nodeId: "m", portId: "return_out" })).toBeUndefined();
  });

  it("offers only compatible, unconnected ports of other nodes", () => {
    const s = schema();
    s.connections.push({ from: "hp.hot_out", to: "m.supply_in" });
    const candidates = candidatePorts(s, { nodeId: "hp", portId: "hot_out" }).map((c) => `${c.nodeId}.${c.portId}`);
    expect(candidates).not.toContain("m.supply_in");
    expect(candidates).toContain("fh.in");
    expect(candidates.every((c) => !c.startsWith("hp."))).toBe(true);
    expect(connectedPortCount(s, s.nodes[0])).toEqual([1, 2]);
  });

  it("renumbers loop ports after removing a loop", () => {
    const s = schema();
    s.connections = [
      { from: "m.loop_1_out", to: "fh.in" },
      { from: "m.loop_2_out", to: "fh.in" },
      { from: "m.loop_3_out", to: "fh.in" },
    ];
    expect(renumberLoops(s, "m", 2)).toEqual([
      { from: "m.loop_1_out", to: "fh.in" },
      { from: "m.loop_2_out", to: "fh.in" },
    ]);
  });

  it("detects and prunes connections to missing ports", () => {
    const s = schema();
    s.connections = [
      { from: "m.loop_3_out", to: "fh.in" },
      { from: "fh.out", to: "hp.hot_out" },
    ];
    expect(invalidConnections(s)).toEqual([{ from: "fh.out", to: "hp.hot_out" }]);
    s.nodes[1].addons = loops(2);
    expect(pruneNodeConnections(s, "m")).toEqual([{ from: "fh.out", to: "hp.hot_out" }]);
  });
});

describe("add-on catalog", () => {
  const addonNames = en.addons as Record<string, { name: string }>;
  const slotNames = en.slots as Record<string, string>;

  it("defines and translates every add-on and slot used by devices", () => {
    for (const def of getAllDeviceDefinitions()) {
      for (const spec of def.addons ?? []) {
        expect(ADDON_TYPES[spec.type], `${def.type}: ${spec.type}`).toBeDefined();
        expect(addonNames[spec.type]?.name, spec.type).toBeTruthy();
        for (const slot of spec.slots ?? []) expect(slotNames[slot], slot).toBeTruthy();
        expect(new Set(spec.slots).size).toBe(spec.slots?.length ?? 0);
      }
      const types = (def.addons ?? []).map((s) => s.type);
      expect(new Set(types).size, def.type).toBe(types.length);
    }
  });
});
