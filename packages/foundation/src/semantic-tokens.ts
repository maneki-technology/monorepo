/**
 * Semantic color tokens extracted from the "Color Tokens" page
 * of the Foundation UI Kit (Community) Figma file.
 *
 * Tokens are organized into three sections: General, Global, and Status.
 * Values reference the palette in `colors.ts` via `{ family, step }` or
 * literal hex/rgba strings for one-offs (brand, black, white, overlay).
 */

import { colors, type ColorFamily } from "./colors.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A reference to a palette color. */
export interface PaletteRef {
  family: ColorFamily;
  step: number;
}

/** A semantic token value — either a palette reference or a literal color. */
export type SemanticValue = PaletteRef | string;

/** Elevation tokens use box-shadow strings, not colors. */
export interface ElevationToken {
  boxShadow: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ref(family: ColorFamily, step: number): PaletteRef {
  return { family, step };
}

/** Resolve a SemanticValue to a CSS color string. */
export function resolveSemanticValue(value: SemanticValue): string {
  if (typeof value === "string") return value;
  const steps = colors[value.family] as Record<number, string>;
  return steps[value.step];
}

// ---------------------------------------------------------------------------
// General — Surface
// ---------------------------------------------------------------------------

export const surface = {
  primary: "#ffffff",
  secondary: ref("gray", 10),
  tertiary: ref("gray", 20),
  moderate: ref("gray", 30),
  bold: ref("gray", 40),
  strong: ref("gray", 60),
  action: ref("blue", 60),
  actionContrast: ref("blue", 100),
  destructive: ref("red", 60),
  success: ref("green", 60),
  contrast: ref("gray", 110),
  overlay: "rgba(28, 43, 54, 0.8)", // Gray 90 @80%
  light: "#ffffff",
  dark: ref("gray", 110),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// General — Elevation (box-shadow tokens, Material Design style)
// ---------------------------------------------------------------------------

export const elevation = {
  "00": { boxShadow: "none" },
  "01": {
    boxShadow:
      "0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12), 0px 1px 3px 0px rgba(0,0,0,0.2)",
  },
  "02": {
    boxShadow:
      "0px 2px 2px 0px rgba(0,0,0,0.14), 0px 3px 1px -2px rgba(0,0,0,0.12), 0px 1px 5px 0px rgba(0,0,0,0.2)",
  },
  "03": {
    boxShadow:
      "0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12), 0px 2px 4px -1px rgba(0,0,0,0.2)",
  },
  "04": {
    boxShadow:
      "0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12), 0px 3px 5px -1px rgba(0,0,0,0.2)",
  },
  "05": {
    boxShadow:
      "0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12), 0px 5px 5px -3px rgba(0,0,0,0.2)",
  },
  "06": {
    boxShadow:
      "0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12), 0px 7px 8px -4px rgba(0,0,0,0.2)",
  },
  "07": {
    boxShadow:
      "0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12), 0px 8px 10px -5px rgba(0,0,0,0.2)",
  },
  "08": {
    boxShadow:
      "0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12), 0px 11px 15px -7px rgba(0,0,0,0.2)",
  },
} as const satisfies Record<string, ElevationToken>;

// ---------------------------------------------------------------------------
// General — Border
// ---------------------------------------------------------------------------

export const border = {
  minimal: ref("gray", 20),
  subtle: ref("gray", 30),
  moderate: ref("gray", 40),
  bold: ref("gray", 60),
  focus: ref("blue", 60),
  contrast: ref("gray", 90),
  light: "#ffffff",
  dark: ref("gray", 110),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// General — Text
// ---------------------------------------------------------------------------

export const text = {
  primary: ref("gray", 90),
  secondary: ref("gray", 70),
  tertiary: ref("gray", 40),
  link: ref("blue", 60),
  linkHover: ref("blue", 70),
  linkActive: ref("blue", 80),
  visited: ref("purple", 60),
  selected: ref("blue", 60),
  destructive: ref("red", 60),
  reversed: "#ffffff",
  light: "#ffffff",
  dark: ref("gray", 110),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// General — Icon
// ---------------------------------------------------------------------------

export const icon = {
  action: ref("blue", 60),
  primary: ref("gray", 90),
  secondary: ref("gray", 40),
  destructive: ref("red", 60),
  contrast: "#000000",
  reversed: "#ffffff",
  light: "#ffffff",
  dark: ref("gray", 110),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Global
// ---------------------------------------------------------------------------

export const global = {
  brand: "#7399c6",
  globalHeader: ref("blue", 90),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Status — Surface / Background
// ---------------------------------------------------------------------------

export const statusSurface = {
  noneBold: ref("gray", 60),
  informationBold: ref("blue", 60),
  successBold: ref("green", 60),
  errorBold: ref("red", 60),
  warningBold: ref("yellow", 30),
  noneSubtle: ref("gray", 20),
  informationSubtle: ref("blue", 20),
  successSubtle: ref("green", 20),
  errorSubtle: ref("red", 20),
  warningSubtle: ref("yellow", 10),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Status — Text
// ---------------------------------------------------------------------------

export const statusText = {
  noneBoldText: "#ffffff",
  informationBoldText: "#ffffff",
  successBoldText: "#ffffff",
  errorBoldText: "#ffffff",
  warningBoldText: ref("gray", 110),
  noneSubtleText: ref("gray", 70),
  informationSubtleText: ref("blue", 70),
  successSubtleText: ref("green", 70),
  errorSubtleText: ref("red", 80),
  warningSubtleText: ref("gray", 90),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Status — Icon
// ---------------------------------------------------------------------------

export const statusIcon = {
  noneBoldIcon: "#ffffff",
  informationBoldIcon: "#ffffff",
  successBoldIcon: "#ffffff",
  errorBoldIcon: "#ffffff",
  warningBoldIcon: ref("gray", 110),
  noneSubtleIcon: ref("gray", 70),
  informationSubtleIcon: ref("blue", 70),
  successSubtleIcon: ref("green", 70),
  errorSubtleIcon: ref("red", 60),
  warningSubtleIcon: ref("orange", 50),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Status — General (base status colors)
// ---------------------------------------------------------------------------

export const statusGeneral = {
  none: ref("gray", 60),
  information: ref("blue", 60),
  success: ref("green", 60),
  error: ref("red", 60),
  warning: ref("orange", 50),
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// State — Disabled
// ---------------------------------------------------------------------------

export const stateDisabled = {
  border: "rgba(91, 114, 130, 0.4)",   // gray-60 @40% — outer ring
  minimal: "rgba(91, 114, 130, 0.2)",  // gray-60 @20% — inner fill/dot
  text: "rgba(91, 114, 130, 0.5)",     // gray-60 @50% — label text
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Form — Input tokens
// ---------------------------------------------------------------------------

export const form = {
  inputBorder: ref("gray", 40),        // #9FB1BD — same resolved value as border.moderate
  inputBackground: "#ffffff",           // white
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// State — Hover
// ---------------------------------------------------------------------------

export const stateHover = {
  borderModerate: ref("gray", 50),      // #7A909E — darkened border on hover
  surfaceMinimal: ref("gray", 10),      // #F2F5F7 — hover-minimal surface
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// State — Selected
// ---------------------------------------------------------------------------

export const stateSelected = {
  surfaceBold: ref("blue", 60),         // #186ADE — checked/selected fill
  surfaceMinimal: ref("blue", 10),      // #EBF3FE — selected-minimal surface
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export const tag = {
  bold: ref("blue", 60),              // #186ADE
  subtle: ref("blue", 20),            // #D4E4FA
  minimal: "#ffffff",                  // #FFFFFF
  textBold: "#ffffff",                 // #FFFFFF
  textSubtle: ref("blue", 70),        // #0D4EA6
  textMinimal: ref("gray", 70),       // #3E5463
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export const button = {
  secondary: ref("gray", 20),          // #DCE3E8
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Grid / Row — Table row tokens
// ---------------------------------------------------------------------------

export const gridRow = {
  rowDefault: "#ffffff",                  // white — default row background
  rowAlt: ref("gray", 10),                // #EEF1F4 — zebra stripe alternate row
  rowSelected: ref("blue", 10),           // #E8F1FC — selected row background
} as const satisfies Record<string, SemanticValue>;

// ---------------------------------------------------------------------------
// Aggregate — all semantic color token groups
// ---------------------------------------------------------------------------

export const semanticTokens = {
  surface,
  border,
  text,
  icon,
  global,
  statusSurface,
  statusText,
  statusIcon,
  statusGeneral,
  stateDisabled,
  form,
  stateHover,
  stateSelected,
  tag,
  button,
  gridRow,
} as const;

export type SemanticTokenGroup = keyof typeof semanticTokens;
