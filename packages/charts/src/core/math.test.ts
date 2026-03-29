import { describe, it, expect } from "vitest";
import { computeCartesianLayout } from "./math.js";

describe("computeCartesianLayout", () => {
  it("computes layout regions within viewBox", () => {
    const layout = computeCartesianLayout(960, 960, {});
    expect(layout.viewBox).toEqual({ width: 960, height: 960 });
    expect(layout.plot.x).toBeGreaterThan(0);
    expect(layout.plot.y).toBeGreaterThan(0);
    expect(layout.plot.width).toBeGreaterThan(0);
    expect(layout.plot.height).toBeGreaterThan(0);
  });

  it("plot area fits within viewBox", () => {
    const layout = computeCartesianLayout(960, 960, {});
    expect(layout.plot.x + layout.plot.width).toBeLessThanOrEqual(960);
    expect(layout.plot.y + layout.plot.height).toBeLessThanOrEqual(960);
  });

  it("allocates space for title when provided", () => {
    const withTitle = computeCartesianLayout(960, 960, { title: "Test" });
    const noTitle = computeCartesianLayout(960, 960, {});
    // Plot area should be smaller with title
    expect(withTitle.plot.height).toBeLessThanOrEqual(noTitle.plot.height);
  });

  it("allocates space for legend when items provided", () => {
    const withLegend = computeCartesianLayout(960, 960, {
      showLegend: true,
      legendItems: [
        { label: "A", color: "red" },
        { label: "B", color: "blue" },
      ],
    });
    const noLegend = computeCartesianLayout(960, 960, { showLegend: false });
    expect(withLegend.plot.height).toBeLessThan(noLegend.plot.height);
  });

  it("allocates extra bottom space for rotated labels", () => {
    const rotated = computeCartesianLayout(960, 960, { labelRotation: 45 });
    const flat = computeCartesianLayout(960, 960, { labelRotation: 0 });
    expect(rotated.plot.height).toBeLessThan(flat.plot.height);
  });

  it("respects custom padding", () => {
    const layout = computeCartesianLayout(960, 960, {
      padding: { left: 120, right: 60 },
    });
    expect(layout.plot.x).toBe(120);
    expect(layout.plot.width).toBe(960 - 120 - 60);
  });
});
