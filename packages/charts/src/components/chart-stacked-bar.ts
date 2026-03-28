/**
 * <chart-stacked-bar> — Stacked bar chart Web Component.
 *
 * Renders stacked vertical bars — datasets stack on top of each other.
 *
 * Usage (declarative):
 *   <chart-stacked-bar
 *     title="Revenue Breakdown"
 *     labels='["Q1","Q2","Q3","Q4"]'
 *     datasets='[{"label":"Product","data":[200,300,250,400]},{"label":"Services","data":[100,150,200,180]}]'
 *   ></chart-stacked-bar>
 */

import {
  TEXT_PRIMARY,
  SURFACE_PRIMARY,
  FONT_PRIMARY,
  TYPE_HEADING_06,
  TYPE_BODY_03,
} from "@maneki/foundation";

import type {
  Dataset,
  BarChartOptions,
  LegendItem,
  ChartEventDetail,
} from "../core/types.js";
import { linearScale, categoryScale } from "../core/scales.js";
import { renderYGridLines, renderYLabels, renderXLabels } from "../core/axis.js";
import { computeCartesianLayout } from "../core/math.js";
import { getDatasetColor, GRID_LINE_COLOR } from "../core/colors.js";
import { renderChartHeader } from "../core/header.js";

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX_W = 960;
const VIEWBOX_H = 960;

const OBSERVED_ATTRS = [
  "title", "labels", "datasets", "show-grid", "show-legend",
  "show-tooltips", "label-rotation", "description",
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
function numAttr(el: Element, n: string): number | undefined {
  const v = el.getAttribute(n);
  if (v === null) return undefined;
  const num = Number(v);
  return isNaN(num) ? undefined : num;
}

class ChartStackedBarElement extends HTMLElement {
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
      labelRotation: numAttr(this, "label-rotation") ?? this._options.labelRotation,
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

    // Accessibility
    const titleSvg = document.createElementNS(NS, "title");
    titleSvg.textContent = opts.title ?? "Stacked Bar Chart";
    svg.appendChild(titleSvg);
    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Stacked Bar Chart");
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

    // Compute layout — header already rendered, use its height as top padding
    const layout = computeCartesianLayout(VIEWBOX_W, VIEWBOX_H, {
      labelRotation: opts.labelRotation,
      padding: { top: header.height },
    });

    // Compute stacked max per category
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

    const yScale = linearScale(0, stackMax, layout.plot.height, opts.yAxis);
    const xScale = categoryScale(opts.labels, layout.plot.width, 0.1);

    // Grid
    const gridGroup = document.createElementNS(NS, "g");
    svg.appendChild(gridGroup);
    if (opts.showGrid !== false) {
      renderYGridLines(gridGroup, yScale.ticks, layout.plot, gridColor);
    }

    // Bars
    const barWidthFrac = 0.6;
    const barWidth = xScale.bandWidth * barWidthFrac;

    for (let ci = 0; ci < numCategories; ci++) {
      let stackY = 0;
      const centerX = layout.plot.x + xScale.scale(ci);
      const barX = centerX - barWidth / 2;

      for (let di = 0; di < datasets.length; di++) {
        const value = datasets[di].data[ci];
        if (value === null || typeof value !== "number" || value <= 0) continue;

        const barH = yScale.scale(value) - yScale.scale(0);
        const barY = layout.plot.y + layout.plot.height - yScale.scale(stackY + value);

        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", String(barX));
        rect.setAttribute("y", String(barY));
        rect.setAttribute("width", String(barWidth));
        rect.setAttribute("height", String(barH));
        rect.setAttribute("fill", colors[di]);
        rect.setAttribute("class", "chart-bar");
        rect.dataset.datasetIndex = String(di);
        rect.dataset.dataIndex = String(ci);
        rect.dataset.value = String(value);

        rect.addEventListener("mouseenter", this._onBarEnter);
        rect.addEventListener("mouseleave", this._onBarLeave);
        rect.addEventListener("click", this._onBarClick);

        svg.appendChild(rect);
        stackY += value;
      }
    }

    // Axis labels
    const axisGroup = document.createElementNS(NS, "g");
    svg.appendChild(axisGroup);
    renderYLabels(axisGroup, yScale.ticks, layout.plot, textColor);
    const xPositions = opts.labels.map((_, i) => xScale.scale(i));
    renderXLabels(axisGroup, opts.labels, xPositions, layout.plot, textColor, opts.labelRotation ?? 0);
  }

  private _onBarEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;
    const rect = e.target as SVGRectElement;
    const di = Number(rect.dataset.datasetIndex);
    const ci = Number(rect.dataset.dataIndex);
    const value = rect.dataset.value;
    this._tooltip.textContent = `${this._datasets[di].label}: ${value} (${this._options.labels[ci]})`;
    this._tooltip.classList.add("visible");
    const hostRect = this.getBoundingClientRect();
    const barRect = rect.getBoundingClientRect();
    this._tooltip.style.left = `${barRect.left + barRect.width / 2 - hostRect.left}px`;
    this._tooltip.style.top = `${barRect.top - hostRect.top - 8}px`;
    this._tooltip.style.transform = "translate(-50%, -100%)";
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

customElements.define("chart-stacked-bar", ChartStackedBarElement);
export { ChartStackedBarElement };
