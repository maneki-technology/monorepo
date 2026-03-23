import {
  BORDER_FOCUS,
  BORDER_MODERATE,
  FONT_PRIMARY,
  ICON_SEARCH,
  ICON_SECONDARY,
  RADIUS_SM,
  SP_0_5,
  SP_1,
  SP_1_5,
  SP_2,
  SP_3,
  SP_4,
  SP_5,
  SURFACE_PRIMARY,
  TEXT_PRIMARY,
  TEXT_TERTIARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
} from "@maneki/foundation";
import "./ui-tree-item.js";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
    font-display: swap;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    font-family: ${FONT_PRIMARY};
  }

  .search {
    flex-shrink: 0;
  }

  .search-input-wrapper {
    display: none;
    align-items: center;
    border: 1px solid ${BORDER_MODERATE};
    background: ${SURFACE_PRIMARY};
    border-radius: ${RADIUS_SM};
  }

  :host([searchable]) .search-input-wrapper {
    display: flex;
  }

  .search-input-wrapper:focus-within {
    border-color: ${BORDER_FOCUS};
    outline: 1px solid ${BORDER_FOCUS};
    outline-offset: -1px;
  }

  .search-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${ICON_SECONDARY};
  }

  .search-icon .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0;
  }

  .search-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    font-family: ${FONT_PRIMARY};
    color: ${TEXT_PRIMARY};
    outline: none;
  }

  .search-input::placeholder {
    color: ${TEXT_TERTIARY};
  }

  .tree {
    display: flex;
    flex-direction: column;
    padding: ${SP_0_5} 0;
  }

  ::slotted(ui-tree-item) {
    width: 100%;
  }

  ::slotted(ui-tree-item[hidden][hidden]) {
    display: flex;
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .search-input-wrapper {
    height: ${SP_3};
    padding: 0 ${SP_1};
    gap: ${SP_0_5};
  }

  :host([size="s"]) .search-icon {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .search-icon .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .search-input {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) {
    gap: ${SP_1};
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    gap: ${SP_1_5};
  }

  :host .search-input-wrapper,
  :host([size="m"]) .search-input-wrapper {
    height: ${SP_4};
    padding: 0 ${SP_1};
    gap: ${SP_1};
  }

  :host .search-icon,
  :host([size="m"]) .search-icon {
    width: 20px;
    height: 20px;
  }

  :host .search-icon .material-symbols-outlined,
  :host([size="m"]) .search-icon .material-symbols-outlined {
    font-size: 20px;
  }

  :host .search-input,
  :host([size="m"]) .search-input {
    ${TYPE_BODY_02}
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    gap: ${SP_2};
  }

  :host([size="l"]) .search-input-wrapper {
    height: ${SP_5};
    padding: 0 ${SP_1_5};
    gap: ${SP_1};
  }

  :host([size="l"]) .search-icon {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .search-icon .material-symbols-outlined {
    font-size: 24px;
  }

  :host([size="l"]) .search-input {
    ${TYPE_BODY_01}
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTreeGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "searchable"];

  #searchWrapper!: HTMLElement;
  #searchInput!: HTMLInputElement;
  #tree!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Built-in search input
    this.#searchWrapper = document.createElement("div");
    this.#searchWrapper.className = "search-input-wrapper";

    const searchIcon = document.createElement("span");
    searchIcon.className = "search-icon";
    const iconEl = document.createElement("span");
    iconEl.className = "material-symbols-outlined";
    iconEl.textContent = ICON_SEARCH;
    searchIcon.appendChild(iconEl);

    this.#searchInput = document.createElement("input");
    this.#searchInput.className = "search-input";
    this.#searchInput.type = "text";
    this.#searchInput.placeholder = "Type to search...";

    this.#searchWrapper.append(searchIcon, this.#searchInput);

    // Search slot (for custom search)
    const searchSlot = document.createElement("div");
    searchSlot.className = "search";
    const searchSlotEl = document.createElement("slot");
    searchSlotEl.name = "search";
    searchSlot.appendChild(searchSlotEl);

    // Tree items
    this.#tree = document.createElement("div");
    this.#tree.className = "tree";
    this.#tree.setAttribute("role", "tree");
    const treeSlot = document.createElement("slot");
    this.#tree.appendChild(treeSlot);

    shadow.append(this.#searchWrapper, searchSlot, this.#tree);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");

    const slot = this.shadowRoot!.querySelector("slot:not([name])") as HTMLSlotElement;
    slot.addEventListener("slotchange", () => {
      this._propagateSize();
      this._syncVisibility();
    });
    this._propagateSize();

    // Listen for tree-toggle events to manage child visibility
    this.addEventListener("tree-toggle", () => {
      this._syncVisibility();
    });

    // Search filtering
    this.#searchInput.addEventListener("input", () => {
      this._filterBySearch();
    });
  }

  attributeChangedCallback(name: string): void {
    if (name === "size" && this.isConnected) this._propagateSize();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): string {
    return this.getAttribute("size") ?? "m";
  }
  set size(v: string) {
    this.setAttribute("size", v);
  }

  get searchable(): boolean {
    return this.hasAttribute("searchable");
  }
  set searchable(v: boolean) {
    if (v) this.setAttribute("searchable", "");
    else this.removeAttribute("searchable");
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _getItems(): HTMLElement[] {
    const slot = this.shadowRoot!.querySelector("slot:not([name])") as HTMLSlotElement;
    return slot.assignedElements().filter((el) => el.tagName === "UI-TREE-ITEM") as HTMLElement[];
  }

  private _propagateSize(): void {
    const size = this.getAttribute("size");
    if (!size) return;
    for (const item of this._getItems()) {
      item.setAttribute("size", size);
    }
  }

  private _syncVisibility(): void {
    const items = this._getItems();
    const levelOrder = ["parent", "child-1", "child-2", "child-3"];
    let hiddenBelowLevel = -1; // -1 means nothing hidden

    for (const item of items) {
      const level = item.getAttribute("level") ?? "parent";
      const levelIdx = levelOrder.indexOf(level);
      const arrow = item.getAttribute("arrow");

      // If we're hiding children and this item is at or deeper than the hidden level
      if (hiddenBelowLevel >= 0 && levelIdx > hiddenBelowLevel) {
        item.setAttribute("hidden", "");
        continue;
      }

      // This item is at or above the hidden level — show it
      item.removeAttribute("hidden");
      hiddenBelowLevel = -1;

      // If this item is collapsed, hide everything below its level
      if (arrow === "closed") {
        hiddenBelowLevel = levelIdx;
      }
    }
  }

  private _filterBySearch(): void {
    const query = this.#searchInput.value.toLowerCase().trim();
    const items = this._getItems();

    if (!query) {
      // Reset: show all, then apply collapse visibility
      for (const item of items) {
        item.removeAttribute("hidden");
      }
      this._syncVisibility();
      return;
    }

    // Show items matching query, hide others
    for (const item of items) {
      const label = (item.getAttribute("label") ?? "").toLowerCase();
      if (label.includes(query)) {
        item.removeAttribute("hidden");
      } else {
        item.setAttribute("hidden", "");
      }
    }
  }
}

customElements.define("ui-tree-group", UiTreeGroup);
