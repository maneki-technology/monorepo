/**
 * Spacing tokens extracted from the "Spacing" page
 * of the Foundation UI Kit (Community) Figma file.
 *
 * Based on an 8px base unit grid. The Figma annotations use the naming
 * convention `gs-uitk-h-{multiplier}` where the multiplier is relative
 * to the 8px base (e.g. 1 = 8px, 1.5 = 12px, 2 = 16px, 2.5 = 20px).
 *
 * Full scale: gs-uitk-h-0 through gs-uitk-h-10, plus gs-uitk-h-1px.
 */

// ---------------------------------------------------------------------------
// Base unit
// ---------------------------------------------------------------------------

/** The base spacing unit in pixels. */
export const spacingBase = 8;

// ---------------------------------------------------------------------------
// Spacing scale
// ---------------------------------------------------------------------------

export const spacing = {
  /** 0px — no spacing */
  "0": 0,
  /** 1px — hairline / border compensation */
  "1px": 1,
  /** 2px — micro adjustments */
  "0.25": spacingBase * 0.25,
  /** 4px — small adjustments */
  "0.5": spacingBase * 0.5,
  /** 6px — compact gaps */
  "0.75": spacingBase * 0.75,
  /** 8px — tight gaps (heading-06/body, heading-05/body) */
  "1": spacingBase * 1,
  /** 12px — paragraph-to-heading gaps */
  "1.5": spacingBase * 1.5,
  /** 16px — heading-01 to body gap */
  "2": spacingBase * 2,
  /** 20px — major section gaps */
  "2.5": spacingBase * 2.5,
  /** 24px — large section gaps */
  "3": spacingBase * 3,
  /** 32px — extra-large gaps */
  "4": spacingBase * 4,
  /** 40px — page-level gaps */
  "5": spacingBase * 5,
  /** 48px — major page sections */
  "6": spacingBase * 6,
  /** 56px — large layout gaps */
  "7": spacingBase * 7,
  /** 64px — top-level layout gaps */
  "8": spacingBase * 8,
  /** 72px — extra-large layout gaps */
  "9": spacingBase * 9,
  /** 80px — maximum layout gaps */
  "10": spacingBase * 10,
} as const;

export type SpacingStep = keyof typeof spacing;
