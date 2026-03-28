/**
 * <chart-stacked-horizontal-bar> — Stacked horizontal bar chart.
 *
 * Datasets stack left-to-right within each category row.
 *
 * Usage (declarative):
 *   <chart-stacked-horizontal-bar
 *     title="Task Status"
 *     labels='["Team A","Team B","Team C"]'
 *     datasets='[{"label":"Done","data":[30,45,25]},{"label":"In Progress","data":[15,10,20]},{"label":"Todo","data":[5,5,15]}]'
 *   ></chart-stacked-horizontal-bar>
 */

import {
  TEXT_PRIMARY,
  SURFACE_PRIMARY,
  FONT_PRIMARY,
  TYPE_HEADING_06,
  TYPE_BODY_03,
} from "@maneki/foundation";

import type { Dataset, BarChartOptions, LegendItem, ChartEventDetail } from "../core/types.js";
import { linearScale, categoryScale } from "../core/scales.js";
import { renderChartHeader } from "../core/header.js";
import { getDatasetColor, GRID_LINE_COLOR } from "../core/colors.js";

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX_W = 960;
const VIEWBOX_H = 960;

const OBSERVED_ATTRS = [
  "title", "labels", "datasets", "show-grid", "show-legend",
  "show-tooltips", "description",
] as const;

