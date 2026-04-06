/**
 * Dark theme semantic token overrides.
 *
 * Each group mirrors the light theme structure but with inverted values
 * suitable for dark backgrounds. Accent colors (blue, red, green, etc.)
 * stay the same — they work on both light and dark backgrounds.
 *
 * Applied via `[data-theme="dark"]` selector on `:root` or any ancestor.
 */

import type { SemanticValue, ElevationToken } from "./semantic-tokens.js";
import { colors, type ColorFamily } from "./colors.js";

function ref(family: ColorFamily, step: number): { family: ColorFamily; step: number } {
  return { family, step };
}

// ─── Surface ────────────────────────────────────────────────────────────────

export const darkSurface = {
  primary: ref("gray", 100),           // #0D1826 — main background
  secondary: ref("gray", 110),         // #090F14 — sidebar, panels
  tertiary: ref("gray", 90),           // #1C2B36 — cards, elevated surfaces
  moderate: ref("gray", 80),           // #2C3E4C
  bold: ref("gray", 60),              // #5B7282
  strong: ref("gray", 40),            // #9FB1BD
  action: ref("blue", 60),            // stays
  actionHover: ref("blue", 50),       // lighter blue for hover on dark
  actionContrast: ref("gray", 80),    // #2B3C49 — dark surface for info bold bg
  destructive: ref("red", 60),        // stays
  destructiveHover: ref("red", 50),   // lighter red for hover on dark
  success: ref("green", 60),          // stays
  contrast: "#ffffff",                 // inverted
  overlay: "rgba(0, 0, 0, 0.7)",      // darker overlay
  light: "#ffffff",                    // stays (structural)
  dark: ref("gray", 110),             // stays
} as const satisfies Record<string, SemanticValue>;

// ─── Border ─────────────────────────────────────────────────────────────────

export const darkBorder = {
  minimal: ref("gray", 80),           // #2C3E4C
  subtle: ref("gray", 70),            // #3E5463
  moderate: ref("gray", 60),          // #5B7282
  bold: ref("gray", 40),              // #9FB1BD
  focus: ref("blue", 50),             // #4D94FF — slightly lighter for visibility
  contrast: ref("gray", 10),          // #EEF1F4
  light: "#ffffff",
  dark: ref("gray", 110),
} as const satisfies Record<string, SemanticValue>;

// ─── Text ───────────────────────────────────────────────────────────────────

export const darkText = {
  primary: ref("gray", 20),           // #DCE3E8 — softer than pure white
  secondary: ref("gray", 30),         // #C1CCD6
  tertiary: ref("gray", 50),          // #7A909E
  link: ref("blue", 40),              // #5BA3F5 — lighter blue for readability
  linkHover: ref("blue", 30),         // #A3C9F9
  linkActive: ref("blue", 20),        // #D4E4FA
  visited: ref("purple", 40),         // lighter purple
  selected: ref("blue", 40),
  destructive: ref("red", 40),
  actionContrast: ref("blue", 40),    // #5BA3F5 — lighter blue for info subtle/minimal on dark bg
  reversed: "#ffffff",                // stays white — used on colored backgrounds that don't change
  light: "#ffffff",
  dark: ref("gray", 110),
} as const satisfies Record<string, SemanticValue>;

// ─── Icon ───────────────────────────────────────────────────────────────────

export const darkIcon = {
  action: ref("blue", 40),            // lighter blue
  primary: ref("gray", 10),           // #EEF1F4
  secondary: ref("gray", 50),         // #7A909E
  destructive: ref("red", 40),
  contrast: "#ffffff",                 // inverted
  reversed: "#ffffff",                // stays white — used on colored backgrounds
  light: "#ffffff",
  dark: ref("gray", 110),
} as const satisfies Record<string, SemanticValue>;

// ─── Global ─────────────────────────────────────────────────────────────────

export const darkGlobal = {
  brand: "#7399c6",                    // stays
  globalHeader: ref("blue", 100),     // stays dark
} as const satisfies Record<string, SemanticValue>;

// ─── Status Surface ─────────────────────────────────────────────────────────
// Bold backgrounds stay the same — they're accent colors that work on dark.
// Subtle backgrounds use darker shades.

