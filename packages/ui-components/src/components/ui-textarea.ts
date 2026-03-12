import { STYLES, STATUS_ICON_MAP } from "./ui-textarea.styles.js";
import "./ui-icon.js";
import "./ui-label.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type TextareaSize = "s" | "m" | "l";
export type TextareaStatus = "none" | "warning" | "error" | "success" | "loading";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTextarea extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "label",
    "secondary-label",
    "placeholder",
    "value",
    "name",
    "disabled",
    "readonly",
    "error",
    "status",
    "rows",
    "maxlength",
  ];

  private _textareaEl: HTMLTextAreaElement;
  private _statusIconEl: HTMLSpanElement;
  private _statusIconInner: HTMLElement;
  private _labelTextEl: HTMLElement;
  private _charCountEl: HTMLSpanElement;
  private _secondaryLabelEl: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // ── Label row ──────────────────────────────────────────────────────
    const labelRow = document.createElement("div");
    labelRow.className = "label-row";

    this._labelTextEl = document.createElement("ui-label");
    this._labelTextEl.setAttribute("emphasis", "bold");
    labelRow.appendChild(this._labelTextEl);

    this._charCountEl = document.createElement("span");
    this._charCountEl.className = "char-count";
    labelRow.appendChild(this._charCountEl);

    shadow.appendChild(labelRow);

    // ── Textarea container ─────────────────────────────────────────────
    const container = document.createElement("div");
    container.className = "textarea-container";

    // Native textarea
    this._textareaEl = document.createElement("textarea");
    this._textareaEl.className = "native-textarea";
    container.appendChild(this._textareaEl);

    // Status icon
    this._statusIconEl = document.createElement("span");
    this._statusIconEl.className = "status-icon";
    this._statusIconEl.setAttribute("aria-hidden", "true");
    this._statusIconInner = document.createElement("ui-icon") as HTMLElement;
    this._statusIconInner.setAttribute("filled", "");
    this._statusIconEl.appendChild(this._statusIconInner);
    container.appendChild(this._statusIconEl);

    shadow.appendChild(container);

    // ── Secondary label ────────────────────────────────────────────────
    this._secondaryLabelEl = document.createElement("span");
    this._secondaryLabelEl.className = "secondary-label";
    shadow.appendChild(this._secondaryLabelEl);

    // ── Event listeners ────────────────────────────────────────────────
    this._textareaEl.addEventListener("input", this._handleInput.bind(this));
    this._textareaEl.addEventListener("change", this._handleChange.bind(this));
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "textbox");
    }
    if (!this.hasAttribute("aria-multiline")) {
      this.setAttribute("aria-multiline", "true");
    }
    this._syncValue();
    this._syncPlaceholder();
    this._syncDisabled();
    this._syncReadonly();
    this._syncStatusIcon();
    this._syncLabels();
    this._syncSecondaryLabel();
    this._syncRows();
    this._syncMaxlength();
    this._syncCharCount();
    this._syncAria();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (name) {
      case "value":
        this._syncValue();
        this._syncCharCount();
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
      case "size":
        this._syncLabels();
        break;
      case "status":
      case "error":
        this._syncStatusIcon();
        this._syncAria();
        break;
      case "label":
        this._syncLabels();
        this._syncAria();
        break;
      case "secondary-label":
        this._syncSecondaryLabel();
        break;
      case "rows":
        this._syncRows();
        break;
      case "maxlength":
        this._syncMaxlength();
        this._syncCharCount();
        break;
      case "name":
        this._textareaEl.name = this.getAttribute("name") ?? "";
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): TextareaSize {
    return (this.getAttribute("size") as TextareaSize) ?? "m";
  }

  set size(value: TextareaSize) {
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

  get placeholder(): string {
    return this.getAttribute("placeholder") ?? "";
  }

  set placeholder(value: string) {
    this.setAttribute("placeholder", value);
  }

  get value(): string {
    return this._textareaEl.value;
  }

  set value(v: string) {
    this._textareaEl.value = v;
    this.setAttribute("value", v);
    this._syncCharCount();
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

  get status(): TextareaStatus {
    return (this.getAttribute("status") as TextareaStatus) ?? "none";
  }

  set status(value: TextareaStatus) {
    this.setAttribute("status", value);
  }

  get rows(): number {
    const val = this.getAttribute("rows");
    return val ? parseInt(val, 10) : 4;
  }

  set rows(value: number) {
    this.setAttribute("rows", String(value));
  }

  get maxlength(): number | null {
    const val = this.getAttribute("maxlength");
    return val ? parseInt(val, 10) : null;
  }

  set maxlength(value: number | null) {
    if (value !== null) {
      this.setAttribute("maxlength", String(value));
    } else {
      this.removeAttribute("maxlength");
    }
  }

  // ── Public methods ─────────────────────────────────────────────────────

  focus(): void {
    this._textareaEl.focus();
  }

  blur(): void {
    this._textareaEl.blur();
  }

  // ── Private sync methods ───────────────────────────────────────────────

  private _syncValue(): void {
    const val = this.getAttribute("value") ?? "";
    if (this._textareaEl.value !== val) {
      this._textareaEl.value = val;
    }
  }

  private _syncPlaceholder(): void {
    this._textareaEl.placeholder = this.getAttribute("placeholder") ?? "";
  }

  private _syncDisabled(): void {
    this._textareaEl.disabled = this.disabled;
  }

  private _syncReadonly(): void {
    this._textareaEl.readOnly = this.readonly;
  }

  private _syncRows(): void {
    this._textareaEl.rows = this.rows;
  }

  private _syncMaxlength(): void {
    const ml = this.maxlength;
    if (ml !== null) {
      this._textareaEl.maxLength = ml;
    } else {
      this._textareaEl.removeAttribute("maxlength");
    }
  }

  private _syncStatusIcon(): void {
    const effectiveStatus = this.error ? "error" : this.status;
    const iconName = STATUS_ICON_MAP[effectiveStatus];
    if (iconName) {
      this._statusIconInner.setAttribute("name", iconName);
    } else {
      this._statusIconInner.setAttribute("name", "");
    }
  }

  private _syncLabels(): void {
    this._labelTextEl.textContent = this.label;
    const size = this.getAttribute("size") || "m";
    this._labelTextEl.setAttribute("size", size);
    if (this.disabled) {
      this._labelTextEl.setAttribute("disabled", "");
    } else {
      this._labelTextEl.removeAttribute("disabled");
    }
  }

  private _syncSecondaryLabel(): void {
    this._secondaryLabelEl.textContent = this.secondaryLabel;
  }

  private _syncCharCount(): void {
    const ml = this.maxlength;
    if (ml !== null) {
      const current = this._textareaEl.value.length;
      this._charCountEl.textContent = `${current}/${ml}`;
    }
  }

  private _syncAria(): void {
    // aria-invalid
    const effectiveStatus = this.error ? "error" : this.status;
    if (effectiveStatus === "error") {
      this._textareaEl.setAttribute("aria-invalid", "true");
    } else {
      this._textareaEl.removeAttribute("aria-invalid");
    }

    // aria-disabled
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }

    // aria-readonly
    if (this.readonly) {
      this._textareaEl.setAttribute("aria-readonly", "true");
    } else {
      this._textareaEl.removeAttribute("aria-readonly");
    }

    // aria-label
    if (this.label) {
      this._textareaEl.setAttribute("aria-label", this.label);
      this.setAttribute("aria-label", this.label);
    } else {
      const hostAriaLabel = this.getAttribute("aria-label");
      if (hostAriaLabel) {
        this._textareaEl.setAttribute("aria-label", hostAriaLabel);
      }
    }
  }

  // ── Event handlers ─────────────────────────────────────────────────────

  private _handleInput(): void {
    this.setAttribute("value", this._textareaEl.value);
    this._syncCharCount();
    this.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        composed: true,
        detail: { value: this._textareaEl.value },
      }),
    );
  }

  private _handleChange(): void {
    this.setAttribute("value", this._textareaEl.value);
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: this._textareaEl.value },
      }),
    );
  }
}

customElements.define("ui-textarea", UiTextarea);
