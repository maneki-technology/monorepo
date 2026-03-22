/**
 * HeroUI v3 theme — maps Maneki semantic tokens to HeroUI's visual language.
 *
 * Key characteristics:
 * - Very rounded corners (24px default)
 * - Zinc-based neutrals (cool grays)
 * - Blue accent (#006FEE)
 * - System font stack (no custom font)
 * - Subtle multi-layer shadows
 * - Borderless form fields
 * - 2px blue focus ring
 *
 * Applied via `[data-theme="heroui"]` on `:root` or any ancestor.
 * Combine with `[data-theme="heroui-dark"]` for dark mode.
 */

import type { SemanticValue, ElevationToken } from "@maneki/foundation";

// ─── Zinc palette (HeroUI's neutral scale) ──────────────────────────────────

const zinc = {
  50: "#fafafa",
  100: "#f4f4f5",
  200: "#e4e4e7",
  300: "#d4d4d8",
  400: "#a1a1aa",
  500: "#71717a",
  600: "#52525b",
  700: "#3f3f46",
  800: "#27272a",
  900: "#18181b",
  950: "#09090b",
} as const;

// ─── HeroUI accent colors ───────────────────────────────────────────────────

const accent = {
  50: "#e6f1fe",
  100: "#cce3fd",
  200: "#99c7fb",
  300: "#66aaf9",
  400: "#338ef7",
  500: "#006FEE",
  600: "#005bc4",
  700: "#004493",
  800: "#002e62",
  900: "#001731",
} as const;

const success = {
  500: "#17c964",
  700: "#12a150",
} as const;

const warning = {
  500: "#f5a524",
  700: "#c4841d",
} as const;

const danger = {
  500: "#f31260",
  700: "#b80a47",
} as const;

// ─── Helper ─────────────────────────────────────────────────────────────────

function hex(value: string): string {
  return value;
}

// ─── Light theme ────────────────────────────────────────────────────────────

export const heroSurface = {
  primary: "#ffffff",                 // HeroUI --surface = var(--white)
  secondary: hex(zinc[100]),           // #f4f4f5
  tertiary: hex(zinc[200]),            // #e4e4e7
  moderate: hex(zinc[300]),
  bold: hex(zinc[500]),
  strong: hex(zinc[400]),
  action: hex(accent[500]),            // #006FEE
  actionContrast: hex(accent[700]),
  destructive: hex(danger[500]),
  success: hex(success[500]),
  contrast: hex(zinc[900]),
  overlay: "rgba(0, 0, 0, 0.4)",
  light: "#ffffff",
  dark: hex(zinc[900]),
} as const satisfies Record<string, SemanticValue>;

export const heroBorder = {
  minimal: "#dedee0",             // from Figma --border
  subtle: hex(zinc[300]),
  moderate: hex(zinc[400]),
  bold: hex(zinc[600]),
  focus: "#0485f7",               // from Figma --focus-ring
  contrast: hex(zinc[900]),
  light: "#ffffff",
  dark: hex(zinc[900]),
} as const satisfies Record<string, SemanticValue>;

export const heroText = {
  primary: hex(zinc[900]),             // #18181b
  secondary: hex(zinc[600]),           // #52525b
  tertiary: hex(zinc[500]),            // #71717a
  link: hex(accent[500]),
  linkHover: hex(accent[600]),
  linkActive: hex(accent[700]),
  visited: "#7828c8",                  // purple
  selected: hex(accent[500]),
  destructive: hex(danger[500]),
  reversed: "#ffffff",
  light: "#ffffff",
  dark: hex(zinc[900]),
} as const satisfies Record<string, SemanticValue>;

export const heroIcon = {
  action: hex(accent[500]),
  primary: hex(zinc[900]),
  secondary: hex(zinc[500]),
  destructive: hex(danger[500]),
  contrast: "#ffffff",
  reversed: "#ffffff",
  light: "#ffffff",
  dark: hex(zinc[900]),
} as const satisfies Record<string, SemanticValue>;

export const heroGlobal = {
  brand: hex(accent[500]),
  globalHeader: hex(zinc[900]),
} as const satisfies Record<string, SemanticValue>;

export const heroForm = {
  inputBorder: "#dedee0",             // subtle border — our components don't support bg-fill inputs yet
  inputBackground: hex(zinc[100]),
} as const satisfies Record<string, SemanticValue>;

export const heroStateHover = {
  borderModerate: hex(zinc[400]),
  surfaceMinimal: "rgba(0, 0, 0, 0.04)",
  surfaceModerate: "rgba(0, 0, 0, 0.08)",
  surfaceBold: "rgba(0, 0, 0, 0.1)",
  surfaceSubtle: "rgba(0, 0, 0, 0.06)",
} as const satisfies Record<string, SemanticValue>;

export const heroStateActive = {
  surfaceBold: "rgba(0, 0, 0, 0.15)",
  surfaceSubtle: "rgba(0, 0, 0, 0.1)",
} as const satisfies Record<string, SemanticValue>;

export const heroStateSelected = {
  surfaceBold: hex(accent[500]),
  surfaceMinimal: hex(accent[50]),
  surfaceOverlay: "rgba(0, 111, 238, 0.15)",
} as const satisfies Record<string, SemanticValue>;

export const heroStateDisabled = {
  border: "rgba(0, 0, 0, 0.1)",
  minimal: "rgba(0, 0, 0, 0.05)",
  text: "rgba(0, 0, 0, 0.3)",
} as const satisfies Record<string, SemanticValue>;

export const heroTag = {
  bold: hex(accent[500]),
  subtle: hex(accent[100]),
  minimal: hex(zinc[100]),
  textBold: "#ffffff",
  textSubtle: hex(accent[700]),
  textMinimal: hex(zinc[600]),
} as const satisfies Record<string, SemanticValue>;

