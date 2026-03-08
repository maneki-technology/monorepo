/**
 * Typography tokens extracted from the "Typography / Type System" page
 * of the Foundation UI Kit (Community) Figma file.
 *
 * Three sections: Display Headings, Component/Layout Headings, Body/Supporting.
 * Two font families: "Inter" (primary) and "Roboto Mono" (code).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TypeToken {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  usage: string;
}

// ---------------------------------------------------------------------------
// Font families
// ---------------------------------------------------------------------------

export const fontFamilies = {
  primary: "'Inter', sans-serif",
  code: "'Roboto Mono', monospace",
} as const;

// ---------------------------------------------------------------------------
// Font weights (mapped to numeric values)
// ---------------------------------------------------------------------------

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
} as const;

// ---------------------------------------------------------------------------
// Display Headings — Inter Light, large marketing/content headings
// ---------------------------------------------------------------------------

export const display = {
  "01": {
    fontFamily: fontFamilies.primary,
    fontSize: 78,
    lineHeight: 104,
    fontWeight: fontWeights.light,
    usage: "Content headings, marketing page headings, large display headings",
  },
  "02": {
    fontFamily: fontFamilies.primary,
    fontSize: 60,
    lineHeight: 80,
    fontWeight: fontWeights.light,
    usage: "Content headings, marketing page headings, large display headings",
  },
  "03": {
    fontFamily: fontFamilies.primary,
    fontSize: 48,
    lineHeight: 64,
    fontWeight: fontWeights.light,
    usage: "Content headings, marketing page headings, large display headings",
  },
} as const satisfies Record<string, TypeToken>;

// ---------------------------------------------------------------------------
// Component & Layout Headings — Inter Medium
// ---------------------------------------------------------------------------

export const heading = {
  "01": {
    fontFamily: fontFamilies.primary,
    fontSize: 40,
    lineHeight: 52,
    fontWeight: fontWeights.medium,
    usage: "Content headings, marketing page headings, large display headings",
  },
  "02": {
    fontFamily: fontFamilies.primary,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: fontWeights.medium,
    usage: "Content headings, marketing page headings, large display headings",
  },
  "03": {
    fontFamily: fontFamilies.primary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.medium,
    usage: "Content headings, marketing page headings, large display headings",
  },
  "04": {
    fontFamily: fontFamilies.primary,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: fontWeights.medium,
    usage: "Content headings, marketing page headings, large display headings",
  },
  "05": {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.medium,
    usage: "Standard cards, panels",
  },
  "06": {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.medium,
    usage: "Standard cards/panels, list items, menu items",
  },
  "07": {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    usage: "Standard cards, panels, compact list items, compact menu items",
  },
} as const satisfies Record<string, TypeToken>;

// ---------------------------------------------------------------------------
// Body — Inter Regular
// ---------------------------------------------------------------------------

export const body = {
  "01": {
    fontFamily: fontFamilies.primary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: fontWeights.regular,
    usage: "Primary body text, paragraphs, descriptions",
  },
  "02": {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    usage: "Secondary body text, form labels, table cells",
  },
  "03": {
    fontFamily: fontFamilies.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.regular,
    usage: "Compact body text, helper text, metadata",
  },
} as const satisfies Record<string, TypeToken>;

// ---------------------------------------------------------------------------
// Supporting — UI, Caption, Badge
// ---------------------------------------------------------------------------

export const ui = {
  "01": {
    fontFamily: fontFamilies.primary,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: fontWeights.regular,
    usage: "Large UI elements, prominent labels",
  },
  "02": {
    fontFamily: fontFamilies.primary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: fontWeights.medium,
    usage: "Compact badges",
  },
} as const satisfies Record<string, TypeToken>;

export const caption = {
  "01": {
    fontFamily: fontFamilies.primary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: fontWeights.regular,
    usage: "Small captions",
  },
} as const satisfies Record<string, TypeToken>;

export const badge = {
  "01": {
    fontFamily: fontFamilies.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    usage: "Badge labels, tags",
  },
} as const satisfies Record<string, TypeToken>;

// ---------------------------------------------------------------------------
// Code — Roboto Mono Regular
// ---------------------------------------------------------------------------

export const code = {
  "01": {
    fontFamily: fontFamilies.code,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeights.regular,
    usage: "Inline code, code blocks",
  },
  "02": {
    fontFamily: fontFamilies.code,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: fontWeights.regular,
    usage: "Compact code, terminal output",
  },
} as const satisfies Record<string, TypeToken>;

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const typography = {
  display,
  heading,
  body,
  ui,
  caption,
  badge,
  code,
} as const;

export type TypographyGroup = keyof typeof typography;
