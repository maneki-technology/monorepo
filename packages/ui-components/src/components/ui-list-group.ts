import { STYLES } from "./ui-list-group.styles.js";
import "./ui-list-header.js";
import "./ui-list-item.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ListGroupSize = "s" | "m" | "l";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiListGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "collapsed"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Header slot
    const headerSlot = document.createElement("slot");
    headerSlot.name = "header";

    // Items slot
    const items = document.createElement("div");
    items.className = "items";
    const defaultSlot = document.createElement("slot");
    items.appendChild(defaultSlot);

    shadow.append(headerSlot, items);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listbox");
    }

    this.addEventListener("collapse", this.#onCollapse);
    this.#propagateSize();
  }

  disconnectedCallback(): void {
    this.removeEventListener("collapse", this.#onCollapse);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (!this.isConnected) return;
    if (name === "size") {
      this.#propagateSize();
    }
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): ListGroupSize {
    return (this.getAttribute("size") as ListGroupSize) || "m";
  }

  set size(v: ListGroupSize) {
    this.setAttribute("size", v);
  }

  get collapsed(): boolean {
    return this.hasAttribute("collapsed");
  }

  set collapsed(v: boolean) {
    if (v) this.setAttribute("collapsed", "");
    else this.removeAttribute("collapsed");
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  #onCollapse = (): void => {
    this.collapsed = !this.collapsed;
  };

  #propagateSize(): void {
    const size = this.size;
    for (const child of this.children) {
      if (child.tagName === "UI-LIST-HEADER" || child.tagName === "UI-LIST-ITEM") {
        child.setAttribute("size", size);
      }
    }
  }
}

customElements.define("ui-list-group", UiListGroup);
