/**
 * <chart-multitype> — Bar + Line composite chart Web Component.
 *
 * Renders bars and lines on the same cartesian grid.
 * Each dataset specifies `type: "bar" | "line"`.
 *
 * Usage (declarative):
 *   <chart-multitype
 *     title="Revenue & Growth"
 *     labels='["Q1","Q2","Q3","Q4"]'
 *     datasets='[{"label":"Revenue","data":[200,300,250,400],"type":"bar"},{"label":"Growth %","data":[10,15,12,20],"type":"line","color":2}]'
 *   ></chart-multitype>
 */

import {
  TEXT_PRIMARY,
  SURFACE_PRIMARY,
  FONT_PRIMARY,
  TYPE_HEADING_06,
  TYPE_BODY_03,
} from "@maneki/foundation";

import type {
  AxisConfig,
  LegendItem,
  DataValue,
} from "../core/types.js";
import { linearScale, categoryScale } from "../core/scales.js";
import { renderYGridLines, renderYLabels, renderXLabels } from "../core/axis.js";
import { renderChartHeader } from "../core/header.js";
import { getDatasetColor, GRID_LINE_COLOR } from "../core/colors.js";

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX_W = 960;
const VIEWBOX_H = 960;

export interface MultitypeDataset {
  label: string;
  data: DataValue[];
  type: "bar" | "line";
  color?: string | number;
}

export interface MultitypeChartOptions {
  title?: string;
  labels: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltips?: boolean;
  showPoints?: boolean;
  pointRadius?: number;
  lineWidth?: number;
  tension?: number;
  labelRotation?: number;
  yAxis?: AxisConfig;
  description?: string;
}

const OBSERVED_ATTRS = [
  "title", "labels", "datasets", "show-grid", "show-legend",
  "show-tooltips", "show-points", "point-radius", "line-width",
  "tension", "label-rotation", "description",
] as const;

