/**
 * <chart-line> — Line chart Web Component.
 *
 * Renders line/area charts with SVG inside Shadow DOM.
 * Supports multiple datasets, data points, area fill, curved lines,
 * tooltips, and dark mode via CSS custom properties.
 *
 * Usage (declarative):
 *   <chart-line
 *     title="Monthly Revenue"
 *     labels='["Jan","Feb","Mar"]'
 *     datasets='[{"label":"Revenue","data":[65,59,80]}]'
 *     fill
 *     tension="0.3"
 *   ></chart-line>
 *
 * Usage (programmatic):
 *   chart.datasets = [{ label: 'Revenue', data: [65, 59, 80] }];
 *   chart.options = { title: 'Monthly Revenue', labels: ['Jan', 'Feb', 'Mar'], fill: true };
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
  LineChartOptions,
  LegendItem,
  ChartEventDetail,
} from "../core/types.js";
import { linearScale, categoryScale, dataExtent } from "../core/scales.js";
import { renderYGridLines, renderYLabels, renderXGridLines, renderXLabels } from "../core/axis.js";
import { computeCartesianLayout } from "../core/math.js";
import { getDatasetColor, GRID_LINE_COLOR } from "../core/colors.js";
import { renderChartHeader } from "../core/header.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX_W = 960;
const VIEWBOX_H = 960;

// ---------------------------------------------------------------------------
// Observed attributes
// ---------------------------------------------------------------------------

const OBSERVED_ATTRS = [
  "title",
  "labels",
  "datasets",
  "show-grid",
  "show-legend",
  "show-tooltips",
  "show-points",
  "point-radius",
  "line-width",
  "label-rotation",
  "fill",
  "gradient",
  "tension",
  "tension",
  "description",
] as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const STYLES = /* css */ `
:host {
  display: block;
  width: 100%;
  contain: layout style;
}

svg {
  width: 100%;
  height: auto;
  display: block;
  font-family: var(--chart-font, ${FONT_PRIMARY});
}

.chart-title {
  ${TYPE_HEADING_06}
  font-size: var(--chart-title-font-size, 16px);
  fill: var(--chart-text-color, ${TEXT_PRIMARY});
}

.chart-axis-label {
  ${TYPE_BODY_03}
  font-size: var(--chart-axis-font-size, 12px);
  fill: var(--chart-text-color, ${TEXT_PRIMARY});
}

.chart-legend-label {
  ${TYPE_BODY_03}
  font-size: var(--chart-legend-font-size, 12px);
  fill: var(--chart-text-color, ${TEXT_PRIMARY});
}

.chart-point {
  transition: r 0.15s ease;
  cursor: pointer;
}

.chart-point:hover {
  r: 6;
}

.chart-tooltip {
  position: absolute;
  pointer-events: none;
  background: var(--chart-tooltip-bg, ${SURFACE_PRIMARY});
  color: var(--chart-text-color, ${TEXT_PRIMARY});
  border: 1px solid var(--chart-grid-color, ${GRID_LINE_COLOR});
  padding: 6px 10px;
  border-radius: 4px;
  font-family: var(--chart-font, ${FONT_PRIMARY});
  ${TYPE_BODY_03}
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-tooltip.visible {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .chart-point,
  .chart-tooltip {
    transition-duration: 0.01ms !important;
  }
}
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tryParseJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function boolAttr(el: Element, name: string, defaultValue: boolean): boolean {
  if (!el.hasAttribute(name)) return defaultValue;
  const val = el.getAttribute(name);
  if (val === "false") return false;
  return true;
}

function numAttr(el: Element, name: string): number | undefined {
  const val = el.getAttribute(name);
  if (val === null) return undefined;
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

/**
 * Build a cubic Bézier path through data points with given tension.
 * tension=0 → straight lines, tension=0.4 → smooth, tension=1 → very curved.
 */
function smoothPath(
  points: { x: number; y: number }[],
  tension: number,
): string {
  if (points.length < 2) return "";
  if (tension === 0 || points.length === 2) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  }

  // Clamp tension to 0–1 range
  const t = Math.max(0, Math.min(1, tension));

  let d = `M${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom to cubic Bézier conversion
    const cp1x = p1.x + ((p2.x - p0.x) * t) / 3;
    const cp1y = p1.y + ((p2.y - p0.y) * t) / 3;
    const cp2x = p2.x - ((p3.x - p1.x) * t) / 3;
    const cp2y = p2.y - ((p3.y - p1.y) * t) / 3;

    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return d;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

class ChartLineElement extends HTMLElement {
  private _datasets: Dataset[] = [];
  private _options: LineChartOptions = { labels: [] };
  private _svg: SVGSVGElement;
  private _tooltip: HTMLDivElement;
  private _resizeObserver: ResizeObserver | null = null;
  private _renderScheduled = false;

  static get observedAttributes(): readonly string[] {
    return OBSERVED_ATTRS;
  }

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

  // ── Public property API ─────────────────────────────────────────────────

  get datasets(): Dataset[] {
    return this._datasets;
  }

  set datasets(value: Dataset[]) {
    this._datasets = value;
    this._scheduleRender();
  }

  get options(): LineChartOptions {
    return this._options;
  }

  set options(value: LineChartOptions) {
    this._options = value;
    this._scheduleRender();
  }

  // ── Attribute reflection ────────────────────────────────────────────────

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    this._syncFromAttributes();
    this._scheduleRender();
  }

  private _syncFromAttributes(): void {
    const labelsAttr = tryParseJSON<string[]>(this.getAttribute("labels"));
    const datasetsAttr = tryParseJSON<Dataset[]>(this.getAttribute("datasets"));

    if (datasetsAttr) this._datasets = datasetsAttr;

    const opts: LineChartOptions = {
      labels: labelsAttr ?? this._options.labels,
      title: this.getAttribute("title") ?? this._options.title,
      description: this.getAttribute("description") ?? this._options.description,
      showGrid: boolAttr(this, "show-grid", this._options.showGrid ?? true),
      showLegend: boolAttr(this, "show-legend", this._options.showLegend ?? true),
      showTooltips: boolAttr(this, "show-tooltips", this._options.showTooltips ?? true),
      showPoints: boolAttr(this, "show-points", this._options.showPoints ?? true),
      fill: boolAttr(this, "fill", this._options.fill ?? false),
      gradient: boolAttr(this, "gradient", this._options.gradient ?? false),
    };

    opts.labelRotation = numAttr(this, "label-rotation") ?? this._options.labelRotation;
    opts.pointRadius = numAttr(this, "point-radius") ?? this._options.pointRadius;
    opts.lineWidth = numAttr(this, "line-width") ?? this._options.lineWidth;
    opts.tension = numAttr(this, "tension") ?? this._options.tension;

    this._options = opts;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "img");
    }

    this._resizeObserver = new ResizeObserver(() => {});
    this._resizeObserver.observe(this);

    this._syncFromAttributes();
    this._scheduleRender();
  }

  disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  // ── Render scheduling ──────────────────────────────────────────────────

  private _scheduleRender(): void {
    if (this._renderScheduled) return;
    this._renderScheduled = true;
    requestAnimationFrame(() => {
      this._renderScheduled = false;
      this._render();
    });
  }

  // ── Rendering ───────────────────────────────────────────────────────────

  private _render(): void {
    const svg = this._svg;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const { datasets, _options: opts } = this;
    if (!datasets.length || !opts.labels.length) return;

    // Accessibility
    this._renderAccessibility(svg, opts);

    const colors = datasets.map((ds, i) => getDatasetColor(i, ds.color));
    const legendItems: LegendItem[] = datasets.map((ds, i) => ({
      label: ds.label,
      color: colors[i],
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

    const { min: dataMin, max: dataMax } = dataExtent(datasets);
    const yScale = linearScale(dataMin, dataMax, layout.plot.height, opts.yAxis);
    const xScale = categoryScale(opts.labels, layout.plot.width, 0.05);

    // SVG groups for layering
    const gridGroup = document.createElementNS(NS, "g");
    gridGroup.setAttribute("class", "chart-grid");
    svg.appendChild(gridGroup);

    const areaGroup = document.createElementNS(NS, "g");
    areaGroup.setAttribute("class", "chart-areas");
    svg.appendChild(areaGroup);

    const lineGroup = document.createElementNS(NS, "g");
    lineGroup.setAttribute("class", "chart-lines");
    svg.appendChild(lineGroup);

    const pointGroup = document.createElementNS(NS, "g");
    pointGroup.setAttribute("class", "chart-points");
    svg.appendChild(pointGroup);

    const axisGroup = document.createElementNS(NS, "g");
    axisGroup.setAttribute("class", "chart-axes");
    svg.appendChild(axisGroup);

    // Grid
    const showGrid = opts.showGrid !== false;
    if (showGrid) {
      renderYGridLines(gridGroup, yScale.ticks, layout.plot, gridColor);
      const xGridPositions = opts.labels.map((_, i) => xScale.scale(i));
      renderXGridLines(gridGroup, xGridPositions, layout.plot, gridColor);
    }

    // Axis labels
    const xPositions = opts.labels.map((_, i) => xScale.scale(i));
    renderYLabels(axisGroup, yScale.ticks, layout.plot, textColor);
    renderXLabels(axisGroup, opts.labels, xPositions, layout.plot, textColor, opts.labelRotation ?? 0);

    // Lines, areas, and points
    const tension = opts.tension ?? 0;
    const lineWidth = opts.lineWidth ?? 2;
    const pointRadius = opts.pointRadius ?? 4;
    const showPoints = opts.showPoints !== false;
    const showFill = opts.fill === true || opts.gradient === true;
    const useGradient = opts.gradient === true;
    const plotBottom = layout.plot.y + layout.plot.height;

    // Create <defs> for gradients if needed
    let defs: SVGDefsElement | null = null;
    if (useGradient) {
      defs = document.createElementNS(NS, "defs");
      svg.insertBefore(defs, svg.firstChild);
    }
    for (let di = 0; di < datasets.length; di++) {
      const ds = datasets[di];
      const color = colors[di];

      // Compute pixel positions for non-null data points
      const points: { x: number; y: number; ci: number; value: number }[] = [];
      for (let ci = 0; ci < ds.data.length; ci++) {
        const value = ds.data[ci];
        if (value === null) continue;
        points.push({
          x: layout.plot.x + xScale.scale(ci),
          y: layout.plot.y + layout.plot.height - yScale.scale(value),
          ci,
          value,
        });
      }

      if (points.length < 2) continue;

      const pathD = smoothPath(points, tension);

      // Area fill
      if (showFill) {
        const areaD =
          pathD +
          ` L${points[points.length - 1].x},${plotBottom}` +
          ` L${points[0].x},${plotBottom} Z`;
        const area = document.createElementNS(NS, "path");
        area.setAttribute("d", areaD);

        if (useGradient && defs) {
          // Create vertical gradient: color at top → transparent at bottom
          const gradId = `chart-grad-${di}`;
          const grad = document.createElementNS(NS, "linearGradient");
          grad.setAttribute("id", gradId);
          grad.setAttribute("x1", "0");
          grad.setAttribute("y1", "0");
          grad.setAttribute("x2", "0");
          grad.setAttribute("y2", "1");
          const stop1 = document.createElementNS(NS, "stop");
          stop1.setAttribute("offset", "0%");
          stop1.setAttribute("stop-color", color);
          stop1.setAttribute("stop-opacity", "0.4");
          const stop2 = document.createElementNS(NS, "stop");
          stop2.setAttribute("offset", "100%");
          stop2.setAttribute("stop-color", color);
          stop2.setAttribute("stop-opacity", "0.02");
          grad.appendChild(stop1);
          grad.appendChild(stop2);
          defs.appendChild(grad);
          area.setAttribute("fill", `url(#${gradId})`);
        } else {
          area.setAttribute("fill", color);
          area.setAttribute("opacity", "0.15");
        }

        areaGroup.appendChild(area);
      }

      // Line
      const line = document.createElementNS(NS, "path");
      line.setAttribute("d", pathD);
      line.setAttribute("fill", "none");
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", String(lineWidth));
      line.setAttribute("stroke-linejoin", "round");
      line.setAttribute("stroke-linecap", "round");
      lineGroup.appendChild(line);

      // Data points
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

          circle.addEventListener("mouseenter", this._onPointEnter);
          circle.addEventListener("mouseleave", this._onPointLeave);
          circle.addEventListener("click", this._onPointClick);

          pointGroup.appendChild(circle);
        }
      }
    }
  }

  // ── Accessibility ──────────────────────────────────────────────────────

  private _renderAccessibility(svg: SVGSVGElement, opts: LineChartOptions): void {
    const titleEl = document.createElementNS(NS, "title");
    titleEl.textContent = opts.title ?? "Line Chart";
    svg.appendChild(titleEl);

    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }

    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Line Chart");
    }
  }

  // ── Tooltip handlers ────────────────────────────────────────────────────

  private _onPointEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;

    const circle = e.target as SVGCircleElement;
    const di = Number(circle.dataset.datasetIndex);
    const ci = Number(circle.dataset.dataIndex);
    const value = circle.dataset.value;
    const ds = this._datasets[di];
    const label = this._options.labels[ci] ?? "";

    this._tooltip.textContent = `${ds.label}: ${value} (${label})`;
    this._tooltip.classList.add("visible");

    const hostRect = this.getBoundingClientRect();
    const ptRect = circle.getBoundingClientRect();

    this._tooltip.style.left = `${ptRect.left + ptRect.width / 2 - hostRect.left}px`;
    this._tooltip.style.top = `${ptRect.top - hostRect.top - 8}px`;
    this._tooltip.style.transform = "translate(-50%, -100%)";
  };

  private _onPointLeave = (): void => {
    this._tooltip.classList.remove("visible");
  };

  private _onPointClick = (e: Event): void => {
    const circle = e.target as SVGCircleElement;
    const di = Number(circle.dataset.datasetIndex);
    const ci = Number(circle.dataset.dataIndex);
    const value = this._datasets[di].data[ci];

    const detail: ChartEventDetail = {
      datasetIndex: di,
      dataIndex: ci,
      value,
      datasetLabel: this._datasets[di].label,
      categoryLabel: this._options.labels[ci],
    };

    this.dispatchEvent(
      new CustomEvent("chart-click", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

customElements.define("chart-line", ChartLineElement);

export { ChartLineElement };
export type { LineChartOptions };
