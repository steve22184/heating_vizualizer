import { describe, expect, it } from "vitest";
import { getNodeDefinition, getPreset, tankHeight } from "../src/models/device-registry.js";
import type { SchemaNode } from "../src/models/schema.js";
import { spinDuration, withNumericActivity } from "../src/renderer/devices/common.js";

const at = { x: 0, y: 0 };

describe("tank", () => {
  it("gets its ports from its modules", () => {
    const empty: SchemaNode = { id: "t", type: "tank", position: at };
    expect(getNodeDefinition(empty)!.ports).toEqual([]);

    const dhw: SchemaNode = { ...empty, addons: [{ type: "heat_exchanger" }, { type: "dhw" }, { type: "circulation" }] };
    const def = getNodeDefinition(dhw)!;
    expect(def.labelKey).toBe("devices.tank.name_dhw");
    const left = def.ports.filter((p) => p.position.x === 0);
    const right = def.ports.filter((p) => p.position.x === def.width);
    expect(left.map((p) => p.id)).toEqual(["coil_in", "coil_out"]);
    expect(right.map((p) => p.id)).toEqual(["hot_out", "circulation_in", "cold_in"]);
    // Ports on one side go from top to bottom without overlapping.
    expect(right[0].position.y).toBeLessThan(right[1].position.y);
    expect(right[1].position.y).toBeLessThan(right[2].position.y);
    expect(def.ports.find((p) => p.id === "coil_out")?.kind).toBe("outlet");
  });

  it("grows with its volume", () => {
    expect(tankHeight(50)).toBeLessThan(tankHeight(200));
    expect(tankHeight(200)).toBeLessThan(tankHeight(1000));
    expect(tankHeight(undefined)).toBe(tankHeight(200));
    expect(tankHeight(100_000)).toBe(300);
    const small = getNodeDefinition({ id: "t", type: "tank", position: at, volume: 50 })!;
    expect(small.height).toBe(tankHeight(50));
  });
});

describe("DHW tank with two coils", () => {
  const preset = getPreset("tank_dhw_2coil")!;
  const node: SchemaNode = {
    id: "t",
    type: "tank",
    position: at,
    addons: preset.addons,
    scale: preset.scale,
    variant: preset.variant,
  };

  it("has a second coil and is 20 % larger by default", () => {
    expect(preset.scale).toBe(1.2);
    const base = getNodeDefinition({ id: "t", type: "tank", position: at, addons: [{ type: "heat_exchanger" }, { type: "dhw" }] })!;
    const def = getNodeDefinition(node)!;
    // 120 for the scaled tank plus 20 for the wider body.
    expect(def.width).toBe(140);
    expect(def.height).toBeGreaterThan(base.height);
  });

  it("heats the tank with the left coil and domestic water flow-through with the right coil", () => {
    const def = getNodeDefinition({ ...node, addons: [...preset.addons!, { type: "circulation" }] })!;
    const port = (id: string) => def.ports.find((p) => p.id === id)!;
    // Left coil: supply at the top, return at the bottom.
    expect(port("coil_in").position.x).toBe(0);
    expect(port("coil_in").position.y).toBeLessThan(port("coil_out").position.y);
    expect(port("coil_in").kind).toBe("inlet");
    // Right coil: cold water in at the bottom, hot water out at the top.
    expect(port("coil2_in").position.x).toBe(def.width);
    expect(port("coil2_in").position.y).toBeGreaterThan(port("coil2_out").position.y);
    expect(port("coil2_in").kind).toBe("inlet");
    expect(port("coil2_out").kind).toBe("outlet");
    // Tank outlets on top, heating outlet in the middle of the right wall, return at the bottom.
    expect(port("hot_out").position.y).toBe(0);
    expect(port("hot_out2").position.y).toBe(0);
    expect(port("hot_out").position.x).toBeLessThan(port("hot_out2").position.x);
    expect([port("hot_out").kind, port("hot_out2").kind, port("supply_out").kind]).toEqual(["outlet", "outlet", "outlet"]);
    expect(port("supply_out").position.x).toBe(def.width);
    expect(port("return_in").position.y).toBe(def.height);
    expect(port("return_in").kind).toBe("inlet");
    expect(def.ports.find((p) => p.id === "cold_in")).toBeUndefined();
  });

  it("colors the left coil red on top and blue at the bottom, ports on the flat top edge, bottom port clear of the body", () => {
    const def = getNodeDefinition(node)!;
    const port = (id: string) => def.ports.find((p) => p.id === id)!;
    expect(port("coil_in").tone).toBe("hot");
    expect(port("coil_out").tone).toBe("cold");
    expect(port("coil2_in").tone).toBe("cold");
    expect(port("coil2_out").tone).toBe("hot");
    expect(port("return_in").tone).toBe("cold");
    // Body is 17 from each edge before widening (14 * 1.2); the rounded corner takes 12 more.
    expect(port("hot_out").position.x).toBeGreaterThan(17 + 12);
    expect(def.width - port("hot_out2").position.x).toBeGreaterThan(17 + 12);
    expect(port("hot_out").position.x).toBe(def.width - port("hot_out2").position.x);
    expect(port("return_in").position.x).toBe(port("hot_out2").position.x);
  });

  it("never stacks two ports on the same spot", () => {
    const def = getNodeDefinition({
      ...node,
      addons: [...preset.addons!, { type: "circulation" }, { type: "direct_source" }, { type: "direct_heating" }],
    })!;
    const spots = def.ports.map((p) => `${p.position.x},${p.position.y}`);
    expect(new Set(spots).size).toBe(spots.length);
  });

  it("leaves unscaled tanks unchanged", () => {
    const plain = getNodeDefinition({ id: "t", type: "tank", position: at })!;
    expect(plain.width).toBe(100);
    expect(plain.height).toBe(tankHeight(undefined));
  });
});

describe("junction", () => {
  it("merges two inlets into one outlet", () => {
    const def = getNodeDefinition({ id: "j", type: "junction", position: at, variant: "merge" })!;
    expect(def.ports.map((p) => `${p.id}:${p.kind}`)).toEqual(["in_top:inlet", "in_bottom:inlet", "out:outlet"]);
  });
});

describe("speed and activity", () => {
  it("spins faster with higher speed", () => {
    expect(spinDuration({ active: true, numeric: 0 })).toBeUndefined();
    expect(spinDuration({ active: true, numeric: 300 })).toBe(2);
    expect(spinDuration({ active: true, numeric: 900 })).toBeCloseTo(0.67);
    expect(spinDuration({ active: true, numeric: 100, unit: "%" })).toBe(0.5);
  });

  it("treats numbers above zero as running unless an active state is set", () => {
    expect(withNumericActivity({ type: "fan" }, { active: false, numeric: 450 }).active).toBe(true);
    expect(withNumericActivity({ type: "fan" }, { active: true, numeric: 0 }).active).toBe(false);
    expect(withNumericActivity({ type: "fan", active_state: "on" }, { active: false, numeric: 450 }).active).toBe(false);
  });
});
