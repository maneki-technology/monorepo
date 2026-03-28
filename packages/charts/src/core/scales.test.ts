import { describe, it, expect } from "vitest";
import { linearScale, categoryScale, dataExtent } from "./scales.js";

// ---------------------------------------------------------------------------
// linearScale
// ---------------------------------------------------------------------------

describe("linearScale", () => {
  it("computes nice ticks for positive data", () => {
    const result = linearScale(0, 800, 400);
    expect(result.min).toBe(0);
    expect(result.max).toBeGreaterThanOrEqual(800);
    expect(result.ticks.length).toBeGreaterThanOrEqual(3);
    // First tick should be at 0
    expect(result.ticks[0].value).toBe(0);
    expect(result.ticks[0].position).toBe(0);
  });

  it("includes zero when all data is positive", () => {
    const result = linearScale(50, 200, 400);
    expect(result.min).toBe(0);
  });

  it("includes zero when all data is negative", () => {
    const result = linearScale(-200, -50, 400);
    expect(result.max).toBe(0);
  });

  it("handles equal min and max", () => {
    const result = linearScale(100, 100, 400);
    expect(result.min).toBeLessThan(100);
    expect(result.max).toBeGreaterThan(100);
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
  });

  it("handles zero min and max", () => {
    const result = linearScale(0, 0, 400);
    expect(result.min).toBeLessThan(0);
    expect(result.max).toBeGreaterThan(0);
  });

  it("respects user-provided min/max", () => {
    const result = linearScale(0, 100, 400, { min: -50, max: 200 });
    expect(result.min).toBeLessThanOrEqual(-50);
    expect(result.max).toBeGreaterThanOrEqual(200);
  });

  it("respects custom tickCount", () => {
    const result = linearScale(0, 1000, 400, { tickCount: 3 });
    // Should have roughly 3 ticks (nice numbers may adjust)
    expect(result.ticks.length).toBeGreaterThanOrEqual(2);
    expect(result.ticks.length).toBeLessThanOrEqual(6);
  });

  it("scale function maps values to pixel positions", () => {
    const result = linearScale(0, 100, 400);
    expect(result.scale(0)).toBe(0);
    expect(result.scale(result.max)).toBeCloseTo(400, 0);
  });

  it("uses custom formatTick", () => {
    const result = linearScale(0, 100, 400, {
      formatTick: (v) => `$${v}`,
    });
    expect(result.ticks[0].label).toMatch(/^\$/);
  });

  it("formats thousands with spaces", () => {
    const result = linearScale(0, 5000, 400);
    const bigTick = result.ticks.find((t) => t.value >= 1000);
    if (bigTick) {
      expect(bigTick.label).toContain(" ");
    }
  });
});

// ---------------------------------------------------------------------------
// categoryScale
// ---------------------------------------------------------------------------

describe("categoryScale", () => {
  it("computes band positions for labels", () => {
    const result = categoryScale(["A", "B", "C"], 300);
    expect(result.labels).toEqual(["A", "B", "C"]);
    expect(result.bandWidth).toBeGreaterThan(0);
  });

  it("centers each category within its band", () => {
    const result = categoryScale(["A", "B"], 200, 0);
    // With no padding, band = 100, centers at 50 and 150
    expect(result.scale(0)).toBeCloseTo(50, 0);
    expect(result.scale(1)).toBeCloseTo(150, 0);
  });

  it("handles empty labels", () => {
    const result = categoryScale([], 300);
    expect(result.labels).toEqual([]);
    expect(result.bandWidth).toBe(0);
    expect(result.scale(0)).toBe(0);
  });

  it("handles single label", () => {
    const result = categoryScale(["Only"], 300, 0.1);
    expect(result.labels).toEqual(["Only"]);
    expect(result.bandWidth).toBeGreaterThan(0);
    // Center should be at midpoint of usable area
    const center = result.scale(0);
    expect(center).toBeGreaterThan(0);
    expect(center).toBeLessThan(300);
  });

  it("start returns left edge of band", () => {
    const result = categoryScale(["A", "B", "C"], 300, 0);
    expect(result.start(0)).toBe(0);
    expect(result.start(1)).toBeCloseTo(100, 0);
    expect(result.start(2)).toBeCloseTo(200, 0);
  });

  it("respects padding", () => {
    const noPad = categoryScale(["A", "B"], 200, 0);
    const withPad = categoryScale(["A", "B"], 200, 0.2);
    // With padding, bands should be narrower
    expect(withPad.bandWidth).toBeLessThan(noPad.bandWidth);
  });
});

// ---------------------------------------------------------------------------
// dataExtent
// ---------------------------------------------------------------------------

describe("dataExtent", () => {
  it("finds min and max across datasets", () => {
    const result = dataExtent([
      { data: [10, 20, 30] },
      { data: [5, 25, 15] },
    ]);
    expect(result.min).toBe(5);
    expect(result.max).toBe(30);
  });

  it("ignores null values", () => {
    const result = dataExtent([{ data: [null, 10, null, 20, null] }]);
    expect(result.min).toBe(10);
    expect(result.max).toBe(20);
  });

  it("handles all-null datasets", () => {
    const result = dataExtent([{ data: [null, null] }]);
    expect(result.min).toBe(0);
    expect(result.max).toBe(1);
  });

  it("handles empty datasets", () => {
    const result = dataExtent([]);
    expect(result.min).toBe(0);
    expect(result.max).toBe(1);
  });

  it("handles negative values", () => {
    const result = dataExtent([{ data: [-100, -50, 0, 50] }]);
    expect(result.min).toBe(-100);
    expect(result.max).toBe(50);
  });

  it("handles single value", () => {
    const result = dataExtent([{ data: [42] }]);
    expect(result.min).toBe(42);
    expect(result.max).toBe(42);
  });
});
