/**
 * HeroUI v3-inspired theme semantic token overrides (light + dark).
 *
 * Maps HeroUI v3's modern design language (OKLCH-based, flat semantic model,
 * generous radii, soft shadows) onto the Maneki foundation token structure.
 *
 * Light: `[data-theme="heroui"]`
 * Dark:  `[data-theme="heroui-dark"]`
 *
 * Reference: HeroUI Figma Kit V3 (Community) — figma_get_variable_defs
 */

import { resolveSemanticValue, type SemanticValue, type ElevationToken } from "./semantic-tokens.js";

// ─── Surface ────────────────────────────────────────────────────────────────

export const herouiSurface = {
  primary: "#ffffff",                    // surface/surface
  secondary: "#f5f5f5",                  // background/background
  tertiary: "#efeff0",                   // surface/surface-secondary
  moderate: "#d4d4d8",                   // zinc-300
  bold: "#a1a1aa",                       // --muted (~zinc-400)
  strong: "#71717a",                     // zinc-500
  action: "#0485f7",                     // accent/accent
  actionHover: "#3592f9",               // accent/accent-hover
  actionContrast: "#001731",             // deep navy
  destructive: "#ff383c",               // danger/danger
  destructiveHover: "#ff5c5f",          // danger lighter
  success: "#17c964",                    // --success
  contrast: "#18181b",                   // --eclipse (foreground)
  overlay: "rgba(0, 0, 0, 0.5)",        // --backdrop
  light: "#ffffff",
  dark: "#18181b",
} as const satisfies Record<string, SemanticValue>;

// ─── Border ─────────────────────────────────────────────────────────────────

export const herouiBorder = {
  minimal: "#dedee0",                    // border
  subtle: "#e4e4e7",                     // separator/separator
  moderate: "#a1a1aa", // zinc-400
  bold: "#71717a", // zinc-500
  focus: "#0485f7",                      // focus-ring
  contrast: "#27272a", // zinc-800
  light: "#ffffff",
  dark: "#18181b",
} as const satisfies Record<string, SemanticValue>;

// ─── Text ───────────────────────────────────────────────────────────────────

export const herouiText = {
  primary: "#18181b", // --foreground (eclipse)
  secondary: "#71717a", // --muted
  tertiary: "#a1a1aa", // zinc-400
  link: "#18181b",                       // foreground/link
  linkHover: "#0485f7",                  // accent on hover
  linkActive: "#3592f9",                 // accent-hover
  visited: "#7828c8", // purple
  selected: "#0485f7",                   // accent/accent
  destructive: "#ff383c",               // danger/danger
  actionContrast: "#001731",             // deep navy — info subtle/minimal text on light bg
  light: "#ffffff",
  dark: "#18181b",
} as const satisfies Record<string, SemanticValue>;

// ─── Icon ───────────────────────────────────────────────────────────────────

export const herouiIcon = {
  action: "#0485f7",                     // accent/accent
  primary: "#18181b", // --foreground
  secondary: "#71717a",                  // zinc-500
  destructive: "#ff383c",               // danger/danger
  contrast: "#18181b", // --foreground
  reversed: "#ffffff",
  light: "#ffffff",
  dark: "#18181b",
} as const satisfies Record<string, SemanticValue>;

// ─── Global ─────────────────────────────────────────────────────────────────

export const herouiGlobal = {
  brand: "#0485f7",                      // accent/accent
  globalHeader: "#18181b", // --eclipse
} as const satisfies Record<string, SemanticValue>;

// ─── Status Surface ─────────────────────────────────────────────────────────