const STYLES = /* css */ `
:host { display: block; width: 100%; contain: layout style; }
svg { width: 100%; height: auto; display: block; font-family: var(--chart-font, ${FONT_PRIMARY}); }
.chart-title { ${TYPE_HEADING_06} font-size: var(--chart-title-font-size, 16px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-axis-label { ${TYPE_BODY_03} font-size: var(--chart-axis-font-size, 12px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-legend-label { ${TYPE_BODY_03} font-size: var(--chart-legend-font-size, 12px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-bar { transition: opacity 0.15s ease; cursor: pointer; }
.chart-bar:hover { opacity: 0.8; }
.chart-point { transition: r 0.15s ease; cursor: pointer; }
.chart-point:hover { r: 6; }
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
  .chart-bar, .chart-point, .chart-tooltip { transition-duration: 0.01ms !important; }
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

function smoothPath(points: { x: number; y: number }[], tension: number): string {
  if (points.length < 2) return "";
  const t = Math.max(0, Math.min(1, tension));
  if (t === 0 || points.length === 2) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + ((p2.x - p0.x) * t) / 3;
    const cp1y = p1.y + ((p2.y - p0.y) * t) / 3;
    const cp2x = p2.x - ((p3.x - p1.x) * t) / 3;
    const cp2y = p2.y - ((p3.y - p1.y) * t) / 3;
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

class ChartMultitypeElement extends HTMLElement {
  private _datasets: MultitypeDataset[] = [];
  private _options: MultitypeChartOptions = { labels: [] };
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

  get datasets(): MultitypeDataset[] { return this._datasets; }
  set datasets(v: MultitypeDataset[]) { this._datasets = v; this._scheduleRender(); }
  get options(): MultitypeChartOptions { return this._options; }
  set options(v: MultitypeChartOptions) { this._options = v; this._scheduleRender(); }

  attributeChangedCallback(_: string, o: string | null, n: string | null): void {
    if (o === n) return;
    this._syncFromAttributes();
    this._scheduleRender();
  }

  private _syncFromAttributes(): void {
    const labelsAttr = tryParseJSON<string[]>(this.getAttribute("labels"));
    const datasetsAttr = tryParseJSON<MultitypeDataset[]>(this.getAttribute("datasets"));
    if (datasetsAttr) this._datasets = datasetsAttr;
    this._options = {
      labels: labelsAttr ?? this._options.labels,
      title: this.getAttribute("title") ?? this._options.title,
      description: this.getAttribute("description") ?? this._options.description,
      showGrid: boolAttr(this, "show-grid", this._options.showGrid ?? true),
      showLegend: boolAttr(this, "show-legend", this._options.showLegend ?? true),
      showTooltips: boolAttr(this, "show-tooltips", this._options.showTooltips ?? true),
      showPoints: boolAttr(this, "show-points", this._options.showPoints ?? true),
      labelRotation: numAttr(this, "label-rotation") ?? this._options.labelRotation,
      pointRadius: numAttr(this, "point-radius") ?? this._options.pointRadius,
      lineWidth: numAttr(this, "line-width") ?? this._options.lineWidth,
      tension: numAttr(this, "tension") ?? this._options.tension,
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
    titleSvg.textContent = opts.title ?? "Multitype Chart";
    svg.appendChild(titleSvg);
    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Multitype Chart");
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

    const leftPad = 80;
    const rightPad = 40;
    const bottomPad = 60 + (opts.labelRotation ? Math.sin((opts.labelRotation * Math.PI) / 180) * 50 : 0);

    const plotX = leftPad;
    const plotY = header.height;
    const plotW = VIEWBOX_W - leftPad - rightPad;
    const plotH = VIEWBOX_H - header.height - bottomPad;
    const plot = { x: plotX, y: plotY, width: plotW, height: plotH };

    // Compute extent across all datasets
    let dataMin = Infinity, dataMax = -Infinity;
    for (const ds of datasets) {
      for (const v of ds.data) {
        if (v === null) continue;
        if (v < dataMin) dataMin = v;
        if (v > dataMax) dataMax = v;
      }
    }
    if (dataMin === Infinity) return;

    const yScale = linearScale(dataMin, dataMax, plotH, opts.yAxis);
    const xScale = categoryScale(opts.labels, plotW, 0.1);

    // Grid
    const gridGroup = document.createElementNS(NS, "g");
    svg.appendChild(gridGroup);
    if (opts.showGrid !== false) {
      renderYGridLines(gridGroup, yScale.ticks, plot, gridColor);
    }

    // Bars first (behind lines)
    const barDatasets = datasets.map((ds, i) => ({ ds, i })).filter(d => d.ds.type === "bar");
    const numBarDS = barDatasets.length;
    const groupGap = 0.2;
    const barGap = 0.1;
    const bandWidth = xScale.bandWidth;
    const groupWidth = bandWidth * (1 - groupGap);
    const barWidth = numBarDS > 0 ? groupWidth / numBarDS : 0;
    const innerBarWidth = barWidth * (1 - barGap);
    const barOffset = (barWidth - innerBarWidth) / 2;
    const zeroY = plotY + plotH - yScale.scale(0);

    for (let bi = 0; bi < barDatasets.length; bi++) {
      const { ds, i: di } = barDatasets[bi];
      const color = colors[di];

      for (let ci = 0; ci < ds.data.length; ci++) {
        const value = ds.data[ci];
        if (value === null) continue;

        const categoryX = plotX + xScale.start(ci);
        const groupStart = categoryX + (bandWidth - groupWidth) / 2;
        const barX = groupStart + bi * barWidth + barOffset;
        const valueY = plotY + plotH - yScale.scale(value);
        const barH = Math.abs(valueY - zeroY);
        const barY = value >= 0 ? valueY : zeroY;

        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", String(barX));
        rect.setAttribute("y", String(barY));
        rect.setAttribute("width", String(innerBarWidth));
        rect.setAttribute("height", String(barH));
        rect.setAttribute("fill", color);
        rect.setAttribute("class", "chart-bar");
        rect.dataset.datasetIndex = String(di);
        rect.dataset.dataIndex = String(ci);
        rect.dataset.value = String(value);
        rect.addEventListener("mouseenter", this._onEnter);
        rect.addEventListener("mouseleave", this._onLeave);
        svg.appendChild(rect);
      }
    }

    // Lines on top
    const tension = opts.tension ?? 0;
    const lineWidth = opts.lineWidth ?? 2;
    const pointRadius = opts.pointRadius ?? 4;
    const showPoints = opts.showPoints !== false;

    for (let di = 0; di < datasets.length; di++) {
      const ds = datasets[di];
      if (ds.type !== "line") continue;
      const color = colors[di];

      const points: { x: number; y: number; ci: number; value: number }[] = [];
      for (let ci = 0; ci < ds.data.length; ci++) {
        const value = ds.data[ci];
        if (value === null) continue;
        points.push({
          x: plotX + xScale.scale(ci),
          y: plotY + plotH - yScale.scale(value),
          ci,
          value,
        });
      }

      if (points.length < 2) continue;

      const pathD = smoothPath(points, tension);
      const line = document.createElementNS(NS, "path");
      line.setAttribute("d", pathD);
      line.setAttribute("fill", "none");
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", String(lineWidth));
      line.setAttribute("stroke-linejoin", "round");
      line.setAttribute("stroke-linecap", "round");
      svg.appendChild(line);

      if (showPoints) {
        for (const pt of points) {
          const circle = document.createElementNS(NS, "circle");
          circle.setAttribute("cx", String(pt.x));
          circle.setAttribute("cy", String(pt.y));
          circle.setAttribute("r", String(pointRadius));
          circle.setAttribute("fill", color);
          circle.setAttribute("stroke", `var(--chart-tooltip-bg, ${SURFACE_PRIMARY})`);
          circle.setAttribute("stroke-width", "2");
          circle.setAttribute("class", "chart-point");
          circle.dataset.datasetIndex = String(di);
          circle.dataset.dataIndex = String(pt.ci);
          circle.dataset.value = String(pt.value);
          circle.addEventListener("mouseenter", this._onEnter);
          circle.addEventListener("mouseleave", this._onLeave);
          svg.appendChild(circle);
        }
      }
    }

    // Axis labels (on top of everything)
    const axisGroup = document.createElementNS(NS, "g");
    svg.appendChild(axisGroup);
    renderYLabels(axisGroup, yScale.ticks, plot, textColor);
    const xPositions = opts.labels.map((_, i) => xScale.scale(i));
    renderXLabels(axisGroup, opts.labels, xPositions, plot, textColor, opts.labelRotation ?? 0);
  }

  private _onEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;
    const el = e.target as SVGElement;
    const di = Number(el.dataset.datasetIndex);
    const ci = Number(el.dataset.dataIndex);
    const value = el.dataset.value;
    this._tooltip.textContent = `${this._datasets[di].label}: ${value} (${this._options.labels[ci]})`;
    this._tooltip.classList.add("visible");
    const hostRect = this.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    this._tooltip.style.left = `${elRect.left + elRect.width / 2 - hostRect.left}px`;
    this._tooltip.style.top = `${elRect.top - hostRect.top - 8}px`;
    this._tooltip.style.transform = "translate(-50%, -100%)";
  };

  private _onLeave = (): void => {
    this._tooltip.classList.remove("visible");
  };
}

customElements.define("chart-multitype", ChartMultitypeElement);
export { ChartMultitypeElement };
