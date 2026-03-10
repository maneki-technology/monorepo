import { semanticVar, spaceVar } from "@maneki/foundation";
import "./ui-label.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type InputSize = "s" | "m" | "l";
export type InputType = "text" | "numeric" | "clearable" | "password";
export type InputStatus = "none" | "warning" | "error" | "success" | "loading";

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
const DISABLED_MINIMAL = semanticVar("stateDisabled", "minimal");
const ICON_PRIMARY = semanticVar("icon", "primary");
const SP_05 = spaceVar("0.5");
const SP_1 = spaceVar("1");
const SP_15 = spaceVar("1.5");

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

  /* ── Input container ───────────────────────────────────────────────────── */

  .input-container {
    display: flex;
    align-items: center;
    border: 1px solid var(--ui-input-border, ${FORM_INPUT_BORDER});
    border-radius: 2px;
    background-color: var(--ui-input-bg, #ffffff);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    overflow: hidden;
  }

  /* ── Native input ──────────────────────────────────────────────────────── */

  .native-input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    color: var(--ui-input-color, ${TEXT_PRIMARY});
    padding: 0;
    margin: 0;
    -moz-appearance: textfield;
  }

  .native-input::-webkit-outer-spin-button,
  .native-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .native-input::placeholder {
    color: var(--ui-input-placeholder-color, ${TEXT_TERTIARY});
  }

  /* ── Slots (leading / trailing) ────────────────────────────────────────── */

  .leading-slot,
  .trailing-slot {
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

  .trailing-slot ::slotted(*) {
    display: flex;
    align-items: center;
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
  }

  .clear-btn:hover {
    color: ${TEXT_PRIMARY};
  }

  .clear-btn .material-symbols-outlined {
    font-size: var(--_clear-size);
  }

  :host([type="clearable"]) .clear-btn.has-value {
    display: flex;
  }

  /* ── Password toggle ──────────────────────────────────────────────────── */

  .password-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: ${ICON_PRIMARY};
    line-height: 1;
  }

  .password-toggle:hover {
    color: ${TEXT_PRIMARY};
  }

  .password-toggle .material-symbols-outlined {
    font-size: var(--_clear-size);
  }

  :host([type="password"]) .password-toggle {
    display: flex;
  }

  /* ── Numeric spinner ───────────────────────────────────────────────────── */

  .numeric-controls {
    display: none;
    flex-direction: column;
    flex-shrink: 0;
    border-left: 1px solid ${BORDER_MINIMAL};
    align-self: stretch;
  }

  :host([type="numeric"]) .numeric-controls {
    display: flex;
  }

  .spinner-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: ${TEXT_SECONDARY};
    line-height: 1;
  }

  .spinner-btn:hover {
    background-color: ${SURFACE_SECONDARY};
    color: ${TEXT_PRIMARY};
  }

  .spinner-divider {
    height: 1px;
    background-color: ${BORDER_MINIMAL};
  }

  .spinner-btn .material-symbols-outlined {
    font-size: 16px;
  }

  /* ── Supportive text ───────────────────────────────────────────────────── */

  .supportive-text {
    display: none;
    font-size: 11px;
    line-height: 16px;
    color: var(--ui-input-supportive-color, ${TEXT_SECONDARY});
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
    --_input-height: 32px;
    --_input-padding-left: ${SP_1};
    --_input-font-size: 14px;
    --_input-line-height: 20px;
    --_status-icon-size: 18px;
    --_clear-size: 16px;
    --_numeric-width: 24px;
  }

  /* ── Size: s ───────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_input-height: 24px;
    --_input-padding-left: ${SP_1};
    --_input-font-size: 12px;
    --_input-line-height: 16px;
    --_status-icon-size: 14px;
    --_clear-size: 12px;
    --_numeric-width: 20px;
  }

  /* ── Size: l ───────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_input-height: 40px;
    --_input-padding-left: ${SP_15};
    --_input-font-size: 16px;
    --_input-line-height: 24px;
    --_status-icon-size: 20px;
    --_clear-size: 18px;
    --_numeric-width: 28px;
  }

  .input-container {
    height: var(--_input-height);
    padding-left: var(--_input-padding-left);
    padding-right: ${SP_1};
    gap: ${SP_05};
  }

  .native-input {
    font-size: var(--_input-font-size);
    line-height: var(--_input-line-height);
  }


  .status-icon {
    width: var(--_status-icon-size);
    height: var(--_status-icon-size);
  }

  .clear-btn {
    width: var(--_clear-size);
    height: var(--_clear-size);
  }

  .numeric-controls {
    width: var(--_numeric-width);
  }

  /* ── Hover ─────────────────────────────────────────────────────────────── */

  :host(:hover:not([disabled]):not([readonly])) .input-container {
    border-color: var(--ui-input-hover-border, ${HOVER_BORDER});
  }

  /* ── Focus ─────────────────────────────────────────────────────────────── */

  :host(:focus-within:not([disabled]):not([readonly])) .input-container {
    border-color: var(--ui-input-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-input-focus-border, ${BORDER_FOCUS});
  }

  /* ── Error state ───────────────────────────────────────────────────────── */

  :host([status="error"]) .input-container,
  :host([error]) .input-container {
    border-color: ${STATUS_ERROR};
  }

  :host([status="error"]:focus-within) .input-container,
  :host([error]:focus-within) .input-container {
    border-color: ${STATUS_ERROR};
    box-shadow: 0 0 0 1px ${STATUS_ERROR};
  }

  /* ── Warning state ─────────────────────────────────────────────────────── */

  :host([status="warning"]) .input-container {
    border-color: ${STATUS_WARNING};
  }

  :host([status="warning"]:focus-within) .input-container {
    border-color: ${STATUS_WARNING};
    box-shadow: 0 0 0 1px ${STATUS_WARNING};
  }

  /* ── Success state ─────────────────────────────────────────────────────── */

  :host([status="success"]) .input-container {
    border-color: ${STATUS_SUCCESS};
  }

  :host([status="success"]:focus-within) .input-container {
    border-color: ${STATUS_SUCCESS};
    box-shadow: 0 0 0 1px ${STATUS_SUCCESS};
  }

  /* ── Disabled ──────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .input-container {
    border-color: ${DISABLED_BORDER};
    background-color: ${SURFACE_SECONDARY};
  }

  :host([disabled]) .native-input {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .native-input::placeholder {
    color: ${DISABLED_TEXT};
  }


  :host([disabled]) .supportive-text {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .leading-slot,
  :host([disabled]) .trailing-slot {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .status-icon {
    color: ${DISABLED_TEXT} !important;
  }

  :host([disabled]) .numeric-controls {
    border-left-color: ${DISABLED_BORDER};
  }

  :host([disabled]) .spinner-btn {
    color: ${DISABLED_TEXT};
  }

  /* ── Readonly ──────────────────────────────────────────────────────────── */

  :host([readonly]) .input-container {
    border-color: ${BORDER_MINIMAL};
    background-color: ${SURFACE_SECONDARY};
  }

  :host([readonly]) .native-input {
    cursor: default;
    color: ${TEXT_SECONDARY};
  }


  /* ── Reduced motion ────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .input-container {
      transition-duration: 0.01ms !important;
    }
    :host([status="loading"]) .status-icon .material-symbols-outlined {
      animation-duration: 0.01ms !important;
    }
  }
`;

// ─── Status icon map ─────────────────────────────────────────────────────────

const STATUS_ICON_MAP: Record<string, string> = {
  warning: "warning",
  error: "error",
  success: "check_circle",
  loading: "progress_activity",
};

// ─── Component ───────────────────────────────────────────────────────────────

export class UiInput extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "type",
    "label",
    "secondary-label",
    "supportive",
    "placeholder",
    "value",
    "name",
    "disabled",
    "readonly",
    "error",
    "status",
  ];

  private _inputEl: HTMLInputElement;
  private _statusIconEl: HTMLSpanElement;
  private _statusIconInner: HTMLSpanElement;
  private _clearBtnEl: HTMLButtonElement;
  private _passwordToggleEl: HTMLButtonElement;
  private _passwordIconEl: HTMLSpanElement;
  private _passwordVisible: boolean;
  private _labelTextEl: HTMLElement;
  private _secondaryLabelEl: HTMLElement;
  private _supportiveTextEl: HTMLSpanElement;
  private _supportiveId: string;

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

    // ── Input container ────────────────────────────────────────────────
    const container = document.createElement("div");
    container.className = "input-container";

    // Leading slot
    const leadingSlot = document.createElement("span");
    leadingSlot.className = "leading-slot";
    const leadingSlotEl = document.createElement("slot");
    leadingSlotEl.name = "leading";
    leadingSlot.appendChild(leadingSlotEl);
    container.appendChild(leadingSlot);

    // Native input
    this._inputEl = document.createElement("input");
    this._inputEl.className = "native-input";
    this._inputEl.type = "text";
    container.appendChild(this._inputEl);

    // Status icon
    this._statusIconEl = document.createElement("span");
    this._statusIconEl.className = "status-icon";
    this._statusIconEl.setAttribute("aria-hidden", "true");
    this._statusIconInner = document.createElement("span");
    this._statusIconInner.className = "material-symbols-outlined";
    this._statusIconEl.appendChild(this._statusIconInner);
    container.appendChild(this._statusIconEl);

    // Trailing slot
    const trailingSlot = document.createElement("span");
    trailingSlot.className = "trailing-slot";
    const trailingSlotEl = document.createElement("slot");
    trailingSlotEl.name = "trailing";
    trailingSlot.appendChild(trailingSlotEl);
    container.appendChild(trailingSlot);

    // Clear button
    this._clearBtnEl = document.createElement("button");
    this._clearBtnEl.className = "clear-btn";
    this._clearBtnEl.type = "button";
    this._clearBtnEl.setAttribute("aria-label", "Clear input");
    const clearIcon = document.createElement("span");
    clearIcon.className = "material-symbols-outlined";
    clearIcon.textContent = "close";
    this._clearBtnEl.appendChild(clearIcon);
    container.appendChild(this._clearBtnEl);

    // Password toggle
    this._passwordVisible = false;
    this._passwordToggleEl = document.createElement("button");
    this._passwordToggleEl.className = "password-toggle";
    this._passwordToggleEl.type = "button";
    this._passwordToggleEl.setAttribute("aria-label", "Toggle password visibility");
    this._passwordIconEl = document.createElement("span");
    this._passwordIconEl.className = "material-symbols-outlined";
    this._passwordIconEl.textContent = "visibility";
    this._passwordToggleEl.appendChild(this._passwordIconEl);
    container.appendChild(this._passwordToggleEl);

    // Numeric controls
    const numericControls = document.createElement("div");
    numericControls.className = "numeric-controls";

    const upBtn = document.createElement("button");
    upBtn.className = "spinner-btn spinner-up";
    upBtn.type = "button";
    upBtn.setAttribute("aria-label", "Increment");
    const upIcon = document.createElement("span");
    upIcon.className = "material-symbols-outlined";
    upIcon.textContent = "arrow_drop_up";
    upBtn.appendChild(upIcon);
    numericControls.appendChild(upBtn);

    const spinnerDivider = document.createElement("div");
    spinnerDivider.className = "spinner-divider";
    numericControls.appendChild(spinnerDivider);

    const downBtn = document.createElement("button");
    downBtn.className = "spinner-btn spinner-down";
    downBtn.type = "button";
    downBtn.setAttribute("aria-label", "Decrement");
    const downIcon = document.createElement("span");
    downIcon.className = "material-symbols-outlined";
    downIcon.textContent = "arrow_drop_down";
    downBtn.appendChild(downIcon);
    numericControls.appendChild(downBtn);

    container.appendChild(numericControls);

    shadow.appendChild(container);

    // ── Supportive text ────────────────────────────────────────────────
    this._supportiveId = "supportive-" + Math.random().toString(36).slice(2, 8);
    this._supportiveTextEl = document.createElement("div");
    this._supportiveTextEl.className = "supportive-text";
    this._supportiveTextEl.id = this._supportiveId;
    shadow.appendChild(this._supportiveTextEl);

    // ── Event listeners ────────────────────────────────────────────────
    this._inputEl.addEventListener("input", this._handleInput.bind(this));
    this._inputEl.addEventListener("change", this._handleChange.bind(this));
    this._clearBtnEl.addEventListener("click", this._handleClear.bind(this));
    this._passwordToggleEl.addEventListener("click", this._handlePasswordToggle.bind(this));
    upBtn.addEventListener("click", this._handleIncrement.bind(this));
    downBtn.addEventListener("click", this._handleDecrement.bind(this));
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "textbox");
    }
    this._syncInputType();
    this._syncValue();
    this._syncPlaceholder();
    this._syncDisabled();
    this._syncReadonly();
    this._syncStatusIcon();
    this._syncLabels();
    this._syncSupportive();
    this._syncAria();
    this._syncClearVisibility();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (name) {
      case "value":
        this._syncValue();
        this._syncClearVisibility();
        break;
      case "placeholder":
        this._syncPlaceholder();
        break;
      case "disabled":
        this._syncDisabled();
        this._syncLabels();
        this._syncAria();
        break;
      case "readonly":
        this._syncReadonly();
        this._syncAria();
        break;
      case "type":
        this._syncInputType();
        break;
      case "size":
        this._syncLabels();
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
      case "name":
        this._inputEl.name = this.getAttribute("name") ?? "";
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): InputSize {
    return (this.getAttribute("size") as InputSize) ?? "m";
  }

  set size(value: InputSize) {
    this.setAttribute("size", value);
  }

  get type(): InputType {
    return (this.getAttribute("type") as InputType) ?? "text";
  }

  set type(value: InputType) {
    this.setAttribute("type", value);
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
    return this.getAttribute("placeholder") ?? "";
  }

  set placeholder(value: string) {
    this.setAttribute("placeholder", value);
  }

  get value(): string {
    return this._inputEl.value;
  }

  set value(v: string) {
    this._inputEl.value = v;
    this.setAttribute("value", v);
    this._syncClearVisibility();
  }

  get name(): string {
    return this.getAttribute("name") ?? "";
  }

  set name(value: string) {
    this.setAttribute("name", value);
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

  get status(): InputStatus {
    return (this.getAttribute("status") as InputStatus) ?? "none";
  }

  set status(value: InputStatus) {
    this.setAttribute("status", value);
  }

  // ── Public methods ─────────────────────────────────────────────────────

  focus(): void {
    this._inputEl.focus();
  }

  blur(): void {
    this._inputEl.blur();
  }

  // ── Private sync methods ───────────────────────────────────────────────

  private _syncValue(): void {
    const val = this.getAttribute("value") ?? "";
    if (this._inputEl.value !== val) {
      this._inputEl.value = val;
    }
  }

  private _syncPlaceholder(): void {
    this._inputEl.placeholder = this.getAttribute("placeholder") ?? "";
  }

  private _syncDisabled(): void {
    this._inputEl.disabled = this.disabled;
  }

  private _syncReadonly(): void {
    this._inputEl.readOnly = this.readonly;
  }

  private _syncInputType(): void {
    if (this.type === "numeric") {
      this._inputEl.type = "text";
      this._inputEl.inputMode = "numeric";
      this._inputEl.pattern = "[0-9]*";
    } else if (this.type === "password") {
      this._inputEl.type = this._passwordVisible ? "text" : "password";
      this._inputEl.removeAttribute("inputmode");
      this._inputEl.removeAttribute("pattern");
    } else {
      this._inputEl.type = "text";
      this._inputEl.removeAttribute("inputmode");
      this._inputEl.removeAttribute("pattern");
    }
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

  private _syncLabels(): void {
    this._labelTextEl.textContent = this.label;
    this._secondaryLabelEl.textContent = this.secondaryLabel;
    // Sync size and disabled to ui-label children
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

  private _syncClearVisibility(): void {
    if (this._inputEl.value) {
      this._clearBtnEl.classList.add("has-value");
    } else {
      this._clearBtnEl.classList.remove("has-value");
    }
  }

  private _syncAria(): void {
    // aria-invalid
    const effectiveStatus = this.error ? "error" : this.status;
    if (effectiveStatus === "error") {
      this._inputEl.setAttribute("aria-invalid", "true");
    } else {
      this._inputEl.removeAttribute("aria-invalid");
    }

    // aria-disabled
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }

    // aria-readonly
    if (this.readonly) {
      this._inputEl.setAttribute("aria-readonly", "true");
    } else {
      this._inputEl.removeAttribute("aria-readonly");
    }

    // aria-describedby
    if (this.supportive) {
      this._inputEl.setAttribute("aria-describedby", this._supportiveId);
    } else {
      this._inputEl.removeAttribute("aria-describedby");
    }

    // aria-label — set on both host (for axe) and inner input
    if (this.label) {
      this._inputEl.setAttribute("aria-label", this.label);
      this.setAttribute("aria-label", this.label);
    } else {
      const hostAriaLabel = this.getAttribute("aria-label");
      if (hostAriaLabel) {
        this._inputEl.setAttribute("aria-label", hostAriaLabel);
      }
    }
  }

  // ── Event handlers ─────────────────────────────────────────────────────

  private _handleInput(): void {
    this.setAttribute("value", this._inputEl.value);
    this._syncClearVisibility();
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        composed: true,
        detail: { value: this._inputEl.value },
      }),
    );
  }

  private _handleChange(): void {
    this.setAttribute("value", this._inputEl.value);
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: this._inputEl.value },
      }),
    );
  }

  private _handleClear(): void {
    this._inputEl.value = "";
    this.setAttribute("value", "");
    this._syncClearVisibility();
    this._inputEl.focus();
    this.dispatchEvent(
      new CustomEvent("clear", { bubbles: true, composed: true }),
    );
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        composed: true,
        detail: { value: "" },
      }),
    );
  }
  private _handlePasswordToggle(): void {
    this._passwordVisible = !this._passwordVisible;
    this._inputEl.type = this._passwordVisible ? "text" : "password";
    this._passwordIconEl.textContent = this._passwordVisible ? "visibility_off" : "visibility";
    this._passwordToggleEl.setAttribute(
      "aria-label",
      this._passwordVisible ? "Hide password" : "Show password",
    );
    this._inputEl.focus();
  }

  private _handleIncrement(): void {
    if (this.disabled || this.readonly) return;
    const current = parseFloat(this._inputEl.value) || 0;
    const next = String(current + 1);
    this._inputEl.value = next;
    this.setAttribute("value", next);
    this._syncClearVisibility();
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        composed: true,
        detail: { value: next },
      }),
    );
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: next },
      }),
    );
  }

  private _handleDecrement(): void {
    if (this.disabled || this.readonly) return;
    const current = parseFloat(this._inputEl.value) || 0;
    const next = String(current - 1);
    this._inputEl.value = next;
    this.setAttribute("value", next);
    this._syncClearVisibility();
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        composed: true,
        detail: { value: next },
      }),
    );
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: next },
      }),
    );
  }
}

customElements.define("ui-input", UiInput);
