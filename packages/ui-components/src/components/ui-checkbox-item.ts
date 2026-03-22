
import {
  BORDER_FOCUS,
  BW_SM,
  DISABLED_BORDER,
  DISABLED_MINIMAL,
  DISABLED_TEXT,
  FONT_PRIMARY,
  FORM_INPUT_BORDER,
  HOVER_BORDER_MODERATE,
  RADIUS_LG,
  RADIUS_MD,
  RADIUS_SM,
  SELECTED_BOLD,
  SP_0_75,
  SP_1,
  STATUS_GENERAL_ERROR,
  STATUS_SURFACE_ERROR_BOLD,
  TEXT_PRIMARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  SURFACE_PRIMARY,
} from "@maneki/foundation";
import "./ui-icon.js";
import type { UiIcon } from "./ui-icon.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type CheckboxSize = "s" | "m" | "l";
export type CheckboxLabel = "none" | "right" | "left";
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
    border-width: ${BW_SM};
    border-style: solid;
    border-color: transparent;
  }

  /* ── Inner box (visible checkbox square) ─────────────────────────────────── */

  .checkbox {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-width: ${BW_SM};
    border-style: solid;
    border-color: var(--ui-cb-border, ${FORM_INPUT_BORDER});
    border-radius: ${RADIUS_MD};
    background-color: var(--ui-cb-bg, ${SURFACE_PRIMARY});
    color: #ffffff;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;
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

  /* ── Label slot ──────────────────────────────────────────────────────────── */

  .label {
    display: none;
    font-family: ${FONT_PRIMARY};
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
    ${TYPE_BODY_02}
  }

  :host .indeterminate-icon,
  :host([size="m"]) .indeterminate-icon {
    --ui-icon-size: 14px;
  }

  :host .check-icon,
  :host([size="m"]) .check-icon {
    --ui-icon-size: 14px;
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
    gap: var(--ui-cb-gap, ${SP_0_75});
  }

  :host([size="s"]) .label {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .indeterminate-icon {
    --ui-icon-size: 12px;
  }

  :host([size="s"]) .check-icon {
    --ui-icon-size: 12px;
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
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .indeterminate-icon {
    --ui-icon-size: 16px;
  }

  :host([size="l"]) .check-icon {
    --ui-icon-size: 16px;
  }

  /* ── Checked / Indeterminate fill ────────────────────────────────────────── */

  :host([checked]) .checkbox,
  :host([indeterminate]) .checkbox {
    background-color: var(--ui-cb-checked-bg, ${SELECTED_BOLD});
    border-color: var(--ui-cb-checked-bg, ${SELECTED_BOLD});
  }

  /* ── Hover ───────────────────────────────────────────────────────────────── */

  :host(:hover) .checkbox {
    border-color: var(--ui-cb-hover-border, ${HOVER_BORDER_MODERATE});
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
    border-color: var(--ui-cb-error-border, ${STATUS_GENERAL_ERROR});
  }

  :host([error][checked]) .checkbox,
  :host([error][indeterminate]) .checkbox {
    background-color: var(--ui-cb-error-checked-bg, ${STATUS_SURFACE_ERROR_BOLD});
    border-color: var(--ui-cb-error-checked-bg, ${STATUS_SURFACE_ERROR_BOLD});
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
    const checkIcon = document.createElement("ui-icon") as UiIcon;
    checkIcon.className = "check-icon";
    checkIcon.setAttribute("name", "check");
    checkbox.appendChild(checkIcon);

    // Indeterminate icon
    const indeterminateIcon = document.createElement("ui-icon") as UiIcon;
    indeterminateIcon.className = "indeterminate-icon";
    indeterminateIcon.setAttribute("name", "remove");
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
