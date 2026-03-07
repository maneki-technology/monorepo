import { describe, it, expect } from "vitest";
import {
  compactBreakpoints,
  standardBreakpoints,
  spaciousBreakpoints,
  responsiveLayouts,
  breakpointOrder,
  getBreakpoint,
  getBreakpointConfig,
  breakpointMediaQuery,
} from "./breakpoints.js";

describe("breakpoint definitions", () => {
  it("has 7 breakpoints per density", () => {
    expect(Object.keys(compactBreakpoints)).toHaveLength(7);
    expect(Object.keys(standardBreakpoints)).toHaveLength(7);
    expect(Object.keys(spaciousBreakpoints)).toHaveLength(7);
  });

  it("breakpoints are contiguous (no gaps)", () => {
    for (const density of ["compact", "standard", "spacious"] as const) {
      const bps = responsiveLayouts[density];
      for (let i = 1; i < breakpointOrder.length; i++) {
        const prev = bps[breakpointOrder[i - 1]];
        const curr = bps[breakpointOrder[i]];
        expect(curr.minWidth).toBe(prev.maxWidth + 1);
      }
    }
  });

  it("last breakpoint has Infinity maxWidth", () => {
    expect(compactBreakpoints.xxxl.maxWidth).toBe(Infinity);
    expect(standardBreakpoints.xxxl.maxWidth).toBe(Infinity);
    expect(spaciousBreakpoints.xxxl.maxWidth).toBe(Infinity);
  });

  it("compact has tighter margins/gutters than standard", () => {
    for (const name of breakpointOrder) {
      expect(compactBreakpoints[name].margin).toBeLessThanOrEqual(
        standardBreakpoints[name].margin,
      );
      expect(compactBreakpoints[name].gutter).toBeLessThanOrEqual(
        standardBreakpoints[name].gutter,
      );
    }
  });

  it("spacious has wider margins/gutters than standard", () => {
    for (const name of breakpointOrder) {
      expect(spaciousBreakpoints[name].margin).toBeGreaterThanOrEqual(
        standardBreakpoints[name].margin,
      );
      expect(spaciousBreakpoints[name].gutter).toBeGreaterThanOrEqual(
        standardBreakpoints[name].gutter,
      );
    }
  });
});

describe("compact breakpoints", () => {
  it("xs: 6 cols, 8px margin, 8px gutter", () => {
    expect(compactBreakpoints.xs).toEqual({
      minWidth: 360, maxWidth: 599, columns: 6, margin: 8, gutter: 8,
    });
  });
  it("s: 12 cols, 8px margin, 8px gutter", () => {
    expect(compactBreakpoints.s.columns).toBe(12);
    expect(compactBreakpoints.s.margin).toBe(8);
    expect(compactBreakpoints.s.gutter).toBe(8);
  });
  it("m: 12 cols, 16px margin, 8px gutter", () => {
    expect(compactBreakpoints.m.margin).toBe(16);
    expect(compactBreakpoints.m.gutter).toBe(8);
  });
  it("l+: 12 cols, 16px margin, 8px gutter", () => {
    expect(compactBreakpoints.l.margin).toBe(16);
    expect(compactBreakpoints.l.gutter).toBe(8);
  });
});

describe("standard breakpoints", () => {
  it("xs: 6 cols, 16px margin, 8px gutter", () => {
    expect(standardBreakpoints.xs).toEqual({
      minWidth: 360, maxWidth: 599, columns: 6, margin: 16, gutter: 8,
    });
  });
  it("m: 12 cols, 24px margin, 16px gutter", () => {
    expect(standardBreakpoints.m.margin).toBe(24);
    expect(standardBreakpoints.m.gutter).toBe(16);
  });
  it("l+: 12 cols, 32px margin, 24px gutter", () => {
    expect(standardBreakpoints.l.margin).toBe(32);
    expect(standardBreakpoints.l.gutter).toBe(24);
  });
});

describe("spacious breakpoints", () => {
  it("xs: 6 cols, 16px margin, 12px gutter", () => {
    expect(spaciousBreakpoints.xs).toEqual({
      minWidth: 360, maxWidth: 599, columns: 6, margin: 16, gutter: 12,
    });
  });
  it("m: 12 cols, 32px margin, 24px gutter", () => {
    expect(spaciousBreakpoints.m.margin).toBe(32);
    expect(spaciousBreakpoints.m.gutter).toBe(24);
  });
  it("l+: 12 cols, 40px margin, 32px gutter", () => {
    expect(spaciousBreakpoints.l.margin).toBe(40);
    expect(spaciousBreakpoints.l.gutter).toBe(32);
  });
});

describe("getBreakpoint", () => {
  it("returns xs for small viewports", () => {
    expect(getBreakpoint(360)).toBe("xs");
    expect(getBreakpoint(599)).toBe("xs");
  });
  it("returns s for 600-767", () => {
    expect(getBreakpoint(600)).toBe("s");
    expect(getBreakpoint(767)).toBe("s");
  });
  it("returns m for 768-1023", () => {
    expect(getBreakpoint(768)).toBe("m");
  });
  it("returns l for 1024-1279", () => {
    expect(getBreakpoint(1024)).toBe("l");
  });
  it("returns xxxl for 1600+", () => {
    expect(getBreakpoint(1600)).toBe("xxxl");
    expect(getBreakpoint(3000)).toBe("xxxl");
  });
  it("returns xs for widths below 360", () => {
    expect(getBreakpoint(320)).toBe("xs");
  });
  it("respects density parameter", () => {
    expect(getBreakpoint(800, "compact")).toBe("m");
    expect(getBreakpoint(800, "spacious")).toBe("m");
  });
});

describe("getBreakpointConfig", () => {
  it("returns full config for a viewport width", () => {
    const config = getBreakpointConfig(1024);
    expect(config.columns).toBe(12);
    expect(config.margin).toBe(32);
    expect(config.gutter).toBe(24);
  });
  it("returns compact config when specified", () => {
    const config = getBreakpointConfig(1024, "compact");
    expect(config.margin).toBe(16);
    expect(config.gutter).toBe(8);
  });
});

describe("breakpointMediaQuery", () => {
  it("generates min/max media query for bounded breakpoints", () => {
    expect(breakpointMediaQuery("xs")).toBe(
      "(min-width: 360px) and (max-width: 599px)",
    );
    expect(breakpointMediaQuery("m")).toBe(
      "(min-width: 768px) and (max-width: 1023px)",
    );
  });
  it("generates min-width only for xxxl", () => {
    expect(breakpointMediaQuery("xxxl")).toBe("(min-width: 1600px)");
  });
  it("respects density parameter", () => {
    expect(breakpointMediaQuery("xs", "compact")).toBe(
      "(min-width: 360px) and (max-width: 599px)",
    );
  });
});
