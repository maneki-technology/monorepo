import {
  semanticVar,
  spaceVar,
  ICON_MORE_HORIZ,
} from "@maneki/foundation";
import type { TabItemSize, TabItemOrientation } from "./ui-tab-item.js";

// ─── Token constants ─────────────────────────────────────────────────────────

const BORDER_MINIMAL = semanticVar("border", "minimal");
const TEXT_PRIMARY = semanticVar("text", "primary");
const ICON_PRIMARY = semanticVar("icon", "primary");
const ICON_SECONDARY = semanticVar("icon", "secondary");
const SP_1_5 = spaceVar("1.5");
const SP_2 = spaceVar("2");

// ─── Types ───────────────────────────────────────────────────────────────────

export type TabGroupOverflow = "scroll" | "menu";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    width: 100%;
  }

  :host([orientation="vertical"]) {
    width: auto;
    height: 100%;
  }

  .wrapper {
    display: flex;
    width: 100%;
    position: relative;
  }

  :host([orientation="vertical"]) .wrapper {
    flex-direction: column;
    width: auto;
    height: 100%;
  }

  /* ── Horizontal (default) ──────────────────────────────────────────────── */

  :host .tablist,
  :host([orientation="horizontal"]) .tablist {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    border-bottom: 1px solid ${BORDER_MINIMAL};
    flex: 1 1 0%;
    min-width: 0;
  }

  :host .tablist::-webkit-scrollbar,
  :host([orientation="horizontal"]) .tablist::-webkit-scrollbar {
    display: none;
  }

  /* ── Overflow=menu: hide scrolling ─────────────────────────────────────── */

  :host([overflow="menu"]) .tablist,
  :host([overflow="menu"][orientation="horizontal"]) .tablist {
    overflow: hidden;
    flex: 0 1 auto;
  }
  :host([overflow="menu"][orientation="vertical"]) .tablist {
    overflow: hidden;
    flex: 0 1 auto;
  }

  /* ── Vertical ──────────────────────────────────────────────────────────── */

  :host([orientation="vertical"]) .tablist {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    border-bottom: none;
    border-left: 1px solid ${BORDER_MINIMAL};
    flex: 1 1 0%;
    min-height: 0;
  }

  :host([orientation="vertical"]) .tablist::-webkit-scrollbar {
    display: none;
  }

  /* ── Gaps: horizontal by size ──────────────────────────────────────────── */

  :host .tablist,
  :host([size="m"]) .tablist {
    gap: var(--ui-tab-group-gap, ${SP_2});
  }

  :host([size="s"]) .tablist {
    gap: var(--ui-tab-group-gap, ${SP_1_5});
  }

  /* ── More button ───────────────────────────────────────────────────────── */

  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }

  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-variation-settings: "FILL" 0;
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
  }

  .more-btn {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0 4px;
    color: ${ICON_PRIMARY};
    font-size: 20px;
  }

  :host([orientation="vertical"]) .more-btn {
    padding: 4px 0;
  }

  :host([overflow="menu"]) .more-btn.visible {
    display: flex;
  }

  .more-btn:hover {
    opacity: 0.7;
  }

  .more-btn:focus-visible {
    outline: 2px solid ${semanticVar("border", "focus")};
    outline-offset: -2px;
  }

  /* ── Overflow menu (popover) ───────────────────────────────────────────── */

  .overflow-menu {
    display: none;
    position: absolute;
    z-index: 100;
    background: #ffffff;
    border: 1px solid ${BORDER_MINIMAL};
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    padding: 4px 0;
    min-width: 120px;
    max-height: 240px;
    overflow-y: auto;
  }

  .overflow-menu.open {
    display: flex;
    flex-direction: column;
  }

  /* Horizontal: menu below the more button container */
  .more-container {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid ${BORDER_MINIMAL};
  }

  :host([orientation="vertical"]) .more-container {
    border-bottom: none;
    border-left: 1px solid ${BORDER_MINIMAL};
  }

  .overflow-menu.open.horizontal {
    top: 100%;
    right: 0;
    margin-top: 2px;
  }

  .overflow-menu.open.vertical {
    left: 100%;
    top: 0;
    margin-left: 2px;
  }

  .overflow-menu-item {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    font-family: "Inter", sans-serif;
    font-size: 13px;
    line-height: 20px;
    color: ${TEXT_PRIMARY};
    cursor: pointer;
    white-space: nowrap;
    border: none;
    background: none;
    text-align: left;
    width: 100%;
  }

  .overflow-menu-item:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .overflow-menu-item.selected {
    color: ${semanticVar("text", "link")};
    font-weight: 500;
  }

  .overflow-menu-item:focus-visible {
    outline: 2px solid ${semanticVar("border", "focus")};
    outline-offset: -2px;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const PROPAGATED_ATTRS = ["size", "orientation"] as const;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTabGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "orientation", "overflow"];

  private _tablist!: HTMLDivElement;
  private _moreBtn!: HTMLButtonElement;
  private _overflowMenu!: HTMLDivElement;
  private _resizeObserver: ResizeObserver | null = null;
  private _hiddenItems: Element[] = [];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // Wrapper for tablist + more button
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const tablist = document.createElement("div");
    tablist.className = "tablist";
    tablist.setAttribute("role", "tablist");
    tablist.setAttribute("part", "tablist");
    this._tablist = tablist;

    const slot = document.createElement("slot");
    tablist.appendChild(slot);

    // More button
    const moreBtn = document.createElement("button");
    moreBtn.className = "more-btn";
    moreBtn.setAttribute("aria-label", "More tabs");
    moreBtn.setAttribute("aria-haspopup", "true");
    moreBtn.setAttribute("aria-expanded", "false");
    moreBtn.setAttribute("tabindex", "-1");
    moreBtn.setAttribute("type", "button");
    const moreIcon = document.createElement("span");
    moreIcon.className = "material-symbols-outlined";
    moreIcon.textContent = ICON_MORE_HORIZ;
    moreBtn.appendChild(moreIcon);
    this._moreBtn = moreBtn;

    // Overflow menu
    const overflowMenu = document.createElement("div");
    overflowMenu.className = "overflow-menu";
    overflowMenu.setAttribute("role", "menu");
    this._overflowMenu = overflowMenu;

    // More container (button + menu)
    const moreContainer = document.createElement("div");
    moreContainer.className = "more-container";
    moreContainer.appendChild(moreBtn);
    moreContainer.appendChild(overflowMenu);

    wrapper.appendChild(tablist);
    wrapper.appendChild(moreContainer);

    shadow.appendChild(wrapper);

    // Listen for slotchange to propagate attributes to new children
    slot.addEventListener("slotchange", () => {
      this._propagateAttributes();
      this._syncTabindex();
      this._updateOverflow();
    });

    // Listen for tab-select events for mutual exclusion
    this.addEventListener("tab-select", this._handleTabSelect.bind(this));

    // More button click
    moreBtn.addEventListener("click", this._toggleOverflowMenu.bind(this));
  }

  connectedCallback(): void {
    this._propagateAttributes();
    this._syncTabindex();
    this._syncAriaOrientation();
    this.addEventListener("keydown", this._handleKeydown);
    document.addEventListener("click", this._handleOutsideClick);

    if (this.overflow === "menu") {
      this._startObserving();
    }
  }

  disconnectedCallback(): void {
    this.removeEventListener("keydown", this._handleKeydown);
    document.removeEventListener("click", this._handleOutsideClick);
    this._stopObserving();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    this._propagateAttributes();
    if (name === "orientation") {
      this._syncAriaOrientation();
      this._updateOverflow();
    }
    if (name === "overflow") {
      if (this.overflow === "menu") {
        this._startObserving();
      } else {
        this._stopObserving();
        this._showAllItems();
        this._moreBtn.classList.remove("visible");
        this._closeOverflowMenu();
      }
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): TabItemSize {
    return (this.getAttribute("size") as TabItemSize) ?? "m";
  }

  set size(value: TabItemSize) {
    this.setAttribute("size", value);
  }

  get orientation(): TabItemOrientation {
    return (this.getAttribute("orientation") as TabItemOrientation) ?? "horizontal";
  }

  set orientation(value: TabItemOrientation) {
    this.setAttribute("orientation", value);
  }

  get overflow(): TabGroupOverflow {
    return (this.getAttribute("overflow") as TabGroupOverflow) ?? "scroll";
  }

  set overflow(value: TabGroupOverflow) {
    this.setAttribute("overflow", value);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _getChildItems(): Element[] {
    const slot = this.shadowRoot!.querySelector("slot")!;
    return slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-TAB-ITEM");
  }

  private _propagateAttributes(): void {
    const items = this._getChildItems();
    for (const attr of PROPAGATED_ATTRS) {
      const value = this.getAttribute(attr);
      for (const item of items) {
        if (value) {
          item.setAttribute(attr, value);
        } else {
          item.removeAttribute(attr);
        }
      }
    }
  }

  /** Enforce single selection: deselect siblings when one is selected. */
  private _handleTabSelect(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.tagName !== "UI-TAB-ITEM") return;

    const items = this._getChildItems();
    for (const item of items) {
      if (item !== target && item.hasAttribute("selected")) {
        item.removeAttribute("selected");
      }
    }
    target.setAttribute("selected", "");
    this._syncTabindex();

    this.dispatchEvent(
      new CustomEvent("tab-change", {
        bubbles: true,
        composed: true,
        detail: { value: target.getAttribute("value") ?? "" },
      }),
    );

    this._closeOverflowMenu();
    this._updateOverflow();
  }

  /** WAI-ARIA roving tabindex: only the selected (or first) item is tabbable. */
  private _syncTabindex(): void {
    const items = this._getChildItems();
    if (items.length === 0) return;
    const selected = items.find((el) => el.hasAttribute("selected"));
    const focusable = selected ?? items[0];
    for (const item of items) {
      item.setAttribute("tabindex", item === focusable ? "0" : "-1");
    }
  }

  private _syncAriaOrientation(): void {
    if (this._tablist) {
      this._tablist.setAttribute("aria-orientation", this.orientation);
    }
  }

  // ── Overflow menu logic ────────────────────────────────────────────────

  private _startObserving(): void {
    this._stopObserving();
    this._resizeObserver = new ResizeObserver(() => {
      this._updateOverflow();
    });
    this._resizeObserver.observe(this._tablist);
  }

  private _stopObserving(): void {
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  private _updateOverflow(): void {
    if (this.overflow !== "menu") return;

    const items = this._getChildItems();
    if (items.length === 0) return;

    // First, show all items to measure
    this._showAllItems();

    const isHorizontal = this.orientation !== "vertical";
    const tablistRect = this._tablist.getBoundingClientRect();
    const containerEnd = isHorizontal
      ? tablistRect.right
      : tablistRect.bottom;

    // Reserve space for the more button (approximate)
    const moreBtnSize = isHorizontal ? 36 : 36;

    this._hiddenItems = [];

    for (const item of items) {
      const el = item as HTMLElement;
      const rect = el.getBoundingClientRect();
      const itemEnd = isHorizontal ? rect.right : rect.bottom;

      if (itemEnd > containerEnd) {
        this._hiddenItems.push(item);
        el.style.display = "none";
      }
    }

    if (this._hiddenItems.length > 0) {
      this._moreBtn.classList.add("visible");
      this._moreBtn.setAttribute("tabindex", "0");
    } else {
      this._moreBtn.classList.remove("visible");
      this._moreBtn.setAttribute("tabindex", "-1");
      this._closeOverflowMenu();
    }
  }

  private _showAllItems(): void {
    const items = this._getChildItems();
    for (const item of items) {
      (item as HTMLElement).style.display = "";
    }
    this._hiddenItems = [];
  }

  private _toggleOverflowMenu(): void {
    const isOpen = this._overflowMenu.classList.contains("open");
    if (isOpen) {
      this._closeOverflowMenu();
    } else {
      this._openOverflowMenu();
    }
  }

  private _openOverflowMenu(): void {
    // Build menu items from hidden tabs
    this._overflowMenu.innerHTML = "";
    for (const item of this._hiddenItems) {
      const btn = document.createElement("button");
      btn.className = "overflow-menu-item";
      btn.setAttribute("role", "menuitem");
      if (item.hasAttribute("selected")) {
        btn.classList.add("selected");
      }
      btn.textContent = item.getAttribute("label") || "";
      btn.addEventListener("click", () => {
        // Simulate click on the hidden tab item
        (item as HTMLElement).click();
        this._closeOverflowMenu();
      });
      this._overflowMenu.appendChild(btn);
    }

    const orientationClass = this.orientation === "vertical" ? "vertical" : "horizontal";
    this._overflowMenu.classList.add("open", orientationClass);
    this._moreBtn.setAttribute("aria-expanded", "true");

    // Focus first menu item
    const firstItem = this._overflowMenu.querySelector(".overflow-menu-item") as HTMLElement;
    if (firstItem) {
      firstItem.focus();
    }
  }

  private _closeOverflowMenu(): void {
    this._overflowMenu.classList.remove("open", "horizontal", "vertical");
    this._moreBtn.setAttribute("aria-expanded", "false");
  }

  private _handleOutsideClick = (e: MouseEvent): void => {
    if (!this._overflowMenu.classList.contains("open")) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this._closeOverflowMenu();
    }
  };

  /** WAI-ARIA: Arrow keys move focus between tabs, Home/End jump to first/last. */
  private _handleKeydown = (e: KeyboardEvent): void => {
    // Close overflow menu on Escape
    if (e.key === "Escape" && this._overflowMenu.classList.contains("open")) {
      this._closeOverflowMenu();
      this._moreBtn.focus();
      e.preventDefault();
      return;
    }

    const items = this._getChildItems().filter(
      (el) => !el.hasAttribute("disabled") && (el as HTMLElement).style.display !== "none",
    );
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as Element);
    if (currentIndex === -1) return;

    const isHorizontal = this.orientation === "horizontal";
    let nextIndex: number | null = null;

    switch (e.key) {
      case "ArrowRight":
        if (isHorizontal) nextIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowLeft":
        if (isHorizontal)
          nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "ArrowDown":
        if (!isHorizontal) nextIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowUp":
        if (!isHorizontal)
          nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex === null) return;

    e.preventDefault();
    const next = items[nextIndex] as HTMLElement;
    next.focus();
  };
}

customElements.define("ui-tab-group", UiTabGroup);