export const heroButton = {
  secondary: hex(zinc[200]),
} as const satisfies Record<string, SemanticValue>;

export const heroGridRow = {
  rowDefault: hex(zinc[50]),
  rowAlt: hex(zinc[100]),
  rowSelected: hex(accent[50]),
} as const satisfies Record<string, SemanticValue>;

export const heroStatusGeneral = {
  none: hex(zinc[500]),
  information: hex(accent[500]),
  success: hex(success[500]),
  error: hex(danger[500]),
  warning: hex(warning[500]),
} as const satisfies Record<string, SemanticValue>;

export const heroStatusSurface = {
  noneBold: hex(zinc[500]),
  informationBold: hex(accent[500]),
  successBold: hex(success[500]),
  errorBold: hex(danger[500]),
  warningBold: hex(warning[500]),
  openBold: hex(success[500]),
  completeBold: hex(success[700]),
  suspendedBold: hex(warning[500]),
  cancelledBold: hex(danger[500]),
  noneSubtle: hex(zinc[100]),
  informationSubtle: hex(accent[50]),
  successSubtle: "#e8faf0",
  errorSubtle: "#fee7ef",
  warningSubtle: "#fef3e2",
  openSubtle: "#e8faf0",
  completeSubtle: hex(zinc[100]),
  suspendedSubtle: "#fef3e2",
  cancelledSubtle: "#fee7ef",
} as const satisfies Record<string, SemanticValue>;

export const heroStatusText = {
  noneBoldText: "#ffffff",
  informationBoldText: "#ffffff",
  successBoldText: hex(zinc[900]),
  errorBoldText: "#ffffff",
  warningBoldText: hex(zinc[900]),
  noneSubtleText: hex(zinc[700]),
  informationSubtleText: hex(accent[700]),
  successSubtleText: hex(success[700]),
  errorSubtleText: hex(danger[700]),
  warningSubtleText: hex(warning[700]),
} as const satisfies Record<string, SemanticValue>;

export const heroStatusIcon = {
  noneBoldIcon: "#ffffff",
  informationBoldIcon: "#ffffff",
  successBoldIcon: hex(zinc[900]),
  errorBoldIcon: "#ffffff",
  warningBoldIcon: hex(zinc[900]),
  noneSubtleIcon: hex(zinc[700]),
  informationSubtleIcon: hex(accent[700]),
  successSubtleIcon: hex(success[700]),
  errorSubtleIcon: hex(danger[700]),
  warningSubtleIcon: hex(warning[700]),
} as const satisfies Record<string, SemanticValue>;

// ─── Elevation (subtle multi-layer shadows) ─────────────────────────────────

export const heroElevation = {
  "00": { boxShadow: "none" },
  "01": {
    boxShadow:
      "0 2px 4px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.06), 0 0 1px 0 rgba(0,0,0,0.06)",
  },
  "02": {
    boxShadow:
      "0 2px 4px 0 rgba(0,0,0,0.04), 0 1px 2px 0 rgba(0,0,0,0.06), 0 0 1px 0 rgba(0,0,0,0.06)",
  },
  "03": {
    boxShadow:
      "0 2px 8px 0 rgba(0,0,0,0.06), 0 -6px 12px 0 rgba(0,0,0,0.03), 0 14px 28px 0 rgba(0,0,0,0.08)",
  },
  "04": {
    boxShadow:
      "0 2px 8px 0 rgba(0,0,0,0.06), 0 -6px 12px 0 rgba(0,0,0,0.03), 0 14px 28px 0 rgba(0,0,0,0.08)",
  },
  "05": {
    boxShadow:
      "0 2px 8px 0 rgba(0,0,0,0.06), 0 -6px 12px 0 rgba(0,0,0,0.03), 0 14px 28px 0 rgba(0,0,0,0.08)",
  },
  "06": {
    boxShadow:
      "0 4px 16px 0 rgba(0,0,0,0.08), 0 -8px 20px 0 rgba(0,0,0,0.04), 0 20px 40px 0 rgba(0,0,0,0.1)",
  },
  "07": {
    boxShadow:
      "0 4px 16px 0 rgba(0,0,0,0.08), 0 -8px 20px 0 rgba(0,0,0,0.04), 0 20px 40px 0 rgba(0,0,0,0.1)",
  },
  "08": {
    boxShadow:
      "0 8px 24px 0 rgba(0,0,0,0.1), 0 -12px 28px 0 rgba(0,0,0,0.06), 0 28px 56px 0 rgba(0,0,0,0.12)",
  },
} as const satisfies Record<string, ElevationToken>;

// ─── Shape overrides (very rounded) ─────────────────────────────────────────

export const heroRadius = {
  none: "0px",
  sm: "12px",      // HeroUI default component radius (buttons, cards, inputs)
  md: "14px",      // HeroUI larger component radius
  pill: "9999px",
  circle: "50%",
} as const;

export const heroBorderWidth = {
  sm: "1px",       // unchanged
  md: "2px",       // unchanged
} as const;

// ─── Aggregates ─────────────────────────────────────────────────────────────

export const heroSemanticTokens = {
  surface: heroSurface,
  border: heroBorder,
  text: heroText,
  icon: heroIcon,
  global: heroGlobal,
  statusSurface: heroStatusSurface,
  statusText: heroStatusText,
  statusIcon: heroStatusIcon,
  statusGeneral: heroStatusGeneral,
  stateDisabled: heroStateDisabled,
  form: heroForm,
  stateHover: heroStateHover,
  stateActive: heroStateActive,
  stateSelected: heroStateSelected,
  tag: heroTag,
  button: heroButton,
  gridRow: heroGridRow,
} as const;

