/**
 * <chart-pie> — Pie / Doughnut chart Web Component.
 *
 * Renders pie or doughnut charts with SVG inside Shadow DOM.
 * Set inner-radius="0.5" (or higher) for doughnut style.
 *
 * Usage (declarative):
 *   <chart-pie
 *     title="Market Share"
 *     slices='[{"label":"Chrome","value":65},{"label":"Safari","value":19},{"label":"Firefox","value":10}]'
 *   ></chart-pie>
 *
 *   <!-- Doughnut -->
 *   <chart-pie
 *     title="Budget"
 *     slices='[{"label":"Rent","value":1200},{"label":"Food","value":400}]'
 *     inner-radius="0.6"
 *   ></chart-pie>
 */

import {
  TEXT_PRIMARY,
  SURFACE_PRIMARY,
  FONT_PRIMARY,
  TYPE_HEADING_06,
  TYPE_BODY_03,
} from "@maneki/foundation";

import type {
  PieSlice,
  PieChartOptions,
  LegendItem,
} from "../core/types.js";
import { CIRCULAR_LEGEND } from "../core/legend.js";
import { getDatasetColor, GRID_LINE_COLOR } from "../core/colors.js";
import { renderChartHeader } from "../core/header.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX = 960;
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------
// Observed attributes
// ---------------------------------------------------------------------------

const OBSERVED_ATTRS = [
  "title",
  "slices",
  "show-legend",
  "show-tooltips",
  "inner-radius",
  "start-angle",
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
  font-size: var(--chart-title-font-size, 24px);
  fill: var(--chart-text-color, ${TEXT_PRIMARY});
}

.chart-legend-label {
  ${TYPE_BODY_03}
  font-size: var(--chart-legend-font-size, 18px);
  fill: var(--chart-text-color, ${TEXT_PRIMARY});
}

.chart-slice {
  transition: opacity 0.15s ease;
  cursor: pointer;
}