export const herouiStatusSurface = {
  noneBold: "#71717a", // zinc-500
  informationBold: "#0485f7",            // accent/accent
  successBold: "#17c964", // --success
  errorBold: "#ff383c",                  // danger/danger
  warningBold: "#f5a524", // --warning
  openBold: "#17c964",
  completeBold: "#17c964",
  suspendedBold: "#f5a524",
  cancelledBold: "#ff383c",
  noneSubtle: "#f4f4f5", // zinc-100
  informationSubtle: "rgba(4, 133, 247, 0.15)", // accent-soft
  successSubtle: "#d4f8e5", // success-soft
  errorSubtle: "rgba(255, 56, 60, 0.15)", // danger-soft
  warningSubtle: "rgba(245, 165, 36, 0.15)", // warning-soft
  openSubtle: "#d4f8e5",
  completeSubtle: "#f4f4f5",
  suspendedSubtle: "#fef3d6",
  cancelledSubtle: "rgba(255, 56, 60, 0.15)",
} as const satisfies Record<string, SemanticValue>;

// ─── Status Text ────────────────────────────────────────────────────────────

export const herouiStatusText = {
  noneBoldText: "#ffffff",
  informationBoldText: "#ffffff",
  successBoldText: "#18181b", // dark on bright green
  errorBoldText: "#ffffff",
  warningBoldText: "#18181b", // dark on bright yellow
  noneSubtleText: "#52525b", // zinc-600
  informationSubtleText: "#004a9e", // accent-dark
  successSubtleText: "#0d7a40", // success-dark
  errorSubtleText: "#a1093e", // danger-dark
  warningSubtleText: "#8b5e0f", // warning-dark
} as const satisfies Record<string, SemanticValue>;

// ─── Status Icon ────────────────────────────────────────────────────────────

export const herouiStatusIcon = {
  noneBoldIcon: "#ffffff",
  informationBoldIcon: "#ffffff",
  successBoldIcon: "#18181b",
  errorBoldIcon: "#ffffff",
  warningBoldIcon: "#18181b",
  noneSubtleIcon: "#52525b",
  informationSubtleIcon: "#004a9e",
  successSubtleIcon: "#0d7a40",
  errorSubtleIcon: "#a1093e",
  warningSubtleIcon: "#8b5e0f",
} as const satisfies Record<string, SemanticValue>;

// ─── Status General ─────────────────────────────────────────────────────────

export const herouiStatusGeneral = {
  none: "#71717a",
  information: "#0485f7",
  success: "#17c964",
  error: "#ff383c",
  warning: "#f5a524",
} as const satisfies Record<string, SemanticValue>;

// ─── State — Disabled ───────────────────────────────────────────────────────

export const herouiStateDisabled = {
  border: "rgba(113, 113, 122, 0.3)", // muted @30%
  minimal: "rgba(113, 113, 122, 0.15)", // muted @15%
  text: "rgba(113, 113, 122, 0.5)", // --disabled-opacity: 0.5
} as const satisfies Record<string, SemanticValue>;

// ─── Form ───────────────────────────────────────────────────────────────────

export const herouiForm = {
  inputBorder: "rgba(222, 222, 224, 0)", // field/border (transparent — shadow provides boundary)
  inputBackground: "#ffffff", // --field-background
} as const satisfies Record<string, SemanticValue>;

// ─── State — Hover ──────────────────────────────────────────────────────────

export const herouiStateHover = {
  borderModerate: "#a1a1aa", // zinc-400
  surfaceMinimal: "rgba(113, 113, 122, 0.08)", // muted @8%
  surfaceModerate: "rgba(113, 113, 122, 0.15)", // muted @15%
  surfaceBold: "rgba(24, 24, 27, 0.1)", // foreground @10%
  surfaceSubtle: "rgba(24, 24, 27, 0.06)", // foreground @6%
} as const satisfies Record<string, SemanticValue>;

// ─── State — Active ─────────────────────────────────────────────────────────

export const herouiStateActive = {
  surfaceBold: "rgba(24, 24, 27, 0.2)", // foreground @20%
  surfaceSubtle: "rgba(24, 24, 27, 0.12)", // foreground @12%
} as const satisfies Record<string, SemanticValue>;

// ─── State — Selected ───────────────────────────────────────────────────────

export const herouiStateSelected = {
  surfaceBold: "#0485f7",                // accent/accent
  surfaceMinimal: "rgba(4, 133, 247, 0.15)", // accent-soft
  surfaceOverlay: "rgba(4, 133, 247, 0.15)", // accent @15%
} as const satisfies Record<string, SemanticValue>;

