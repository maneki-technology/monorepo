import { describe, it, expect } from "vitest";
import type { LayoutItem } from "./types";
import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_COLS,
  sortBreakpoints,
  getBreakpointFromWidth,
  findOrGenerateResponsiveLayout,
  getColsFromBreakpoint,
} from "./responsive";

describe("sortBreakpoints", () => {
  it("sorts breakpoints by pixel value ascending", () => {
    const sorted = sortBreakpoints(DEFAULT_BREAKPOINTS);
    expect(sorted).toEqual(["xxs", "xs", "sm", "md", "lg"]);
  });

  it("handles custom breakpoints", () => {
    const bp = { small: 0, medium: 500, large: 1000 };
    expect(sortBreakpoints(bp)).toEqual(["small", "medium", "large"]);
  });
});

describe("getBreakpointFromWidth", () => {
  it("returns lg for wide screens", () => {
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 1400)).toBe("lg");
  });

  it("returns md for medium screens", () => {
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 1000)).toBe("md");
  });

  it("returns sm for small screens", () => {
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 800)).toBe("sm");
  });

  it("returns xs for extra small screens", () => {
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 500)).toBe("xs");
  });

  it("returns xxs for tiny screens", () => {
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 200)).toBe("xxs");
  });

  it("returns exact breakpoint at boundary", () => {
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 1200)).toBe("lg");
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 996)).toBe("md");
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 768)).toBe("sm");
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 480)).toBe("xs");
    expect(getBreakpointFromWidth(DEFAULT_BREAKPOINTS, 0)).toBe("xxs");
  });
});

describe("getColsFromBreakpoint", () => {
  it("returns correct column count", () => {
    expect(getColsFromBreakpoint("lg", DEFAULT_COLS)).toBe(12);
    expect(getColsFromBreakpoint("md", DEFAULT_COLS)).toBe(10);
    expect(getColsFromBreakpoint("sm", DEFAULT_COLS)).toBe(6);
    expect(getColsFromBreakpoint("xs", DEFAULT_COLS)).toBe(4);
    expect(getColsFromBreakpoint("xxs", DEFAULT_COLS)).toBe(2);
  });
});

describe("findOrGenerateResponsiveLayout", () => {
  const baseLayout: LayoutItem[] = [
    { i: "a", x: 0, y: 0, w: 4, h: 2 },
    { i: "b", x: 4, y: 0, w: 4, h: 2 },
    { i: "c", x: 8, y: 0, w: 4, h: 2 },
  ];

  it("returns existing layout for breakpoint", () => {
    const layouts = { lg: baseLayout };
    const result = findOrGenerateResponsiveLayout(
      layouts, DEFAULT_BREAKPOINTS, "lg", 12, "vertical"
    );
    expect(result).toEqual(baseLayout);
  });

  it("generates layout from larger breakpoint when current is missing", () => {
    const layouts: Record<string, LayoutItem[]> = { lg: baseLayout };
    const result = findOrGenerateResponsiveLayout(
      layouts, DEFAULT_BREAKPOINTS, "sm", 6, "vertical"
    );
    expect(result.length).toBe(3);
    // Items should be corrected for 6 cols
    for (const item of result) {
      expect(item.x + item.w).toBeLessThanOrEqual(6);
    }
  });

  it("generates layout from smaller breakpoint when no larger exists", () => {
    const smLayout: LayoutItem[] = [
      { i: "a", x: 0, y: 0, w: 3, h: 2 },
      { i: "b", x: 3, y: 0, w: 3, h: 2 },
    ];
    const layouts: Record<string, LayoutItem[]> = { sm: smLayout };
    const result = findOrGenerateResponsiveLayout(
      layouts, DEFAULT_BREAKPOINTS, "lg", 12, "vertical"
    );
    expect(result.length).toBe(2);
  });

  it("returns empty array when no layouts exist", () => {
    const result = findOrGenerateResponsiveLayout(
      {}, DEFAULT_BREAKPOINTS, "lg", 12, "vertical"
    );
    expect(result).toEqual([]);
  });

  it("clones the returned layout (no mutation)", () => {
    const layouts = { lg: baseLayout };
    const result = findOrGenerateResponsiveLayout(
      layouts, DEFAULT_BREAKPOINTS, "lg", 12, "vertical"
    );
    result[0].x = 999;
    expect(baseLayout[0].x).toBe(0);
  });
});
