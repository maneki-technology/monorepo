import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const ROW_DEFAULT = semanticVar("gridRow", "rowDefault");
const ROW_SELECTED = semanticVar("gridRow", "rowSelected");
const BORDER_MODERATE = semanticVar("border", "moderate");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: table-row;
    background-color: var(--ui-table-row-bg, ${ROW_DEFAULT});
  }

  /* ── Hover ────────────────────────────────────────────────────────────── */

  :host(:hover:not([disabled]):not([header])) {
    background: linear-gradient(0deg, rgba(159, 177, 189, 0.20) 0%, rgba(159, 177, 189, 0.20) 100%), #fff;
  }

  /* ── Selected ─────────────────────────────────────────────────────────── */

  :host([selected]) {
    background-color: var(--ui-table-row-selected-bg, ${ROW_SELECTED});
  }

  /* ── Header rows always use moderate border ───────────────────────────── */

  :host([header]) {
    /* Header styling handled by cells */
  }

  /* ── Disabled ─────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
    opacity: 0.5;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTableRow extends HTMLElement {
  static readonly observedAttributes = [
    "header",
    "selected",
    "disabled",
  ];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const slot = document.createElement("slot");
    shadow.appendChild(slot);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "row");
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

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean) {
    if (value) {
      this.setAttribute("selected", "");
    } else {
      this.removeAttribute("selected");
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
}

customElements.define("ui-table-row", UiTableRow);
