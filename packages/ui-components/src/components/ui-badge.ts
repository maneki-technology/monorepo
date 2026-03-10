import { colorVar, semanticVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type BadgeSize = "xs" | "s" | "m" | "l";
export type BadgeEmphasis = "bold" | "subtle" | "minimal";
export type BadgeShape = "square" | "rounded";
export type BadgeColor =
  | "none"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "lime"
  | "teal"
  | "turquoise"
  | "aqua"
  | "ultramarine"
  | "pink"
  | "purple"
  | "orange";
export type BadgeStatus =
  | "none"
  | "error"
  | "warning"
  | "success"
  | "information";

// ─── Token constants ─────────────────────────────────────────────────────────

const GRAY_60 = colorVar("gray", 60);
const RED_60 = colorVar("red", 60);
const YELLOW_30 = colorVar("yellow", 30);
const GREEN_60 = colorVar("green", 60);
const BLUE_60 = colorVar("blue", 60);
const LIME_60 = colorVar("lime", 60);
const TEAL_60 = colorVar("teal", 60);
const TURQUOISE_60 = colorVar("turquoise", 60);
const AQUA_60 = colorVar("aqua", 60);
const ULTRAMARINE_60 = colorVar("ultramarine", 60);
const PINK_60 = colorVar("pink", 60);
const PURPLE_60 = colorVar("purple", 60);
const ORANGE_60 = colorVar("orange", 60);

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const SURFACE_TERTIARY = semanticVar("surface", "tertiary");
const BORDER_MODERATE = semanticVar("border", "moderate");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
  }

  /* ── Base ─────────────────────────────────────────────────────────────────── */

  .base {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="m"]) .base {
    font-size: 12px;
    line-height: 16px;
    padding: 2px 8px;
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .base {
    font-size: 9px;
    line-height: 12px;
    padding: 0 4px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .base {
    font-size: 11px;
    line-height: 16px;
    padding: 0 6px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    font-size: 14px;
    line-height: 20px;
    padding: 4px 10px;
  }

  /* ── Shape: square (default) ─────────────────────────────────────────────── */

  :host .base,
  :host([shape="square"]) .base {
    border-radius: 2px;
  }

  /* ── Shape: rounded ──────────────────────────────────────────────────────── */

  :host([shape="rounded"]) .base {
    border-radius: 20px;
  }

  /* ── Emphasis: bold (default) + color: none (default) ────────────────────── */

  :host .base,
  :host([color="none"]) .base,
  :host([color="none"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${GRAY_60});
    color: var(--ui-badge-color, #ffffff);
  }

  /* ── Bold color variants ─────────────────────────────────────────────────── */

  :host([color="red"]) .base,
  :host([color="red"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${RED_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="yellow"]) .base,
  :host([color="yellow"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${YELLOW_30});
    color: var(--ui-badge-color, ${TEXT_PRIMARY});
  }

  :host([color="green"]) .base,
  :host([color="green"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${GREEN_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="blue"]) .base,
  :host([color="blue"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${BLUE_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="lime"]) .base,
  :host([color="lime"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${LIME_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="teal"]) .base,
  :host([color="teal"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${TEAL_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="turquoise"]) .base,
  :host([color="turquoise"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${TURQUOISE_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="aqua"]) .base,
  :host([color="aqua"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${AQUA_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="ultramarine"]) .base,
  :host([color="ultramarine"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${ULTRAMARINE_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="pink"]) .base,
  :host([color="pink"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${PINK_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="purple"]) .base,
  :host([color="purple"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${PURPLE_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([color="orange"]) .base,
  :host([color="orange"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${ORANGE_60});
    color: var(--ui-badge-color, #ffffff);
  }

  /* ── Status overrides (bold) ─────────────────────────────────────────────── */

  :host([status="error"]) .base,
  :host([status="error"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${RED_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([status="warning"]) .base,
  :host([status="warning"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${YELLOW_30});
    color: var(--ui-badge-color, ${TEXT_PRIMARY});
  }

  :host([status="success"]) .base,
  :host([status="success"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${GREEN_60});
    color: var(--ui-badge-color, #ffffff);
  }

  :host([status="information"]) .base,
  :host([status="information"][emphasis="bold"]) .base {
    background-color: var(--ui-badge-bg, ${BLUE_60});
    color: var(--ui-badge-color, #ffffff);
  }

  /* ── Emphasis: subtle ────────────────────────────────────────────────────── */

  :host([emphasis="subtle"]) .base {
    background-color: var(--ui-badge-bg, ${SURFACE_TERTIARY});
    color: var(--ui-badge-color, ${TEXT_SECONDARY});
  }

  /* ── Emphasis: minimal ───────────────────────────────────────────────────── */

  :host([emphasis="minimal"]) .base {
    background-color: var(--ui-badge-bg, transparent);
    color: var(--ui-badge-color, ${TEXT_SECONDARY});
    border: 1px solid var(--ui-badge-border, ${BORDER_MODERATE});
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiBadge extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "emphasis",
    "shape",
    "color",
    "status",
  ];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // .base
    const base = document.createElement("span");
    base.className = "base";

    // default slot
    const slot = document.createElement("slot");
    base.appendChild(slot);

    shadow.appendChild(base);
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    // All styling is handled via :host([attr]) CSS selectors — no JS sync needed
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): BadgeSize {
    return (this.getAttribute("size") as BadgeSize) ?? "m";
  }

  set size(value: BadgeSize) {
    this.setAttribute("size", value);
  }

  get emphasis(): BadgeEmphasis {
    return (this.getAttribute("emphasis") as BadgeEmphasis) ?? "bold";
  }

  set emphasis(value: BadgeEmphasis) {
    this.setAttribute("emphasis", value);
  }

  get shape(): BadgeShape {
    return (this.getAttribute("shape") as BadgeShape) ?? "square";
  }

  set shape(value: BadgeShape) {
    this.setAttribute("shape", value);
  }

  get color(): BadgeColor {
    return (this.getAttribute("color") as BadgeColor) ?? "none";
  }

  set color(value: BadgeColor) {
    this.setAttribute("color", value);
  }

  get status(): BadgeStatus {
    return (this.getAttribute("status") as BadgeStatus) ?? "none";
  }

  set status(value: BadgeStatus) {
    this.setAttribute("status", value);
  }
}

customElements.define("ui-badge", UiBadge);
