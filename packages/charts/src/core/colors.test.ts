import { describe, it, expect } from "vitest";
import { CHART_PALETTE, getDatasetColor, GRID_LINE_COLOR } from "./colors.js";

describe("CHART_PALETTE", () => {
  it("has 10 colors", () => {
    expect(CHART_PALETTE).toHaveLength(10);
  });

  it("all entries are CSS var() references", () => {
    for (const color of CHART_PALETTE) {
      expect(color).toMatch(/^var\(--fd-color-/);
    }
  });
});

describe("getDatasetColor", () => {
  it("returns palette color by index", () => {
    expect(getDatasetColor(0)).toBe(CHART_PALETTE[0]);
    expect(getDatasetColor(1)).toBe(CHART_PALETTE[1]);
    expect(getDatasetColor(9)).toBe(CHART_PALETTE[9]);
  });

  it("cycles through palette for index > 9", () => {
    expect(getDatasetColor(10)).toBe(CHART_PALETTE[0]);
    expect(getDatasetColor(11)).toBe(CHART_PALETTE[1]);
  });

  it("returns string override as-is", () => {
    expect(getDatasetColor(0, "#ff0000")).toBe("#ff0000");
    expect(getDatasetColor(0, "rgb(0,0,0)")).toBe("rgb(0,0,0)");
  });

  it("returns palette color for 1-based number override", () => {
    expect(getDatasetColor(0, 1)).toBe(CHART_PALETTE[0]);
    expect(getDatasetColor(0, 5)).toBe(CHART_PALETTE[4]);
    expect(getDatasetColor(0, 10)).toBe(CHART_PALETTE[9]);
  });

  it("falls back to index for out-of-range number override", () => {
    expect(getDatasetColor(2, 0)).toBe(CHART_PALETTE[2]);
    expect(getDatasetColor(3, 11)).toBe(CHART_PALETTE[3]);
  });
});

describe("GRID_LINE_COLOR", () => {
  it("is a CSS var() reference", () => {
    expect(GRID_LINE_COLOR).toMatch(/^var\(--fd-border-/);
  });
});
