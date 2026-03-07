import { describe, it, expect } from "vitest";
import type { LayoutItem, GridConfig } from "./types";
import { DEFAULT_GRID_CONFIG } from "./types";
import {
  calcColWidth,
  calcPosition,
  calcXY,
  calcWH,
  constrainSize,
  constrainPosition,
  calcContainerHeight,
  bottom,
  cloneLayout,
  getLayoutItem,
} from "./utils";

const cfg: GridConfig = {
  cols: 12,
  rowHeight: 30,
  margin: [10, 10],
  containerPadding: [10, 10],
  maxRows: Infinity,
};

describe("calcColWidth", () => {
  it("calculates column width correctly", () => {
    // containerWidth = 12 * colWidth + 11 * margin + 2 * padding
    // 1000 = 12 * colWidth + 110 + 20 => colWidth = 870 / 12 = 72.5
    const w = calcColWidth(1000, cfg);
    expect(w).toBeCloseTo(72.5);
  });

  it("uses margin as padding when containerPadding is null", () => {
    const c: GridConfig = { ...cfg, containerPadding: null };
    const w = calcColWidth(1000, c);
    // same formula since containerPadding falls back to margin
    expect(w).toBeCloseTo(72.5);
  });

  it("handles different margin values", () => {
    const c: GridConfig = { ...cfg, margin: [0, 0], containerPadding: [0, 0] };
    const w = calcColWidth(1200, c);
    expect(w).toBe(100); // 1200 / 12
  });
});

describe("calcPosition", () => {
  it("converts grid units to pixel position", () => {
    const item: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 1 };
    const pos = calcPosition(item, 1000, cfg);
    expect(pos.left).toBe(10); // padding
    expect(pos.top).toBe(10); // padding
    const colWidth = calcColWidth(1000, cfg);
    expect(pos.width).toBe(Math.round(colWidth * 2 + 10)); // 2 cols + 1 margin
    expect(pos.height).toBe(30); // 1 row, no extra margin
  });

  it("offsets position for non-zero x/y", () => {
    const item: LayoutItem = { i: "a", x: 1, y: 1, w: 1, h: 1 };
    const pos = calcPosition(item, 1000, cfg);
    const colWidth = calcColWidth(1000, cfg);
    expect(pos.left).toBe(Math.round((colWidth + 10) * 1 + 10));
    expect(pos.top).toBe(Math.round((30 + 10) * 1 + 10));
  });
});

describe("calcXY", () => {
  it("converts pixel position back to grid units", () => {
    const item: LayoutItem = { i: "a", x: 2, y: 3, w: 1, h: 1 };
    const pos = calcPosition(item, 1000, cfg);
    const { x, y } = calcXY(pos.top, pos.left, 1000, cfg);
    expect(x).toBe(2);
    expect(y).toBe(3);
  });

  it("clamps x to valid range", () => {
    const { x } = calcXY(0, 99999, 1000, cfg);
    expect(x).toBeLessThanOrEqual(cfg.cols - 1);
    expect(x).toBeGreaterThanOrEqual(0);
  });

  it("clamps y to >= 0", () => {
    const { y } = calcXY(-999, 0, 1000, cfg);
    expect(y).toBe(0);
  });
});

describe("calcWH", () => {
  it("converts pixel dimensions to grid units", () => {
    const item: LayoutItem = { i: "a", x: 0, y: 0, w: 3, h: 2 };
    const pos = calcPosition(item, 1000, cfg);
    const { w, h } = calcWH(pos.width, pos.height, 1000, cfg);
    expect(w).toBe(3);
    expect(h).toBe(2);
  });

  it("returns minimum 1x1", () => {
    const { w, h } = calcWH(0, 0, 1000, cfg);
    expect(w).toBe(1);
    expect(h).toBe(1);
  });
});

describe("constrainSize", () => {
  it("clamps to min/max constraints", () => {
    const item: LayoutItem = { i: "a", x: 0, y: 0, w: 2, h: 2, minW: 2, maxW: 4, minH: 1, maxH: 3 };
    expect(constrainSize(item, 1, 1, 12)).toEqual({ w: 2, h: 1 });
    expect(constrainSize(item, 10, 10, 12)).toEqual({ w: 4, h: 3 });
    expect(constrainSize(item, 3, 2, 12)).toEqual({ w: 3, h: 2 });
  });

  it("clamps width to available columns", () => {
    const item: LayoutItem = { i: "a", x: 10, y: 0, w: 2, h: 1 };
    const { w } = constrainSize(item, 5, 1, 12);
    expect(w).toBe(2); // cols - x = 2
  });

  it("defaults min to 1 when not set", () => {
    const item: LayoutItem = { i: "a", x: 0, y: 0, w: 1, h: 1 };
    const { w, h } = constrainSize(item, 0, 0, 12);
    expect(w).toBe(1);
    expect(h).toBe(1);
  });
});

describe("constrainPosition", () => {
  it("clamps x within grid bounds", () => {
    const item: LayoutItem = { i: "a", x: 0, y: 0, w: 3, h: 1 };
    expect(constrainPosition(item, 15, 0, 12)).toEqual({ x: 9, y: 0 });
    expect(constrainPosition(item, -5, 0, 12)).toEqual({ x: 0, y: 0 });
  });

  it("clamps y to >= 0", () => {
    const item: LayoutItem = { i: "a", x: 0, y: 0, w: 1, h: 1 };
    expect(constrainPosition(item, 0, -3, 12)).toEqual({ x: 0, y: 0 });
  });
});

describe("calcContainerHeight", () => {
  it("calculates height from bottom-most item", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 1, h: 2 },
      { i: "b", x: 1, y: 2, w: 1, h: 3 },
    ];
    // bottom = 5, height = 5*30 + 4*10 + 2*10 = 150 + 40 + 20 = 210
    expect(calcContainerHeight(layout, cfg)).toBe(210);
  });

  it("returns padding-only height for empty-ish layout at y=0 h=1", () => {
    const layout: LayoutItem[] = [{ i: "a", x: 0, y: 0, w: 1, h: 1 }];
    // bottom = 1, height = 1*30 + 0*10 + 20 = 50
    expect(calcContainerHeight(layout, cfg)).toBe(50);
  });
});

describe("bottom", () => {
  it("returns 0 for empty layout", () => {
    expect(bottom([])).toBe(0);
  });

  it("returns max y+h", () => {
    const layout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 1, h: 2 },
      { i: "b", x: 0, y: 5, w: 1, h: 3 },
      { i: "c", x: 0, y: 1, w: 1, h: 1 },
    ];
    expect(bottom(layout)).toBe(8);
  });
});

describe("cloneLayout", () => {
  it("creates a deep copy", () => {
    const layout: LayoutItem[] = [{ i: "a", x: 0, y: 0, w: 1, h: 1 }];
    const cloned = cloneLayout(layout);
    expect(cloned).toEqual(layout);
    expect(cloned).not.toBe(layout);
    expect(cloned[0]).not.toBe(layout[0]);
  });

  it("handles empty layout", () => {
    expect(cloneLayout([])).toEqual([]);
  });
});

describe("getLayoutItem", () => {
  const layout: LayoutItem[] = [
    { i: "a", x: 0, y: 0, w: 1, h: 1 },
    { i: "b", x: 1, y: 0, w: 1, h: 1 },
  ];

  it("finds item by id", () => {
    expect(getLayoutItem(layout, "b")).toBe(layout[1]);
  });

  it("returns undefined for missing id", () => {
    expect(getLayoutItem(layout, "z")).toBeUndefined();
  });
});
