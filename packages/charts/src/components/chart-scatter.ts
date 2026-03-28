/**
 * <chart-scatter> — Scatter / Bubble chart Web Component.
 *
 * Renders scatter plots with SVG inside Shadow DOM.
 * Set min-bubble-radius + max-bubble-radius for bubble mode (when data has `r` values).
 *
 * Usage (declarative):
 *   <chart-scatter
 *     title="Height vs Weight"
 *     datasets='[{"label":"Group A","data":[{"x":10,"y":20},{"x":30,"y":40}]}]'
 *   ></chart-scatter>
 */

import {
  TEXT_PRIMARY,
  SURFACE_PRIMARY,
  FONT_PRIMARY,
  TYPE_HEADING_06,
  TYPE_BODY_03,
} from "@maneki/foundation";

import type {
  ScatterDataset,
  ScatterChartOptions,
  LegendItem,
} from "../core/types.js";
import { linearScale } from "../core/scales.js";
import { renderYGridLines, renderYLabels, renderXGridLines, renderXLabels } from "../core/axis.js";
import { computeCartesianLayout } from "../core/math.js";
import { getDatasetColor, GRID_LINE_COLOR } from "../core/colors.js";
import { renderChartHeader } from "../core/header.js";

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX_W = 960;
const VIEWBOX_H = 960;

const OBSERVED_ATTRS = [
  "title", "datasets", "show-grid", "show-legend", "show-tooltips",
  "point-radius", "min-bubble-radius", "max-bubble-radius", "description",
] as const;

const STYLES = /* css */ `
:host { display: block; width: 100%; contain: layout style; }
svg { width: 100%; height: auto; display: block; font-family: var(--chart-font, ${FONT_PRIMARY}); }
.chart-title { ${TYPE_HEADING_06} font-size: var(--chart-title-font-size, 16px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-axis-label { ${TYPE_BODY_03} font-size: var(--chart-axis-font-size, 12px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-legend-label { ${TYPE_BODY_03} font-size: var(--chart-legend-font-size, 12px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-point { transition: opacity 0.15s ease; cursor: pointer; }
.chart-point:hover { opacity: 0.8; }
.chart-tooltip {
  position: absolute; pointer-events: none;
  background: var(--chart-tooltip-bg, ${SURFACE_PRIMARY});
  color: var(--chart-text-color, ${TEXT_PRIMARY});
  border: 1px solid var(--chart-grid-color, ${GRID_LINE_COLOR});
  padding: 6px 10px; border-radius: 4px;
  font-family: var(--chart-font, ${FONT_PRIMARY}); ${TYPE_BODY_03}
  white-space: nowrap; opacity: 0; transition: opacity 0.15s ease;
  z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.chart-tooltip.visible { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .chart-point, .chart-tooltip { transition-duration: 0.01ms !important; }
}
`;

function tryParseJSON<T>(v: string | null): T | null {
  if (!v) return null;
  try { return JSON.parse(v) as T; } catch { return null; }
}
function boolAttr(el: Element, n: string, d: boolean): boolean {
  if (!el.hasAttribute(n)) return d;
  return el.getAttribute(n) !== "false";
}
function numAttr(el: Element, n: string): number | undefined {
  const v = el.getAttribute(n);
  if (v === null) return undefined;
  const num = Number(v);
  return isNaN(num) ? undefined : num;
}

class ChartScatterElement extends HTMLElement {
  private _datasets: ScatterDataset[] = [];
  private _options: ScatterChartOptions = {};
  private _svg: SVGSVGElement;
  private _tooltip: HTMLDivElement;
  private _renderScheduled = false;

