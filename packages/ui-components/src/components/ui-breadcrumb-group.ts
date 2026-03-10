import type { BreadcrumbSize } from "./ui-breadcrumb-item.js";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
  }

  nav {
    display: block;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* ── Gap: m (default) ──────────────────────────────────────────────────── */

  :host .list,
  :host([size="m"]) .list {
    gap: 8px;
  }

  /* ── Gap: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .list {
    gap: 4px;
  }

  /* ── Gap: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .list {
    gap: 8px;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiBreadcrumbGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "aria-label"];

  private _nav: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // <nav aria-label="Breadcrumb">
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "Breadcrumb");
    this._nav = nav;

    // <div role="list" class="list" part="list">
    const list = document.createElement("div");
    list.className = "list";
    list.setAttribute("role", "list");
    list.setAttribute("part", "list");

    const slot = document.createElement("slot");
    list.appendChild(slot);

    nav.appendChild(list);
    shadow.appendChild(nav);

    // Listen for slotchange to propagate size to new children
    slot.addEventListener("slotchange", () => this._propagateSize());
  }

  connectedCallback(): void {
    this._propagateSize();
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (_name === "aria-label" && _newValue) {
      this._nav.setAttribute("aria-label", _newValue);
    }
    this._propagateSize();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): BreadcrumbSize {
    return (this.getAttribute("size") as BreadcrumbSize) ?? "m";
  }

  set size(value: BreadcrumbSize) {
    this.setAttribute("size", value);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _propagateSize(): void {
    const slot = this.shadowRoot!.querySelector("slot")!;
    const items = slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-BREADCRUMB-ITEM");

    const sizeValue = this.getAttribute("size");
    for (const item of items) {
      item.setAttribute("role", "listitem");
      if (sizeValue) {
        item.setAttribute("size", sizeValue);
      } else {
        item.removeAttribute("size");
      }
    }
  }
}

customElements.define("ui-breadcrumb-group", UiBreadcrumbGroup);
