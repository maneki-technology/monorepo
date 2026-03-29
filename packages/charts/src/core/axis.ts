/**
 * Axis rendering helpers — generates SVG elements for grid lines,
 * tick marks, and labels.
 *
 * Grid lines and labels are rendered to separate containers so
 * grid lines can be layered behind chart data elements.
 */

import type { Tick, Rect } from "./types.js";

// ---------------------------------------------------------------------------
// SVG namespace
// ---------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";

// ---------------------------------------------------------------------------
// Y-axis (value axis)
// ---------------------------------------------------------------------------

/**
 * Render horizontal grid lines for the y-axis.
 * These go BEHIND the bars/data elements.
 */
export function renderYGridLines(
  container: SVGGElement,
  ticks: Tick[],
  plot: Rect,
  gridColor: string,
): void {
  for (const tick of ticks) {
    const y = plot.y + plot.height - tick.position;
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", String(plot.x));
    line.setAttribute("y1", String(y));
    line.setAttribute("x2", String(plot.x + plot.width));
    line.setAttribute("y2", String(y));
    line.setAttribute("stroke", gridColor);
    line.setAttribute("stroke-width", "1");
    container.appendChild(line);
  }
}

/**
 * Render y-axis labels (left side).
 * These go ON TOP of the bars/data elements.
 */
export function renderYLabels(
  container: SVGGElement,
  ticks: Tick[],
  plot: Rect,
  textColor: string,
): void {
  for (const tick of ticks) {
    const y = plot.y + plot.height - tick.position;
    const text = document.createElementNS(NS, "text");
    text.setAttribute("x", String(plot.x - 8));
    text.setAttribute("y", String(y));
    text.setAttribute("text-anchor", "end");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", textColor);
    text.setAttribute("class", "chart-axis-label");
    text.textContent = tick.label;
    container.appendChild(text);
  }
}

// ---------------------------------------------------------------------------
// X-axis (category axis)
// ---------------------------------------------------------------------------

/**
 * Render vertical grid lines for the x-axis.
 * These go BEHIND the bars/data elements.
 */
export function renderXGridLines(
  container: SVGGElement,
  positions: number[],
  plot: Rect,
  gridColor: string,
): void {
  for (const pos of positions) {
    const x = plot.x + pos;
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", String(x));
    line.setAttribute("y1", String(plot.y));
    line.setAttribute("x2", String(x));
    line.setAttribute("y2", String(plot.y + plot.height));
    line.setAttribute("stroke", gridColor);
    line.setAttribute("stroke-width", "1");
    container.appendChild(line);
  }
}

/**
 * Render x-axis labels (bottom).
 * These go ON TOP of the bars/data elements.
 */
export function renderXLabels(
  container: SVGGElement,
  labels: string[],
  positions: number[],
  plot: Rect,
  textColor: string,
  rotation = 0,
): void {
  for (let i = 0; i < labels.length; i++) {
    const x = plot.x + positions[i];
    const labelY = plot.y + plot.height + 16;

    const text = document.createElementNS(NS, "text");
    text.setAttribute("fill", textColor);
    text.setAttribute("class", "chart-axis-label");

    if (rotation !== 0) {
      text.setAttribute("x", "0");
      text.setAttribute("y", "0");
      text.setAttribute("text-anchor", "end");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute(
        "transform",
        `translate(${x}, ${labelY}) rotate(${-rotation})`,
      );
    } else {
      text.setAttribute("x", String(x));
      text.setAttribute("y", String(labelY));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "hanging");
    }

    text.textContent = labels[i];
    container.appendChild(text);
  }
}

// ---------------------------------------------------------------------------
// Chart title
// ---------------------------------------------------------------------------

/**
 * Render the chart title as an SVG text element.
 */
export function renderTitle(
  container: SVGGElement,
  title: string,
  viewBoxWidth: number,
  y: number,
  textColor: string,
): void {
  const text = document.createElementNS(NS, "text");
  text.setAttribute("x", String(viewBoxWidth / 2));
  text.setAttribute("y", String(y));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "hanging");
  text.setAttribute("fill", textColor);
  text.setAttribute("class", "chart-title");
  text.textContent = title;
  container.appendChild(text);
}