  static get observedAttributes(): readonly string[] { return OBSERVED_ATTRS; }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);
    this._svg = document.createElementNS(NS, "svg");
    this._svg.setAttribute("viewBox", `0 0 ${VIEWBOX_W} ${VIEWBOX_H}`);
    this._svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    shadow.appendChild(this._svg);
    this._tooltip = document.createElement("div");
    this._tooltip.className = "chart-tooltip";
    shadow.appendChild(this._tooltip);
  }

  get datasets(): ScatterDataset[] { return this._datasets; }
  set datasets(v: ScatterDataset[]) { this._datasets = v; this._scheduleRender(); }
  get options(): ScatterChartOptions { return this._options; }
  set options(v: ScatterChartOptions) { this._options = v; this._scheduleRender(); }

  attributeChangedCallback(_: string, o: string | null, n: string | null): void {
    if (o === n) return;
    this._syncFromAttributes();
    this._scheduleRender();
  }

  private _syncFromAttributes(): void {
    const datasetsAttr = tryParseJSON<ScatterDataset[]>(this.getAttribute("datasets"));
    if (datasetsAttr) this._datasets = datasetsAttr;
    this._options = {
      title: this.getAttribute("title") ?? this._options.title,
      description: this.getAttribute("description") ?? this._options.description,
      showGrid: boolAttr(this, "show-grid", this._options.showGrid ?? true),
      showLegend: boolAttr(this, "show-legend", this._options.showLegend ?? true),
      showTooltips: boolAttr(this, "show-tooltips", this._options.showTooltips ?? true),
      pointRadius: numAttr(this, "point-radius") ?? this._options.pointRadius,
      minBubbleRadius: numAttr(this, "min-bubble-radius") ?? this._options.minBubbleRadius,
      maxBubbleRadius: numAttr(this, "max-bubble-radius") ?? this._options.maxBubbleRadius,
    };
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "img");
    this._syncFromAttributes();
    this._scheduleRender();
  }

  disconnectedCallback(): void {}

  private _scheduleRender(): void {
    if (this._renderScheduled) return;
    this._renderScheduled = true;
    requestAnimationFrame(() => { this._renderScheduled = false; this._render(); });
  }

  private _render(): void {
    const svg = this._svg;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const { datasets, _options: opts } = this;
    if (!datasets.length) return;

    // Accessibility
    const titleSvg = document.createElementNS(NS, "title");
    titleSvg.textContent = opts.title ?? "Scatter Chart";
    svg.appendChild(titleSvg);
    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Scatter Chart");
    }

    const colors = datasets.map((ds, i) => getDatasetColor(i, ds.color));
    const legendItems: LegendItem[] = datasets.map((ds, i) => ({
      label: ds.label, color: colors[i],
    }));

    // Detect bubble mode
    const isBubble = datasets.some(ds => ds.data.some(p => p.r !== undefined && p.r > 0));

    // Compute data extents
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    let rMin = Infinity, rMax = -Infinity;
    for (const ds of datasets) {
      for (const p of ds.data) {
        if (p.x < xMin) xMin = p.x;
        if (p.x > xMax) xMax = p.x;
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
        if (p.r !== undefined) {
          if (p.r < rMin) rMin = p.r;
          if (p.r > rMax) rMax = p.r;
        }
      }
    }
    if (xMin === Infinity) return;

    const textColor = `var(--chart-text-color, ${TEXT_PRIMARY})`;
    const gridColor = `var(--chart-grid-color, ${GRID_LINE_COLOR})`;

    // Header (title + legend)
    const header = renderChartHeader(svg, {
      title: opts.title,
      legendItems,
      showLegend: opts.showLegend,
      viewBoxWidth: VIEWBOX_W,
      textColor,
    });

    // Compute layout — header already rendered, use its height as top padding
    const layout = computeCartesianLayout(VIEWBOX_W, VIEWBOX_H, {
      padding: { top: header.height },
    });

    const xScale = linearScale(xMin, xMax, layout.plot.width, { ...opts.xAxis, beginAtZero: opts.xAxis?.beginAtZero ?? false });
    const yScale = linearScale(yMin, yMax, layout.plot.height, { ...opts.yAxis, beginAtZero: opts.yAxis?.beginAtZero ?? false });

    // Groups
    const gridGroup = document.createElementNS(NS, "g");
    svg.appendChild(gridGroup);
    const pointGroup = document.createElementNS(NS, "g");
    svg.appendChild(pointGroup);
    const axisGroup = document.createElementNS(NS, "g");
    svg.appendChild(axisGroup);

    // Grid
    if (opts.showGrid !== false) {
      renderYGridLines(gridGroup, yScale.ticks, layout.plot, gridColor);
      const xPositions = xScale.ticks.map(t => t.position);
      renderXGridLines(gridGroup, xPositions, layout.plot, gridColor);
    }

    // Axis labels
    renderYLabels(axisGroup, yScale.ticks, layout.plot, textColor);
    const xPositions = xScale.ticks.map(t => t.position);
    const xLabels = xScale.ticks.map(t => t.label);
    renderXLabels(axisGroup, xLabels, xPositions, layout.plot, textColor);

    // Points
    const defaultRadius = opts.pointRadius ?? 5;
    const minBR = opts.minBubbleRadius ?? 4;
    const maxBR = opts.maxBubbleRadius ?? 40;

    for (let di = 0; di < datasets.length; di++) {
      const ds = datasets[di];
      const color = colors[di];

      for (let pi = 0; pi < ds.data.length; pi++) {
        const pt = ds.data[pi];
        const px = layout.plot.x + xScale.scale(pt.x);
        const py = layout.plot.y + layout.plot.height - yScale.scale(pt.y);

        let r = defaultRadius;
        if (isBubble && pt.r !== undefined) {
          // Scale r linearly between minBR and maxBR
          r = rMax === rMin
            ? (minBR + maxBR) / 2
            : minBR + ((pt.r - rMin) / (rMax - rMin)) * (maxBR - minBR);
        }

        const circle = document.createElementNS(NS, "circle");
        circle.setAttribute("cx", String(px));
        circle.setAttribute("cy", String(py));
        circle.setAttribute("r", String(r));
        circle.setAttribute("fill", color);
        circle.setAttribute("opacity", isBubble ? "0.6" : "1");
        circle.setAttribute("class", "chart-point");
        circle.dataset.datasetIndex = String(di);
        circle.dataset.pointIndex = String(pi);
        circle.dataset.x = String(pt.x);
        circle.dataset.y = String(pt.y);
        if (pt.r !== undefined) circle.dataset.r = String(pt.r);

        circle.addEventListener("mouseenter", this._onPointEnter);
        circle.addEventListener("mouseleave", this._onPointLeave);

        pointGroup.appendChild(circle);
      }
    }
  }

  private _onPointEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;
    const c = e.target as SVGCircleElement;
    const di = Number(c.dataset.datasetIndex);
    const x = c.dataset.x;
    const y = c.dataset.y;
    const r = c.dataset.r;
    let text = `${this._datasets[di].label}: (${x}, ${y})`;
    if (r !== undefined) text += ` r=${r}`;
    this._tooltip.textContent = text;
    this._tooltip.classList.add("visible");
    const hostRect = this.getBoundingClientRect();
    const ptRect = c.getBoundingClientRect();
    this._tooltip.style.left = `${ptRect.left + ptRect.width / 2 - hostRect.left}px`;
    this._tooltip.style.top = `${ptRect.top - hostRect.top - 8}px`;
    this._tooltip.style.transform = "translate(-50%, -100%)";
  };

  private _onPointLeave = (): void => {
    this._tooltip.classList.remove("visible");
  };
}

customElements.define("chart-scatter", ChartScatterElement);
export { ChartScatterElement };
