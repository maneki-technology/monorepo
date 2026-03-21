import {
  FONT_PRIMARY,
  SP_0_5,
  SP_1,
  SP_3,
  TEXT_PRIMARY,
  TYPE_BODY_02,
  TYPE_BODY_03,
} from "@maneki/foundation";
import { STATUS_FILL, STATUS_TRACK } from "./ui-progress-bar.styles.js";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const CIRCLE_STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    font-family: ${FONT_PRIMARY};
  }

  .container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    display: block;
    transform: rotate(-90deg);
  }

  .track-circle {
    fill: none;
  }

  .fill-circle {
    fill: none;
    transition: stroke-dashoffset 0.3s ease;
  }

  .percentage {
    position: absolute;
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    text-align: center;
  }

  .label {
    font-weight: 400;
    color: ${TEXT_PRIMARY};
    text-align: center;
    white-space: nowrap;
  }

  /* ── Size: S (24px) ──────────────────────────────────────────────────────── */

  :host([size="s"]) .container {
    width: ${SP_3};
    height: ${SP_3};
  }

  :host([size="s"]) .percentage {
    display: none;
  }

  :host([size="s"]) .label {
    ${TYPE_BODY_03}
  }

  /* ── Size: M (default, 52px) ─────────────────────────────────────────────── */

  :host .container,
  :host([size="m"]) .container {
    width: 52px;
    height: 52px;
  }

  :host .percentage,
  :host([size="m"]) .percentage {
    ${TYPE_BODY_02}
  }

  :host .label,
  :host([size="m"]) .label {
    ${TYPE_BODY_02}
  }

  /* ── Label positions ─────────────────────────────────────────────────────── */

  :host([label-position="bottom"]) {
    gap: ${SP_1};
  }

  :host([label-position="bottom"]) .label {
    display: block;
  }

  :host([size="s"][label-position="bottom"]) {
    gap: ${SP_0_5};
  }

  :host([label-position="right"]) {
    flex-direction: row;
    gap: ${SP_1};
  }

  :host([label-position="right"]) .label {
    display: block;
  }

  :host([label-position="none"]) .label {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .fill-circle {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export type ProgressCircleSize = "s" | "m";
export type ProgressCircleLabelPosition = "none" | "bottom" | "right";

const circleSheet = new CSSStyleSheet();
circleSheet.replaceSync(CIRCLE_STYLES);

// SVG dimensions per size
const SIZE_CONFIG: Record<string, { diameter: number; strokeWidth: number }> = {
  s: { diameter: 24, strokeWidth: 3 },
  m: { diameter: 52, strokeWidth: 4 },
};

export class UiProgressCircle extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "label-position",
    "status",
    "value",
    "label-text",
  ];

  #container!: HTMLElement;
  #svg!: SVGSVGElement;
  #trackCircle!: SVGCircleElement;
  #fillCircle!: SVGCircleElement;
  #percentage!: HTMLElement;
  #label!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [circleSheet];

    this.#container = document.createElement("div");
    this.#container.className = "container";
    this.#container.setAttribute("role", "progressbar");
    this.#container.setAttribute("aria-valuemin", "0");
    this.#container.setAttribute("aria-valuemax", "100");

    // SVG
    this.#svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.#trackCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.#trackCircle.classList.add("track-circle");
    this.#fillCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.#fillCircle.classList.add("fill-circle");
    this.#svg.append(this.#trackCircle, this.#fillCircle);

    // Percentage text overlay
    this.#percentage = document.createElement("div");
    this.#percentage.className = "percentage";

    this.#container.append(this.#svg, this.#percentage);

    // Label
    this.#label = document.createElement("div");
    this.#label.className = "label";

    shadow.append(this.#container, this.#label);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    if (!this.hasAttribute("label-position")) this.setAttribute("label-position", "bottom");
    if (!this.hasAttribute("status")) this.setAttribute("status", "information");
    if (!this.hasAttribute("value")) this.setAttribute("value", "0");
    this._syncAll();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncAll();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): ProgressCircleSize {
    return (this.getAttribute("size") as ProgressCircleSize) ?? "m";
  }
  set size(v: ProgressCircleSize) {
    this.setAttribute("size", v);
  }

  get labelPosition(): ProgressCircleLabelPosition {
    return (this.getAttribute("label-position") as ProgressCircleLabelPosition) ?? "bottom";
  }
  set labelPosition(v: ProgressCircleLabelPosition) {
    this.setAttribute("label-position", v);
  }

  get status(): string {
    return this.getAttribute("status") ?? "information";
  }
  set status(v: string) {
    this.setAttribute("status", v);
  }

  get value(): number {
    return Math.max(0, Math.min(100, parseInt(this.getAttribute("value") ?? "0", 10) || 0));
  }
  set value(v: number) {
    this.setAttribute("value", String(Math.max(0, Math.min(100, v))));
  }

  get labelText(): string {
    return this.getAttribute("label-text") ?? "";
  }
  set labelText(v: string) {
    this.setAttribute("label-text", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncAll(): void {
    const val = this.value;
    const status = this.status;
    const size = this.size;
    const config = SIZE_CONFIG[size] ?? SIZE_CONFIG.m;
    const { diameter, strokeWidth } = config;
    const radius = (diameter - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (val / 100) * circumference;

    // SVG attributes
    this.#svg.setAttribute("width", String(diameter));
    this.#svg.setAttribute("height", String(diameter));
    this.#svg.setAttribute("viewBox", `0 0 ${diameter} ${diameter}`);

    const cx = String(diameter / 2);
    const cy = String(diameter / 2);
    const r = String(radius);

    this.#trackCircle.setAttribute("cx", cx);
    this.#trackCircle.setAttribute("cy", cy);
    this.#trackCircle.setAttribute("r", r);
    this.#trackCircle.setAttribute("stroke-width", String(strokeWidth));
    this.#trackCircle.style.stroke = STATUS_TRACK[status] ?? STATUS_TRACK.none;

    this.#fillCircle.setAttribute("cx", cx);
    this.#fillCircle.setAttribute("cy", cy);
    this.#fillCircle.setAttribute("r", r);
    this.#fillCircle.setAttribute("stroke-width", String(strokeWidth));
    this.#fillCircle.setAttribute("stroke-linecap", "round");
    this.#fillCircle.style.stroke = STATUS_FILL[status] ?? STATUS_FILL.none;
    this.#fillCircle.style.strokeDasharray = String(circumference);
    this.#fillCircle.style.strokeDashoffset = String(offset);

    // Percentage text
    this.#percentage.textContent = `${val}%`;

    // Label
    this.#label.textContent = this.labelText;

    // ARIA
    this.#container.setAttribute("aria-valuenow", String(val));
    if (this.labelText) this.#container.setAttribute("aria-label", this.labelText);
  }
}

customElements.define("ui-progress-circle", UiProgressCircle);