// ─── Tag ────────────────────────────────────────────────────────────────────

export const herouiTag = {
  bold: "#0485f7",                       // accent/accent
  subtle: "rgba(4, 133, 247, 0.15)",     // accent-soft
  minimal: "#ebebec",                    // default/default
  textBold: "#ffffff",
  textSubtle: "#0485f7",                 // accent
  textMinimal: "#52525b", // zinc-600
} as const satisfies Record<string, SemanticValue>;

// ─── Button ─────────────────────────────────────────────────────────────────

export const herouiButton = {
  secondary: "#ebebec",                  // default/default
} as const satisfies Record<string, SemanticValue>;

// ─── Default ─────────────────────────────────────────────────────────────────

export const herouiDefaultTokens = {
  default: "#ebebec",                     // default/default
  defaultForeground: "#18181b",           // default/default-foreground
  defaultHover: "#e1e1e2",               // default/default-hover
} as const satisfies Record<string, SemanticValue>;

// ─── Grid Row ───────────────────────────────────────────────────────────────

export const herouiGridRow = {
  rowDefault: "#ffffff",
  rowAlt: "#fafafa", // zinc-50
  rowSelected: "rgba(4, 133, 247, 0.15)", // accent-soft
} as const satisfies Record<string, SemanticValue>;

// ─── Elevation ──────────────────────────────────────────────────────────────
// HeroUI v3 uses softer, more diffuse shadows than Material Design

export const herouiElevation = {
  "00": { boxShadow: "none" },
  "01": {
    boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.06), 0px 0px 1px 0px rgba(0,0,0,0.06)",
  },
  "02": {
    boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.04), 0px 1px 2px 0px rgba(0,0,0,0.06), 0px 0px 1px 0px rgba(0,0,0,0.06)",
  },
  "03": {
    boxShadow: "0px 4px 8px 0px rgba(0,0,0,0.04), 0px 2px 4px 0px rgba(0,0,0,0.04), 0px 0px 1px 0px rgba(0,0,0,0.06)",
  },
  "04": {
    boxShadow: "0px 6px 12px 0px rgba(0,0,0,0.05), 0px 2px 6px 0px rgba(0,0,0,0.04), 0px 0px 1px 0px rgba(0,0,0,0.06)",
  },
  "05": {
    boxShadow:
      "0px 2px 8px 0px rgba(0,0,0,0.06), 0px -6px 12px 0px rgba(0,0,0,0.03), 0px 14px 28px 0px rgba(0,0,0,0.08)",
  },
  "06": {
    boxShadow:
      "0px 4px 12px 0px rgba(0,0,0,0.06), 0px -4px 16px 0px rgba(0,0,0,0.03), 0px 16px 32px 0px rgba(0,0,0,0.08)",
  },
  "07": {
    boxShadow:
      "0px 6px 16px 0px rgba(0,0,0,0.06), 0px -2px 20px 0px rgba(0,0,0,0.03), 0px 20px 40px 0px rgba(0,0,0,0.1)",
  },
  "08": {
    boxShadow:
      "0px 8px 20px 0px rgba(0,0,0,0.06), 0px 0px 24px 0px rgba(0,0,0,0.04), 0px 24px 48px 0px rgba(0,0,0,0.12)",
  },
} as const satisfies Record<string, ElevationToken>;

// ─── Shadow ──────────────────────────────────────────────────────────────────
// HeroUI v3 uses soft multi-layer shadows instead of borders for fields.
// From Figma: shadow-field, shadow-surface, shadow-overlay

