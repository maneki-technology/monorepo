import {
  BORDER_FOCUS,
  BORDER_MINIMAL,
  DISABLED_BORDER,
  DISABLED_TEXT,
  FONT_PRIMARY,
  ICON_SECONDARY,
  RADIUS_SM,
  SP_1,
  SP_1_5,
  SP_2,
  SP_3,
  SURFACE_PRIMARY,
  SURFACE_SECONDARY,
  TEXT_LINK,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
} from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type DropzoneSize = "s" | "m" | "l";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }

  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-variation-settings: "FILL" 0;
    display: inline-block;
    line-height: 1;
    vertical-align: middle;
  }

  :host {
    display: block;
    font-family: ${FONT_PRIMARY};
  }

  .label-row {
    display: flex;
    align-items: baseline;
    gap: ${SP_1};
    margin-bottom: ${SP_1};
  }

  .label-row:empty {
    display: none;
  }

  .label-row ::slotted(ui-label) {
    display: inline;
  }

  .zone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--ui-dz-border, ${BORDER_MINIMAL});
    border-radius: ${RADIUS_SM};
    background-color: var(--ui-dz-bg, ${SURFACE_PRIMARY});
    cursor: pointer;
    text-align: center;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease;
  }

  .zone-icon {
    color: var(--ui-dz-icon-color, ${ICON_SECONDARY});
  }

  .zone-text {
    color: var(--ui-dz-text-color, ${TEXT_SECONDARY});
  }

  .zone-link {
    color: var(--ui-dz-link-color, ${TEXT_LINK});
    font-weight: 500;
    cursor: pointer;
  }

  .zone-hint {
    color: var(--ui-dz-hint-color, ${TEXT_SECONDARY});
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
    --_dz-padding: ${SP_3};
    --_dz-gap: ${SP_1};
    --_dz-icon-size: 32px;
  }

  :host .zone-text,
  :host([size="m"]) .zone-text {
    ${TYPE_BODY_02}
  }

  :host .zone-link,
  :host([size="m"]) .zone-link {
    ${TYPE_BODY_02}
  }

  :host .zone-hint,
  :host([size="m"]) .zone-hint {
    ${TYPE_CAPTION_01}
  }

  /* ── Size: s ───────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_dz-padding: ${SP_1_5};
    --_dz-gap: ${SP_1};
    --_dz-icon-size: 24px;
  }

  :host([size="s"]) .zone-text {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .zone-link {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .zone-hint {
    ${TYPE_CAPTION_01}
  }

  /* ── Size: l ───────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_dz-padding: ${SP_3};
    --_dz-gap: ${SP_1_5};
    --_dz-icon-size: 40px;
  }

  :host([size="l"]) .zone-text {
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .zone-link {
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .zone-hint {
    ${TYPE_CAPTION_01}
  }

  .zone {
    padding: var(--_dz-padding);
    gap: var(--_dz-gap);
  }

  .zone-icon .material-symbols-outlined {
    font-size: var(--_dz-icon-size);
  }

  /* ── Hover ─────────────────────────────────────────────────────────────── */

  :host(:hover:not([disabled])) .zone {
    border-color: var(--ui-dz-hover-border, ${TEXT_LINK});
    background-color: var(--ui-dz-hover-bg, ${SURFACE_SECONDARY});
  }

  /* ── Drag over ─────────────────────────────────────────────────────────── */

  .zone.drag-over {
    border-color: var(--ui-dz-active-border, ${BORDER_FOCUS});
    background-color: var(--ui-dz-active-bg, ${SURFACE_SECONDARY});
  }

  /* ── Focus ─────────────────────────────────────────────────────────────── */

  :host(:focus-within:not([disabled])) .zone {
    border-color: var(--ui-dz-focus-border, ${BORDER_FOCUS});
    outline: 1px solid var(--ui-dz-focus-border, ${BORDER_FOCUS});
  }

  /* ── Has files ─────────────────────────────────────────────────────────── */

  .file-list {
    display: flex;
    flex-wrap: wrap;
    gap: ${SP_1};
    justify-content: center;
    color: ${TEXT_PRIMARY};
  }

  .file-list .file-name {
    ${TYPE_BODY_03}
    background: ${SURFACE_SECONDARY};
    padding: 2px ${SP_1};
    border-radius: ${RADIUS_SM};
  }

  /* ── Disabled ──────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .zone {
    border-color: ${DISABLED_BORDER};
    background-color: ${SURFACE_SECONDARY};
  }

  :host([disabled]) .zone-text,
  :host([disabled]) .zone-link,
  :host([disabled]) .zone-hint,
  :host([disabled]) .zone-icon {
    color: ${DISABLED_TEXT};
  }

  /* ── Reduced motion ────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .zone {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

const UPLOAD_ICON = "\uF09B"; // ICON_UPLOAD codepoint

export class UiDropzone extends HTMLElement {
  static readonly observedAttributes = ["size", "accept", "multiple", "disabled", "text", "hint"];

  private _hiddenInput: HTMLInputElement;
  private _zoneEl: HTMLDivElement;
  private _textEl: HTMLSpanElement;
  private _linkEl: HTMLSpanElement;
  private _hintEl: HTMLSpanElement;
  private _fileListEl: HTMLDivElement;
  private _iconEl: HTMLSpanElement;
  private _labelRow: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Hidden file input
    this._hiddenInput = document.createElement("input");
    this._hiddenInput.type = "file";
    this._hiddenInput.className = "hidden-input";
    this._hiddenInput.tabIndex = -1;
    this._hiddenInput.setAttribute("aria-hidden", "true");
    shadow.appendChild(this._hiddenInput);

    // Label slot
    this._labelRow = document.createElement("div");
    this._labelRow.className = "label-row";
    const labelSlot = document.createElement("slot");
    labelSlot.name = "label";
    this._labelRow.appendChild(labelSlot);
    shadow.appendChild(this._labelRow);

    // Drop zone
    this._zoneEl = document.createElement("div");
    this._zoneEl.className = "zone";
    this._zoneEl.setAttribute("role", "button");

    // Icon
    const iconWrap = document.createElement("div");
    iconWrap.className = "zone-icon";
    this._iconEl = document.createElement("span");
    this._iconEl.className = "material-symbols-outlined";
    this._iconEl.textContent = UPLOAD_ICON;
    this._iconEl.setAttribute("aria-hidden", "true");
    iconWrap.appendChild(this._iconEl);
    this._zoneEl.appendChild(iconWrap);

    // Text
    this._textEl = document.createElement("span");
    this._textEl.className = "zone-text";
    this._textEl.textContent = "Drag and drop files here, or ";
    this._zoneEl.appendChild(this._textEl);

    // Browse link (inside text)
    this._linkEl = document.createElement("span");
    this._linkEl.className = "zone-link";
    this._linkEl.textContent = "browse";
    this._textEl.appendChild(this._linkEl);

    // Hint
    this._hintEl = document.createElement("span");
    this._hintEl.className = "zone-hint";
    this._zoneEl.appendChild(this._hintEl);

    // File list (shown after selection)
    this._fileListEl = document.createElement("div");
    this._fileListEl.className = "file-list";
    this._fileListEl.style.display = "none";
    this._zoneEl.appendChild(this._fileListEl);

    shadow.appendChild(this._zoneEl);

    // Event listeners
    this._zoneEl.addEventListener("click", this._openPicker.bind(this));
    this._hiddenInput.addEventListener("change", this._handleChange.bind(this));
    this._zoneEl.addEventListener("dragover", this._onDragOver.bind(this));
    this._zoneEl.addEventListener("dragenter", this._onDragEnter.bind(this));
    this._zoneEl.addEventListener("dragleave", this._onDragLeave.bind(this));
    this._zoneEl.addEventListener("drop", this._onDrop.bind(this));
  }

  connectedCallback(): void {
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    this._syncAll();
    this.addEventListener("keydown", this._handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener("keydown", this._handleKeydown);
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    switch (name) {
      case "accept":
        this._hiddenInput.accept = this.getAttribute("accept") ?? "";
        break;
      case "multiple":
        this._hiddenInput.multiple = this.hasAttribute("multiple");
        break;
      case "disabled":
        this._syncDisabled();
        break;
      case "text":
        this._syncText();
        break;
      case "hint":
        this._syncHint();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): DropzoneSize {
    return (this.getAttribute("size") as DropzoneSize) ?? "m";
  }

  set size(value: DropzoneSize) {
    this.setAttribute("size", value);
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

  get text(): string {
    return this.getAttribute("text") ?? "Drag and drop files here, or ";
  }

  set text(value: string) {
    if (value) {
      this.setAttribute("text", value);
    } else {
      this.removeAttribute("text");
    }
  }

  get hint(): string {
    return this.getAttribute("hint") ?? "";
  }

  set hint(value: string) {
    if (value) {
      this.setAttribute("hint", value);
    } else {
      this.removeAttribute("hint");
    }
  }

  get files(): FileList | null {
    return this._hiddenInput.files;
  }

  // ── Public methods ─────────────────────────────────────────────────────

  reset(): void {
    this._hiddenInput.value = "";
    this._syncFileDisplay();
  }

  // ── Private methods ────────────────────────────────────────────────────

  private _syncAll(): void {
    this._hiddenInput.accept = this.getAttribute("accept") ?? "";
    this._hiddenInput.multiple = this.hasAttribute("multiple");
    this._syncDisabled();
    this._syncText();
    this._syncHint();
    this._syncFileDisplay();
  }

  private _syncText(): void {
    const text = this.getAttribute("text") ?? "Drag and drop files here, or ";
    // Clear text node, keep link child
    this._textEl.textContent = "";
    this._textEl.appendChild(document.createTextNode(text));
    this._textEl.appendChild(this._linkEl);
  }

  private _syncHint(): void {
    const hint = this.getAttribute("hint") ?? "";
    this._hintEl.textContent = hint;
    this._hintEl.style.display = hint ? "" : "none";
  }

  private _syncDisabled(): void {
    this._hiddenInput.disabled = this.disabled;
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
    } else {
      this.removeAttribute("aria-disabled");
    }
  }

  private _syncFileDisplay(): void {
    const files = this._hiddenInput.files;
    if (files && files.length > 0) {
      this._fileListEl.innerHTML = "";
      for (let i = 0; i < files.length; i++) {
        const chip = document.createElement("span");
        chip.className = "file-name";
        chip.textContent = files[i].name;
        this._fileListEl.appendChild(chip);
      }
      this._fileListEl.style.display = "";
    } else {
      this._fileListEl.style.display = "none";
      this._fileListEl.innerHTML = "";
    }
  }

  private _openPicker(): void {
    if (this.disabled) return;
    this._hiddenInput.click();
  }

  private _handleChange(): void {
    this._syncFileDisplay();
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { files: this._hiddenInput.files },
      }),
    );
  }

  private _onDragOver(e: DragEvent): void {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy";
    }
  }

  private _onDragEnter(e: DragEvent): void {
    e.preventDefault();
    this._zoneEl.classList.add("drag-over");
  }

  private _onDragLeave(e: DragEvent): void {
    // Only remove if leaving the zone entirely
    if (!this._zoneEl.contains(e.relatedTarget as Node)) {
      this._zoneEl.classList.remove("drag-over");
    }
  }

  private _onDrop(e: DragEvent): void {
    e.preventDefault();
    this._zoneEl.classList.remove("drag-over");
    if (this.disabled) return;

    const dt = e.dataTransfer;
    if (!dt?.files.length) return;

    // Filter by accept if specified
    const accept = this.accept;
    let files: File[];
    if (accept) {
      const types = accept.split(",").map((t) => t.trim().toLowerCase());
      files = Array.from(dt.files).filter((f) => {
        const mime = f.type.toLowerCase();
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        return types.some((t) => t === mime || (t.endsWith("/*") && mime.startsWith(t.slice(0, -1))) || t === ext);
      });
    } else {
      files = Array.from(dt.files);
    }

    if (!this.multiple && files.length > 1) {
      files = [files[0]];
    }

    if (files.length === 0) return;

    this.dispatchEvent(
      new CustomEvent("drop-files", {
        bubbles: true,
        composed: true,
        detail: { files },
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

customElements.define("ui-dropzone", UiDropzone);
