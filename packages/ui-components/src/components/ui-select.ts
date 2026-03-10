import { semanticVar, spaceVar, elevationVar } from "@maneki/foundation";
import "./ui-label.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type SelectSize = "s" | "m" | "l";
export type SelectStatus = "none" | "warning" | "error" | "success" | "loading";

// ─── Token constants ─────────────────────────────────────────────────────────

const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const TEXT_TERTIARY = semanticVar("text", "tertiary");
const HOVER_BORDER = semanticVar("stateHover", "borderModerate");
const BORDER_FOCUS = semanticVar("border", "focus");
const DISABLED_BORDER = semanticVar("stateDisabled", "border");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const STATUS_ERROR = semanticVar("statusGeneral", "error");
const STATUS_WARNING = semanticVar("statusGeneral", "warning");
const STATUS_SUCCESS = semanticVar("statusGeneral", "success");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const SURFACE_PRIMARY = semanticVar("surface", "primary");
const ELEVATION_05 = elevationVar("05");
const SP_05 = spaceVar("0.5");
const SP_1 = spaceVar("1");
const SP_15 = spaceVar("1.5");

// ─── Status icon map ─────────────────────────────────────────────────────────

const STATUS_ICON_MAP: Record<string, string> = {
  warning: "warning",
  error: "error",
  success: "check_circle",
  loading: "progress_activity",
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }
  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: inherit;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: "liga";
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  :host {
    display: inline-flex;
    flex-direction: column;
    gap: ${SP_05};
    font-family: "Inter", sans-serif;
    position: relative;
  }

  /* ── Label row ─────────────────────────────────────────────────────────── */
  .label-row {
    display: none;
    align-items: baseline;
    gap: ${SP_1};
  }
  :host([label]) .label-row {
    display: flex;
  }
  .label-row ui-label {
    display: inline;
  }

  /* ── Trigger ───────────────────────────────────────────────────────────── */
  .trigger {
    display: flex;
    align-items: center;
    border: 1px solid var(--ui-select-border, ${FORM_INPUT_BORDER});
    border-radius: 2px;
    background-color: var(--ui-select-bg, #ffffff);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    overflow: hidden;
    cursor: pointer;
    outline: none;
  }
  .trigger:focus-visible {
    border-color: var(--ui-select-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-select-focus-border, ${BORDER_FOCUS});
  }

  /* ── Display value ─────────────────────────────────────────────────────── */
  .display-value {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: ${SP_05};
    overflow: hidden;
    color: var(--ui-select-color, ${TEXT_PRIMARY});
  }
  .display-value.placeholder {
    color: var(--ui-select-placeholder-color, ${TEXT_TERTIARY});
  }

  /* ── Tags (multi-select) ───────────────────────────────────────────────── */
  .tag {
    display: inline-flex;
    align-items: center;
    background: #D4E4FA;
    border-radius: 200px;
    padding: 2px 8px;
    gap: 4px;
    flex-shrink: 0;
  }
  .tag-label {
    font-size: 12px;
    line-height: 16px;
    color: #0D4EA6;
    white-space: nowrap;
  }
  .tag-dismiss {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    color: #0D4EA6;
    width: 12px;
    height: 12px;
    line-height: 0;
  }
  .tag-dismiss .material-symbols-outlined {
    font-size: 12px;
  }

  /* ── Content right ─────────────────────────────────────────────────────── */
  .content-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    overflow: clip;
    gap: ${SP_1};
  }

  /* ── Leading slot ──────────────────────────────────────────────────────── */
  .leading-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${TEXT_SECONDARY};
  }
  .leading-slot ::slotted(*) {
    display: flex;
    align-items: center;
  }

  /* ── Clear button ──────────────────────────────────────────────────────── */
  .clear-btn {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: ${TEXT_SECONDARY};
    line-height: 1;
    width: 14px;
    height: 14px;
  }
  .clear-btn:hover {
    color: ${TEXT_PRIMARY};
  }
  .clear-btn .material-symbols-outlined {
    font-size: 14px;
  }
  .clear-btn.visible {
    display: flex;
  }

  /* ── Status icon ───────────────────────────────────────────────────────── */
  .status-icon {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: var(--_status-icon-size);
    line-height: 1;
  }
  .status-icon .material-symbols-outlined {
    font-variation-settings: 'FILL' 1;
  }
  :host([status="warning"]) .status-icon {
    display: flex;
    color: ${STATUS_WARNING};
  }
  :host([status="error"]) .status-icon,
  :host([error]) .status-icon {
    display: flex;
    color: ${STATUS_ERROR};
  }
  :host([status="success"]) .status-icon {
    display: flex;
    color: ${STATUS_SUCCESS};
  }
  :host([status="loading"]) .status-icon {
    display: flex;
    color: ${TEXT_SECONDARY};
  }
  :host([status="loading"]) .status-icon .material-symbols-outlined {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* ── Chevron ───────────────────────────────────────────────────────────── */
  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.15s ease;
    line-height: 0;
    color: ${TEXT_SECONDARY};
  }
  .chevron .material-symbols-outlined {
    font-size: var(--_chevron-size);
  }
  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  /* ── Panel ─────────────────────────────────────────────────────────────── */
  .panel {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 100%;
    padding: ${SP_05} 0;
    background-color: var(--ui-select-panel-bg, ${SURFACE_PRIMARY});
    box-shadow: var(--ui-select-panel-shadow, ${ELEVATION_05});
    border-radius: 2px;
    overflow: visible;
    margin-top: 2px;
  }
  :host([open]) .panel {
    display: block;
  }

  /* ── Supportive text ───────────────────────────────────────────────────── */
  .supportive-text {
    display: none;
    font-size: 11px;
    line-height: 16px;
    color: var(--ui-select-supportive-color, ${TEXT_SECONDARY});
  }
  :host([supportive]) .supportive-text {
    display: block;
  }
  :host([status="warning"]) .supportive-text {
    color: ${STATUS_WARNING};
  }
  :host([status="error"]) .supportive-text,
  :host([error]) .supportive-text {
    color: ${STATUS_ERROR};
  }
  :host([status="success"]) .supportive-text {
    color: ${STATUS_SUCCESS};
  }

  /* ── Size: m (default) ─────────────────────────────────────────────────── */
  :host,
  :host([size="m"]) {
    --_select-height: 32px;
    --_select-padding-left: ${SP_1};
    --_select-padding-right: ${SP_1};
    --_select-font-size: 14px;
    --_select-line-height: 20px;
    --_select-gap: ${SP_1};
    --_status-icon-size: 18px;
    --_chevron-size: 20px;
    --_leading-size: 20px;
  }

  /* ── Size: s ───────────────────────────────────────────────────────────── */
  :host([size="s"]) {
    --_select-height: 24px;
    --_select-padding-left: ${SP_1};
    --_select-padding-right: ${SP_1};
    --_select-font-size: 12px;
    --_select-line-height: 16px;
    --_select-gap: ${SP_05};
    --_status-icon-size: 14px;
    --_chevron-size: 16px;
    --_leading-size: 16px;
  }

  /* ── Size: l ───────────────────────────────────────────────────────────── */
  :host([size="l"]) {
    --_select-height: 40px;
    --_select-padding-left: ${SP_15};
    --_select-padding-right: ${SP_15};
    --_select-font-size: 16px;
    --_select-line-height: 24px;
    --_select-gap: ${SP_1};
    --_status-icon-size: 20px;
    --_chevron-size: 24px;
    --_leading-size: 24px;
  }

  .trigger {
    height: var(--_select-height);
    padding-left: var(--_select-padding-left);

    gap: var(--_select-gap);
    font-size: var(--_select-font-size);
    line-height: var(--_select-line-height);
  }
  .leading-slot {
    width: var(--_leading-size);
    height: var(--_leading-size);
  }
  .content-right {
    height: var(--_select-line-height);
    padding-right: var(--_select-padding-right);
  }
    height: var(--_select-line-height);
  }

  /* ── Hover ─────────────────────────────────────────────────────────────── */
  :host(:not([disabled]):not([readonly]):not([open])) .trigger:hover {
    border-color: var(--ui-select-hover-border, ${HOVER_BORDER});
  }

  /* ── Open / Focus ──────────────────────────────────────────────────────── */
  :host([open]) .trigger {
    border-color: var(--ui-select-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-select-focus-border, ${BORDER_FOCUS});
  }

  /* ── Error state ───────────────────────────────────────────────────────── */
  :host([status="error"]) .trigger,
  :host([error]) .trigger {
    border-color: ${STATUS_ERROR};
  }
  :host([status="error"]) .trigger:focus-visible,
  :host([status="error"][open]) .trigger,
  :host([error]) .trigger:focus-visible,
  :host([error][open]) .trigger {
    border-color: ${STATUS_ERROR};
    box-shadow: 0 0 0 1px ${STATUS_ERROR};
  }

  /* ── Warning state ─────────────────────────────────────────────────────── */
  :host([status="warning"]) .trigger {
    border-color: ${STATUS_WARNING};
  }
  :host([status="warning"]) .trigger:focus-visible,
  :host([status="warning"][open]) .trigger {
    border-color: ${STATUS_WARNING};
    box-shadow: 0 0 0 1px ${STATUS_WARNING};
  }

  /* ── Success state ─────────────────────────────────────────────────────── */
  :host([status="success"]) .trigger {
    border-color: ${STATUS_SUCCESS};
  }
  :host([status="success"]) .trigger:focus-visible,
  :host([status="success"][open]) .trigger {
    border-color: ${STATUS_SUCCESS};
    box-shadow: 0 0 0 1px ${STATUS_SUCCESS};
  }

  /* ── Disabled ──────────────────────────────────────────────────────────── */
  :host([disabled]) {
    pointer-events: none;
  }
  :host([disabled]) .trigger {
    border-color: ${DISABLED_BORDER};
    background-color: ${SURFACE_SECONDARY};
    cursor: not-allowed;
  }
  :host([disabled]) .display-value,
  :host([disabled]) .display-value.placeholder {
    color: ${DISABLED_TEXT};
  }
  :host([disabled]) .chevron {
    color: ${DISABLED_TEXT};
  }
  :host([disabled]) .supportive-text {
    color: ${DISABLED_TEXT};
  }
  :host([disabled]) .leading-slot {
    color: ${DISABLED_TEXT};
  }
  :host([disabled]) .status-icon {
    color: ${DISABLED_TEXT} !important;
  }

  /* ── Readonly ──────────────────────────────────────────────────────────── */
  :host([readonly]) .trigger {
    border-color: ${BORDER_MINIMAL};
    background-color: ${SURFACE_SECONDARY};
    cursor: default;
  }
  :host([readonly]) .display-value {
    color: ${TEXT_SECONDARY};
  }
  :host([readonly]) .chevron {
    color: ${DISABLED_TEXT};
  }

  /* ── Multi-select trigger height auto ──────────────────────────────────── */
  :host([multiple]) .trigger {
    height: auto;
    min-height: var(--_select-height);
    padding-top: 2px;
    padding-bottom: 2px;
    flex-wrap: wrap;
  }

  /* ── Reduced motion ────────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .trigger {
      transition-duration: 0.01ms !important;
    }
    .chevron {
      transition-duration: 0.01ms !important;
    }
    :host([status="loading"]) .status-icon .material-symbols-outlined {
      animation-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiSelect extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "label",
    "secondary-label",
    "supportive",
    "placeholder",
    "disabled",
    "readonly",
    "open",
    "multiple",
    "status",
    "error",
    "value",
    "name",
  ];

  private _trigger: HTMLDivElement;
  private _displayValue: HTMLSpanElement;
  private _clearBtn: HTMLButtonElement;
  private _statusIconEl: HTMLSpanElement;
  private _statusIconInner: HTMLSpanElement;
  private _chevron: HTMLSpanElement;
  private _panel: HTMLDivElement;
  private _slot: HTMLSlotElement;
  private _labelTextEl: HTMLElement;
  private _secondaryLabelEl: HTMLElement;
  private _supportiveTextEl: HTMLDivElement;
  private _supportiveId: string;
  private _panelId: string;
  private _selectedValues: Set<string> = new Set();

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // ── Label row ──────────────────────────────────────────────────────
    const labelRow = document.createElement("div");
    labelRow.className = "label-row";

    this._labelTextEl = document.createElement("ui-label");
    this._labelTextEl.setAttribute("emphasis", "bold");
    labelRow.appendChild(this._labelTextEl);

    this._secondaryLabelEl = document.createElement("ui-label");
    this._secondaryLabelEl.setAttribute("emphasis", "subtle");
    labelRow.appendChild(this._secondaryLabelEl);

    shadow.appendChild(labelRow);

    // ── Trigger ────────────────────────────────────────────────────────
    this._panelId = "panel-" + Math.random().toString(36).slice(2, 8);

    const trigger = document.createElement("div");
    trigger.className = "trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", this._panelId);
    trigger.setAttribute("tabindex", "0");

    // Leading slot
    const leadingSlot = document.createElement("span");
    leadingSlot.className = "leading-slot";
    const leadingSlotEl = document.createElement("slot");
    leadingSlotEl.name = "leading";
    leadingSlot.appendChild(leadingSlotEl);
    trigger.appendChild(leadingSlot);

    // Display value
    this._displayValue = document.createElement("span");
    this._displayValue.className = "display-value placeholder";
    trigger.appendChild(this._displayValue);

    // Content right
    const contentRight = document.createElement("span");
    contentRight.className = "content-right";

    // Clear button
    this._clearBtn = document.createElement("button");
    this._clearBtn.className = "clear-btn";
    this._clearBtn.type = "button";
    this._clearBtn.setAttribute("aria-label", "Clear selection");
    this._clearBtn.setAttribute("tabindex", "-1");
    const clearIcon = document.createElement("span");
    clearIcon.className = "material-symbols-outlined";
    clearIcon.textContent = "close";
    this._clearBtn.appendChild(clearIcon);
    contentRight.appendChild(this._clearBtn);

    // Status icon
    this._statusIconEl = document.createElement("span");
    this._statusIconEl.className = "status-icon";
    this._statusIconEl.setAttribute("aria-hidden", "true");
    this._statusIconInner = document.createElement("span");
    this._statusIconInner.className = "material-symbols-outlined";
    this._statusIconEl.appendChild(this._statusIconInner);
    contentRight.appendChild(this._statusIconEl);

    // Chevron
    this._chevron = document.createElement("span");
    this._chevron.className = "chevron";
    this._chevron.setAttribute("aria-hidden", "true");
    const chevronIcon = document.createElement("span");
    chevronIcon.className = "material-symbols-outlined";
    chevronIcon.textContent = "expand_more";
    this._chevron.appendChild(chevronIcon);
    contentRight.appendChild(this._chevron);

    trigger.appendChild(contentRight);
    shadow.appendChild(trigger);
    this._trigger = trigger;

    // ── Panel ──────────────────────────────────────────────────────────
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.setAttribute("role", "listbox");
    panel.id = this._panelId;

    this._slot = document.createElement("slot");
    panel.appendChild(this._slot);
    shadow.appendChild(panel);
    this._panel = panel;

    // ── Supportive text ────────────────────────────────────────────────
    this._supportiveId = "supportive-" + Math.random().toString(36).slice(2, 8);
    this._supportiveTextEl = document.createElement("div");
    this._supportiveTextEl.className = "supportive-text";
    this._supportiveTextEl.id = this._supportiveId;
    shadow.appendChild(this._supportiveTextEl);

    // ── Event listeners ────────────────────────────────────────────────
    trigger.addEventListener("click", this._handleTriggerClick);
    trigger.addEventListener("keydown", this._handleTriggerKeydown);
    this._clearBtn.addEventListener("click", this._handleClear);
    this._slot.addEventListener("slotchange", this._handleSlotChange);
    this.addEventListener("select", this._handleItemSelect as EventListener);
  }

  connectedCallback(): void {
    document.addEventListener("click", this._handleOutsideClick);
    this._syncLabels();
    this._syncSupportive();
    this._syncStatusIcon();
    this._syncPlaceholder();
    this._syncAria();
    this._syncClearVisibility();
    this._syncOpen();
    this._propagateSize();
    this._syncValueFromAttr();
  }

  disconnectedCallback(): void {
    document.removeEventListener("click", this._handleOutsideClick);
    this.removeEventListener("select", this._handleItemSelect as EventListener);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (name) {
      case "value":
        this._syncValueFromAttr();
        this._syncClearVisibility();
        break;
      case "placeholder":
        this._syncPlaceholder();
        break;
      case "disabled":
        this._syncAria();
        this._syncClearVisibility();
        this._syncLabels();
        break;
      case "readonly":
        this._syncAria();
        this._syncClearVisibility();
        break;
      case "open":
        this._syncOpen();
        break;
      case "size":
        this._syncLabels();
        this._propagateSize();
        break;
      case "status":
      case "error":
        this._syncStatusIcon();
        this._syncAria();
        break;
      case "label":
      case "secondary-label":
        this._syncLabels();
        this._syncAria();
        break;
      case "supportive":
        this._syncSupportive();
        this._syncAria();
        break;
      case "multiple":
        this._renderDisplayValue();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): SelectSize {
    return (this.getAttribute("size") as SelectSize) ?? "m";
  }
  set size(value: SelectSize) {
    this.setAttribute("size", value);
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }
  set label(value: string) {
    if (value) {
      this.setAttribute("label", value);
    } else {
      this.removeAttribute("label");
    }
  }

  get secondaryLabel(): string {
    return this.getAttribute("secondary-label") ?? "";
  }
  set secondaryLabel(value: string) {
    if (value) {
      this.setAttribute("secondary-label", value);
    } else {
      this.removeAttribute("secondary-label");
    }
  }

  get supportive(): string {
    return this.getAttribute("supportive") ?? "";
  }
  set supportive(value: string) {
    if (value) {
      this.setAttribute("supportive", value);
    } else {
      this.removeAttribute("supportive");
    }
  }

  get placeholder(): string {
    return this.getAttribute("placeholder") ?? "Select an option";
  }
  set placeholder(value: string) {
    this.setAttribute("placeholder", value);
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

  get readonly(): boolean {
    return this.hasAttribute("readonly");
  }
  set readonly(value: boolean) {
    if (value) {
      this.setAttribute("readonly", "");
    } else {
      this.removeAttribute("readonly");
    }
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(value: boolean) {
    if (value && !this.disabled && !this.readonly) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  get multiple(): boolean {
    return this.hasAttribute("multiple");
  }
  set multiple(value: boolean) {
    if (value) {
      this.setAttribute("multiple", "");
    } else {
      this.removeAttribute("multiple");
    }
  }

  get status(): SelectStatus {
    return (this.getAttribute("status") as SelectStatus) ?? "none";
  }
  set status(value: SelectStatus) {
    this.setAttribute("status", value);
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

  get name(): string {
    return this.getAttribute("name") ?? "";
  }
  set name(value: string) {
    this.setAttribute("name", value);
  }

  get value(): string | string[] {
    if (this.multiple) {
      return Array.from(this._selectedValues);
    }
    const vals = Array.from(this._selectedValues);
    return vals.length > 0 ? vals[0] : "";
  }
  set value(v: string | string[]) {
    if (Array.isArray(v)) {
      this._selectedValues = new Set(v);
    } else {
      this._selectedValues = v ? new Set([v]) : new Set();
    }
    this._syncItemSelection();
    this._renderDisplayValue();
    this._syncClearVisibility();
  }

  // ── Private sync methods ───────────────────────────────────────────────

  private _syncLabels(): void {
    this._labelTextEl.textContent = this.label;
    this._secondaryLabelEl.textContent = this.secondaryLabel;
    const size = this.getAttribute("size") || "m";
    this._labelTextEl.setAttribute("size", size);
    this._secondaryLabelEl.setAttribute("size", size);
    if (this.disabled) {
      this._labelTextEl.setAttribute("disabled", "");
      this._secondaryLabelEl.setAttribute("disabled", "");
    } else {
      this._labelTextEl.removeAttribute("disabled");
      this._secondaryLabelEl.removeAttribute("disabled");
    }
  }

  private _syncSupportive(): void {
    this._supportiveTextEl.textContent = this.supportive;
  }

  private _syncStatusIcon(): void {
    const effectiveStatus = this.error ? "error" : this.status;
    const iconName = STATUS_ICON_MAP[effectiveStatus];
    if (iconName) {
      this._statusIconInner.textContent = iconName;
    } else {
      this._statusIconInner.textContent = "";
    }
  }

  private _syncPlaceholder(): void {
    if (this._selectedValues.size === 0) {
      this._displayValue.textContent = this.placeholder;
      this._displayValue.classList.add("placeholder");
    }
  }

  private _syncOpen(): void {
    const isOpen = this.open;
    this._trigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      this._panel.setAttribute("aria-multiselectable", String(this.multiple));
    }
    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { open: isOpen },
      }),
    );
  }

  private _syncClearVisibility(): void {
    const hasValue = this._selectedValues.size > 0;
    const canClear = hasValue && !this.disabled && !this.readonly;
    if (canClear) {
      this._clearBtn.classList.add("visible");
    } else {
      this._clearBtn.classList.remove("visible");
    }
  }

  private _syncAria(): void {
    const effectiveStatus = this.error ? "error" : this.status;
    if (effectiveStatus === "error") {
      this._trigger.setAttribute("aria-invalid", "true");
    } else {
      this._trigger.removeAttribute("aria-invalid");
    }
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
      this._trigger.setAttribute("tabindex", "-1");
    } else {
      this.removeAttribute("aria-disabled");
      this._trigger.setAttribute("tabindex", "0");
    }
    if (this.readonly) {
      this.setAttribute("aria-readonly", "true");
    } else {
      this.removeAttribute("aria-readonly");
    }
    if (this.supportive) {
      this._trigger.setAttribute("aria-describedby", this._supportiveId);
    } else {
      this._trigger.removeAttribute("aria-describedby");
    }
    if (this.label) {
      this._trigger.setAttribute("aria-label", this.label);
      this.setAttribute("aria-label", this.label);
    } else {
      const hostAriaLabel = this.getAttribute("aria-label");
      if (hostAriaLabel) {
        this._trigger.setAttribute("aria-label", hostAriaLabel);
      }
    }
  }

  private _syncValueFromAttr(): void {
    const attrVal = this.getAttribute("value");
    if (attrVal === null) return;
    if (this.multiple) {
      const vals = attrVal.split(",").map((s) => s.trim()).filter(Boolean);
      this._selectedValues = new Set(vals);
    } else {
      this._selectedValues = attrVal ? new Set([attrVal]) : new Set();
    }
    this._syncItemSelection();
    this._renderDisplayValue();
  }

  private _syncItemSelection(): void {
    const items = this._getSlottedItems();
    for (const item of items) {
      const itemValue = item.getAttribute("value") ?? item.textContent?.trim() ?? "";
      if (this._selectedValues.has(itemValue)) {
        item.setAttribute("selected", "");
        item.setAttribute("aria-selected", "true");
      } else {
        item.removeAttribute("selected");
        item.setAttribute("aria-selected", "false");
      }
    }
  }

  private _propagateSize(): void {
    const size = this.size;
    const children = this._slot
      .assignedElements({ flatten: true })
      .filter((el) => ["UI-DROPDOWN-ITEM", "UI-DROPDOWN-HEADING"].includes(el.tagName));
    for (const child of children) {
      child.setAttribute("size", size);
      if (child.tagName === "UI-DROPDOWN-ITEM") {
        child.setAttribute("role", "option");
      }
    }
  }

  private _renderDisplayValue(): void {
    while (this._displayValue.firstChild) {
      this._displayValue.removeChild(this._displayValue.firstChild);
    }

    if (this._selectedValues.size === 0) {
      this._displayValue.textContent = this.placeholder;
      this._displayValue.classList.add("placeholder");
      return;
    }

    this._displayValue.classList.remove("placeholder");

    if (this.multiple) {
      const items = this._getSlottedItems();
      for (const val of this._selectedValues) {
        const matchItem = items.find(
          (el) => (el.getAttribute("value") ?? el.textContent?.trim() ?? "") === val,
        );
        const displayText = matchItem?.textContent?.trim() ?? val;

        const tag = document.createElement("span");
        tag.className = "tag";

        const tagLabel = document.createElement("span");
        tagLabel.className = "tag-label";
        tagLabel.textContent = displayText;
        tag.appendChild(tagLabel);

        const dismiss = document.createElement("button");
        dismiss.className = "tag-dismiss";
        dismiss.type = "button";
        dismiss.setAttribute("aria-label", "Remove " + displayText);
        dismiss.setAttribute("tabindex", "-1");
        const dismissIcon = document.createElement("span");
        dismissIcon.className = "material-symbols-outlined";
        dismissIcon.textContent = "close";
        dismiss.appendChild(dismissIcon);
        tag.appendChild(dismiss);

        dismiss.addEventListener("click", (e: Event) => {
          e.stopPropagation();
          if (this.disabled || this.readonly) return;
          this._selectedValues.delete(val);
          this._syncItemSelection();
          this._renderDisplayValue();
          this._syncClearVisibility();
          this._fireChange();
        });

        this._displayValue.appendChild(tag);
      }
    } else {
      const items = this._getSlottedItems();
      const val = Array.from(this._selectedValues)[0];
      const matchItem = items.find(
        (el) => (el.getAttribute("value") ?? el.textContent?.trim() ?? "") === val,
      );
      this._displayValue.textContent = matchItem?.textContent?.trim() ?? val;
    }
  }

  private _getSlottedItems(): Element[] {
    return this._slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-DROPDOWN-ITEM");
  }

  private _fireChange(): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }

  // ── Event handlers ─────────────────────────────────────────────────────

  private _handleTriggerClick = (e: Event): void => {
    if ((e.target as HTMLElement).closest?.(".clear-btn")) return;
    if (this.disabled || this.readonly) return;
    this.open = !this.open;
  };

  private _handleTriggerKeydown = (e: Event): void => {
    const ke = e as KeyboardEvent;

    if (ke.key === "Escape" && this.open) {
      ke.preventDefault();
      this.open = false;
      this._trigger.focus();
      return;
    }

    if (ke.key === "Tab" && this.open) {
      this.open = false;
      return;
    }

    if (!this.open) {
      if (ke.key === "ArrowDown" || ke.key === "ArrowUp" || ke.key === "Enter" || ke.key === " ") {
        if (this.disabled || this.readonly) return;
        ke.preventDefault();
        this.open = true;
        this._focusItem(ke.key === "ArrowUp" ? -1 : 0);
      }
      return;
    }

    // Panel is open — navigate items
    const items = this._getSlottedItems().filter(
      (el) => !el.hasAttribute("disabled"),
    ) as HTMLElement[];
    if (items.length === 0) return;

    const active = items.findIndex(
      (el) => el === document.activeElement || el.matches(":focus"),
    );
    let next: number | null = null;

    switch (ke.key) {
      case "ArrowDown":
        next = active < 0 ? 0 : (active + 1) % items.length;
        break;
      case "ArrowUp":
        next = active < 0 ? items.length - 1 : (active - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      case "Enter":
      case " ":
        ke.preventDefault();
        if (active >= 0) {
          items[active].click();
        }
        return;
      default:
        return;
    }

    ke.preventDefault();
    items[next].focus();
  };

  private _handleOutsideClick = (e: Event): void => {
    if (this.open && !e.composedPath().includes(this)) {
      this.open = false;
    }
  };

  private _handleClear = (e: Event): void => {
    e.stopPropagation();
    this._selectedValues.clear();
    this._syncItemSelection();
    this._renderDisplayValue();
    this._syncClearVisibility();
    this.dispatchEvent(
      new CustomEvent("clear", { bubbles: true, composed: true }),
    );
    this._fireChange();
    this._trigger.focus();
  };

  private _handleSlotChange = (): void => {
    this._propagateSize();
    this._syncItemSelection();
    this._renderDisplayValue();
    this._syncClearVisibility();
  };

  private _handleItemSelect = (e: Event): void => {
    const item = e.target as HTMLElement;
    if (item.tagName !== "UI-DROPDOWN-ITEM") return;

    const itemValue = item.getAttribute("value") ?? item.textContent?.trim() ?? "";

    if (this.multiple) {
      if (this._selectedValues.has(itemValue)) {
        this._selectedValues.delete(itemValue);
      } else {
        this._selectedValues.add(itemValue);
      }
    } else {
      this._selectedValues.clear();
      this._selectedValues.add(itemValue);
      this.open = false;
      this._trigger.focus();
    }

    this._syncItemSelection();
    this._renderDisplayValue();
    this._syncClearVisibility();
    this._fireChange();
  };

  private _focusItem(index: number): void {
    requestAnimationFrame(() => {
      const items = this._getSlottedItems().filter(
        (el) => !el.hasAttribute("disabled"),
      ) as HTMLElement[];
      if (items.length === 0) return;
      const target = index < 0 ? items.length - 1 : Math.min(index, items.length - 1);
      items[target].focus();
    });
  }
}

customElements.define("ui-select", UiSelect);
