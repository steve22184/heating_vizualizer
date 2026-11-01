import { describe, expect, it } from "vitest";
import { getNodeDefinition } from "../src/models/device-registry.js";
import type { SchemaNode } from "../src/models/schema.js";

const at = { x: 0, y: 0 };

describe("heat pump", () => {
  it("keeps the original housing and two connections by default", () => {
    const def = getNodeDefinition({ id: "h", type: "heat_pump", position: at } as SchemaNode)!;
    expect([def.width, def.height]).toEqual([170, 120]);
    expect(def.ports.map((p) => p.id)).toEqual(["hot_out", "cold_in"]);
    expect(def.ports.every((p) => p.position.x === 170)).toBe(true);
  });

  it("v2 is square, with mirrored connections on both sides", () => {
    const def = getNodeDefinition({ id: "h", type: "heat_pump", position: at, variant: "v2" } as SchemaNode)!;
    expect([def.width, def.height]).toEqual([150, 225]);
    const left = def.ports.filter((p) => p.position.x === 0).map((p) => p.id);
    const right = def.ports.filter((p) => p.position.x === 150).map((p) => p.id);
    expect(left).toEqual(["hot_out_left", "cold_in_left"]);
    expect(right).toEqual(["hot_out", "cold_in"]);
    const ys = (side: string[]) => def.ports.filter((p) => side.includes(p.id)).map((p) => p.position.y);
    expect(ys(left)).toEqual([90, 140]);
    expect(ys(right)).toEqual([90, 140]);
  });
});

describe("heat pump presets", () => {
  it("offers the square v2 as its own device, with the original heat pump unchanged", async () => {
    const { getPreset, DEVICE_PRESETS } = await import("../src/models/device-registry.js");
    expect(DEVICE_PRESETS.filter((p) => p.type === "heat_pump").map((p) => p.id)).toEqual(["heat_pump", "heat_pump_v2"]);
    expect(getPreset("heat_pump_v2")?.variant).toBe("v2");
    const def = getNodeDefinition({ id: "h", type: "heat_pump", position: at, variant: "v2" } as SchemaNode)!;
    expect(def.width).toBe(150);
    expect(def.height).toBe(225);
    expect(getNodeDefinition({ id: "h", type: "heat_pump", position: at } as SchemaNode)!.width).toBe(170);
  });
});

describe("ground collector", () => {
  it("centres its name on the pipe and lifts it 2 mm", () => {
    const def = getNodeDefinition({ id: "g", type: "ground_collector", position: at } as SchemaNode)!;
    expect(def.labelOffset).toEqual({ x: 63, y: 7 });
  });

  it("has a cold inlet and a warm outlet on opposite ends", () => {
    const def = getNodeDefinition({ id: "g", type: "ground_collector", position: at } as SchemaNode)!;
    const cold = def.ports.find((p) => p.id === "cold_in")!;
    const hot = def.ports.find((p) => p.id === "hot_out")!;
    expect(cold.kind).toBe("inlet");
    expect(hot.kind).toBe("outlet");
    expect(cold.position.x).toBe(def.width);
    expect(hot.position.x).toBe(def.width);
    expect(cold.position.y - hot.position.y).toBe(50);
  });
});
