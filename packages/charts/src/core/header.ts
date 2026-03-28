/**
 * Chart header — shared title + legend rendering for all chart types.
 *
 * Ensures consistent spacing across cartesian and circular charts.
 */

import type { LegendItem, Rect } from "./types.js";
import type { LegendConfig } from "./legend.js";
import { renderLegend, legendHeight } from "./legend.js";

const NS = "http://www.w3.org/2000/svg";

/** Result of rendering the chart header. */
export interface ChartHeaderResult {
  /** Total height consumed by title + legend + spacing. */
  height: number;
  /** Region where the legend was rendered (for layout calculations). */
  legendRegion: Rect;
}

/**
 * Render chart title and legend into an SVG container.
 *
 * @param svg - Root SVG element to append to
 * @param options - Title, legend items, and layout config
 * @returns The total header height consumed
 */
export function renderChartHeader(
  svg: SVGSVGElement,
  options: {
    title?: string;
    legendItems?: LegendItem[];
    showLegend?: boolean;
    viewBoxWidth: number;
    textColor: string;
    legendConfig?: Partial<LegendConfig>;
    /** Left padding for legend region. Default: 40. */
    legendPadX?: number;
  },
): ChartHeaderResult {
  const {
    title,
    legendItems,
    showLegend = true,
    viewBoxWidth,
    textColor,
    legendConfig,
    legendPadX = 40,
  } = options;

  let y = 16; // top padding

  // Title
  if (title) {
    const titleGroup = document.createElementNS(NS, "g");
    svg.appendChild(titleGroup);

    const text = document.createElementNS(NS, "text");
    text.setAttribute("x", String(viewBoxWidth / 2));
    text.setAttribute("y", String(y));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "hanging");
    text.setAttribute("fill", textColor);
    text.setAttribute("class", "chart-title");
    text.textContent = title;
    titleGroup.appendChild(text);

    y += 36; // title height + gap below title
  }

  // Legend
  const legendWidth = viewBoxWidth - legendPadX * 2;
  let legendH = 0;

  if (showLegend !== false && legendItems && legendItems.length > 0) {
    legendH = legendHeight(legendItems, legendWidth, legendConfig);

    const legendGroup = document.createElementNS(NS, "g");
    svg.appendChild(legendGroup);

    renderLegend(
      legendGroup,
      legendItems,
      { x: legendPadX, y, width: legendWidth, height: legendH },
      textColor,
      legendConfig,
    );

    y += legendH + 12; // legend height + gap below legend
  }

  return {
    height: y,
    legendRegion: {
      x: legendPadX,
      y: y - legendH - 12,
      width: legendWidth,
      height: legendH,
    },
  };
}
