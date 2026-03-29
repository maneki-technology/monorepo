/**
 * <chart-radar> — Radar/Spider chart Web Component.
 *
 * Renders radar charts with SVG inside Shadow DOM.
 * Each axis radiates from center; data forms a polygon.
 *
 * Usage (declarative):
 *   <chart-radar
 *     title="Skills"
 *     axes='[{"label":"JS"},{"label":"CSS"},{"label":"HTML"},{"label":"React"},{"label":"Node"}]'
 *     datasets='[{"label":"Alice","data":[90,80,95,70,85]},{"label":"Bob","data":[70,90,80,85,75]}]'
 *   ></chart-radar>
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
  RadarChartOptions,
  RadarAxis,
  LegendItem,
} from "../core/types.js";
import { CIRCULAR_LEGEND } from "../core/legend.js";
import { getDatasetColor, GRID_LINE_COLOR } from "../core/colors.js";
import { renderChartHeader } from "../core/header.js";

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX = 960;
const TAU = Math.PI * 2;

const OBSERVED_ATTRS = [
  "title", "axes", "datasets", "show-legend", "show-tooltips",
  "show-points", "point-radius", "line-width", "levels",
  "fill", "fill-opacity", "description",
] as const;

const STYLES = /* css */ `
:host { display: block; width: 100%; contain: layout style; }
svg { width: 100%; height: auto; display: block; font-family: var(--chart-font, ${FONT_PRIMARY}); }
.chart-title { ${TYPE_HEADING_06} font-size: var(--chart-title-font-size, 24px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-axis-label { ${TYPE_BODY_03} font-size: var(--chart-axis-font-size, 18px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-legend-label { ${TYPE_BODY_03} font-size: var(--chart-legend-font-size, 18px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
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

class ChartRadarElement extends HTMLElement {
  private _datasets: Dataset[] = [];
  private _options: RadarChartOptions = { axes: [] };
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
    this._svg.setAttribute("viewBox", `0 0 ${VIEWBOX} ${VIEWBOX}`);
    this._svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    shadow.appendChild(this._svg);
    this._tooltip = document.createElement("div");
    this._tooltip.className = "chart-tooltip";
    shadow.appendChild(this._tooltip);
  }

  get datasets(): Dataset[] { return this._datasets; }
  set datasets(v: Dataset[]) { this._datasets = v; this._scheduleRender(); }
  get options(): RadarChartOptions { return this._options; }
  set options(v: RadarChartOptions) { this._options = v; this._scheduleRender(); }

  attributeChangedCallback(_: string, o: string | null, n: string | null): void {
    if (o === n) return;
    this._syncFromAttributes();
    this._scheduleRender();
  }

  private _syncFromAttributes(): void {
    const axesAttr = tryParseJSON<RadarAxis[]>(this.getAttribute("axes"));
    const datasetsAttr = tryParseJSON<Dataset[]>(this.getAttribute("datasets"));
    if (datasetsAttr) this._datasets = datasetsAttr;
    this._options = {
      axes: axesAttr ?? this._options.axes,
      title: this.getAttribute("title") ?? this._options.title,
      description: this.getAttribute("description") ?? this._options.description,
      showLegend: boolAttr(this, "show-legend", this._options.showLegend ?? true),
      showTooltips: boolAttr(this, "show-tooltips", this._options.showTooltips ?? true),
      showPoints: boolAttr(this, "show-points", this._options.showPoints ?? true),
      fill: boolAttr(this, "fill", this._options.fill ?? true),
      levels: numAttr(this, "levels") ?? this._options.levels,
      fillOpacity: numAttr(this, "fill-opacity") ?? this._options.fillOpacity,
      lineWidth: numAttr(this, "line-width") ?? this._options.lineWidth,
      pointRadius: numAttr(this, "point-radius") ?? this._options.pointRadius,
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
    const axisCount = opts.axes.length;
    if (!datasets.length || axisCount < 3) return;

    // Accessibility
    const titleEl = document.createElementNS(NS, "title");
    titleEl.textContent = opts.title ?? "Radar Chart";
    svg.appendChild(titleEl);
    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Radar Chart");
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
      viewBoxWidth: VIEWBOX,
      textColor,
      legendConfig: CIRCULAR_LEGEND,
      legendPadX: 40,
    });
    const headerH = header.height;

    const availableH = VIEWBOX - headerH - 60;
    const availableW = VIEWBOX - 120;
    const radius = Math.min(availableW, availableH) / 2;
    const cx = VIEWBOX / 2;
    const cy = headerH + 30 + availableH / 2;

    // Compute max values per axis
    const maxValues = opts.axes.map((axis, ai) => {
      if (axis.max !== undefined) return axis.max;
      let m = 0;
      for (const ds of datasets) {
        const v = ds.data[ai];
        if (v !== null && typeof v === "number" && v > m) m = v;
      }
      return m || 1;
    });

    const levels = opts.levels ?? 5;
    const angleStep = TAU / axisCount;

    // Grid group
    const gridGroup = document.createElementNS(NS, "g");
    gridGroup.setAttribute("class", "chart-grid");
    svg.appendChild(gridGroup);

    // Concentric grid polygons
    for (let l = 1; l <= levels; l++) {
      const r = (radius * l) / levels;
      const points: string[] = [];
      for (let a = 0; a < axisCount; a++) {
        const angle = -Math.PI / 2 + a * angleStep;
        points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      const polygon = document.createElementNS(NS, "polygon");
      polygon.setAttribute("points", points.join(" "));
      polygon.setAttribute("fill", "none");
      polygon.setAttribute("stroke", gridColor);
      polygon.setAttribute("stroke-width", "1");
      gridGroup.appendChild(polygon);
    }

    // Axis spokes + labels
    const labelPad = 16;
    for (let a = 0; a < axisCount; a++) {
      const angle = -Math.PI / 2 + a * angleStep;
      const x2 = cx + radius * Math.cos(angle);
      const y2 = cy + radius * Math.sin(angle);

      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", String(cx));
      line.setAttribute("y1", String(cy));
      line.setAttribute("x2", String(x2));
      line.setAttribute("y2", String(y2));
      line.setAttribute("stroke", gridColor);
      line.setAttribute("stroke-width", "1");
      gridGroup.appendChild(line);

      // Label
      const lx = cx + (radius + labelPad) * Math.cos(angle);
      const ly = cy + (radius + labelPad) * Math.sin(angle);
      const text = document.createElementNS(NS, "text");
      text.setAttribute("x", String(lx));
      text.setAttribute("y", String(ly));
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", textColor);
      text.setAttribute("class", "chart-axis-label");

      // Anchor based on position
      const cos = Math.cos(angle);
      if (cos < -0.1) text.setAttribute("text-anchor", "end");
      else if (cos > 0.1) text.setAttribute("text-anchor", "start");
      else text.setAttribute("text-anchor", "middle");

      text.textContent = opts.axes[a].label;
      gridGroup.appendChild(text);
    }

    // Data polygons + points
    const fillOpacity = opts.fillOpacity ?? 0.15;
    const lineWidth = opts.lineWidth ?? 2;
    const pointRadius = opts.pointRadius ?? 4;
    const showPoints = opts.showPoints !== false;
    const showFill = opts.fill !== false;

    for (let di = 0; di < datasets.length; di++) {
      const ds = datasets[di];
      const color = colors[di];
      const pts: { x: number; y: number; ai: number; value: number }[] = [];

      for (let a = 0; a < axisCount; a++) {
        const value = ds.data[a];
        if (value === null || typeof value !== "number") continue;
        const frac = value / maxValues[a];
        const angle = -Math.PI / 2 + a * angleStep;
        pts.push({
          x: cx + radius * frac * Math.cos(angle),
          y: cy + radius * frac * Math.sin(angle),
          ai: a,
          value,
        });
      }

      if (pts.length < 3) continue;

      const polyPoints = pts.map(p => `${p.x},${p.y}`).join(" ");

      // Fill
      if (showFill) {
        const fill = document.createElementNS(NS, "polygon");
        fill.setAttribute("points", polyPoints);
        fill.setAttribute("fill", color);
        fill.setAttribute("opacity", String(fillOpacity));
        svg.appendChild(fill);
      }

      // Outline
      const outline = document.createElementNS(NS, "polygon");
      outline.setAttribute("points", polyPoints);
      outline.setAttribute("fill", "none");
      outline.setAttribute("stroke", color);
      outline.setAttribute("stroke-width", String(lineWidth));
      outline.setAttribute("stroke-linejoin", "round");
      svg.appendChild(outline);

      // Points
      if (showPoints) {
        for (const pt of pts) {
          const circle = document.createElementNS(NS, "circle");
          circle.setAttribute("cx", String(pt.x));
          circle.setAttribute("cy", String(pt.y));
          circle.setAttribute("r", String(pointRadius));
          circle.setAttribute("fill", color);
          circle.setAttribute("stroke", `var(--chart-tooltip-bg, ${SURFACE_PRIMARY})`);
          circle.setAttribute("stroke-width", "2");
          circle.setAttribute("class", "chart-point");
          circle.dataset.datasetIndex = String(di);
          circle.dataset.axisIndex = String(pt.ai);
          circle.dataset.value = String(pt.value);
          circle.addEventListener("mouseenter", this._onPointEnter);
          circle.addEventListener("mouseleave", this._onPointLeave);
          svg.appendChild(circle);
        }
      }
    }
  }

  private _onPointEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;
    const c = e.target as SVGCircleElement;
    const di = Number(c.dataset.datasetIndex);
    const ai = Number(c.dataset.axisIndex);
    const value = c.dataset.value;
    this._tooltip.textContent = `${this._datasets[di].label}: ${value} (${this._options.axes[ai].label})`;
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

customElements.define("chart-radar", ChartRadarElement);
export { ChartRadarElement };
