import { semanticVar, spaceVar } from "@maneki/foundation";
import { ICON_CHECK } from "../assets/icons.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type CheckboxSize = "s" | "m" | "l";
export type CheckboxLabel = "none" | "right" | "left";

// ─── Token constants ─────────────────────────────────────────────────────────

const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const SELECTED_BOLD = semanticVar("stateSelected", "surfaceBold");
const HOVER_BORDER = semanticVar("stateHover", "borderModerate");
const BORDER_FOCUS = semanticVar("border", "focus");
const ERROR_BOLD = semanticVar("statusSurface", "errorBold");
const STATUS_ERROR = semanticVar("statusGeneral", "error");
const TEXT_PRIMARY = semanticVar("text", "primary");
const DISABLED_BORDER = semanticVar("stateDisabled", "border");
const DISABLED_MINIMAL = semanticVar("stateDisabled", "minimal");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const SP_075 = spaceVar("0.75");
const SP_1 = spaceVar("1");


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
  }

  /* ── Inner box (visible checkbox square) ─────────────────────────────────── */

  .checkbox {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--ui-cb-border, ${FORM_INPUT_BORDER});
    background-color: var(--ui-cb-bg, #ffffff);
    color: #ffffff;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;
  }

  .checkbox svg {
    width: 100%;
    height: 100%;
  }

  /* ── Check / indeterminate icons ─────────────────────────────────────────── */

  .check-icon,
  .indeterminate-icon {
    display: none;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  :host([checked]) .check-icon {
    display: inline-flex;
  }

  :host([indeterminate]) .check-icon {
    display: none;
  }

  :host([indeterminate]) .indeterminate-icon {
    display: inline-flex;
  }

  .indeterminate-bar {
    display: block;
    background-color: #ffffff;
    border-radius: 1px;
    height: 1.5px;
  }

  /* ── Label slot ──────────────────────────────────────────────────────────── */

  .label {
    display: none;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    color: var(--ui-cb-label-color, ${TEXT_PRIMARY});
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
    width: var(--ui-cb-outer-size, 18px);
    height: var(--ui-cb-outer-size, 18px);
  }

  :host .checkbox,
  :host([size="m"]) .checkbox {
    width: var(--ui-cb-inner-size, 14px);
    height: var(--ui-cb-inner-size, 14px);
  }

  :host .base,
  :host([size="m"]) .base {
    gap: var(--ui-cb-gap, ${SP_1});
  }

  :host .label,
  :host([size="m"]) .label {
    font-size: 14px;
    line-height: 20px;
  }

  :host .indeterminate-bar,
  :host([size="m"]) .indeterminate-bar {
    width: 8px;
  }

  :host .check-icon,
  :host([size="m"]) .check-icon {
    width: 10px;
    height: 10px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .outer {
    width: var(--ui-cb-outer-size, 16px);
    height: var(--ui-cb-outer-size, 16px);
  }

  :host([size="s"]) .checkbox {
    width: var(--ui-cb-inner-size, 12px);
    height: var(--ui-cb-inner-size, 12px);
  }

  :host([size="s"]) .base {
    gap: var(--ui-cb-gap, ${SP_075});
  }

  :host([size="s"]) .label {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .indeterminate-bar {
    width: 7px;
  }

  :host([size="s"]) .check-icon {
    width: 8px;
    height: 8px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .outer {
    width: var(--ui-cb-outer-size, 20px);
    height: var(--ui-cb-outer-size, 20px);
  }

  :host([size="l"]) .checkbox {
    width: var(--ui-cb-inner-size, 16px);
    height: var(--ui-cb-inner-size, 16px);
  }

  :host([size="l"]) .base {
    gap: var(--ui-cb-gap, ${SP_1});
  }

  :host([size="l"]) .label {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .indeterminate-bar {
    width: 9px;
  }

  :host([size="l"]) .check-icon {
    width: 12px;
    height: 12px;
  }

  /* ── Checked / Indeterminate fill ────────────────────────────────────────── */

  :host([checked]) .checkbox,
  :host([indeterminate]) .checkbox {
    background-color: var(--ui-cb-checked-bg, ${SELECTED_BOLD});
    border-color: var(--ui-cb-checked-bg, ${SELECTED_BOLD});
  }

  /* ── Hover ───────────────────────────────────────────────────────────────── */

  :host(:hover) .checkbox {
    border-color: var(--ui-cb-hover-border, ${HOVER_BORDER});
  }

  :host([checked]:hover) .checkbox,
  :host([indeterminate]:hover) .checkbox {
    border-color: var(--ui-cb-checked-bg, ${SELECTED_BOLD});
  }

  /* ── Focus ───────────────────────────────────────────────────────────────── */

  :host(:focus-visible) .outer {
    border-color: var(--ui-cb-focus-border, ${BORDER_FOCUS});
  }

  /* ── Disabled ────────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .checkbox {
    border-color: var(--ui-cb-disabled-border, ${DISABLED_BORDER});
  }
  :host([disabled][checked]) .checkbox,
  :host([disabled][indeterminate]) .checkbox {
    background-color: var(--ui-cb-disabled-bg, ${DISABLED_MINIMAL});
    border-color: var(--ui-cb-disabled-border, ${DISABLED_BORDER});
  }
  :host([disabled]) .label {
    color: var(--ui-cb-disabled-label, ${DISABLED_TEXT});
  }

  /* ── Error ───────────────────────────────────────────────────────────────── */

  :host([error]) .checkbox {
    border-color: var(--ui-cb-error-border, ${STATUS_ERROR});
  }

  :host([error][checked]) .checkbox,
  :host([error][indeterminate]) .checkbox {
    background-color: var(--ui-cb-error-checked-bg, ${ERROR_BOLD});
    border-color: var(--ui-cb-error-checked-bg, ${ERROR_BOLD});
  }

  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .checkbox {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiCheckboxItem extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "label",
    "checked",
    "indeterminate",
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

    // .checkbox (visible square)
    const checkbox = document.createElement("div");
    checkbox.className = "checkbox";

    // Check icon
    const checkIcon = document.createElement("span");
    checkIcon.className = "check-icon";
    checkIcon.innerHTML = ICON_CHECK;
    checkbox.appendChild(checkIcon);

    // Indeterminate icon
    const indeterminateIcon = document.createElement("span");
    indeterminateIcon.className = "indeterminate-icon";
    const indeterminateBar = document.createElement("span");
    indeterminateBar.className = "indeterminate-bar";
    indeterminateIcon.appendChild(indeterminateBar);
    checkbox.appendChild(indeterminateIcon);

    outer.appendChild(checkbox);
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
      this.setAttribute("role", "checkbox");
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
    if (name === "checked" || name === "indeterminate") {
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

  get size(): CheckboxSize {
    return (this.getAttribute("size") as CheckboxSize) ?? "m";
  }

  set size(value: CheckboxSize) {
    this.setAttribute("size", value);
  }

  get label(): CheckboxLabel {
    return (this.getAttribute("label") as CheckboxLabel) ?? "none";
  }

  set label(value: CheckboxLabel) {
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

  get indeterminate(): boolean {
    return this.hasAttribute("indeterminate");
  }

  set indeterminate(value: boolean) {
    if (value) {
      this.setAttribute("indeterminate", "");
    } else {
      this.removeAttribute("indeterminate");
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

  // ── Private ─────────────────────────────────────────────────────────────

  private _handleClick(): void {
    if (this.disabled) return;
    this._toggle();
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._toggle();
    }
  }

  private _toggle(): void {
    if (this.indeterminate) {
      this.indeterminate = false;
      this.checked = true;
    } else {
      this.checked = !this.checked;
    }
    this.dispatchEvent(
      new CustomEvent("change", { bubbles: true, composed: true }),
    );
  }

  private _syncAriaChecked(): void {
    if (this.indeterminate) {
      this.setAttribute("aria-checked", "mixed");
    } else {
      this.setAttribute("aria-checked", this.checked ? "true" : "false");
    }
  }
}

customElements.define("ui-checkbox-item", UiCheckboxItem);