.chart-slice:hover {
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
  .chart-slice,
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

/** Describe an SVG arc path from angle a0 to a1 at given radii. */
function arcPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  a0: number,
  a1: number,
): string {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;

  const ox0 = cx + outerR * Math.sin(a0);
  const oy0 = cy - outerR * Math.cos(a0);
  const ox1 = cx + outerR * Math.sin(a1);
  const oy1 = cy - outerR * Math.cos(a1);

  if (innerR <= 0) {
    // Pie slice: arc + line to center
    return [
      `M${cx},${cy}`,
      `L${ox0},${oy0}`,
      `A${outerR},${outerR} 0 ${largeArc} 1 ${ox1},${oy1}`,
      "Z",
    ].join(" ");
  }

  // Doughnut: outer arc + inner arc (reversed)
  const ix0 = cx + innerR * Math.sin(a0);
  const iy0 = cy - innerR * Math.cos(a0);
  const ix1 = cx + innerR * Math.sin(a1);
  const iy1 = cy - innerR * Math.cos(a1);

  return [
    `M${ox0},${oy0}`,
    `A${outerR},${outerR} 0 ${largeArc} 1 ${ox1},${oy1}`,
    `L${ix1},${iy1}`,
    `A${innerR},${innerR} 0 ${largeArc} 0 ${ix0},${iy0}`,
    "Z",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

class ChartPieElement extends HTMLElement {
  private _slices: PieSlice[] = [];
  private _options: PieChartOptions = {};
  private _svg: SVGSVGElement;
  private _tooltip: HTMLDivElement;
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
    this._svg.setAttribute("viewBox", `0 0 ${VIEWBOX} ${VIEWBOX}`);
    this._svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    shadow.appendChild(this._svg);

    this._tooltip = document.createElement("div");
    this._tooltip.className = "chart-tooltip";
    shadow.appendChild(this._tooltip);
  }

  // ── Public property API ─────────────────────────────────────────────────

  get slices(): PieSlice[] {
    return this._slices;
  }

  set slices(value: PieSlice[]) {
    this._slices = value;
    this._scheduleRender();
  }

  get options(): PieChartOptions {
    return this._options;
  }

  set options(value: PieChartOptions) {
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
    const slicesAttr = tryParseJSON<PieSlice[]>(this.getAttribute("slices"));
    if (slicesAttr) this._slices = slicesAttr;

    this._options = {
      title: this.getAttribute("title") ?? this._options.title,
      description: this.getAttribute("description") ?? this._options.description,
      showLegend: boolAttr(this, "show-legend", this._options.showLegend ?? true),
      showTooltips: boolAttr(this, "show-tooltips", this._options.showTooltips ?? true),
      innerRadius: numAttr(this, "inner-radius") ?? this._options.innerRadius,
      startAngle: numAttr(this, "start-angle") ?? this._options.startAngle,
    };
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "img");
    }
    this._syncFromAttributes();
    this._scheduleRender();
  }

  disconnectedCallback(): void {}

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

    const { _slices: slices, _options: opts } = this;
    if (!slices.length) return;

    // Accessibility
    this._renderAccessibility(svg, opts);

    const colors = slices.map((s, i) => getDatasetColor(i, s.color));
    const legendItems: LegendItem[] = slices.map((s, i) => ({
      label: s.label,
      color: colors[i],
    }));

    const textColor = `var(--chart-text-color, ${TEXT_PRIMARY})`;

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

    // Pie center and radius
    const availableH = VIEWBOX - headerH - 40;
    const availableW = VIEWBOX - 80;
    const outerR = Math.min(availableW, availableH) / 2;
    const cx = VIEWBOX / 2;
    const cy = headerH + 20 + availableH / 2;

    const innerRadiusFrac = opts.innerRadius ?? 0;
    const innerR = outerR * Math.max(0, Math.min(innerRadiusFrac, 0.9));

    // Slices
    const total = slices.reduce((sum, s) => sum + s.value, 0);
    if (total <= 0) return;

    const startAngleRad = ((opts.startAngle ?? 0) * Math.PI) / 180;
    let angle = startAngleRad;

    const sliceGroup = document.createElementNS(NS, "g");
    sliceGroup.setAttribute("class", "chart-slices");
    svg.appendChild(sliceGroup);

    for (let i = 0; i < slices.length; i++) {
      const slice = slices[i];
      const sliceAngle = (slice.value / total) * TAU;
      // Clamp to avoid full-circle arc rendering issues
      const endAngle = angle + Math.max(sliceAngle, 0.001);

      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", arcPath(cx, cy, outerR, innerR, angle, endAngle));
      path.setAttribute("fill", colors[i]);
      path.setAttribute("class", "chart-slice");

      path.dataset.index = String(i);
      path.dataset.value = String(slice.value);
      path.dataset.label = slice.label;
      path.dataset.percent = String(Math.round((slice.value / total) * 100));

      path.addEventListener("mouseenter", this._onSliceEnter);
      path.addEventListener("mouseleave", this._onSliceLeave);
      path.addEventListener("click", this._onSliceClick);

      sliceGroup.appendChild(path);
      angle = endAngle;
    }
  }

  // ── Accessibility ──────────────────────────────────────────────────────

  private _renderAccessibility(svg: SVGSVGElement, opts: PieChartOptions): void {
    const titleEl = document.createElementNS(NS, "title");
    titleEl.textContent = opts.title ?? "Pie Chart";
    svg.appendChild(titleEl);

    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }

    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Pie Chart");
    }
  }

  // ── Tooltip handlers ────────────────────────────────────────────────────

  private _onSliceEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;

    const me = e as MouseEvent;
    const path = e.target as SVGPathElement;
    const label = path.dataset.label;
    const value = path.dataset.value;
    const percent = path.dataset.percent;

    this._tooltip.textContent = `${label}: ${value} (${percent}%)`;
    this._tooltip.classList.add("visible");

    const hostRect = this.getBoundingClientRect();
    this._tooltip.style.left = `${me.clientX - hostRect.left}px`;
    this._tooltip.style.top = `${me.clientY - hostRect.top - 12}px`;
    this._tooltip.style.transform = "translate(-50%, -100%)";
  };

  private _onSliceLeave = (): void => {
    this._tooltip.classList.remove("visible");
  };

  private _onSliceClick = (e: Event): void => {
    const path = e.target as SVGPathElement;
    const i = Number(path.dataset.index);
    const slice = this._slices[i];

    this.dispatchEvent(
      new CustomEvent("chart-click", {
        detail: {
          index: i,
          label: slice.label,
          value: slice.value,
          percent: Math.round((slice.value / this._slices.reduce((s, sl) => s + sl.value, 0)) * 100),
        },
        bubbles: true,
        composed: true,
      }),
    );
  };
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

customElements.define("chart-pie", ChartPieElement);

export { ChartPieElement };
export type { PieChartOptions, PieSlice };