export const herouiShadow = {
  field: {
    boxShadow:
      "0px 0px 1px 0px rgba(0,0,0,0.06), 0px 1px 2px 0px rgba(0,0,0,0.06), 0px 2px 4px 0px rgba(0,0,0,0.04)",
  },
  surface: {
    boxShadow:
      "0px 0px 1px 0px rgba(0,0,0,0.06), 0px 1px 2px 0px rgba(0,0,0,0.06), 0px 2px 4px 0px rgba(0,0,0,0.04), inset 0px 0px 1px 0px rgba(0,0,0,0.3)",
  },
  overlay: {
    boxShadow:
      "0px 2px 8px 0px rgba(0,0,0,0.06), 0px -6px 12px 0px rgba(0,0,0,0.03), 0px 14px 28px 0px rgba(0,0,0,0.08), 0px 0px 1px 0px rgba(0,0,0,0.06)",
  },
} as const satisfies Record<string, ElevationToken>;

// ─── Aggregate ──────────────────────────────────────────────────────────────

export const herouiSemanticTokens = {
  surface: herouiSurface,
  border: herouiBorder,
  text: herouiText,
  icon: herouiIcon,
  global: herouiGlobal,
  statusSurface: herouiStatusSurface,
  statusText: herouiStatusText,
  statusIcon: herouiStatusIcon,
  statusGeneral: herouiStatusGeneral,
  stateDisabled: herouiStateDisabled,
  form: herouiForm,
  stateHover: herouiStateHover,
  stateActive: herouiStateActive,
  stateSelected: herouiStateSelected,
  tag: herouiTag,
  button: herouiButton,
  gridRow: herouiGridRow,
  defaultTokens: herouiDefaultTokens,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HeroUI Dark Theme
// ═══════════════════════════════════════════════════════════════════════════

// ─── Surface (Dark) ──────────────────────────────────────────────────────

export const herouiDarkSurface = {
  primary: "#18181b",                    // --surface (eclipse)
  secondary: "#060607",                  // background/background (dark)
  tertiary: "#27272a",                   // --surface-secondary
  moderate: "#3f3f46",                   // zinc-700
  bold: "#71717a",                       // zinc-500
  strong: "#a1a1aa",                     // --muted (dark)
  action: "#0485f7",                     // accent/accent
  actionHover: "#3592f9",               // accent/accent-hover
  actionContrast: "#1e293b",             // slate-800 — blue-tinted dark surface
  destructive: "#ff383c",               // danger/danger
  destructiveHover: "#ff5c5f",          // danger lighter
  success: "#17c964",                    // --success (stays)
  contrast: "#fcfcfc",                   // --snow (inverted)
  overlay: "rgba(0, 0, 0, 0.6)",        // --backdrop (darker)
  light: "#ffffff",
  dark: "#18181b",
} as const satisfies Record<string, SemanticValue>;

// ─── Border (Dark) ───────────────────────────────────────────────────────

export const herouiDarkBorder = {
  minimal: "#28282c",                    // border (dark)
  subtle: "#3f3f46",                     // zinc-700
  moderate: "#52525b",                   // zinc-600
  bold: "#71717a",                       // zinc-500
  focus: "#0485f7",                      // focus-ring
  contrast: "#e4e4e7",                   // zinc-200
  light: "#ffffff",
  dark: "#18181b",
} as const satisfies Record<string, SemanticValue>;

// ─── Text (Dark) ────────────────────────────────────────────────────────

export const herouiDarkText = {
  primary: "#fcfcfc",                    // --snow (foreground)
  secondary: "#a1a1aa",                  // --muted (dark)
  tertiary: "#71717a",                   // zinc-500
  link: "#fcfcfc",                       // foreground (dark)
  linkHover: "#0485f7",                  // accent
  linkActive: "#3592f9",                 // accent-hover
  visited: "#a855f7",                    // purple lighter
  selected: "#0485f7",                   // accent
  destructive: "#ff383c",               // danger
  actionContrast: "#5bb3f5",             // lighter blue — info subtle/minimal text on dark bg
  light: "#ffffff",
  dark: "#18181b",
} as const satisfies Record<string, SemanticValue>;

// ─── Icon (Dark) ────────────────────────────────────────────────────────

export const herouiDarkIcon = {
  action: "#0485f7",                     // accent
  primary: "#fcfcfc",                    // --snow
  secondary: "#a1a1aa",                  // zinc-400 (lighter for dark bg)
  destructive: "#ff383c",               // danger
  contrast: "#fcfcfc",                   // --snow
  reversed: "#ffffff",
  light: "#ffffff",
  dark: "#18181b",
} as const satisfies Record<string, SemanticValue>;

// ─── Global (Dark) ──────────────────────────────────────────────────────

export const herouiDarkGlobal = {
  brand: "#0485f7",                      // accent
  globalHeader: "#0a0a0b",              // deep black
} as const satisfies Record<string, SemanticValue>;

// ─── Status Surface (Dark) ──────────────────────────────────────────────

export const herouiDarkStatusSurface = {
  noneBold: "#71717a",
  informationBold: "#0485f7",
  successBold: "#17c964",
  errorBold: "#ff383c",
  warningBold: "#f5a524",
  openBold: "#17c964",
  completeBold: "#17c964",
  suspendedBold: "#f5a524",
  cancelledBold: "#ff383c",
  noneSubtle: "#27272a",                 // zinc-800
  informationSubtle: "#0a1e3d",          // accent-deep
  successSubtle: "#052e16",              // success-deep
  errorSubtle: "#3b0a1e",               // danger-deep
  warningSubtle: "#3b2506",             // warning-deep
  openSubtle: "#052e16",
  completeSubtle: "#27272a",
  suspendedSubtle: "#3b2506",
  cancelledSubtle: "#3b0a1e",
} as const satisfies Record<string, SemanticValue>;

// ─── Status Text (Dark) ─────────────────────────────────────────────────

export const herouiDarkStatusText = {
  noneBoldText: "#ffffff",
  informationBoldText: "#ffffff",
  successBoldText: "#18181b",
  errorBoldText: "#ffffff",
  warningBoldText: "#18181b",
  noneSubtleText: "#a1a1aa",             // zinc-400
  informationSubtleText: "#5bb3f5",      // accent-light
  successSubtleText: "#4ade80",          // success-light
  errorSubtleText: "#f87171",            // danger-light
  warningSubtleText: "#fbbf24",          // warning-light
} as const satisfies Record<string, SemanticValue>;

// ─── Status Icon (Dark) ─────────────────────────────────────────────────

export const herouiDarkStatusIcon = {
  noneBoldIcon: "#ffffff",
  informationBoldIcon: "#ffffff",
  successBoldIcon: "#18181b",
  errorBoldIcon: "#ffffff",
  warningBoldIcon: "#18181b",
  noneSubtleIcon: "#a1a1aa",
  informationSubtleIcon: "#5bb3f5",
  successSubtleIcon: "#4ade80",
  errorSubtleIcon: "#f87171",
  warningSubtleIcon: "#fbbf24",
} as const satisfies Record<string, SemanticValue>;

// ─── Status General (Dark) ──────────────────────────────────────────────

export const herouiDarkStatusGeneral = {
  none: "#a1a1aa",
  information: "#0485f7",
  success: "#4ade80",
  error: "#ff383c",
  warning: "#fbbf24",
} as const satisfies Record<string, SemanticValue>;

// ─── State — Disabled (Dark) ────────────────────────────────────────────

export const herouiDarkStateDisabled = {
  border: "rgba(161, 161, 170, 0.3)",    // muted-dark @30%
  minimal: "rgba(161, 161, 170, 0.15)",  // muted-dark @15%
  text: "rgba(161, 161, 170, 0.5)",      // muted-dark @50%
} as const satisfies Record<string, SemanticValue>;

// ─── Form (Dark) ────────────────────────────────────────────────────────

export const herouiDarkForm = {
  inputBorder: "rgba(40, 40, 44, 0)",    // field/border (dark, transparent — bg contrast is sufficient)
  inputBackground: "#18181b",            // --surface (dark)
} as const satisfies Record<string, SemanticValue>;

// ─── State — Hover (Dark) ───────────────────────────────────────────────

export const herouiDarkStateHover = {
  borderModerate: "#52525b",             // zinc-600
  surfaceMinimal: "rgba(161, 161, 170, 0.08)",
  surfaceModerate: "rgba(161, 161, 170, 0.15)",
  surfaceBold: "rgba(255, 255, 255, 0.1)",
  surfaceSubtle: "rgba(255, 255, 255, 0.06)",
} as const satisfies Record<string, SemanticValue>;

// ─── State — Active (Dark) ──────────────────────────────────────────────

export const herouiDarkStateActive = {
  surfaceBold: "rgba(255, 255, 255, 0.2)",
  surfaceSubtle: "rgba(255, 255, 255, 0.12)",
} as const satisfies Record<string, SemanticValue>;

// ─── State — Selected (Dark) ────────────────────────────────────────────

export const herouiDarkStateSelected = {
  surfaceBold: "#0485f7",                // accent
  surfaceMinimal: "rgba(4, 133, 247, 0.2)", // accent-soft (dark)
  surfaceOverlay: "rgba(4, 133, 247, 0.25)",
} as const satisfies Record<string, SemanticValue>;

// ─── Tag (Dark) ─────────────────────────────────────────────────────────

export const herouiDarkTag = {
  bold: "#0485f7",
  subtle: "rgba(4, 133, 247, 0.2)",      // accent-soft (dark)
  minimal: "#27272a",                    // zinc-800
  textBold: "#ffffff",
  textSubtle: "#5bb3f5",                 // accent-light
  textMinimal: "#a1a1aa",               // zinc-400
} as const satisfies Record<string, SemanticValue>;

// ─── Button (Dark) ──────────────────────────────────────────────────────

export const herouiDarkButton = {
  secondary: "#27272a",                  // --default (dark)
} as const satisfies Record<string, SemanticValue>;

// ─── Default (Dark) ──────────────────────────────────────────────────────

export const herouiDarkDefaultTokens = {
  default: "#27272a",                     // default/default (dark)
  defaultForeground: "#fcfcfc",           // default/default-foreground (dark)
  defaultHover: "#3f3f46",               // zinc-700
} as const satisfies Record<string, SemanticValue>;

// ─── Grid Row (Dark) ────────────────────────────────────────────────────

export const herouiDarkGridRow = {
  rowDefault: "#18181b",                 // --surface
  rowAlt: "#1f1f23",                     // slightly lighter
  rowSelected: "#0a1e3d",               // accent-deep
} as const satisfies Record<string, SemanticValue>;

// ─── Elevation (Dark) ───────────────────────────────────────────────────
// HeroUI v3 dark uses inset shadows / transparent shadows

export const herouiDarkElevation = {
  "00": { boxShadow: "none" },
  "01": { boxShadow: "0 0 transparent inset" },
  "02": { boxShadow: "0 0 transparent inset" },
  "03": { boxShadow: "0 0 1px 0 rgba(255,255,255,0.1) inset" },
  "04": { boxShadow: "0 0 1px 0 rgba(255,255,255,0.15) inset" },
  "05": { boxShadow: "0 0 1px 0 rgba(255,255,255,0.2) inset" },
  "06": { boxShadow: "0 0 1px 0 rgba(255,255,255,0.25) inset" },
  "07": { boxShadow: "0 0 1px 0 rgba(255,255,255,0.3) inset" },
  "08": { boxShadow: "0 0 1px 0 rgba(255,255,255,0.3) inset" },
} as const satisfies Record<string, ElevationToken>;

// ─── Shadow (Dark) ──────────────────────────────────────────────────────
// HeroUI v3 dark: shadows are essentially invisible (transparent)

export const herouiDarkShadow = {
  field: {
    boxShadow: "none",
  },
  surface: {
    boxShadow: "none",
  },
  overlay: {
    boxShadow:
      "0px 2px 8px 0px rgba(0,0,0,0.3), 0px 14px 28px 0px rgba(0,0,0,0.4), 0px 0px 1px 0px rgba(255,255,255,0.1) inset",
  },
} as const satisfies Record<string, ElevationToken>;

// ─── Aggregate (Dark) ───────────────────────────────────────────────────

export const herouiDarkSemanticTokens = {
  surface: herouiDarkSurface,
  border: herouiDarkBorder,
  text: herouiDarkText,
  icon: herouiDarkIcon,
  global: herouiDarkGlobal,
  statusSurface: herouiDarkStatusSurface,
  statusText: herouiDarkStatusText,
  statusIcon: herouiDarkStatusIcon,
  statusGeneral: herouiDarkStatusGeneral,
  stateDisabled: herouiDarkStateDisabled,
  form: herouiDarkForm,
  stateHover: herouiDarkStateHover,
  stateActive: herouiDarkStateActive,
  stateSelected: herouiDarkStateSelected,
  tag: herouiDarkTag,
  button: herouiDarkButton,
  gridRow: herouiDarkGridRow,
  defaultTokens: herouiDarkDefaultTokens,
} as const;

// ─── Shape Overrides ─────────────────────────────────────────────────────────
// HeroUI v3 uses much larger radii than the default theme.
// Figma: rounded-sm=4, rounded-md=6, rounded-lg=8, rounded-xl=12,
//        rounded-3xl=24 (buttons/cards), rounded-full=9999, field/radius=12

export const herouiRadius = {
  none: "0px",
  xs: "6px",                              // rounded-md — checkboxes, radios, small controls
  sm: "12px",                             // field/radius — inputs, default component radius
  md: "16px",                             // rounded-2xl — small buttons
  lg: "24px",                             // rounded-3xl — large buttons, cards, panels
  pill: "9999px",                          // rounded-full — avatars, tags, switches
  circle: "50%",                           // unchanged
} as const;

export const herouiDarkRadius = herouiRadius;

// ─── CSS Injection ──────────────────────────────────────────────────────

/** Convert a camelCase key to kebab-case. */
function toKebab(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function semanticTokensToCss(tokens: Record<string, Record<string, SemanticValue>>): string {
  const lines: string[] = [];
  for (const [group, groupTokens] of Object.entries(tokens)) {
    const prefix = `--fd-${toKebab(group)}`;
    for (const [name, value] of Object.entries(groupTokens)) {
      lines.push(`${prefix}-${toKebab(name)}: ${resolveSemanticValue(value as SemanticValue)};`);
    }
  }
  return lines.join("\n");
}

function elevationToCss(tokens: Record<string, { boxShadow: string }>): string {
  return Object.entries(tokens)
    .map(([level, token]) => `--fd-elevation-${level}: ${token.boxShadow};`)
    .join("\n");
}

function radiusToCss(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .map(([step, value]) => `--fd-radius-${step}: ${value};`)
    .join("\n");
}

function shadowToCss(tokens: Record<string, { boxShadow: string }>): string {
  return Object.entries(tokens)
    .map(([name, token]) => `--fd-shadow-${toKebab(name)}: ${token.boxShadow};`)
    .join("\n");
}


// HeroUI component-level overrides (not semantic tokens, but theme-specific)
// Shared component overrides (both light and dark)
const herouiComponentCssShared = [
  "--ui-ring-offset: 2px;",
  "--ui-ring-width: 4px;",
  "--ui-disabled-opacity: 0.5;",
  "--ui-select-panel-radius: 20px;",
  "--ui-select-panel-gap: 8px;",
  "--ui-dd-menu-radius: 20px;",
  "--ui-menu-radius: 20px;",
  "--ui-menu-gap: 8px;",
  "--ui-modal-radius: 24px;",
  "--ui-qf-menu-gap: 8px;",
  "--ui-modal-padding: 24px;",
  "--ui-qf-menu-radius: 20px;",
  "--ui-acc-group-bg: var(--fd-surface-primary, #ffffff);",
  "--ui-acc-group-radius: 24px;",
  "--ui-acc-group-shadow: var(--fd-shadow-surface, none);",
  "--ui-acc-group-overflow: clip;",
  "--ui-card-border-width: 0;",
  "--ui-acc-separator-color: #dedee0;",
  "--ui-acc-separator-margin: 0 16px;",
  "--ui-acc-header-padding: 16px;",
  "--ui-acc-label-font-size: 14px;",
  "--ui-acc-label-font-weight: 500;",
  "--ui-acc-content-color: #71717a;",
  "--ui-acc-content-padding: 8px 16px 16px;",
  "--ui-modal-padding-l: 24px;",
  "--ui-modal-close-radius: 9999px;",
  "--ui-modal-gap: 16px;",
  "--ui-popover-radius: 16px;",
  "--ui-tooltip-radius: 12px;",
  "--ui-search-dropdown-radius: 20px;",
  "--ui-search-dropdown-gap: 8px;",
  "--ui-tab-group-radius: 28px;",
  "--ui-tab-group-padding: 4px 8px;",
  "--ui-tab-group-padding-v: 8px 4px;",
  "--ui-tab-group-border-shadow: none;",
  "--ui-tab-group-border-shadow-v: none;",
  "--ui-tab-group-gap: 2px;",
  "--ui-tab-group-align: center;",
  "--ui-tab-radius: 24px;",
  "--ui-tab-unselected-radius: 24px;",
  "--ui-tab-padding: 4px 8px;",
  "--ui-tab-padding-y: 4px;",
  "--ui-tab-font-size: 14px;",
  "--ui-tab-font-weight: 500;",
  "--ui-tab-selected-inset: 0 -4px;",
  "--ui-tab-selected-inset-v: -4px 0;",
  "--ui-tab-highlight-color: transparent;",
].join("\n");

// Light-only component overrides
const herouiComponentCssLight = [
  "--ui-select-hover-border: transparent;",
  "--ui-select-hover-bg: rgba(249, 249, 249, 0.92);",
  "--ui-search-category-bg: #ebebec;",
  "--ui-search-item-hover-bg: #e4e4e7;",
  "--ui-tab-group-bg: #ebebec;",
  "--ui-tab-text-color: #71717a;",
  "--ui-tab-selected-bg: #ffffff;",
  "--ui-tab-selected-shadow: 0px 2px 8px 0px rgba(0,0,0,0.06);",
  "--ui-project-card-border: none;",
  "--ui-cb-border: #dedee0;",
].join("\n");

// Dark-only component overrides
const herouiComponentCssDark = [
  "--ui-select-hover-border: transparent;",
  "--ui-select-hover-bg: rgba(39, 39, 42, 0.92);",
  "--ui-search-category-bg: #27272a;",
  "--ui-search-item-hover-bg: #3f3f46;",
  "--ui-tab-group-bg: #27272a;",
  "--ui-tab-text-color: #a1a1aa;",
  "--ui-tab-selected-bg: #3f3f46;",
  "--ui-tab-selected-shadow: none;",
  "--ui-card-border-width: 1px;",
  "--ui-cb-border: #3f3f46;",
].join("\n");

const STYLE_ID = "maneki-heroui-theme";

/**
 * Injects HeroUI theme CSS custom properties.
 * Creates `[data-theme="heroui"]` and `[data-theme="heroui-dark"]` blocks.
 * Idempotent — safe to call multiple times.
 */
export function injectHerouiTheme(): void {
  if (typeof document === "undefined") return;

  const existing = document.getElementById(STYLE_ID);
  const herouiCss = [semanticTokensToCss(herouiSemanticTokens), elevationToCss(herouiElevation), shadowToCss(herouiShadow), radiusToCss(herouiRadius), herouiComponentCssShared, herouiComponentCssLight].join("\n");
  const herouiDarkCss = [semanticTokensToCss(herouiDarkSemanticTokens), elevationToCss(herouiDarkElevation), shadowToCss(herouiDarkShadow), radiusToCss(herouiDarkRadius), herouiComponentCssShared, herouiComponentCssDark].join("\n");
  const cssContent = `[data-theme="heroui"] {\n${herouiCss}\n}\n\n[data-theme="heroui-dark"] {\n${herouiDarkCss}\n}`;

  if (existing) {
    if ((import.meta as any).hot) {
      existing.textContent = cssContent;
    }
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = cssContent;
  document.head.appendChild(style);
}
