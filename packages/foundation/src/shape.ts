/**
 * Shape tokens — border-radius and border-width constants.
 *
 * These cover ~95% of shape declarations across all components:
 * - `radius.sm` (2px) — 67 usages: default component radius
 * - `radius.pill` (999px) — 19 usages: pill/circle shape
 * - `radius.circle` (50%) — 10 usages: perfect circle
 * - `borderWidth.sm` (1px) — ~40 usages: standard border
 * - `borderWidth.md` (2px) — ~12 usages: focus ring, indicators
 */

// ─── Radius ──────────────────────────────────────────────────────────────────

export const radius = {
  /** 0px — no rounding */
  none: "0px",
  /** 2px — extra-small radius (checkboxes, radios, small controls) */
  xs: "2px",
  /** 2px — small component radius (inputs, default) */
  sm: "2px",
  /** 4px — medium radius (small buttons) */
  md: "4px",
  /** 4px — large radius (large buttons, cards, panels) */
  lg: "4px",
  /** 999px — pill shape (avatars, tags, switches, rounded badges) */
  pill: "999px",
  /** 50% — perfect circle (progress-circle, clock) */
  circle: "50%",
} as const;

export type RadiusStep = keyof typeof radius;

// ─── Border Width ────────────────────────────────────────────────────────────

export const borderWidth = {
  /** 1px — standard border (inputs, cards, separators) */
  sm: "1px",
  /** 2px — focus ring, checkbox/radio/switch indicators */
  md: "2px",
} as const;

export type BorderWidthStep = keyof typeof borderWidth;