const STYLES = /* css */ `
:host { display: block; width: 100%; contain: layout style; }
svg { width: 100%; height: auto; display: block; font-family: var(--chart-font, ${FONT_PRIMARY}); }
.chart-title { ${TYPE_HEADING_06} font-size: var(--chart-title-font-size, 16px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-axis-label { ${TYPE_BODY_03} font-size: var(--chart-axis-font-size, 12px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-legend-label { ${TYPE_BODY_03} font-size: var(--chart-legend-font-size, 12px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-bar { transition: opacity 0.15s ease; cursor: pointer; }
.chart-bar:hover { opacity: 0.8; }
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
  .chart-bar, .chart-tooltip { transition-duration: 0.01ms !important; }
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

class ChartStackedHorizontalBarElement extends HTMLElement {
  private _datasets: Dataset[] = [];
  private _options: BarChartOptions = { labels: [] };
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

  get datasets(): Dataset[] { return this._datasets; }
  set datasets(v: Dataset[]) { this._datasets = v; this._scheduleRender(); }
  get options(): BarChartOptions { return this._options; }
  set options(v: BarChartOptions) { this._options = v; this._scheduleRender(); }

  attributeChangedCallback(_: string, o: string | null, n: string | null): void {
    if (o === n) return;
    this._syncFromAttributes();
    this._scheduleRender();
  }

  private _syncFromAttributes(): void {
    const labelsAttr = tryParseJSON<string[]>(this.getAttribute("labels"));
    const datasetsAttr = tryParseJSON<Dataset[]>(this.getAttribute("datasets"));
    if (datasetsAttr) this._datasets = datasetsAttr;
    this._options = {
      labels: labelsAttr ?? this._options.labels,
      title: this.getAttribute("title") ?? this._options.title,
      description: this.getAttribute("description") ?? this._options.description,
      showGrid: boolAttr(this, "show-grid", this._options.showGrid ?? true),
      showLegend: boolAttr(this, "show-legend", this._options.showLegend ?? true),
      showTooltips: boolAttr(this, "show-tooltips", this._options.showTooltips ?? true),
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
    if (!datasets.length || !opts.labels.length) return;

    const titleSvg = document.createElementNS(NS, "title");
    titleSvg.textContent = opts.title ?? "Stacked Horizontal Bar Chart";
    svg.appendChild(titleSvg);
    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Stacked Horizontal Bar Chart");
    }

    const colors = datasets.map((ds, i) => getDatasetColor(i, ds.color));
    const legendItems: LegendItem[] = datasets.map((ds, i) => ({
      label: ds.label, color: colors[i],
    }));

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

    // Layout
    const leftPad = 120;
    const rightPad = 40;
    const bottomPad = 60;
    const plotX = leftPad;
    const plotY = header.height;
    const plotW = VIEWBOX_W - leftPad - rightPad;
    const plotH = VIEWBOX_H - header.height - bottomPad;

    // Compute stacked max
    const numCategories = opts.labels.length;
    let stackMax = 0;
    for (let ci = 0; ci < numCategories; ci++) {
      let sum = 0;
      for (const ds of datasets) {
        const v = ds.data[ci];
        if (v !== null && typeof v === "number") sum += v;
      }
      if (sum > stackMax) stackMax = sum;
    }

    const xScale = linearScale(0, stackMax, plotW);
    const yScale = categoryScale(opts.labels, plotH, 0.1);

    // Grid: vertical lines
    if (opts.showGrid !== false) {
      for (const tick of xScale.ticks) {
        const x = plotX + tick.position;
        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", String(x));
        line.setAttribute("y1", String(plotY));
        line.setAttribute("x2", String(x));
        line.setAttribute("y2", String(plotY + plotH));
        line.setAttribute("stroke", gridColor);
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);
      }
    }

    // X-axis labels (bottom)
    for (const tick of xScale.ticks) {
      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", String(plotX + tick.position));
      text.setAttribute("y", String(plotY + plotH + 16));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "hanging");
      text.setAttribute("fill", textColor);
      text.setAttribute("class", "chart-axis-label");
      text.textContent = tick.label;
      svg.appendChild(text);
    }

    // Y-axis labels (left)
    for (let i = 0; i < opts.labels.length; i++) {
      const y = plotY + yScale.scale(i);
      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", String(plotX - 8));
      text.setAttribute("y", String(y));
      text.setAttribute("text-anchor", "end");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", textColor);
      text.setAttribute("class", "chart-axis-label");
      text.textContent = opts.labels[i];
      svg.appendChild(text);
    }

    // Stacked bars
    const barHeightFrac = 0.6;
    const barHeight = yScale.bandWidth * barHeightFrac;

    for (let ci = 0; ci < numCategories; ci++) {
      let stackX = 0;
      const centerY = plotY + yScale.scale(ci);
      const barY = centerY - barHeight / 2;

      for (let di = 0; di < datasets.length; di++) {
        const value = datasets[di].data[ci];
        if (value === null || typeof value !== "number" || value <= 0) continue;

        const barW = xScale.scale(value) - xScale.scale(0);
        const barX = plotX + xScale.scale(stackX);

        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", String(barX));
        rect.setAttribute("y", String(barY));
        rect.setAttribute("width", String(barW));
        rect.setAttribute("height", String(barHeight));
        rect.setAttribute("fill", colors[di]);
        rect.setAttribute("class", "chart-bar");
        rect.dataset.datasetIndex = String(di);
        rect.dataset.dataIndex = String(ci);
        rect.dataset.value = String(value);

        rect.addEventListener("mouseenter", this._onBarEnter);
        rect.addEventListener("mouseleave", this._onBarLeave);
        rect.addEventListener("click", this._onBarClick);

        svg.appendChild(rect);
        stackX += value;
      }
    }
  }

  private _onBarEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;
    const rect = e.target as SVGRectElement;
    const di = Number(rect.dataset.datasetIndex);
    const ci = Number(rect.dataset.dataIndex);
    this._tooltip.textContent = `${this._datasets[di].label}: ${rect.dataset.value} (${this._options.labels[ci]})`;
    this._tooltip.classList.add("visible");
    const hostRect = this.getBoundingClientRect();
    const barRect = rect.getBoundingClientRect();
    this._tooltip.style.left = `${barRect.right - hostRect.left + 8}px`;
    this._tooltip.style.top = `${barRect.top + barRect.height / 2 - hostRect.top}px`;
    this._tooltip.style.transform = "translateY(-50%)";
  };

  private _onBarLeave = (): void => {
    this._tooltip.classList.remove("visible");
  };

  private _onBarClick = (e: Event): void => {
    const rect = e.target as SVGRectElement;
    const di = Number(rect.dataset.datasetIndex);
    const ci = Number(rect.dataset.dataIndex);
    this.dispatchEvent(new CustomEvent<ChartEventDetail>("chart-click", {
      detail: {
        datasetIndex: di, dataIndex: ci,
        value: this._datasets[di].data[ci],
        datasetLabel: this._datasets[di].label,
        categoryLabel: this._options.labels[ci],
      },
      bubbles: true, composed: true,
    }));
  };
}

customElements.define("chart-stacked-horizontal-bar", ChartStackedHorizontalBarElement);
export { ChartStackedHorizontalBarElement };
