import { semanticVar, elevationVar, spaceVar, colorVar, standardBreakpoints } from "@maneki/foundation";
import { ICON_CHEVRON_LEFT, ICON_CHEVRON_RIGHT } from "../assets/icons.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type SidePanelMenuState = "expanded" | "collapsed";

/** Mobile breakpoint threshold — foundation "s" maxWidth (767px). */
const MOBILE_MAX_WIDTH = standardBreakpoints.s.maxWidth;

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const TEXT_PRIMARY = semanticVar("text", "primary");
const ICON_PRIMARY_TOKEN = semanticVar("icon", "primary");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const BORDER_MODERATE = semanticVar("border", "moderate");
const ELEVATION_03 = elevationVar("03");
const BLUE_60 = colorVar("blue", 60);
const SP_1 = spaceVar("1");       // 8px
const SP_2 = spaceVar("2");       // 16px

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    width: 300px;
    height: 100%;
    background-color: var(--ui-spm-bg, ${SURFACE_SECONDARY});
    font-family: "Goldman Sans", sans-serif;
    position: relative;
    transition: width 0.2s ease;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  /* ── Right border (inset shadow) ─────────────────────────────────────────── */

  :host(:not([overlay])) .container::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset -1px 0 0 0 var(--ui-spm-border, ${BORDER_MODERATE});
  }

  /* ── Overlay mode ────────────────────────────────────────────────────────── */

  :host([overlay]) {
    box-shadow: var(--ui-spm-shadow, ${ELEVATION_03});
  }

  /* ── Collapsed mode ──────────────────────────────────────────────────────── */

  :host([state="collapsed"]) {
    width: 40px;
  }

  /* ── Mobile full-width overlay ───────────────────────────────────────────── */

  :host([mobile][state="expanded"]) {
    position: fixed;
    inset: 0;
    width: 100%;
    z-index: 100;
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */

  .header {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${SP_1};
    padding-left: ${SP_2};
    gap: ${SP_1};
    background-color: var(--ui-spm-header-bg, ${SURFACE_SECONDARY});
    flex-shrink: 0;
  }

  .header-title {
    flex: 1 0 0;
    min-width: 0;
    overflow: hidden;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    color: var(--ui-spm-header-text, ${TEXT_PRIMARY});
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .header-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    line-height: 0;
    color: var(--ui-spm-toggle-icon, ${ICON_PRIMARY_TOKEN});
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    border-radius: 2px;
  }

  .header-toggle:focus-visible {
    outline: 2px solid ${BLUE_60};
    outline-offset: -2px;
  }

  .header-toggle svg {
    width: 100%;
    height: 100%;
  }

  /* ── Collapsed header ────────────────────────────────────────────────────── */

  :host([state="collapsed"]) .header {
    justify-content: center;
    padding: ${SP_1};
  }

  :host([state="collapsed"]) .header-title {
    display: none;
  }

  /* ── Separator ───────────────────────────────────────────────────────────── */

  .separator {
    height: 1px;
    background-color: var(--ui-spm-separator, ${BORDER_MINIMAL});
    flex-shrink: 0;
  }

  /* ── Menu area ───────────────────────────────────────────────────────────── */

  .menu {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
  }
  /* ── Flyout submenu (collapsed mode) ─────────────────────────────────────── */

  .flyout {
    display: none;
    position: absolute;
    left: 40px;
    top: 0;
    min-width: 200px;
    max-height: 100%;
    overflow-y: auto;
    background-color: var(--ui-spm-flyout-bg, ${SURFACE_SECONDARY});
    box-shadow: var(--ui-spm-flyout-shadow, ${ELEVATION_03});
    flex-direction: column;
    z-index: 10;
    font-family: "Goldman Sans", sans-serif;
  }

  .flyout[open] {
    display: flex;
  }

  .flyout-title {
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--ui-spm-flyout-title, ${TEXT_PRIMARY});
    border-bottom: 1px solid var(--ui-spm-flyout-sep, ${BORDER_MINIMAL});
  }

  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    :host {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiSidePanelMenu extends HTMLElement {
  static readonly observedAttributes = ["state", "overlay", "title", "mobile"];

  private _headerTitle: HTMLSpanElement;
  private _toggleBtn: HTMLButtonElement;
  private _menu: HTMLDivElement;
  private _flyout: HTMLDivElement;
  private _flyoutTitle: HTMLDivElement;
  private _flyoutBody: HTMLDivElement;
  private _activeFlyoutItem: Element | null = null;
  private _dismissFlyout: (() => void) | null = null;
  private _mobileQuery: MediaQueryList | null = null;
  private _mobileHandler: ((e: MediaQueryListEvent) => void) | null = null;
  private _userExplicitState = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // Container
    const container = document.createElement("div");
    container.className = "container";

    // Header
    const header = document.createElement("div");
    header.className = "header";

    const headerTitle = document.createElement("span");
    headerTitle.className = "header-title";
    headerTitle.textContent = "Panel Title";
    header.appendChild(headerTitle);

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "header-toggle";
    toggleBtn.setAttribute("type", "button");
    toggleBtn.setAttribute("aria-label", "Toggle panel");
    header.appendChild(toggleBtn);

    container.appendChild(header);

    // Separator
    const separator = document.createElement("div");
    separator.className = "separator";
    container.appendChild(separator);

    // Menu area
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "tree");
    const menuSlot = document.createElement("slot");
    menu.appendChild(menuSlot);
    container.appendChild(menu);

    shadow.appendChild(container);

    // Flyout submenu (for collapsed mode)
    const flyout = document.createElement("div");
    flyout.className = "flyout";
    const flyoutTitle = document.createElement("div");
    flyoutTitle.className = "flyout-title";
    flyout.appendChild(flyoutTitle);
    const flyoutBody = document.createElement("div");
    flyoutBody.setAttribute("role", "group");
    flyout.appendChild(flyoutBody);
    shadow.appendChild(flyout);

    this._headerTitle = headerTitle;
    this._toggleBtn = toggleBtn;
    this._menu = menu;
    this._flyout = flyout;
    this._flyoutTitle = flyoutTitle;
    this._flyoutBody = flyoutBody;

    // Toggle handler
    toggleBtn.addEventListener("click", () => this._toggle());

    // Keyboard navigation in menu
    menu.addEventListener("keydown", (e: KeyboardEvent) =>
      this._handleMenuKeydown(e),
    );
    // Selection management
    this.addEventListener("select", (e: Event) =>
      this._handleItemSelect(e as CustomEvent),
    );
    // Intercept expandable item toggles in collapsed mode
    this.addEventListener("toggle", (e: Event) =>
      this._handleItemToggle(e as CustomEvent),
    );
  }

  connectedCallback(): void {
    this._syncToggleIcon();
    this._syncTitle();
    this._setupMobileDetection();
  }

  disconnectedCallback(): void {
    this._teardownMobileDetection();
    this._closeFlyout();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "state") {
      this._syncToggleIcon();
      this._syncItemTypes();
      this._closeFlyout();
    }
    if (name === "title") {
      this._syncTitle();
    }
    if (name === "mobile") {
      this._syncMobileState();
    }
  }
  // ── Property accessors ──────────────────────────────────────────────────

  get state(): SidePanelMenuState {
    return (this.getAttribute("state") as SidePanelMenuState) ?? "expanded";
  }

  set state(value: SidePanelMenuState) {
    this.setAttribute("state", value);
  }

  get overlay(): boolean {
    return this.hasAttribute("overlay");
  }

  set overlay(value: boolean) {
    if (value) this.setAttribute("overlay", "");
    else this.removeAttribute("overlay");
  }

  get mobile(): boolean {
    return this.hasAttribute("mobile");
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _toggle(): void {
    this._userExplicitState = true;
    const newState =
      this.state === "expanded" ? "collapsed" : "expanded";
    this.state = newState;
    // On mobile, expanded = overlay
    if (this.mobile) {
      this.overlay = newState === "expanded";
    }
    this.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { state: newState },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _syncToggleIcon(): void {
    this._toggleBtn.innerHTML =
      this.state === "expanded" ? ICON_CHEVRON_LEFT : ICON_CHEVRON_RIGHT;
    this._toggleBtn.setAttribute(
      "aria-label",
      this.state === "expanded" ? "Collapse panel" : "Expand panel",
    );
  }

  private _syncTitle(): void {
    this._headerTitle.textContent =
      this.getAttribute("title") ?? "Panel Title";
  }

  private _syncItemTypes(): void {
    const isCollapsed = this.state === "collapsed";
    const slot = this._menu.querySelector("slot");
    if (!slot) return;
    const items = slot
      .assignedElements({ flatten: true })
      .filter(
        (el) => el.tagName === "UI-SIDE-PANEL-MENU-ITEM",
      );
    for (const item of items) {
      if (isCollapsed) {
        item.setAttribute("type", "icon-only");
      } else {
        item.removeAttribute("type");
      }
    }
  }

  private _getNavigableItems(): HTMLElement[] {
    const slot = this._menu.querySelector("slot");
    if (!slot) return [];
    const allItems: HTMLElement[] = [];
    const collectItems = (elements: Element[]) => {
      for (const el of elements) {
        if (
          el.tagName === "UI-SIDE-PANEL-MENU-ITEM" &&
          !el.hasAttribute("disabled")
        ) {
          allItems.push(el as HTMLElement);
          // If expanded, also collect children
          const childSlot = el.shadowRoot?.querySelector(
            'slot[name="children"]',
          );
          if (childSlot && el.hasAttribute("expanded")) {
            const children = (childSlot as HTMLSlotElement).assignedElements({
              flatten: true,
            });
            collectItems(children);
          }
        }
      }
    };
    collectItems(
      slot.assignedElements({ flatten: true }),
    );
    return allItems;
  }

  private _handleMenuKeydown(e: KeyboardEvent): void {
    const items = this._getNavigableItems();
    if (items.length === 0) return;

    // Find the currently focused item
    const activeEl = this.shadowRoot?.activeElement ?? document.activeElement;
    let currentItem: HTMLElement | null = null;
    for (const item of items) {
      if (item === activeEl || item.shadowRoot?.activeElement) {
        currentItem = item;
        break;
      }
    }

    // Also check if focus is inside a child item's shadow
    if (!currentItem) {
      const composed = e.composedPath();
      for (const item of items) {
        if (composed.includes(item)) {
          currentItem = item;
          break;
        }
      }
    }

    const currentIndex = currentItem ? items.indexOf(currentItem) : -1;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextIndex =
          currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        this._focusItem(items[nextIndex]);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        this._focusItem(items[prevIndex]);
        break;
      }
      case "Home": {
        e.preventDefault();
        this._focusItem(items[0]);
        break;
      }
      case "End": {
        e.preventDefault();
        this._focusItem(items[items.length - 1]);
        break;
      }
      case "ArrowRight": {
        if (
          currentItem &&
          currentItem.hasAttribute("expandable") &&
          !currentItem.hasAttribute("expanded")
        ) {
          e.preventDefault();
          currentItem.setAttribute("expanded", "");
          currentItem.dispatchEvent(
            new CustomEvent("toggle", {
              detail: { expanded: true },
              bubbles: true,
              composed: true,
            }),
          );
        }
        break;
      }
      case "ArrowLeft": {
        if (
          currentItem &&
          currentItem.hasAttribute("expandable") &&
          currentItem.hasAttribute("expanded")
        ) {
          e.preventDefault();
          currentItem.removeAttribute("expanded");
          currentItem.dispatchEvent(
            new CustomEvent("toggle", {
              detail: { expanded: false },
              bubbles: true,
              composed: true,
            }),
          );
        }
        break;
      }
    }
  }


  private _getAllItems(): Element[] {
    const slot = this._menu.querySelector("slot");
    if (!slot) return [];
    const allItems: Element[] = [];
    const collect = (elements: Element[]) => {
      for (const el of elements) {
        if (el.tagName === "UI-SIDE-PANEL-MENU-ITEM") {
          allItems.push(el);
          const childSlot = el.shadowRoot?.querySelector(
            'slot[name="children"]',
          );
          if (childSlot) {
            const children = (childSlot as HTMLSlotElement).assignedElements({
              flatten: true,
            });
            collect(children);
          }
        }
      }
    };
    collect(
      (slot as HTMLSlotElement).assignedElements({ flatten: true }),
    );
    return allItems;
  }

  private _handleItemSelect(e: CustomEvent): void {
    const target = e.composedPath().find(
      (el) => (el as Element).tagName === "UI-SIDE-PANEL-MENU-ITEM",
    ) as Element | undefined;
    if (!target) return;

    // If the item is expandable and not a leaf, don't select — just toggle
    if (target.hasAttribute("expandable")) return;

    const allItems = this._getAllItems();

    // Clear all selected and child-parent-selected
    for (const item of allItems) {
      item.removeAttribute("selected");
      item.removeAttribute("child-parent-selected");
    }

    // Select the clicked item
    target.setAttribute("selected", "");

    // Walk up to mark parent expandable items as child-parent-selected
    this._markParentSelected(target, allItems);
  }

  private _markParentSelected(
    selectedItem: Element,
    _allItems: Element[],
  ): void {
    // Find the parent expandable item that contains this selected item
    // by checking which expandable items have this item in their children slot
    const slot = this._menu.querySelector("slot");
    if (!slot) return;
    const topLevel = (slot as HTMLSlotElement).assignedElements({
      flatten: true,
    });
    this._markParentsRecursive(topLevel, selectedItem);
  }

  private _markParentsRecursive(
    items: Element[],
    selectedItem: Element,
  ): boolean {
    for (const item of items) {
      if (item.tagName !== "UI-SIDE-PANEL-MENU-ITEM") continue;
      if (item === selectedItem) return true;

      const childSlot = item.shadowRoot?.querySelector(
        'slot[name="children"]',
      );
      if (childSlot) {
        const children = (childSlot as HTMLSlotElement).assignedElements({
          flatten: true,
        });
        if (this._markParentsRecursive(children, selectedItem)) {
          item.setAttribute("child-parent-selected", "");
          return true;
        }
      }
    }
    return false;
  }
  // ── Flyout submenu ──────────────────────────────────────────────────

  private _handleItemToggle(e: CustomEvent): void {
    if (this.state !== "collapsed") return;
    const target = e.composedPath().find(
      (el) => (el as Element).tagName === "UI-SIDE-PANEL-MENU-ITEM",
    ) as HTMLElement | undefined;
    if (!target || !target.hasAttribute("expandable")) return;

    // Revert inline expansion — collapsed mode uses flyout instead
    if (target.hasAttribute("expanded")) {
      target.removeAttribute("expanded");
    }

    // If clicking the same item that's already open, close flyout
    if (this._activeFlyoutItem === target) {
      this._closeFlyout();
      return;
    }

    this._openFlyout(target);
  }

  private _openFlyout(item: HTMLElement): void {
    this._closeFlyout();
    this._activeFlyoutItem = item;

    // Position flyout at the item's vertical offset
    const menuRect = this._menu.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    this._flyout.style.top = `${itemRect.top - menuRect.top + this._menu.offsetTop}px`;

    // Set title from item's light DOM text (exclude slotted children)
    const itemText = Array.from(item.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(" ");
    this._flyoutTitle.textContent = itemText || item.textContent?.trim()?.split("\n")[0] || "";

    // Clone children into flyout
    this._flyoutBody.innerHTML = "";
    const childSlot = item.shadowRoot?.querySelector(
      'slot[name="children"]',
    ) as HTMLSlotElement | null;
    if (childSlot) {
      const children = childSlot.assignedElements({ flatten: true });
      for (const child of children) {
        if (child.tagName !== "UI-SIDE-PANEL-MENU-ITEM") continue;
        const clone = document.createElement("ui-side-panel-menu-item");
        // Copy relevant attributes
        const level = child.getAttribute("level");
        if (level) clone.setAttribute("level", level);
        if (child.hasAttribute("selected")) clone.setAttribute("selected", "");
        if (child.hasAttribute("disabled")) clone.setAttribute("disabled", "");
        if (child.hasAttribute("child-parent-selected"))
          clone.setAttribute("child-parent-selected", "");
        if (child.hasAttribute("value"))
          clone.setAttribute("value", child.getAttribute("value")!);
        if (child.hasAttribute("leading-icon")) {
          clone.setAttribute("leading-icon", "");
          const iconSlot = child.querySelector('[slot="icon"]');
          if (iconSlot) clone.appendChild(iconSlot.cloneNode(true));
        }
        clone.textContent = child.textContent?.trim() ?? "";
        // Flyout items use secondary level styling but no extra indent
        if (!level) clone.setAttribute("level", "secondary");
        // Store reference to original for selection sync
        (clone as any)._originalItem = child;
        clone.addEventListener("select", (ev: Event) => {
          ev.stopPropagation();
          const ce = ev as CustomEvent;
          // Dispatch select from the original child so container handles it
          child.dispatchEvent(
            new CustomEvent("select", {
              detail: ce.detail,
              bubbles: true,
              composed: true,
            }),
          );
          this._closeFlyout();
        });
        this._flyoutBody.appendChild(clone);
      }
    }

    this._flyout.setAttribute("open", "");

    // Dismiss handlers
    const onDocClick = (ev: MouseEvent) => {
      const path = ev.composedPath();
      if (!path.includes(this._flyout) && !path.includes(item)) {
        this._closeFlyout();
      }
    };
    const onKeydown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        this._closeFlyout();
      }
    };
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onKeydown);
    this._dismissFlyout = () => {
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("keydown", onKeydown);
    };
  }

  private _closeFlyout(): void {
    this._flyout.removeAttribute("open");
    this._flyoutBody.innerHTML = "";
    this._activeFlyoutItem = null;
    if (this._dismissFlyout) {
      this._dismissFlyout();
      this._dismissFlyout = null;
    }
  }

  private _focusItem(item: HTMLElement): void {
    const row = item.shadowRoot?.querySelector(".row") as HTMLElement | null;
    if (row) {
      row.focus();
    } else {
      item.focus();
    }
  }

  // ── Mobile responsive ────────────────────────────────────────────────

  private _setupMobileDetection(): void {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    this._mobileQuery = mq;
    this._mobileHandler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        this.setAttribute("mobile", "");
      } else {
        this.removeAttribute("mobile");
      }
    };
    mq.addEventListener("change", this._mobileHandler);
    // Initial check
    if (mq.matches) {
      this.setAttribute("mobile", "");
    }
  }

  private _teardownMobileDetection(): void {
    if (this._mobileQuery && this._mobileHandler) {
      this._mobileQuery.removeEventListener("change", this._mobileHandler);
      this._mobileQuery = null;
      this._mobileHandler = null;
    }
  }

  private _syncMobileState(): void {
    if (this.mobile) {
      // Entering mobile: auto-collapse unless user explicitly expanded
      if (!this._userExplicitState) {
        this.state = "collapsed";
        this.overlay = false;
      }
    } else {
      // Leaving mobile: restore expanded, remove overlay
      this._userExplicitState = false;
      this.state = "expanded";
      this.overlay = false;
    }
  }
}

customElements.define("ui-side-panel-menu", UiSidePanelMenu);