export const darkStatusSurface = {
  noneBold: ref("gray", 60),
  informationBold: ref("blue", 60),
  successBold: ref("green", 60),
  errorBold: ref("red", 60),
  warningBold: ref("yellow", 30),
  openBold: ref("green", 40),
  completeBold: ref("green", 60),
  suspendedBold: ref("yellow", 20),
  cancelledBold: ref("red", 20),
  noneSubtle: ref("gray", 80),
  informationSubtle: ref("blue", 90),
  successSubtle: ref("green", 90),
  errorSubtle: ref("red", 90),
  warningSubtle: ref("yellow", 90),
  openSubtle: ref("green", 80),
  completeSubtle: ref("gray", 80),
  suspendedSubtle: ref("yellow", 80),
  cancelledSubtle: ref("red", 80),
} as const satisfies Record<string, SemanticValue>;

// ─── Status Text ────────────────────────────────────────────────────────────
// Bold text on bold backgrounds stays the same.
// Subtle text uses lighter shades for readability on dark subtle backgrounds.

export const darkStatusText = {
  noneBoldText: "#ffffff",
  informationBoldText: "#ffffff",
  successBoldText: "#ffffff",
  errorBoldText: "#ffffff",
  warningBoldText: ref("gray", 110),
  noneSubtleText: ref("gray", 30),
  informationSubtleText: ref("blue", 30),
  successSubtleText: ref("green", 30),
  errorSubtleText: ref("red", 30),
  warningSubtleText: ref("yellow", 20),
} as const satisfies Record<string, SemanticValue>;

// ─── Status Icon ────────────────────────────────────────────────────────────

export const darkStatusIcon = {
  noneBoldIcon: "#ffffff",
  informationBoldIcon: "#ffffff",
  successBoldIcon: "#ffffff",
  errorBoldIcon: "#ffffff",
  warningBoldIcon: ref("gray", 110),
  noneSubtleIcon: ref("gray", 30),
  informationSubtleIcon: ref("blue", 30),
  successSubtleIcon: ref("green", 30),
  errorSubtleIcon: ref("red", 30),
  warningSubtleIcon: ref("orange", 30),
} as const satisfies Record<string, SemanticValue>;

// ─── Status General ─────────────────────────────────────────────────────────

export const darkStatusGeneral = {
  none: ref("gray", 50),
  information: ref("blue", 50),
  success: ref("green", 50),
  error: ref("red", 50),
  warning: ref("orange", 40),
} as const satisfies Record<string, SemanticValue>;

// ─── State — Disabled ───────────────────────────────────────────────────────

export const darkStateDisabled = {
  border: "rgba(159, 177, 189, 0.3)",
  minimal: "rgba(159, 177, 189, 0.15)",
  text: "rgba(159, 177, 189, 0.4)",
} as const satisfies Record<string, SemanticValue>;

// ─── Form ───────────────────────────────────────────────────────────────────

export const darkForm = {
  inputBorder: ref("gray", 60),
  inputBackground: ref("gray", 90),   // dark input bg
} as const satisfies Record<string, SemanticValue>;

// ─── State — Hover ──────────────────────────────────────────────────────────

export const darkStateHover = {
  borderModerate: ref("gray", 50),
  surfaceMinimal: "rgba(159, 177, 189, 0.08)",
  surfaceModerate: "rgba(159, 177, 189, 0.15)",
  surfaceBold: "rgba(255, 255, 255, 0.1)",
  surfaceSubtle: "rgba(255, 255, 255, 0.06)",
} as const satisfies Record<string, SemanticValue>;

// ─── State — Active ─────────────────────────────────────────────────────────

export const darkStateActive = {
  surfaceBold: "rgba(255, 255, 255, 0.2)",
  surfaceSubtle: "rgba(255, 255, 255, 0.12)",
} as const satisfies Record<string, SemanticValue>;

// ─── State — Selected ───────────────────────────────────────────────────────

export const darkStateSelected = {
  surfaceBold: ref("blue", 60),
  surfaceMinimal: ref("blue", 90),
  surfaceOverlay: "rgba(24, 106, 222, 0.25)",
} as const satisfies Record<string, SemanticValue>;

// ─── Tag ────────────────────────────────────────────────────────────────────

