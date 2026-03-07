import type { LayoutItem, Position, GridConfig } from "./types";

/**
 * Calculate the width of a single column in pixels.
 */
export function calcColWidth(containerWidth: number, config: GridConfig): number {
  const padding = config.containerPadding ?? config.margin;
  return (
    (containerWidth - config.margin[0] * (config.cols - 1) - padding[0] * 2) /
    config.cols
  );
}

/**
 * Convert grid units (x, y, w, h) to pixel position.
 */
export function calcPosition(
  item: LayoutItem,
  containerWidth: number,
  config: GridConfig
): Position {
  const colWidth = calcColWidth(containerWidth, config);
  const padding = config.containerPadding ?? config.margin;

  return {
    left: Math.round((colWidth + config.margin[0]) * item.x + padding[0]),
    top: Math.round((config.rowHeight + config.margin[1]) * item.y + padding[1]),
    width: Math.round(colWidth * item.w + config.margin[0] * (item.w - 1)),
    height: Math.round(config.rowHeight * item.h + config.margin[1] * (item.h - 1)),
  };
}

/**
 * Convert pixel coordinates to grid units (x, y). Rounds to nearest cell.
 */
export function calcXY(
  top: number,
  left: number,
  containerWidth: number,
  config: GridConfig
): { x: number; y: number } {
  const colWidth = calcColWidth(containerWidth, config);
  const padding = config.containerPadding ?? config.margin;

  let x = Math.round((left - padding[0]) / (colWidth + config.margin[0]));
  let y = Math.round((top - padding[1]) / (config.rowHeight + config.margin[1]));

  x = Math.max(0, Math.min(x, config.cols - 1));
  y = Math.max(0, y);

  return { x, y };
}

/**
 * Convert pixel dimensions to grid units (w, h). Rounds to nearest cell.
 */
export function calcWH(
  width: number,
  height: number,
  containerWidth: number,
  config: GridConfig
): { w: number; h: number } {
  const colWidth = calcColWidth(containerWidth, config);

  let w = Math.round((width + config.margin[0]) / (colWidth + config.margin[0]));
  let h = Math.round((height + config.margin[1]) / (config.rowHeight + config.margin[1]));

  w = Math.max(1, w);
  h = Math.max(1, h);

  return { w, h };
}

/**
 * Clamp item size to min/max constraints and column bounds.
 */
export function constrainSize(
  item: LayoutItem,
  w: number,
  h: number,
  cols: number
): { w: number; h: number } {
  const minW = item.minW ?? 1;
  const maxW = item.maxW ?? Infinity;
  const minH = item.minH ?? 1;
  const maxH = item.maxH ?? Infinity;

  w = Math.max(minW, Math.min(w, maxW, cols - item.x));
  h = Math.max(minH, Math.min(h, maxH));

  return { w, h };
}

/**
 * Clamp item position within grid bounds.
 */
export function constrainPosition(
  item: LayoutItem,
  x: number,
  y: number,
  cols: number
): { x: number; y: number } {
  x = Math.max(0, Math.min(x, cols - item.w));
  y = Math.max(0, y);
  return { x, y };
}

/**
 * Calculate the container height based on the bottom-most item.
 */
export function calcContainerHeight(layout: LayoutItem[], config: GridConfig): number {
  const b = bottom(layout);
  const padding = config.containerPadding ?? config.margin;
  return b * config.rowHeight + (b - 1) * config.margin[1] + padding[1] * 2;
}

/**
 * Get the bottom coordinate (y + h) of the lowest item.
 */
export function bottom(layout: LayoutItem[]): number {
  let max = 0;
  for (const item of layout) {
    const b = item.y + item.h;
    if (b > max) max = b;
  }
  return max;
}

/**
 * Clone a layout (deep clone each item).
 */
export function cloneLayout(layout: LayoutItem[]): LayoutItem[] {
  return layout.map((item) => ({ ...item }));
}

/**
 * Get a layout item by id.
 */
export function getLayoutItem(layout: LayoutItem[], id: string): LayoutItem | undefined {
  return layout.find((item) => item.i === id);
}
