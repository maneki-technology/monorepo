import { semanticVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type TableCellAlign = "left" | "center" | "right";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: table-cell;
    vertical-align: middle;
    font-family: "Inter", sans-serif;
    color: var(--ui-table-cell-color, ${TEXT_PRIMARY});
    font-weight: 400;
    text-align: left;
    /* Inherit size from parent ui-table via CSS custom properties */
    padding: var(--_table-cell-padding, 6px 12px);
    font-size: var(--_table-cell-font-size, 14px);
    line-height: var(--_table-cell-line-height, 20px);
    /* Vertical separator - only when table sets the variable */
    border-right: var(--_table-column-separator-width, 0) solid var(--_table-column-separator-color, transparent);
    /* Horizontal separator - bottom border on each cell for continuous lines */
    border-bottom-style: solid;
    border-bottom-color: var(--_table-separator-color, ${semanticVar("border", "minimal")});
    border-bottom-width: var(--_table-last-row-border, 1px);
  }

  :host(:last-child) {
    border-right: none;
  }

  /* ── Header cell ──────────────────────────────────────────────────────── */

  :host([header]) {
    color: var(--ui-table-cell-header-color, ${TEXT_SECONDARY});
    font-weight: 500;
    font-size: var(--_table-header-font-size, 14px);
    line-height: var(--_table-header-line-height, 20px);
    border-bottom-color: ${semanticVar("border", "moderate")};
  }

  /* ── Alignment ────────────────────────────────────────────────────────── */

  :host([align="center"]) {
    text-align: center;
  }

  :host([align="right"]) {
    text-align: right;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTableCell extends HTMLElement {
  static readonly observedAttributes = [
    "header",
    "align",
  ];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const slot = document.createElement("slot");
    shadow.appendChild(slot);
  }

  connectedCallback(): void {
    this._syncRole();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "header") {
      this._syncRole();
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get header(): boolean {
    return this.hasAttribute("header");
  }

  set header(value: boolean) {
    if (value) {
      this.setAttribute("header", "");
    } else {
      this.removeAttribute("header");
    }
  }

  get align(): TableCellAlign {
    return (this.getAttribute("align") as TableCellAlign) ?? "left";
  }

  set align(value: TableCellAlign) {
    this.setAttribute("align", value);
  }

  // ── Private methods ─────────────────────────────────────────────────────

  private _syncRole(): void {
    this.setAttribute("role", this.header ? "columnheader" : "cell");
  }
}

customElements.define("ui-table-cell", UiTableCell);
