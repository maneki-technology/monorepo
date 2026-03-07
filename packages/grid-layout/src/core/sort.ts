import type { LayoutItem, CompactType } from "./types";

/**
 * Sort layout items. Vertical: top-to-bottom, left-to-right.
 * Horizontal: left-to-right, top-to-bottom.
 */
export function sortLayoutItems(
  layout: LayoutItem[],
  compactType: CompactType = "vertical"
): LayoutItem[] {
  if (compactType === "horizontal") {
    return [...layout].sort((a, b) => {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    });
  }
  // vertical (default)
  return [...layout].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
}

/**
 * Get all static items from a layout.
 */
export function getStatics(layout: LayoutItem[]): LayoutItem[] {
  return layout.filter((item) => item.static);
}
