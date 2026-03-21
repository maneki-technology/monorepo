import {
  BORDER_CONTRAST,
  BORDER_FOCUS,
  DISABLED_BORDER,
  DISABLED_MINIMAL,
  DISABLED_TEXT,
  FONT_PRIMARY,
  FORM_INPUT_BORDER,
  HOVER_BORDER_MODERATE,
  RADIUS_CIRCLE,
  SELECTED_BOLD,
  SP_0_75,
  SP_1,
  SP_1_5,
  STATUS_GENERAL_ERROR,
  STATUS_SURFACE_ERROR_BOLD,
  TEXT_PRIMARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  SURFACE_PRIMARY,
} from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type RadioSize = "s" | "m" | "l";
export type RadioLabel = "none" | "right" | "left";
// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    outline: none;
  }

  /* ── Base ─────────────────────────────────────────────────────────────────── */

  .base {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Outer box (hit area + focus ring) ───────────────────────────────────── */

  .outer {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid transparent;
    border-radius: ${RADIUS_CIRCLE};
  }

  /* ── Inner circle (visible radio) ───────────────────────────────────────── */

  .radio {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ui-radio-border, ${FORM_INPUT_BORDER});
    border-radius: ${RADIUS_CIRCLE};
    background-color: var(--ui-radio-bg, ${SURFACE_PRIMARY});
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;
  }

  /* ── Dot indicator ──────────────────────────────────────────────────────── */

  .dot {
    display: none;
    border-radius: ${RADIUS_CIRCLE};
    background-color: var(--ui-radio-dot-color, ${SELECTED_BOLD});
  }

  :host([checked]) .dot {
    display: block;
  }

  /* ── Label slot ──────────────────────────────────────────────────────────── */

  .label {
    display: none;
    font-family: ${FONT_PRIMARY};
    font-weight: 400;
    color: var(--ui-radio-label-color, ${TEXT_PRIMARY});
  }

  :host([label="right"]) .label {
    display: inline;
    order: 1;
  }

  :host([label="left"]) .label {
    display: inline;
    order: -1;
  }

  :host([label="right"]) .outer {
    order: 0;
  }

  :host([label="left"]) .outer {
    order: 0;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .outer,
  :host([size="m"]) .outer {
    width: var(--ui-radio-outer-size, 18px);
    height: var(--ui-radio-outer-size, 18px);
  }

  :host .radio,
  :host([size="m"]) .radio {
    width: var(--ui-radio-inner-size, 14px);
    height: var(--ui-radio-inner-size, 14px);
  }

  :host .base,
  :host([size="m"]) .base {
    gap: var(--ui-radio-gap, ${SP_1});
  }

  :host .label,
  :host([size="m"]) .label {
    ${TYPE_BODY_02}
  }

  :host .dot,
  :host([size="m"]) .dot {
    width: 6px;
    height: 6px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .outer {
    width: var(--ui-radio-outer-size, 16px);
    height: var(--ui-radio-outer-size, 16px);
  }

  :host([size="s"]) .radio {
    width: var(--ui-radio-inner-size, 12px);
    height: var(--ui-radio-inner-size, 12px);
  }

  :host([size="s"]) .base {
    gap: var(--ui-radio-gap, ${SP_0_75});
  }

  :host([size="s"]) .label {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .dot {
    width: 6px;
    height: 6px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .outer {
    width: var(--ui-radio-outer-size, 20px);
    height: var(--ui-radio-outer-size, 20px);
  }

  :host([size="l"]) .radio {
    width: var(--ui-radio-inner-size, 16px);
    height: var(--ui-radio-inner-size, 16px);
  }

  :host([size="l"]) .base {
    gap: var(--ui-radio-gap, ${SP_1_5});
  }

  :host([size="l"]) .label {
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .dot {
    width: 8px;
    height: 8px;
  }

  /* ── Checked fill ───────────────────────────────────────────────────────── */

  :host([checked]) .radio {
    border-color: var(--ui-radio-checked-border, ${BORDER_CONTRAST});
    background-color: var(--ui-radio-bg, ${SURFACE_PRIMARY});
  }

  /* ── Hover ──────────────────────────────────────────────────────────────── */

  :host(:hover) .radio {
    border-color: var(--ui-radio-hover-border, ${HOVER_BORDER_MODERATE});
  }

  :host([checked]:hover) .radio {
    border-color: var(--ui-radio-checked-border, ${BORDER_CONTRAST});
  }

  /* ── Focus ──────────────────────────────────────────────────────────────── */

  :host(:focus-visible) .outer {
    border-color: var(--ui-radio-focus-border, ${BORDER_FOCUS});
  }

  /* ── Disabled ───────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .radio {
    border-color: ${DISABLED_BORDER};
    background-color: #ffffff;
  }
  :host([disabled][checked]) .radio {
    border-color: ${DISABLED_BORDER};
    background-color: #ffffff;
  }
  :host([disabled][checked]) .dot {
    background-color: ${DISABLED_MINIMAL};
  }
  :host([disabled]) .label {
    color: ${DISABLED_TEXT};
  }

  /* ── Error ──────────────────────────────────────────────────────────────── */

  :host([error]) .radio {
    border-color: var(--ui-radio-error-border, ${STATUS_GENERAL_ERROR});
  }

  :host([error][checked]) .radio {
    border-color: var(--ui-radio-error-border, ${STATUS_GENERAL_ERROR});
    background-color: #ffffff;
  }
  :host([error][checked]) .dot {
    background-color: var(--ui-radio-error-dot, ${STATUS_SURFACE_ERROR_BOLD});
  }

  /* ── Reduced motion ─────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .radio {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiRadioItem extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "label",
    "checked",
    "disabled",
    "error",
  ];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // .base
    const base = document.createElement("div");
    base.className = "base";

    // .outer (hit area + focus ring)
    const outer = document.createElement("div");
    outer.className = "outer";

    // .radio (visible circle)
    const radio = document.createElement("div");
    radio.className = "radio";

    // Dot indicator
    const dot = document.createElement("span");
    dot.className = "dot";
    radio.appendChild(dot);

    outer.appendChild(radio);
    base.appendChild(outer);

    // Label slot
    const label = document.createElement("span");
    label.className = "label";
    const slot = document.createElement("slot");
    label.appendChild(slot);
    base.appendChild(label);

    shadow.appendChild(base);

    // Event listeners
    this.addEventListener("click", this._handleClick.bind(this));
    this.addEventListener("keydown", this._handleKeydown.bind(this));
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "radio");
    }
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    this._syncAriaChecked();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "checked") {
      this._syncAriaChecked();
    }
    if (name === "disabled") {
      this.setAttribute(
        "aria-disabled",
        this.disabled ? "true" : "false",
      );
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): RadioSize {
    return (this.getAttribute("size") as RadioSize) ?? "m";
  }

  set size(value: RadioSize) {
    this.setAttribute("size", value);
  }

  get label(): RadioLabel {
    return (this.getAttribute("label") as RadioLabel) ?? "none";
  }

  set label(value: RadioLabel) {
    this.setAttribute("label", value);
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }

  set checked(value: boolean) {
    if (value) {
      this.setAttribute("checked", "");
    } else {
      this.removeAttribute("checked");
    }
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  get error(): boolean {
    return this.hasAttribute("error");
  }

  set error(value: boolean) {
    if (value) {
      this.setAttribute("error", "");
    } else {
      this.removeAttribute("error");
    }
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _handleClick(): void {
    if (this.disabled) return;
    this._select();
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._select();
    }
  }

  private _select(): void {
    if (this.checked) return; // Radio cannot be unchecked by clicking again
    this.checked = true;
    this.dispatchEvent(
      new CustomEvent("change", { bubbles: true, composed: true }),
    );
  }

  private _syncAriaChecked(): void {
    this.setAttribute("aria-checked", this.checked ? "true" : "false");
  }
}

customElements.define("ui-radio-item", UiRadioItem);
