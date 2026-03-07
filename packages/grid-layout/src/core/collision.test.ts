import { describe, it, expect } from "vitest";
import type { LayoutItem } from "./types";
import { collides, getFirstCollision, getAllCollisions } from "./collision";

describe("collides", () => {
  it("returns false for same item", () => {
    const a: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 2 };
    expect(collides(a, a)).toBe(false);
  });

  it("detects overlapping items", () => {
    const a: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 2 };
    const b: LayoutItem = { i: "b", x: 1, y: 1, w: 2, h: 2 };
    expect(collides(a, b)).toBe(true);
  });

  it("returns false for adjacent items (no overlap)", () => {
    const a: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 2 };
    const right: LayoutItem = { i: "b", x: 2, y: 0, w: 2, h: 2 };
    const below: LayoutItem = { i: "c", x: 0, y: 2, w: 2, h: 2 };
    expect(collides(a, right)).toBe(false);
    expect(collides(a, below)).toBe(false);
  });

  it("returns false for completely separated items", () => {
    const a: LayoutItem = { i: "a", x: 0, y: 0, w: 1, h: 1 };
    const b: LayoutItem = { i: "b", x: 5, y: 5, w: 1, h: 1 };
    expect(collides(a, b)).toBe(false);
  });

  it("detects containment as collision", () => {
    const big: LayoutItem = { i: "a", x: 0, y: 0, w: 4, h: 4 };
    const small: LayoutItem = { i: "b", x: 1, y: 1, w: 1, h: 1 };
    expect(collides(big, small)).toBe(true);
  });
});

describe("getFirstCollision", () => {
  it("returns first colliding item", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 3, h: 3 },
      { i: "b", x: 2, y: 2, w: 2, h: 2 },
      { i: "c", x: 5, y: 0, w: 1, h: 1 },
    ];
    const item: LayoutItem = { i: "test", x: 1, y: 1, w: 2, h: 2 };
    const result = getFirstCollision(layout, item);
    expect(result?.i).toBe("a");
  });

  it("returns undefined when no collision", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
    ];
    const item: LayoutItem = { i: "test", x: 5, y: 5, w: 1, h: 1 };
    expect(getFirstCollision(layout, item)).toBeUndefined();
  });
});

describe("getAllCollisions", () => {
  it("returns all colliding items", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 3, h: 3 },
      { i: "b", x: 2, y: 2, w: 2, h: 2 },
      { i: "c", x: 5, y: 0, w: 1, h: 1 },
    ];
    const item: LayoutItem = { i: "test", x: 1, y: 1, w: 3, h: 3 };
    const result = getAllCollisions(layout, item);
    expect(result.map((r) => r.i).sort()).toEqual(["a", "b"]);
  });

  it("returns empty array when no collisions", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
    ];
    const item: LayoutItem = { i: "test", x: 10, y: 10, w: 1, h: 1 };
    expect(getAllCollisions(layout, item)).toEqual([]);
  });
});
