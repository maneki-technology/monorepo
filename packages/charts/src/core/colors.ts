/**
 * Chart color palette — maps dataset indices to existing foundation palette colors.
 *
 * Uses colorVar() references so colors resolve to CSS custom properties
 * that adapt to the injected palette.
 */

import {
  BLUE_40,
  RED_40,
  GREEN_40,
  ORANGE_40,
  PURPLE_40,
  TEAL_40,
  PINK_40,
  AQUA_40,
  LIME_40,
  ULTRAMARINE_40,
  BORDER_MINIMAL,
} from "@maneki/foundation";

/**
 * The 10 chart colors from the foundation palette (step 40 — softer).
 * Index 0 = blue, cycling through distinct hues for maximum contrast.
 */
export const CHART_PALETTE: readonly string[] = [
  BLUE_40,         // #75B1FF
  RED_40,          // #FC9086
  GREEN_40,        // #43C478
  ORANGE_40,       // #FC9162
  PURPLE_40,       // #C89AFC
  TEAL_40,         // #4EBFB9
  PINK_40,         // #FA87D4
  AQUA_40,         // #48B8F0
  LIME_40,         // #78BF39
  ULTRAMARINE_40,  // #A0A7FA
];

/**
 * Get the color for a dataset by index.
 * Cycles through the palette if more than 10 datasets.
 *
 * @param index - Dataset index (0-based)
 * @param override - Optional color override (CSS string or 1-based palette index)
 */
export function getDatasetColor(
  index: number,
  override?: string | number,
): string {
  if (typeof override === "string") return override;
  if (typeof override === "number" && override >= 1 && override <= 10) {
    return CHART_PALETTE[override - 1];
  }
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

/** Grid line color — uses the border-minimal semantic token. */
export const GRID_LINE_COLOR = BORDER_MINIMAL;
