/**
 * Legend rendering — generates SVG elements for the dataset legend.
 *
 * Pure function that creates SVG group with colored swatches + labels.
 */

import type { LegendItem, Rect } from "./types.js";

const NS = "http://www.w3.org/2000/svg";

// ---------------------------------------------------------------------------
// Legend sizing config
// ---------------------------------------------------------------------------

/** Configurable legend dimensions. */
export interface LegendConfig {
  swatchWidth: number;
  swatchHeight: number;
  swatchLabelGap: number;
  itemGap: number;
  charWidth: number;
  fontSize: number;
}

/** Default for cartesian charts (small — fits in header area). */
const CARTESIAN_LEGEND: LegendConfig = {
  swatchWidth: 40,
  swatchHeight: 16,
  swatchLabelGap: 8,
  itemGap: 20,
  charWidth: 7,
  fontSize: 12,
};

/** Larger legend for circular charts (pie, polar, radar). */
export const CIRCULAR_LEGEND: LegendConfig = {
  swatchWidth: 44,
  swatchHeight: 18,
  swatchLabelGap: 10,
  itemGap: 26,
  charWidth: 10,
  fontSize: 18,
};

function cfg(config?: Partial<LegendConfig>): LegendConfig {
  return { ...CARTESIAN_LEGEND, ...config };
}

// ---------------------------------------------------------------------------
// Legend layout computation
// ---------------------------------------------------------------------------

/**
 * Compute the total width needed for a row of legend items.
 * Used to center the legend horizontally.
 */
export function legendRowWidth(items: LegendItem[], config?: Partial<LegendConfig>): number {
  const c = cfg(config);
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += c.swatchWidth + c.swatchLabelGap + items[i].label.length * c.charWidth;
    if (i < items.length - 1) total += c.itemGap;
  }
  return total;
}

/**
 * Split legend items into rows that fit within maxWidth.
 */
export function splitLegendRows(
  items: LegendItem[],
  maxWidth: number,
  config?: Partial<LegendConfig>,
): LegendItem[][] {
  const c = cfg(config);
  const rows: LegendItem[][] = [];
  let currentRow: LegendItem[] = [];
  let currentWidth = 0;

  for (const item of items) {
    const itemWidth =
      c.swatchWidth + c.swatchLabelGap + item.label.length * c.charWidth;
    const widthWithGap =
      currentRow.length > 0 ? currentWidth + c.itemGap + itemWidth : itemWidth;

    if (currentRow.length > 0 && widthWithGap > maxWidth) {
      rows.push(currentRow);
      currentRow = [item];
      currentWidth = itemWidth;
    } else {
      currentRow.push(item);
      currentWidth = widthWithGap;
    }
  }

  if (currentRow.length > 0) rows.push(currentRow);
  return rows;
}

// ---------------------------------------------------------------------------
// Legend rendering
// ---------------------------------------------------------------------------

/**
 * Render legend items as SVG elements.
 *
 * @param container - SVG group to append to
 * @param items - Legend entries (label + color)
 * @param region - Available region for the legend
 * @param textColor - CSS color for label text
 * @param config - Optional sizing overrides
 */
export function renderLegend(
  container: SVGGElement,
  items: LegendItem[],
  region: Rect,
  textColor: string,
  config?: Partial<LegendConfig>,
): void {
  const c = cfg(config);
  const rows = splitLegendRows(items, region.width, c);
  const rowHeight = c.swatchHeight + 16;

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const rowW = legendRowWidth(row, c);
    let x = region.x + (region.width - rowW) / 2; // center
    const y = region.y + rowIdx * rowHeight;

    for (const item of row) {
      // Color swatch
      const rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(c.swatchWidth));
      rect.setAttribute("height", String(c.swatchHeight));
      rect.setAttribute("fill", item.color);
      rect.setAttribute("rx", "3");
      container.appendChild(rect);

      // Label
      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", String(x + c.swatchWidth + c.swatchLabelGap));
      text.setAttribute("y", String(y + c.swatchHeight / 2));
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", textColor);
      text.setAttribute("class", "chart-legend-label");
      text.textContent = item.label;
      container.appendChild(text);

      x +=
        c.swatchWidth +
        c.swatchLabelGap +
        item.label.length * c.charWidth +
        c.itemGap;
    }
  }
}

/**
 * Compute the height needed for the legend.
 */
export function legendHeight(
  items: LegendItem[],
  maxWidth: number,
  config?: Partial<LegendConfig>,
): number {
  const c = cfg(config);
  const rows = splitLegendRows(items, maxWidth, c);
  const rowHeight = c.swatchHeight + 16;
  return rows.length * rowHeight;
}
