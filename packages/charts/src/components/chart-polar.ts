/**
 * <chart-polar> — Polar area chart Web Component.
 *
 * Like a pie chart but each slice has equal angle — the radius varies by value.
 *
 * Usage (declarative):
 *   <chart-polar
 *     title="Skills"
 *     slices='[{"label":"JS","value":90},{"label":"CSS","value":70},{"label":"HTML","value":95}]'
 *   ></chart-polar>
 */

import {
  TEXT_PRIMARY,
  SURFACE_PRIMARY,
  FONT_PRIMARY,
  TYPE_HEADING_06,
  TYPE_BODY_03,
} from "@maneki/foundation";

import type { PieSlice, PieChartOptions, LegendItem } from "../core/types.js";
import { CIRCULAR_LEGEND } from "../core/legend.js";
import { getDatasetColor, GRID_LINE_COLOR } from "../core/colors.js";
import { renderChartHeader } from "../core/header.js";

const NS = "http://www.w3.org/2000/svg";
const VIEWBOX = 960;
const TAU = Math.PI * 2;

const OBSERVED_ATTRS = [
  "title", "slices", "show-legend", "show-tooltips", "levels", "description",
] as const;

const STYLES = /* css */ `
:host { display: block; width: 100%; contain: layout style; }
svg { width: 100%; height: auto; display: block; font-family: var(--chart-font, ${FONT_PRIMARY}); }
.chart-title { ${TYPE_HEADING_06} font-size: var(--chart-title-font-size, 24px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-legend-label { ${TYPE_BODY_03} font-size: var(--chart-legend-font-size, 18px); fill: var(--chart-text-color, ${TEXT_PRIMARY}); }
.chart-slice { transition: opacity 0.15s ease; cursor: pointer; }
.chart-slice:hover { opacity: 0.8; }
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
  .chart-slice, .chart-tooltip { transition-duration: 0.01ms !important; }
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

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = cx + r * Math.sin(a0);
  const y0 = cy - r * Math.cos(a0);
  const x1 = cx + r * Math.sin(a1);
  const y1 = cy - r * Math.cos(a1);
  return `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${largeArc} 1 ${x1},${y1} Z`;
}

class ChartPolarElement extends HTMLElement {
  private _slices: PieSlice[] = [];
  private _options: PieChartOptions & { levels?: number } = {};
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

  get slices(): PieSlice[] { return this._slices; }
  set slices(v: PieSlice[]) { this._slices = v; this._scheduleRender(); }
  get options(): PieChartOptions { return this._options; }
  set options(v: PieChartOptions & { levels?: number }) { this._options = v; this._scheduleRender(); }

  attributeChangedCallback(_: string, o: string | null, n: string | null): void {
    if (o === n) return;
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
      levels: numAttr(this, "levels") ?? (this._options as any).levels,
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

    const { _slices: slices, _options: opts } = this;
    if (!slices.length) return;

    // Accessibility
    const titleSvg = document.createElementNS(NS, "title");
    titleSvg.textContent = opts.title ?? "Polar Area Chart";
    svg.appendChild(titleSvg);
    if (opts.description) {
      const desc = document.createElementNS(NS, "desc");
      desc.textContent = opts.description;
      svg.appendChild(desc);
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", opts.title ?? "Polar Area Chart");
    }

    const colors = slices.map((s, i) => getDatasetColor(i, s.color));
    const legendItems: LegendItem[] = slices.map((s, i) => ({
      label: s.label, color: colors[i],
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

    const availableH = VIEWBOX - headerH - 40;
    const availableW = VIEWBOX - 80;
    const maxRadius = Math.min(availableW, availableH) / 2;
    const cx = VIEWBOX / 2;
    const cy = headerH + 20 + availableH / 2;

    // Concentric grid circles
    const levels = (opts as any).levels ?? 5;
    const maxValue = Math.max(...slices.map(s => s.value));
    if (maxValue <= 0) return;

    const gridGroup = document.createElementNS(NS, "g");
    svg.appendChild(gridGroup);
    for (let l = 1; l <= levels; l++) {
      const r = (maxRadius * l) / levels;
      const circle = document.createElementNS(NS, "circle");
      circle.setAttribute("cx", String(cx));
      circle.setAttribute("cy", String(cy));
      circle.setAttribute("r", String(r));
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", gridColor);
      circle.setAttribute("stroke-width", "1");
      gridGroup.appendChild(circle);
    }

    // Slices — equal angle, varying radius
    const n = slices.length;
    const sliceAngle = TAU / n;

    for (let i = 0; i < n; i++) {
      const slice = slices[i];
      const frac = slice.value / maxValue;
      const r = maxRadius * frac;
      const a0 = -Math.PI / 2 + i * sliceAngle;
      const a1 = a0 + sliceAngle;

      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", arcPath(cx, cy, r, a0, a1));
      path.setAttribute("fill", colors[i]);
      path.setAttribute("opacity", "0.7");
      path.setAttribute("stroke", `var(--chart-tooltip-bg, ${SURFACE_PRIMARY})`);
      path.setAttribute("stroke-width", "2");
      path.setAttribute("class", "chart-slice");
      path.dataset.index = String(i);
      path.dataset.value = String(slice.value);
      path.dataset.label = slice.label;

      path.addEventListener("mouseenter", this._onSliceEnter);
      path.addEventListener("mouseleave", this._onSliceLeave);

      svg.appendChild(path);
    }
  }

  private _onSliceEnter = (e: Event): void => {
    if (this._options.showTooltips === false) return;
    const me = e as MouseEvent;
    const path = e.target as SVGPathElement;
    this._tooltip.textContent = `${path.dataset.label}: ${path.dataset.value}`;
    this._tooltip.classList.add("visible");
    const hostRect = this.getBoundingClientRect();
    this._tooltip.style.left = `${me.clientX - hostRect.left}px`;
    this._tooltip.style.top = `${me.clientY - hostRect.top - 12}px`;
    this._tooltip.style.transform = "translate(-50%, -100%)";
  };

  private _onSliceLeave = (): void => {
    this._tooltip.classList.remove("visible");
  };
}

customElements.define("chart-polar", ChartPolarElement);
export { ChartPolarElement };
