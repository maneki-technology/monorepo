/**
 * <chart-bar> — Vertical bar chart Web Component.
 *
 * Renders grouped bar charts with SVG inside Shadow DOM.
 * Supports multiple datasets, responsive sizing, tooltips,
 * and dark mode via CSS custom properties.
 *
 * Usage (declarative):
 *   <chart-bar
 *     title="Monthly Sales"
 *     labels='["Jan","Feb","Mar"]'
 *     datasets='[{"label":"Sales","data":[65,59,80]}]'
 *     show-grid
 *     label-rotation="25"
 *   ></chart-bar>
 *
 * Usage (programmatic):
 *   const chart = document.querySelector('chart-bar');
 *   chart.datasets = [{ label: 'Dataset 1', data: [65, 59, 80] }];
 *   chart.options = { title: 'Monthly Sales', labels: ['Jan', 'Feb', 'Mar'] };
 */

import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
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
  "label-rotation",
  "bar-gap",
  "group-gap",
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

.chart-bar {
  transition: opacity 0.15s ease;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.8;
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
  .chart-bar,
  .chart-tooltip {
    transition-duration: 0.01ms !important;
  }
}
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Safely parse JSON from an attribute string. Returns null on failure. */
function tryParseJSON<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/** Check if a boolean attribute is present (present = true, absent = default). */
function boolAttr(el: Element, name: string, defaultValue: boolean): boolean {
  if (!el.hasAttribute(name)) return defaultValue;
  const val = el.getAttribute(name);
  // Present with no value or "true" → true. "false" → false.
  if (val === "false") return false;
  return true;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

class ChartBarElement extends HTMLElement {
  private _datasets: Dataset[] = [];
  private _options: BarChartOptions = { labels: [] };
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

  // ── Public property API (programmatic) ──────────────────────────────────

  get datasets(): Dataset[] {
    return this._datasets;
  }

  set datasets(value: Dataset[]) {
    this._datasets = value;
    this._scheduleRender();
  }

  get options(): BarChartOptions {
    return this._options;
  }

  set options(value: BarChartOptions) {
    this._options = value;
    this._scheduleRender();
  }

  // ── Attribute reflection ────────────────────────────────────────────────

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    this._syncFromAttributes();
    this._scheduleRender();
  }

  /** Sync internal state from HTML attributes. */
  private _syncFromAttributes(): void {
    // Complex JSON attributes
    const labelsAttr = tryParseJSON<string[]>(this.getAttribute("labels"));
    const datasetsAttr = tryParseJSON<Dataset[]>(this.getAttribute("datasets"));

    if (datasetsAttr) this._datasets = datasetsAttr;

    // Build options from attributes (attribute values override existing options
    // only when present — allows mixing attribute + property APIs)
    const opts: BarChartOptions = {
      labels: labelsAttr ?? this._options.labels,
      title: this.getAttribute("title") ?? this._options.title,
      description: this.getAttribute("description") ?? this._options.description,
      showGrid: boolAttr(this, "show-grid", this._options.showGrid ?? true),
      showLegend: boolAttr(this, "show-legend", this._options.showLegend ?? true),
      showTooltips: boolAttr(this, "show-tooltips", this._options.showTooltips ?? true),
    };

    const rotation = this.getAttribute("label-rotation");
    if (rotation !== null) opts.labelRotation = Number(rotation);

    const barGap = this.getAttribute("bar-gap");
    if (barGap !== null) opts.barGap = Number(barGap);

    const groupGap = this.getAttribute("group-gap");
    if (groupGap !== null) opts.groupGap = Number(groupGap);

    this._options = opts;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  connectedCallback(): void {
    // Accessibility
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "img");
    }

    this._resizeObserver = new ResizeObserver(() => {
      // viewBox handles scaling — no re-render needed for now
    });
    this._resizeObserver.observe(this);

    // Initial sync from attributes (for declarative usage)
    this._syncFromAttributes();
    this._scheduleRender();
  }

  disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  // ── Render scheduling ──────────────────────────────────────────────────

  /** Batch multiple attribute/property changes into a single render. */
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
    // Clear previous content
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const { datasets, _options: opts } = this;
    if (!datasets.length || !opts.labels.length) return;

    // Accessibility
    this._renderAccessibility(svg, opts);

    // Resolve colors for each dataset
    const colors = datasets.map((ds, i) => getDatasetColor(i, ds.color));

    // Legend items
    const legendItems: LegendItem[] = datasets.map((ds, i) => ({
      label: ds.label,
      color: colors[i],
    }));

    // CSS var references for colors
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

    // Compute scales
    const { min: dataMin, max: dataMax } = dataExtent(datasets);
    const yScale = linearScale(dataMin, dataMax, layout.plot.height, opts.yAxis);
    const xScale = categoryScale(opts.labels, layout.plot.width, 0.1);

    // Create groups for layering
    const gridGroup = document.createElementNS(NS, "g");
    gridGroup.setAttribute("class", "chart-grid");
    svg.appendChild(gridGroup);

    const barsGroup = document.createElementNS(NS, "g");
    barsGroup.setAttribute("class", "chart-bars");
    svg.appendChild(barsGroup);

    const axisGroup = document.createElementNS(NS, "g");
    axisGroup.setAttribute("class", "chart-axes");
    svg.appendChild(axisGroup);

    // Render grid lines BEHIND bars
    const showGrid = opts.showGrid !== false;
    if (showGrid) {
      renderYGridLines(gridGroup, yScale.ticks, layout.plot, gridColor);
      const xGridPositions = opts.labels.map((_, i) => xScale.scale(i));
      renderXGridLines(gridGroup, xGridPositions, layout.plot, gridColor);
    }

    // Render axis labels ON TOP of bars
    const xPositions = opts.labels.map((_, i) => xScale.scale(i));
    renderYLabels(axisGroup, yScale.ticks, layout.plot, textColor);
    renderXLabels(
      axisGroup,
      opts.labels,
      xPositions,
      layout.plot,
      textColor,
      opts.labelRotation ?? 0,
    );

    // Render bars
    this._renderBars(barsGroup, datasets, colors, xScale, yScale, layout, opts);
  }

  private _renderBars(
    container: SVGGElement,
    datasets: Dataset[],
    colors: string[],
    xScale: ReturnType<typeof categoryScale>,
    yScale: ReturnType<typeof linearScale>,
    layout: ReturnType<typeof computeCartesianLayout>,
    opts: BarChartOptions,
  ): void {
    const numDatasets = datasets.length;
    const groupGap = opts.groupGap ?? 0.2;
    const barGap = opts.barGap ?? 0.1;

    // Each category band is divided into: groupGap | bars | groupGap
    const bandWidth = xScale.bandWidth;
    const groupWidth = bandWidth * (1 - groupGap);
    const barWidth = groupWidth / numDatasets;
    const innerBarWidth = barWidth * (1 - barGap);
    const barOffset = (barWidth - innerBarWidth) / 2;

    // Zero line position
    const zeroY = layout.plot.y + layout.plot.height - yScale.scale(0);

    for (let di = 0; di < numDatasets; di++) {
      const ds = datasets[di];
      for (let ci = 0; ci < ds.data.length; ci++) {
        const value = ds.data[ci];
        if (value === null) continue;

        const categoryX = layout.plot.x + xScale.start(ci);
        const groupStart = categoryX + (bandWidth - groupWidth) / 2;
        const barX = groupStart + di * barWidth + barOffset;

        const valueY = layout.plot.y + layout.plot.height - yScale.scale(value);
        const barH = Math.abs(valueY - zeroY);
        const barY = value >= 0 ? valueY : zeroY;

        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", String(barX));
        rect.setAttribute("y", String(barY));
        rect.setAttribute("width", String(innerBarWidth));
        rect.setAttribute("height", String(barH));
        rect.setAttribute("fill", colors[di]);
        rect.setAttribute("class", "chart-bar");

        // Data attributes for tooltip
        rect.dataset.datasetIndex = String(di);
        rect.dataset.dataIndex = String(ci);
        rect.dataset.value = String(value);

        // Tooltip events
        rect.addEventListener("mouseenter", this._onBarEnter);
        rect.addEventListener("mouseleave", this._onBarLeave);
        rect.addEventListener("click", this._onBarClick);

        container.appendChild(rect);
      }
    }
  }

  // ── Accessibility ──────────────────────────────────────────────────────

  private _renderAccessibility(svg: SVGSVGElement, opts: BarChartOptions): void {
    // <title> for screen readers
    const titleEl = document.createElementNS(NS, "title");
    titleEl.textContent = opts.title ?? "Bar Chart";
    svg.appendChild(titleEl);

    // <desc> for detailed description
    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }

    // aria-label on the host
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Bar Chart");
    }
  }

  // ── Tooltip handlers ────────────────────────────────────────────────────

  private _onBarEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;

    const rect = e.target as SVGRectElement;
    const di = Number(rect.dataset.datasetIndex);
    const ci = Number(rect.dataset.dataIndex);
    const value = rect.dataset.value;
    const ds = this._datasets[di];
    const label = this._options.labels[ci] ?? "";

    this._tooltip.textContent = `${ds.label}: ${value} (${label})`;
    this._tooltip.classList.add("visible");

    // Position tooltip near the bar
    const svgRect = this._svg.getBoundingClientRect();
    const barRect = rect.getBoundingClientRect();
    const hostRect = this.getBoundingClientRect();

    const tooltipX = barRect.left + barRect.width / 2 - hostRect.left;
    const tooltipY = barRect.top - hostRect.top - 8;

    this._tooltip.style.left = `${tooltipX}px`;
    this._tooltip.style.top = `${tooltipY}px`;
    this._tooltip.style.transform = "translate(-50%, -100%)";
  };

  private _onBarLeave = (): void => {
    this._tooltip.classList.remove("visible");
  };

  private _onBarClick = (e: Event): void => {
    const rect = e.target as SVGRectElement;
    const di = Number(rect.dataset.datasetIndex);
    const ci = Number(rect.dataset.dataIndex);
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

customElements.define("chart-bar", ChartBarElement);

export { ChartBarElement };
export type { BarChartOptions, Dataset };
