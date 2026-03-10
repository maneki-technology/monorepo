import { STYLES, STATUS_ICON_MAP } from "./ui-input.styles.js";
import "./ui-label.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type InputSize = "s" | "m" | "l";
export type InputType = "text" | "numeric" | "clearable" | "password";
export type InputStatus = "none" | "warning" | "error" | "success" | "loading";


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
