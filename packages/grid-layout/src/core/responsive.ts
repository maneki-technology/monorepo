import type { Layout, LayoutItem, CompactType, Breakpoints, ResponsiveLayouts } from "./types";
import { compact, correctBounds } from "./compact";
import { cloneLayout } from "./utils";

/**
 * Default breakpoints (min-width in px).
 */
export const DEFAULT_BREAKPOINTS: Breakpoints = {
  lg: 1200,
  md: 996,
  sm: 768,
  xs: 480,
  xxs: 0,
};

/**
 * Default column counts per breakpoint.
 */
export const DEFAULT_COLS: Record<string, number> = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

/**
 * Sort breakpoint names by their pixel value, ascending.
 */
export function sortBreakpoints<B extends string>(breakpoints: Breakpoints<B>): B[] {
  return (Object.keys(breakpoints) as B[]).sort(
    (a, b) => breakpoints[a] - breakpoints[b]
  );
}

/**
 * Get the current breakpoint based on container width.
 * Returns the highest breakpoint where width >= breakpoint value.
 */
export function getBreakpointFromWidth<B extends string>(
  breakpoints: Breakpoints<B>,
  width: number
): B {
  const sorted = sortBreakpoints(breakpoints);
  let result = sorted[0];
  for (const bp of sorted) {
    if (width >= breakpoints[bp]) {
      result = bp;
    }
  }
  return result;
}

/**
 * Find or generate a layout for the given breakpoint.
 * If no layout exists for the breakpoint, clones from the nearest larger breakpoint
 * and re-compacts for the new column count.
 */
export function findOrGenerateResponsiveLayout<B extends string>(
  layouts: ResponsiveLayouts<B>,
  breakpoints: Breakpoints<B>,
  breakpoint: B,
  cols: number,
  compactType: CompactType
): Layout {
  // If layout exists for this breakpoint, use it
  if (layouts[breakpoint]) {
    return cloneLayout(layouts[breakpoint]!);
  }

  // Find the nearest larger breakpoint that has a layout
  const sorted = sortBreakpoints(breakpoints);
  const bpIndex = sorted.indexOf(breakpoint);

  // Search upward (larger breakpoints)
  for (let i = bpIndex + 1; i < sorted.length; i++) {
    const bp = sorted[i];
    if (layouts[bp]) {
      let layout = cloneLayout(layouts[bp]!);
      layout = correctBounds(layout, cols);
      layout = compact(layout, compactType, cols);
      return layout;
    }
  }

  // Search downward (smaller breakpoints)
  for (let i = bpIndex - 1; i >= 0; i--) {
    const bp = sorted[i];
    if (layouts[bp]) {
      let layout = cloneLayout(layouts[bp]!);
      layout = correctBounds(layout, cols);
      layout = compact(layout, compactType, cols);
      return layout;
    }
  }

  return [];
}

/**
 * Get the column count for a given breakpoint.
 */
export function getColsFromBreakpoint<B extends string>(
  breakpoint: B,
  cols: Record<B, number>
): number {
  return cols[breakpoint];
}
