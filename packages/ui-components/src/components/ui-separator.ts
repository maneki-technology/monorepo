import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const BORDER_MINIMAL = semanticVar("border", "minimal");
const BORDER_SUBTLE = semanticVar("border", "subtle");
const BORDER_MODERATE = semanticVar("border", "moderate");
const BORDER_BOLD = semanticVar("border", "bold");
const BORDER_CONTRAST = semanticVar("border", "contrast");

// ─── Types ───────────────────────────────────────────────────────────────────

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorEmphasis = "minimal" | "subtle" | "moderate" | "bold" | "contrast";
export type SeparatorLength = "full" | "inset-04" | "inset-08" | "inset-16" | "inset-24";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  :host {
    display: block;
  }

  .line {
    border: none;
    margin: 0;
  }

  /* ── Horizontal (default) ────────────────────────────────────────────────── */

  :host,
  :host([orientation="horizontal"]) {
    width: 100%;
  }

  :host([orientation="horizontal"]) .line,
  :host:not([orientation]) .line {
    height: 1px;
    width: 100%;
  }

  /* ── Vertical ────────────────────────────────────────────────────────────── */

  :host([orientation="vertical"]) {
    display: inline-block;
    height: 100%;
    width: auto;
  }

  :host([orientation="vertical"]) .line {
    width: 1px;
    height: 100%;
  }

  /* ── Emphasis ─────────────────────────────────────────────────────────────── */

  :host([emphasis="minimal"]) .line,
  :host:not([emphasis]) .line {
    background: ${BORDER_MINIMAL};
  }

  :host([emphasis="subtle"]) .line {
    background: ${BORDER_SUBTLE};
  }

  :host([emphasis="moderate"]) .line {
    background: ${BORDER_MODERATE};
  }

  :host([emphasis="bold"]) .line {
    background: ${BORDER_BOLD};
  }

  :host([emphasis="contrast"]) .line {
    background: ${BORDER_CONTRAST};
  }

  /* ── Length: horizontal insets ────────────────────────────────────────────── */

  :host([length="inset-04"]:not([orientation="vertical"])) .line {
    margin-left: 4px;
    margin-right: 4px;
  }

  :host([length="inset-08"]:not([orientation="vertical"])) .line {
    margin-left: 8px;
    margin-right: 8px;
  }

  :host([length="inset-16"]:not([orientation="vertical"])) .line {
    margin-left: 16px;
    margin-right: 16px;
  }

  :host([length="inset-24"]:not([orientation="vertical"])) .line {
    margin-left: 24px;
    margin-right: 24px;
  }

  /* ── Length: vertical insets ─────────────────────────────────────────────── */

  :host([orientation="vertical"][length="inset-04"]) .line {
    margin-top: 4px;
    margin-bottom: 4px;
  }

  :host([orientation="vertical"][length="inset-08"]) .line {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  :host([orientation="vertical"][length="inset-16"]) .line {
    margin-top: 16px;
    margin-bottom: 16px;
  }

  :host([orientation="vertical"][length="inset-24"]) .line {
    margin-top: 24px;
    margin-bottom: 24px;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSeparator extends HTMLElement {
  static readonly observedAttributes = ["orientation", "emphasis", "length"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const line = document.createElement("div");
    line.className = "line";
    line.setAttribute("role", "separator");
    shadow.appendChild(line);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("orientation")) this.setAttribute("orientation", "horizontal");
    if (!this.hasAttribute("emphasis")) this.setAttribute("emphasis", "minimal");
    if (!this.hasAttribute("length")) this.setAttribute("length", "full");
    if (!this.hasAttribute("role")) this.setAttribute("role", "separator");
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get orientation(): SeparatorOrientation {
    return (this.getAttribute("orientation") as SeparatorOrientation) ?? "horizontal";
  }
  set orientation(v: SeparatorOrientation) {
    this.setAttribute("orientation", v);
  }

  get emphasis(): SeparatorEmphasis {
    return (this.getAttribute("emphasis") as SeparatorEmphasis) ?? "minimal";
  }
  set emphasis(v: SeparatorEmphasis) {
    this.setAttribute("emphasis", v);
  }

  get length(): SeparatorLength {
    return (this.getAttribute("length") as SeparatorLength) ?? "full";
  }
  set length(v: SeparatorLength) {
    this.setAttribute("length", v);
  }
}

customElements.define("ui-separator", UiSeparator);
