import { describe, it, expect } from "vitest";
import type { LayoutItem } from "./types";
import { sortLayoutItems, getStatics } from "./sort";

describe("sortLayoutItems", () => {
  const layout: LayoutItem[] = [
    { i: "c", x: 4, y: 2, w: 1, h: 1 },
    { i: "a", x: 0, y: 0, w: 1, h: 1 },
    { i: "b", x: 2, y: 0, w: 1, h: 1 },
    { i: "d", x: 0, y: 2, w: 1, h: 1 },
  ];

  it("sorts vertically: top-to-bottom, left-to-right", () => {
    const sorted = sortLayoutItems(layout, "vertical");
    expect(sorted.map((i) => i.i)).toEqual(["a", "b", "d", "c"]);
  });

  it("sorts horizontally: left-to-right, top-to-bottom", () => {
    const sorted = sortLayoutItems(layout, "horizontal");
    expect(sorted.map((i) => i.i)).toEqual(["a", "d", "b", "c"]);
  });

  it("defaults to vertical sort", () => {
    const sorted = sortLayoutItems(layout);
    expect(sorted.map((i) => i.i)).toEqual(["a", "b", "d", "c"]);
  });

  it("does not mutate original array", () => {
    const original = [...layout];
    sortLayoutItems(layout, "vertical");
    expect(layout).toEqual(original);
  });
});

describe("getStatics", () => {
  it("returns only static items", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 1, h: 1, static: true },
      { i: "b", x: 1, y: 0, w: 1, h: 1 },
      { i: "c", x: 2, y: 0, w: 1, h: 1, static: true },
    ];
    const statics = getStatics(layout);
    expect(statics.map((i) => i.i)).toEqual(["a", "c"]);
  });

  it("returns empty array when no statics", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 1, h: 1 },
    ];
    expect(getStatics(layout)).toEqual([]);
  });
});
