/**
 * Responsive layout tokens extracted from the "Responsive Layout" page
 * of the Foundation UI Kit (Community) Figma file.
 *
 * Three density variants: compact, standard, spacious.
 * Each defines breakpoints with columns, margins, and gutters.
 *
 * All values in pixels. Margins and gutters are expressed as multiples
 * of the 8px spacing base unit ("blocks").
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LayoutDensity = "compact" | "standard" | "spacious";

export type BreakpointName = "xs" | "s" | "m" | "l" | "xl" | "xxl" | "xxxl";

export interface BreakpointConfig {
  /** Minimum viewport width (inclusive). */
  minWidth: number;
  /** Maximum viewport width (inclusive). `Infinity` for the largest. */
  maxWidth: number;
  /** Number of grid columns. */
  columns: number;
  /** Left/right margin in px. */
  margin: number;
  /** Gap between columns in px. */
  gutter: number;
}

export type BreakpointMap = Record<BreakpointName, BreakpointConfig>;

export interface ResponsiveLayout {
  density: LayoutDensity;
  breakpoints: BreakpointMap;
}

// ---------------------------------------------------------------------------
// Compact
// ---------------------------------------------------------------------------

export const compactBreakpoints: BreakpointMap = {
  xs:   { minWidth: 360,  maxWidth: 599,      columns: 6,  margin: 8,  gutter: 8 },
  s:    { minWidth: 600,  maxWidth: 767,      columns: 12, margin: 8,  gutter: 8 },
  m:    { minWidth: 768,  maxWidth: 1023,     columns: 12, margin: 16, gutter: 8 },
  l:    { minWidth: 1024, maxWidth: 1279,     columns: 12, margin: 16, gutter: 8 },
  xl:   { minWidth: 1280, maxWidth: 1439,     columns: 12, margin: 16, gutter: 8 },
  xxl:  { minWidth: 1440, maxWidth: 1599,     columns: 12, margin: 16, gutter: 8 },
  xxxl: { minWidth: 1600, maxWidth: Infinity, columns: 12, margin: 16, gutter: 8 },
};

// ---------------------------------------------------------------------------
// Standard
// ---------------------------------------------------------------------------

export const standardBreakpoints: BreakpointMap = {
  xs:   { minWidth: 360,  maxWidth: 599,      columns: 6,  margin: 16, gutter: 8 },
  s:    { minWidth: 600,  maxWidth: 767,      columns: 12, margin: 16, gutter: 16 },
  m:    { minWidth: 768,  maxWidth: 1023,     columns: 12, margin: 24, gutter: 16 },
  l:    { minWidth: 1024, maxWidth: 1279,     columns: 12, margin: 32, gutter: 24 },
  xl:   { minWidth: 1280, maxWidth: 1439,     columns: 12, margin: 32, gutter: 24 },
  xxl:  { minWidth: 1440, maxWidth: 1599,     columns: 12, margin: 32, gutter: 24 },
  xxxl: { minWidth: 1600, maxWidth: Infinity, columns: 12, margin: 32, gutter: 24 },
};

// ---------------------------------------------------------------------------
// Spacious
// ---------------------------------------------------------------------------

export const spaciousBreakpoints: BreakpointMap = {
  xs:   { minWidth: 360,  maxWidth: 599,      columns: 6,  margin: 16, gutter: 12 },
  s:    { minWidth: 600,  maxWidth: 767,      columns: 12, margin: 24, gutter: 16 },
  m:    { minWidth: 768,  maxWidth: 1023,     columns: 12, margin: 32, gutter: 24 },
  l:    { minWidth: 1024, maxWidth: 1279,     columns: 12, margin: 40, gutter: 32 },
  xl:   { minWidth: 1280, maxWidth: 1439,     columns: 12, margin: 40, gutter: 32 },
  xxl:  { minWidth: 1440, maxWidth: 1599,     columns: 12, margin: 40, gutter: 32 },
  xxxl: { minWidth: 1600, maxWidth: Infinity, columns: 12, margin: 40, gutter: 32 },
};

// ---------------------------------------------------------------------------
// All layouts
// ---------------------------------------------------------------------------

export const responsiveLayouts: Record<LayoutDensity, BreakpointMap> = {
  compact: compactBreakpoints,
  standard: standardBreakpoints,
  spacious: spaciousBreakpoints,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Ordered breakpoint names from smallest to largest. */
export const breakpointOrder: BreakpointName[] = [
  "xs", "s", "m", "l", "xl", "xxl", "xxxl",
];

/**
 * Returns the active breakpoint name for a given viewport width and density.
 */
export function getBreakpoint(
  width: number,
  density: LayoutDensity = "standard",
): BreakpointName {
  const bps = responsiveLayouts[density];
  for (const name of breakpointOrder) {
    const bp = bps[name];
    if (width >= bp.minWidth && width <= bp.maxWidth) {
      return name;
    }
  }
  return width < 360 ? "xs" : "xxxl";
}

/**
 * Returns the full breakpoint config for a given viewport width and density.
 */
export function getBreakpointConfig(
  width: number,
  density: LayoutDensity = "standard",
): BreakpointConfig {
  return responsiveLayouts[density][getBreakpoint(width, density)];
}

/**
 * Generates a CSS media query string for a given breakpoint.
 */
export function breakpointMediaQuery(
  name: BreakpointName,
  density: LayoutDensity = "standard",
): string {
  const bp = responsiveLayouts[density][name];
  if (bp.maxWidth === Infinity) {
    return `(min-width: ${bp.minWidth}px)`;
  }
  return `(min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px)`;
}
