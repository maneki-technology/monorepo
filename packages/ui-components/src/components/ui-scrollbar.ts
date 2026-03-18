import { STYLES } from "./ui-scrollbar.styles.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScrollbarEmphasis = "bold" | "minimal";
export type ScrollbarOrientation = "vertical" | "horizontal";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiScrollbar extends HTMLElement {
  static readonly observedAttributes = ["emphasis", "orientation"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const container = document.createElement("div");
    container.className = "container";
    const slot = document.createElement("slot");
    container.appendChild(slot);
    shadow.appendChild(container);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("emphasis")) this.setAttribute("emphasis", "bold");
    if (!this.hasAttribute("orientation")) this.setAttribute("orientation", "vertical");
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get emphasis(): ScrollbarEmphasis {
    return (this.getAttribute("emphasis") as ScrollbarEmphasis) ?? "bold";
  }
  set emphasis(v: ScrollbarEmphasis) {
    this.setAttribute("emphasis", v);
  }

  get orientation(): ScrollbarOrientation {
    return (this.getAttribute("orientation") as ScrollbarOrientation) ?? "vertical";
  }
  set orientation(v: ScrollbarOrientation) {
    this.setAttribute("orientation", v);
  }
}

customElements.define("ui-scrollbar", UiScrollbar);
