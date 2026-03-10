import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type FileUploadSize = "s" | "m" | "l";

// ─── Token constants ─────────────────────────────────────────────────────────

const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_TERTIARY = semanticVar("text", "tertiary");
const SURFACE_TERTIARY = semanticVar("surface", "tertiary");
const BORDER_FOCUS = semanticVar("border", "focus");
const DISABLED_BORDER = semanticVar("stateDisabled", "border");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const SP_1 = spaceVar("1");
const SP_15 = spaceVar("1.5");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    font-family: "Inter", sans-serif;
  }

  .wrapper {
    display: flex;
    align-items: stretch;
    border: 1px solid var(--ui-fu-border, ${FORM_INPUT_BORDER});
    border-radius: 2px;
    background-color: var(--ui-fu-bg, #ffffff);
    overflow: hidden;
    cursor: pointer;
    width: 100%;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .display-area {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .display-text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .display-text.placeholder {
    color: var(--ui-fu-placeholder-color, ${TEXT_TERTIARY});
  }

  .display-text.has-files {
    color: var(--ui-fu-color, ${TEXT_PRIMARY});
  }

  .browse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    border-left: 1px solid var(--ui-fu-separator, ${FORM_INPUT_BORDER});
    background-color: var(--ui-fu-btn-bg, ${SURFACE_TERTIARY});
    color: var(--ui-fu-btn-color, ${TEXT_PRIMARY});
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .browse-btn:hover {
    background-color: var(--ui-fu-btn-hover-bg, rgba(0, 0, 0, 0.08));
  }

  .hidden-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }

  /* ── Size: m (default) ─────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    --_fu-height: 30px;
    --_fu-padding-h: ${SP_1};
    --_fu-font-size: 14px;
    --_fu-line-height: 20px;
    --_fu-btn-gap: 4px;
  }

  /* ── Size: s ───────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_fu-height: 22px;
    --_fu-padding-h: ${SP_1};
    --_fu-font-size: 12px;
    --_fu-line-height: 16px;
    --_fu-btn-gap: 2px;
  }

  /* ── Size: l ───────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_fu-height: 38px;
    --_fu-padding-h: ${SP_15};
    --_fu-font-size: 16px;
    --_fu-line-height: 24px;
    --_fu-btn-gap: 6px;
  }

  .wrapper {
    height: var(--_fu-height);
  }

  .display-area {
    padding-left: var(--_fu-padding-h);
    padding-right: var(--_fu-padding-h);
    font-size: var(--_fu-font-size);
    line-height: var(--_fu-line-height);
  }

  .browse-btn {
    padding-left: var(--_fu-padding-h);
    padding-right: var(--_fu-padding-h);
    font-size: var(--_fu-font-size);
    line-height: var(--_fu-line-height);
    gap: var(--_fu-btn-gap);
  }

  /* ── Hover ─────────────────────────────────────────────────────────────── */

  :host(:hover:not([disabled])) .wrapper {
    border-color: var(--ui-fu-hover-border, ${semanticVar("stateHover", "borderModerate")});
  }

  /* ── Focus ─────────────────────────────────────────────────────────────── */

  :host(:focus-within:not([disabled])) .wrapper {
    border-color: var(--ui-fu-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-fu-focus-border, ${BORDER_FOCUS});
  }

  /* ── Disabled ──────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .wrapper {
    border-color: ${DISABLED_BORDER};
    background-color: var(--ui-fu-disabled-bg, ${semanticVar("surface", "secondary")});
  }

  :host([disabled]) .display-text {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .browse-btn {
    color: ${DISABLED_TEXT};
    background-color: var(--ui-fu-disabled-btn-bg, ${semanticVar("surface", "secondary")});
    border-left-color: ${DISABLED_BORDER};
  }

  /* ── Reduced motion ────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .wrapper {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiFileUpload extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "placeholder",
    "button-text",
    "accept",
    "multiple",
    "disabled",
    "name",
  ];

  private _hiddenInput: HTMLInputElement;
  private _displayTextEl: HTMLSpanElement;
  private _browseBtnEl: HTMLButtonElement;
  private _placeholder: string;
  private _buttonText: string;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // Hidden file input
    this._hiddenInput = document.createElement("input");
    this._hiddenInput.type = "file";
    this._hiddenInput.className = "hidden-input";
    this._hiddenInput.tabIndex = -1;
    this._hiddenInput.setAttribute("aria-hidden", "true");
    shadow.appendChild(this._hiddenInput);

    // Wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    // Display area
    const displayArea = document.createElement("div");
    displayArea.className = "display-area";

    this._displayTextEl = document.createElement("span");
    this._displayTextEl.className = "display-text placeholder";
    this._placeholder = "Choose files to upload";
    this._buttonText = "Browse";
    this._displayTextEl.textContent = this._placeholder;
    displayArea.appendChild(this._displayTextEl);
    wrapper.appendChild(displayArea);

    // Browse button
    this._browseBtnEl = document.createElement("button");
    this._browseBtnEl.className = "browse-btn";
    this._browseBtnEl.type = "button";
    this._browseBtnEl.textContent = this._buttonText;
    wrapper.appendChild(this._browseBtnEl);

    shadow.appendChild(wrapper);

    // Event listeners
    this._browseBtnEl.addEventListener("click", this._openPicker.bind(this));
    displayArea.addEventListener("click", this._openPicker.bind(this));
    this._hiddenInput.addEventListener("change", this._handleChange.bind(this));
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "button");
    }
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    this._syncAll();

    this.addEventListener("keydown", this._handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener("keydown", this._handleKeydown);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (name) {
      case "placeholder":
        this._placeholder = this.getAttribute("placeholder") ?? "Choose files to upload";
        this._syncDisplayText();
        break;
      case "button-text":
        this._buttonText = this.getAttribute("button-text") ?? "Browse";
        this._browseBtnEl.textContent = this._buttonText;
        break;
      case "accept":
        this._hiddenInput.accept = this.getAttribute("accept") ?? "";
        break;
      case "multiple":
        this._hiddenInput.multiple = this.hasAttribute("multiple");
        break;
      case "disabled":
        this._syncDisabled();
        break;
      case "name":
        this._hiddenInput.name = this.getAttribute("name") ?? "";
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): FileUploadSize {
    return (this.getAttribute("size") as FileUploadSize) ?? "m";
  }

  set size(value: FileUploadSize) {
    this.setAttribute("size", value);
  }

  get placeholder(): string {
    return this.getAttribute("placeholder") ?? "Choose files to upload";
  }

  set placeholder(value: string) {
    if (value) {
      this.setAttribute("placeholder", value);
    } else {
      this.removeAttribute("placeholder");
    }
  }

  get buttonText(): string {
    return this.getAttribute("button-text") ?? "Browse";
  }

  set buttonText(value: string) {
    if (value) {
      this.setAttribute("button-text", value);
    } else {
      this.removeAttribute("button-text");
    }
  }

  get accept(): string {
    return this.getAttribute("accept") ?? "";
  }

  set accept(value: string) {
    if (value) {
      this.setAttribute("accept", value);
    } else {
      this.removeAttribute("accept");
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

  get name(): string {
    return this.getAttribute("name") ?? "";
  }

  set name(value: string) {
    if (value) {
      this.setAttribute("name", value);
    } else {
      this.removeAttribute("name");
    }
  }

  get files(): FileList | null {
    return this._hiddenInput.files;
  }

  // ── Public methods ─────────────────────────────────────────────────────

  reset(): void {
    this._hiddenInput.value = "";
    this._syncDisplayText();
  }

  // ── Private methods ────────────────────────────────────────────────────

  private _syncAll(): void {
    this._placeholder = this.getAttribute("placeholder") ?? "Choose files to upload";
    this._buttonText = this.getAttribute("button-text") ?? "Browse";
    this._browseBtnEl.textContent = this._buttonText;
    this._hiddenInput.accept = this.getAttribute("accept") ?? "";
    this._hiddenInput.multiple = this.hasAttribute("multiple");
    this._hiddenInput.name = this.getAttribute("name") ?? "";
    this._syncDisabled();
    this._syncDisplayText();
  }

  private _syncDisplayText(): void {
    const files = this._hiddenInput.files;
    if (files && files.length > 0) {
      const names: string[] = [];
      for (let i = 0; i < files.length; i++) {
        names.push(files[i].name);
      }
      this._displayTextEl.textContent = names.join(", ");
      this._displayTextEl.className = "display-text has-files";
    } else {
      this._displayTextEl.textContent = this._placeholder;
      this._displayTextEl.className = "display-text placeholder";
    }
  }

  private _syncDisabled(): void {
    this._hiddenInput.disabled = this.disabled;
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
      this._browseBtnEl.disabled = true;
    } else {
      this.removeAttribute("aria-disabled");
      this._browseBtnEl.disabled = false;
    }
  }

  private _openPicker(): void {
    if (this.disabled) return;
    this._hiddenInput.click();
  }

  private _handleChange(): void {
    this._syncDisplayText();
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { files: this._hiddenInput.files },
      }),
    );
  }

  private _handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._openPicker();
    }
  };
}

customElements.define("ui-file-upload", UiFileUpload);
