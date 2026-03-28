import { describe, it, expect } from "vitest";
import {
  legendRowWidth,
  splitLegendRows,
  legendHeight,
} from "./legend.js";
import type { LegendItem } from "./types.js";

const items: LegendItem[] = [
  { label: "Dataset 1", color: "red" },
  { label: "Dataset 2", color: "blue" },
  { label: "Dataset 3", color: "green" },
];

describe("legendRowWidth", () => {
  it("computes total width for a row of items", () => {
    const width = legendRowWidth(items);
    expect(width).toBeGreaterThan(0);
  });

  it("returns 0 for empty items", () => {
    expect(legendRowWidth([])).toBe(0);
  });

  it("single item has no inter-item gap", () => {
    const single = legendRowWidth([items[0]]);
    const double = legendRowWidth([items[0], items[0]]);
    // Double should be more than 2× single due to gap
    expect(double).toBeGreaterThan(single * 2);
  });
});

describe("splitLegendRows", () => {
  it("fits all items in one row when space allows", () => {
    const rows = splitLegendRows(items, 2000);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveLength(3);
  });

  it("splits into multiple rows when space is tight", () => {
    const rows = splitLegendRows(items, 200);
    expect(rows.length).toBeGreaterThan(1);
  });

  it("handles empty items", () => {
    const rows = splitLegendRows([], 500);
    expect(rows).toHaveLength(0);
  });

  it("puts each item on its own row if very narrow", () => {
    const rows = splitLegendRows(items, 50);
    expect(rows).toHaveLength(3);
  });
});

describe("legendHeight", () => {
  it("returns positive height for items", () => {
    const h = legendHeight(items, 800);
    expect(h).toBeGreaterThan(0);
  });

  it("returns 0 for empty items", () => {
    expect(legendHeight([], 800)).toBe(0);
  });

  it("increases with more rows", () => {
    const wide = legendHeight(items, 2000);
    const narrow = legendHeight(items, 100);
    expect(narrow).toBeGreaterThanOrEqual(wide);
  });
});
