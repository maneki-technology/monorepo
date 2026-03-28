/**
 * SVG math utilities — path generation, coordinate transforms.
 *
 * Pure functions, no DOM.
 */

// ---------------------------------------------------------------------------
// Cartesian layout computation
// ---------------------------------------------------------------------------

import type { Padding, Rect, CartesianLayout, LegendItem } from "./types.js";
import { legendHeight } from "./legend.js";

/** Default padding for cartesian charts. */
const DEFAULT_PADDING: Padding = {
  top: 60,    // space for title
  right: 40,
  bottom: 60, // space for x-axis labels
  left: 80,   // space for y-axis labels
};

/**
 * Compute the layout regions for a cartesian chart.
 *
 * @param width - SVG viewBox width
 * @param height - SVG viewBox height
 * @param options - Chart options affecting layout
 */
export function computeCartesianLayout(
  width: number,
  height: number,
  options: {
    title?: string;
    showLegend?: boolean;
    legendItems?: LegendItem[];
    labelRotation?: number;
    padding?: Partial<Padding>;
  },
): CartesianLayout {
  const pad = { ...DEFAULT_PADDING, ...options.padding };

  // Title region
  const titleH = options.title ? 40 : 0;
  const titleRegion: Rect = {
    x: 0,
    y: pad.top - titleH - 10,
    width,
    height: titleH,
  };

  // Legend region
  let legendH = 0;
  if (options.showLegend !== false && options.legendItems?.length) {
    legendH = legendHeight(options.legendItems, width - pad.left - pad.right);
  }
  const legendRegion: Rect = {
    x: pad.left,
    y: titleRegion.y + titleH + 20,
    width: width - pad.left - pad.right,
    height: legendH,
  };

  // Adjust top padding for title + legend
  const plotTop = legendRegion.y + legendH + (legendH > 0 ? 16 : 0);

  // Extra bottom space for rotated labels
  const rotationExtra = options.labelRotation
    ? Math.sin((options.labelRotation * Math.PI) / 180) * 50
    : 0;
  const bottomSpace = pad.bottom + rotationExtra;

  // Plot area
  const plot: Rect = {
    x: pad.left,
    y: plotTop,
    width: width - pad.left - pad.right,
    height: height - plotTop - bottomSpace,
  };

  // Axis regions
  const xAxisRegion: Rect = {
    x: plot.x,
    y: plot.y + plot.height,
    width: plot.width,
    height: bottomSpace,
  };

  const yAxisRegion: Rect = {
    x: 0,
    y: plot.y,
    width: pad.left,
    height: plot.height,
  };

  return {
    viewBox: { width, height },
    title: titleRegion,
    legend: legendRegion,
    plot,
    xAxis: xAxisRegion,
    yAxis: yAxisRegion,
  };
}
