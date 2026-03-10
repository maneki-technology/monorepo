import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type InputGroupSize = "s" | "m" | "l";

// ─── Token constants ─────────────────────────────────────────────────────────

const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const SURFACE_TERTIARY = semanticVar("surface", "tertiary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const TEXT_PRIMARY = semanticVar("text", "primary");
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
    border: 1px solid var(--ui-ig-border, ${FORM_INPUT_BORDER});
    border-radius: 2px;
    overflow: hidden;
    width: 100%;
  }

  /* ── Prefix / Suffix sections ─────────────────────────────────────────── */

  .prefix,
  .suffix {
    display: none;
    align-items: center;
    flex-shrink: 0;
  }

  .prefix.visible {
    display: flex;
  }

  .suffix.visible {
    display: flex;
  }

  .prefix {
    background-color: var(--ui-ig-prefix-bg, ${SURFACE_SECONDARY});
    color: var(--ui-ig-prefix-color, ${TEXT_SECONDARY});
  }

  .suffix {
    background-color: var(--ui-ig-suffix-bg, ${SURFACE_TERTIARY});
    color: var(--ui-ig-suffix-color, ${TEXT_PRIMARY});
    font-weight: 500;
  }

  /* ── Separators ───────────────────────────────────────────────────────── */

  .separator {
    display: none;
    width: 1px;
    align-self: stretch;
    background-color: var(--ui-ig-separator, ${FORM_INPUT_BORDER});
    flex-shrink: 0;
  }

  .separator.visible {
    display: block;
  }

  /* ── Default slot (for ui-input) ──────────────────────────────────────── */

  .input-slot {
    display: flex;
    flex: 1;
    min-width: 0;
    background-color: #ffffff;
  }

  ::slotted(ui-input) {
    flex: 1;
    min-width: 0;
    --ui-input-border: transparent;
    border: none !important;
    border-radius: 0 !important;
  }

  /* ── Size: m (default) ────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    --_ig-height: 30px;
    --_ig-padding: ${SP_1};
    --_ig-font-size: 14px;
    --_ig-line-height: 20px;
  }

  /* ── Size: s ──────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_ig-height: 22px;
    --_ig-padding: ${SP_1};
    --_ig-font-size: 12px;
    --_ig-line-height: 16px;
  }

  /* ── Size: l ──────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_ig-height: 38px;
    --_ig-padding: ${SP_15};
    --_ig-font-size: 16px;
    --_ig-line-height: 24px;
  }

  .wrapper {
    height: var(--_ig-height);
  }

  .prefix,
  .suffix {
    padding-left: var(--_ig-padding);
    padding-right: var(--_ig-padding);
    font-size: var(--_ig-font-size);
    line-height: var(--_ig-line-height);
    white-space: nowrap;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiInputGroup extends HTMLElement {
  static readonly observedAttributes = ["size"];

  private _prefixEl: HTMLDivElement;
  private _suffixEl: HTMLDivElement;
  private _prefixSeparator: HTMLDivElement;
  private _suffixSeparator: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // ── Wrapper ───────────────────────────────────────────────────────
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    // ── Prefix section ────────────────────────────────────────────────
    this._prefixEl = document.createElement("div");
    this._prefixEl.className = "prefix";
    const prefixSlot = document.createElement("slot");
    prefixSlot.name = "prefix";
    this._prefixEl.appendChild(prefixSlot);
    wrapper.appendChild(this._prefixEl);

    // ── Prefix separator ──────────────────────────────────────────────
    this._prefixSeparator = document.createElement("div");
    this._prefixSeparator.className = "separator";
    wrapper.appendChild(this._prefixSeparator);

    // ── Default slot (for ui-input) ───────────────────────────────────
    const inputSlot = document.createElement("div");
    inputSlot.className = "input-slot";
    const defaultSlot = document.createElement("slot");
    inputSlot.appendChild(defaultSlot);
    wrapper.appendChild(inputSlot);

    // ── Suffix separator ──────────────────────────────────────────────
    this._suffixSeparator = document.createElement("div");
    this._suffixSeparator.className = "separator";
    wrapper.appendChild(this._suffixSeparator);

    // ── Suffix section ────────────────────────────────────────────────
    this._suffixEl = document.createElement("div");
    this._suffixEl.className = "suffix";
    const suffixSlot = document.createElement("slot");
    suffixSlot.name = "suffix";
    this._suffixEl.appendChild(suffixSlot);
    wrapper.appendChild(this._suffixEl);

    shadow.appendChild(wrapper);

    // ── Slot change listeners ─────────────────────────────────────────
    prefixSlot.addEventListener("slotchange", this._handlePrefixSlotChange.bind(this));
    suffixSlot.addEventListener("slotchange", this._handleSuffixSlotChange.bind(this));
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    // size is purely CSS-driven via :host([size="..."]) selectors
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): InputGroupSize {
    return (this.getAttribute("size") as InputGroupSize) ?? "m";
  }

  set size(value: InputGroupSize) {
    this.setAttribute("size", value);
  }

  // ── Private methods ─────────────────────────────────────────────────────

  private _handlePrefixSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const hasContent = slot.assignedNodes().length > 0;
    if (hasContent) {
      this._prefixEl.classList.add("visible");
      this._prefixSeparator.classList.add("visible");
    } else {
      this._prefixEl.classList.remove("visible");
      this._prefixSeparator.classList.remove("visible");
    }
  }

  private _handleSuffixSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const hasContent = slot.assignedNodes().length > 0;
    if (hasContent) {
      this._suffixEl.classList.add("visible");
      this._suffixSeparator.classList.add("visible");
    } else {
      this._suffixEl.classList.remove("visible");
      this._suffixSeparator.classList.remove("visible");
    }
  }
}

customElements.define("ui-input-group", UiInputGroup);