export const darkTag = {
  bold: ref("blue", 60),
  subtle: ref("blue", 80),
  minimal: ref("gray", 90),
  textBold: "#ffffff",
  textSubtle: ref("blue", 30),
  textMinimal: ref("gray", 30),
} as const satisfies Record<string, SemanticValue>;

// ─── Button ─────────────────────────────────────────────────────────────────

export const darkButton = {
  secondary: ref("gray", 80),
} as const satisfies Record<string, SemanticValue>;

// ─── Grid Row ───────────────────────────────────────────────────────────────

export const darkGridRow = {
  rowDefault: ref("gray", 100),
  rowAlt: ref("gray", 90),
  rowSelected: ref("blue", 90),
} as const satisfies Record<string, SemanticValue>;

// Stronger shadows for dark backgrounds (higher opacity than light theme)
export const darkElevation = {
  "00": { boxShadow: "none" },
  "01": {
    boxShadow:
      "0px 1px 2px 0px rgba(0,0,0,0.5), 0px 1px 3px 1px rgba(0,0,0,0.3)",
  },
  "02": {
    boxShadow:
      "0px 1px 2px 0px rgba(0,0,0,0.5), 0px 2px 6px 2px rgba(0,0,0,0.3)",
  },
  "03": {
    boxShadow:
      "0px 4px 8px 3px rgba(0,0,0,0.3), 0px 1px 3px 0px rgba(0,0,0,0.5)",
  },
  "04": {
    boxShadow:
      "0px 6px 10px 4px rgba(0,0,0,0.3), 0px 2px 3px 0px rgba(0,0,0,0.5)",
  },
  "05": {
    boxShadow:
      "0px 8px 12px 6px rgba(0,0,0,0.3), 0px 4px 4px 0px rgba(0,0,0,0.5)",
  },
  "06": {
    boxShadow:
      "0px 12px 17px 2px rgba(0,0,0,0.4), 0px 5px 22px 4px rgba(0,0,0,0.3), 0px 7px 8px -4px rgba(0,0,0,0.5)",
  },
  "07": {
    boxShadow:
      "0px 16px 24px 2px rgba(0,0,0,0.4), 0px 6px 30px 5px rgba(0,0,0,0.3), 0px 8px 10px -5px rgba(0,0,0,0.5)",
  },
  "08": {
    boxShadow:
      "0px 24px 38px 3px rgba(0,0,0,0.4), 0px 9px 46px 8px rgba(0,0,0,0.3), 0px 11px 15px -7px rgba(0,0,0,0.5)",
  },
} as const satisfies Record<string, ElevationToken>;

// ─── Shadow (Dark) ──────────────────────────────────────────────────────────

export const darkShadow = {
  field: {
    boxShadow: "none",
  },
  surface: {
    boxShadow: "none",
  },
  overlay: {
    boxShadow:
      "0px 8px 10px 1px rgba(0,0,0,0.4), 0px 3px 14px 2px rgba(0,0,0,0.3), 0px 5px 5px -3px rgba(0,0,0,0.5)",
  },
} as const satisfies Record<string, ElevationToken>;


// ─── Default (Dark) ─────────────────────────────────────────────────────────

export const darkDefaultTokens = {
  default: ref("gray", 80),               // #2B3C49 — dark default background
  defaultForeground: "#ffffff",           // white text on dark default
  defaultHover: ref("gray", 70),           // #3E5463 — hover state
} as const satisfies Record<string, SemanticValue>;
// ─── Aggregate ──────────────────────────────────────────────────────────────

export const darkSemanticTokens = {
  surface: darkSurface,
  border: darkBorder,
  text: darkText,
  icon: darkIcon,
  global: darkGlobal,
  statusSurface: darkStatusSurface,
  statusText: darkStatusText,
  statusIcon: darkStatusIcon,
  statusGeneral: darkStatusGeneral,
  stateDisabled: darkStateDisabled,
  form: darkForm,
  stateHover: darkStateHover,
  stateActive: darkStateActive,
  stateSelected: darkStateSelected,
  tag: darkTag,
  button: darkButton,
  defaultTokens: darkDefaultTokens,
  gridRow: darkGridRow,
} as const;

