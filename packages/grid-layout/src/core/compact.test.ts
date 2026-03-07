import { describe, it, expect } from "vitest";
import type { LayoutItem } from "./types";
import { compact, correctBounds } from "./compact";

describe("compact", () => {
  it("compacts items vertically (float up)", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 5, w: 2, h: 1 },
      { i: "b", x: 0, y: 10, w: 2, h: 1 },
    ];
    const result = compact(layout, "vertical", 12);
    expect(result[0].y).toBe(0);
    expect(result[1].y).toBe(1);
  });

  it("compacts items horizontally (float left)", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 5, y: 0, w: 1, h: 2 },
      { i: "b", x: 8, y: 0, w: 1, h: 2 },
    ];
    const result = compact(layout, "horizontal", 12);
    expect(result[0].x).toBe(0);
    expect(result[1].x).toBe(1);
  });

  it("does not move static items", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 3, w: 2, h: 1, static: true },
      { i: "b", x: 0, y: 10, w: 2, h: 1 },
    ];
    const result = compact(layout, "vertical", 12);
    expect(result[0].y).toBe(3); // static stays
    expect(result[1].y).toBe(4); // compacted below static
  });

  it("returns cloned layout when compactType is null", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 5, w: 1, h: 1 },
    ];
    const result = compact(layout, null, 12);
    expect(result[0].y).toBe(5); // unchanged
    expect(result).not.toBe(layout);
  });

  it("stacks items that would overlap after compaction", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 2, h: 2 },
      { i: "b", x: 0, y: 5, w: 2, h: 2 },
    ];
    const result = compact(layout, "vertical", 12);
    expect(result[0].y).toBe(0);
    expect(result[1].y).toBe(2); // stacked below a
  });

  it("handles empty layout", () => {
    expect(compact([], "vertical", 12)).toEqual([]);
  });
});

describe("correctBounds", () => {
  it("clamps items that overflow columns", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 10, y: 0, w: 4, h: 1 },
    ];
    const result = correctBounds(layout, 12);
    expect(result[0].x + result[0].w).toBeLessThanOrEqual(12);
  });

  it("clamps width to cols when item is wider than grid", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 20, h: 1 },
    ];
    const result = correctBounds(layout, 6);
    expect(result[0].w).toBe(6);
    expect(result[0].x).toBe(0);
  });

  it("fixes negative x", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: -3, y: 0, w: 2, h: 1 },
    ];
    const result = correctBounds(layout, 12);
    expect(result[0].x).toBe(0);
  });

  it("does not mutate original layout", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 15, y: 0, w: 2, h: 1 },
    ];
    const original = { ...layout[0] };
    correctBounds(layout, 12);
    expect(layout[0]).toEqual(original);
  });
});
