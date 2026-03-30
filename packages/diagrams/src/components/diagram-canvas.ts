/**
 * <diagram-canvas> — Container for diagram boxes and arrows.
 * Uses CSS Grid for box positioning and an SVG overlay for arrows.
 *
 * Attributes:
 *   columns   — number of grid columns (default 4)
 *   rows      — number of grid rows (default 3)
 *   title     — diagram title (optional)
 *   gap       — grid gap in px (default 24)
 */

import { semanticVar, spaceVar } from "@maneki/foundation";

const SURFACE_PRIMARY = semanticVar("surface", "primary");
const TEXT_PRIMARY = semanticVar("text", "primary");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const SP_2 = spaceVar("2");
const SP_3 = spaceVar("3");

const STYLES = `
  :host {
    display: block;
    position: relative;
    padding: ${SP_3};
    background: var(--diagram-canvas-bg, ${SURFACE_PRIMARY});
    border: 1px solid var(--diagram-canvas-border, ${BORDER_MINIMAL});
    border-radius: var(--fd-radius-lg, 12px);
    overflow: visible;
  }

  .title {
    font-family: var(--fd-type-heading-05-font-family);
    font-size: var(--fd-type-heading-05-font-size);
    line-height: var(--fd-type-heading-05-line-height);
    font-weight: var(--fd-type-heading-05-font-weight);
    color: var(--diagram-canvas-title-color, ${TEXT_PRIMARY});
    margin-bottom: ${SP_2};
  }

  .grid {
    display: grid;
    gap: var(--diagram-canvas-gap, 24px);
    align-items: center;
    justify-items: center;
  }

  svg.arrows {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
  }

  svg.arrows line {
    stroke: var(--diagram-arrow-color, ${BORDER_MINIMAL});
    stroke-width: var(--diagram-arrow-width, 1.5);
  }

  svg.arrows polygon {
    fill: var(--diagram-arrow-color, ${BORDER_MINIMAL});
  }

  svg.arrows text {
    font-family: var(--fd-type-body-03-font-family);
    font-size: 11px;
    fill: var(--diagram-arrow-label-color, ${TEXT_PRIMARY});
    text-anchor: middle;
    dominant-baseline: middle;
  }
`;

interface ArrowDef {
  from: string;
  to: string;
  label: string;
}

export class DiagramCanvas extends HTMLElement {
  static observedAttributes = ["columns", "rows", "title", "gap"];

  private _shadow: ShadowRoot;
  private _resizeObserver: ResizeObserver | null = null;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    this._render();
    // Re-draw arrows after layout settles
    this._resizeObserver = new ResizeObserver(() => this._drawArrows());
    this._resizeObserver.observe(this);
    requestAnimationFrame(() => this._drawArrows());
  }

  disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
  }

  attributeChangedCallback(): void {
    this._render();
    requestAnimationFrame(() => this._drawArrows());
  }

  private _render(): void {
    const cols = parseInt(this.getAttribute("columns") ?? "4", 10);
    const rows = parseInt(this.getAttribute("rows") ?? "3", 10);
    const title = this.getAttribute("title") ?? "";
    const gap = this.getAttribute("gap") ?? "24";

    this._shadow.innerHTML = `
      <style>${STYLES}</style>
      ${title ? `<div class="title">${title}</div>` : ""}
      <div class="grid" style="grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, auto); --diagram-canvas-gap: ${gap}px;">
        <slot></slot>
      </div>
      <svg class="arrows"></svg>
    `;
  }

  private _getArrows(): ArrowDef[] {
    const arrows: ArrowDef[] = [];
    const arrowEls = this.querySelectorAll("diagram-arrow");
    for (const el of arrowEls) {
      const from = el.getAttribute("from") ?? "";
      const to = el.getAttribute("to") ?? "";
      const label = el.getAttribute("label") ?? "";
      if (from && to) arrows.push({ from, to, label });
    }
    return arrows;
  }

  private _drawArrows(): void {
    const svg = this._shadow.querySelector("svg.arrows");
    if (!svg) return;

    const arrows = this._getArrows();
    const canvasRect = this.getBoundingClientRect();
    let svgContent = "";

    for (const arrow of arrows) {
      const fromEl = this.querySelector(`[box-id="${arrow.from}"]`) as HTMLElement | null;
      const toEl = this.querySelector(`[box-id="${arrow.to}"]`) as HTMLElement | null;
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // Center points relative to canvas
      const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
      const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
      const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
      const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

      // Find edge intersection points
      const [sx, sy] = this._edgePoint(fromRect, canvasRect, x2, y2);
      const [ex, ey] = this._edgePoint(toRect, canvasRect, x1, y1);

      // Arrowhead
      const angle = Math.atan2(ey - sy, ex - sx);
      const headLen = 8;
      const ax1 = ex - headLen * Math.cos(angle - Math.PI / 6);
      const ay1 = ey - headLen * Math.sin(angle - Math.PI / 6);
      const ax2 = ex - headLen * Math.cos(angle + Math.PI / 6);
      const ay2 = ey - headLen * Math.sin(angle + Math.PI / 6);

      svgContent += `<line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" />`;
      svgContent += `<polygon points="${ex},${ey} ${ax1},${ay1} ${ax2},${ay2}" />`;

      if (arrow.label) {
        const mx = (sx + ex) / 2;
        const my = (sy + ey) / 2;
        svgContent += `<text x="${mx}" y="${my - 8}">${arrow.label}</text>`;
      }
    }

    svg.innerHTML = svgContent;
  }

  /** Find the point where a line from center to (tx,ty) exits the element's bounding box. */
  private _edgePoint(rect: DOMRect, canvasRect: DOMRect, tx: number, ty: number): [number, number] {
    const cx = rect.left + rect.width / 2 - canvasRect.left;
    const cy = rect.top + rect.height / 2 - canvasRect.top;
    const hw = rect.width / 2;
    const hh = rect.height / 2;
    const dx = tx - cx;
    const dy = ty - cy;

    if (dx === 0 && dy === 0) return [cx, cy];

    // Scale factor to reach the edge
    const sx = hw / Math.abs(dx || 1);
    const sy = hh / Math.abs(dy || 1);
    const s = Math.min(sx, sy);

    return [cx + dx * s, cy + dy * s];
  }
}

customElements.define("diagram-canvas", DiagramCanvas);
