import { STYLES } from "./ui-list-header.styles.js";
import "./ui-icon.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ListHeaderSize = "s" | "m" | "l";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiListHeader extends HTMLElement {
  static readonly observedAttributes = ["size", "top-border"];

  #headingEl!: HTMLElement;
  #collapseBtn!: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Top border
    const topBorder = document.createElement("div");
    topBorder.className = "top-border";

    // Content
    const content = document.createElement("div");
    content.className = "content";

    this.#headingEl = document.createElement("span");
    this.#headingEl.className = "heading";
    const slot = document.createElement("slot");
    this.#headingEl.appendChild(slot);

    this.#collapseBtn = document.createElement("button");
    this.#collapseBtn.className = "collapse-btn";
    this.#collapseBtn.type = "button";
    this.#collapseBtn.setAttribute("aria-label", "Collapse");

    content.append(this.#headingEl, this.#collapseBtn);

    // Bottom border
    const bottomBorder = document.createElement("div");
    bottomBorder.className = "bottom-border";

    shadow.append(topBorder, content, bottomBorder);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "heading");
    }

    // Create collapse icon (must be in connectedCallback)
    if (!this.#collapseBtn.querySelector("ui-icon")) {
      const icon = document.createElement("ui-icon");
      icon.setAttribute("name", "close");
      icon.setAttribute("size", "xs");
      this.#collapseBtn.appendChild(icon);
    }

    this.#collapseBtn.addEventListener("click", this.#onCollapse);
  }

  disconnectedCallback(): void {
    this.#collapseBtn.removeEventListener("click", this.#onCollapse);
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): ListHeaderSize {
    return (this.getAttribute("size") as ListHeaderSize) || "m";
  }

  set size(v: ListHeaderSize) {
    this.setAttribute("size", v);
  }

  // ─── Events ────────────────────────────────────────────────────────────

  #onCollapse = (): void => {
    this.dispatchEvent(
      new CustomEvent("collapse", { bubbles: true }),
    );
  };
}

customElements.define("ui-list-header", UiListHeader);
