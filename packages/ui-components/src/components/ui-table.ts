import { semanticVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type TableSize = "s" | "m" | "l";
export type TableSeparator = "minimal" | "moderate";

// ─── Token constants ─────────────────────────────────────────────────────────

const BORDER_MODERATE = semanticVar("border", "moderate");
const BORDER_MINIMAL = semanticVar("border", "minimal");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: "Inter", sans-serif;
    /* Default size: m */
    --_table-cell-padding: 6px 12px;
    --_table-cell-font-size: 14px;
    --_table-cell-line-height: 20px;
    --_table-header-font-size: 14px;
    --_table-header-line-height: 20px;
    --_table-separator-color: ${BORDER_MINIMAL};
    --_table-column-separator-color: transparent;
    --_table-zebra: 0;
  }

  /* ── Size: s ──────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_table-cell-padding: 6px 8px;
    --_table-cell-font-size: 12px;
    --_table-cell-line-height: 16px;
    --_table-header-font-size: 12px;
    --_table-header-line-height: 16px;
  }

  /* ── Size: l ──────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_table-cell-padding: 12px 16px;
    --_table-cell-font-size: 16px;
    --_table-cell-line-height: 24px;
    --_table-header-font-size: 16px;
    --_table-header-line-height: 24px;
  }

  /* ── Separator ────────────────────────────────────────────────────────── */

  :host([separator="minimal"]) {
    --_table-column-separator-width: 1px;
    --_table-column-separator-color: ${BORDER_MINIMAL};
  }

  :host([separator="moderate"]) {
    --_table-separator-color: ${BORDER_MODERATE};
    --_table-column-separator-width: 1px;
    --_table-column-separator-color: ${BORDER_MODERATE};
  }

  /* ── Zebra ────────────────────────────────────────────────────────────── */

  :host([zebra]) ::slotted(ui-table-row:nth-child(even)) {
    background-color: ${semanticVar("gridRow", "rowAlt")};
  }

  .table-wrapper {
    display: table;
    width: 100%;
    border-spacing: 0;
  }

  :host([bordered]) .table-wrapper {
    border: 1px solid ${BORDER_MODERATE};
  }

  /* Tell last row's cells to hide bottom border when bordered */
  :host([bordered]) ::slotted(ui-table-row:last-child) {
    --_table-last-row-border: 0;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTable extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "separator",
    "zebra",
    "bordered",
  ];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";

    const slot = document.createElement("slot");
    wrapper.appendChild(slot);

    shadow.appendChild(wrapper);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "table");
    }
    // Consume pre-upgrade properties FIRST (lit sets properties before CE upgrades)
    this._upgradeProperty("size");
    this._upgradeProperty("separator");
    this._upgradeProperty("zebra");
    this._upgradeProperty("bordered");
    // Then set defaults for any attributes not yet present
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    // Don't auto-set separator — default has row borders but no column borders
  }

  private _upgradeProperty(prop: string): void {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = (this as Record<string, unknown>)[prop];
      delete (this as Record<string, unknown>)[prop];
      (this as Record<string, unknown>)[prop] = value;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): TableSize {
    return (this.getAttribute("size") as TableSize) ?? "m";
  }

  set size(value: TableSize) {
    this.setAttribute("size", value);
  }

  get separator(): TableSeparator {
    return (this.getAttribute("separator") as TableSeparator) ?? "minimal";
  }

  set separator(value: TableSeparator) {
    this.setAttribute("separator", value);
  }

  get zebra(): boolean {
    return this.hasAttribute("zebra");
  }

  set zebra(value: boolean) {
    if (value) {
      this.setAttribute("zebra", "");
    } else {
      this.removeAttribute("zebra");
    }
  }

  get bordered(): boolean {
    return this.hasAttribute("bordered");
  }

  set bordered(value: boolean) {
    if (value) {
      this.setAttribute("bordered", "");
    } else {
      this.removeAttribute("bordered");
    }
  }
}

customElements.define("ui-table", UiTable);
