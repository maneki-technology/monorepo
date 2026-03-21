import "./ui-side-panel.js";
import "./ui-icon.js";
import { STYLES } from "./ui-side-panel-menu.styles.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type SidePanelMenuState = "expanded" | "collapsed";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSidePanelMenu extends HTMLElement {
  static readonly observedAttributes = ["state", "overlay", "title", "mobile", "no-collapse"];

  private _panel: HTMLElement;
  private _menu: HTMLDivElement;
  private _flyout: HTMLDivElement;
  private _flyoutTitle: HTMLDivElement;
  private _flyoutBody: HTMLDivElement;
  private _activeFlyoutItem: Element | null = null;
  private _dismissFlyout: (() => void) | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Compose ui-side-panel as the container
    this._panel = document.createElement("ui-side-panel");

    // Menu area (slotted into the panel)
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "tree");
    const menuSlot = document.createElement("slot");
    menu.appendChild(menuSlot);
    this._panel.appendChild(menu);

    shadow.appendChild(this._panel);

    // Flyout submenu (for collapsed mode) — lives outside the panel
    const flyout = document.createElement("div");
    flyout.className = "flyout";
    const flyoutTitle = document.createElement("div");
    flyoutTitle.className = "flyout-title";
    flyout.appendChild(flyoutTitle);
    const flyoutBody = document.createElement("div");
    flyoutBody.setAttribute("role", "group");
    flyout.appendChild(flyoutBody);
    shadow.appendChild(flyout);

    this._menu = menu;
    this._flyout = flyout;
    this._flyoutTitle = flyoutTitle;
    this._flyoutBody = flyoutBody;

    // Keyboard navigation in menu
    menu.addEventListener("keydown", (e: KeyboardEvent) =>
      this._handleMenuKeydown(e),
    );
    // Selection management
    this.addEventListener("select", (e: Event) =>
      this._handleItemSelect(e as CustomEvent),
    );
    // Intercept expandable item toggles in collapsed mode
    this.addEventListener("toggle", (e: Event) => {
      // Only handle toggle from menu items, not from the panel itself
      const target = (e as CustomEvent).composedPath().find(
        (el) => (el as Element).tagName === "UI-SIDE-PANEL-MENU-ITEM",
      );
      if (target) this._handleItemToggle(e as CustomEvent);
    });

    // Listen for panel toggle to sync item types
    this._panel.addEventListener("toggle", (e: Event) => {
      const ce = e as CustomEvent;
      // Sync state + overlay from panel back to menu
      this.setAttribute("state", ce.detail.state);
      if (this._panel.hasAttribute("overlay")) this.setAttribute("overlay", "");
      else this.removeAttribute("overlay");
    });
  }

  connectedCallback(): void {
    this._syncPanelAttributes();
  }

  disconnectedCallback(): void {
    this._closeFlyout();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "state") {
      this._panel.setAttribute("state", this.state);
      this._syncItemTypes();
      this._closeFlyout();
    }
    if (name === "title") {
      this._panel.setAttribute("title", this.getAttribute("title") ?? "");
    }
    if (name === "overlay") {
      if (this.hasAttribute("overlay")) this._panel.setAttribute("overlay", "");
      else this._panel.removeAttribute("overlay");
    }
    if (name === "mobile") {
      if (this.hasAttribute("mobile")) {
        this._panel.setAttribute("mobile", "");
        // Auto-collapse on mobile
        this.setAttribute("state", "collapsed");
      } else {
        this._panel.removeAttribute("mobile");
        // Leaving mobile: clear overlay, restore expanded
        this.removeAttribute("overlay");
        this._panel.removeAttribute("overlay");
        this.setAttribute("state", "expanded");
      }
    }
    if (name === "no-collapse") {
      if (this.hasAttribute("no-collapse")) this._panel.setAttribute("no-collapse", "");
      else this._panel.removeAttribute("no-collapse");
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

  // ── Private: sync panel ─────────────────────────────────────────────────

  private _syncPanelAttributes(): void {
    this._panel.setAttribute("state", this.state);
    this._panel.setAttribute("title", this.getAttribute("title") ?? "Panel Title");
    if (this.hasAttribute("overlay")) this._panel.setAttribute("overlay", "");
    if (this.hasAttribute("mobile")) this._panel.setAttribute("mobile", "");
    if (this.hasAttribute("no-collapse")) this._panel.setAttribute("no-collapse", "");
  }

  // ── Private: item type sync ─────────────────────────────────────────────

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
        if (item.hasAttribute("expanded")) {
          item.removeAttribute("expanded");
        }
      } else {
        item.removeAttribute("type");
      }
    }
  }

  // ── Private: keyboard navigation ────────────────────────────────────────

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

    const activeEl = this.shadowRoot?.activeElement ?? document.activeElement;
    let currentItem: HTMLElement | null = null;
    for (const item of items) {
      if (item === activeEl || item.shadowRoot?.activeElement) {
        currentItem = item;
        break;
      }
    }

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

  // ── Private: selection management ───────────────────────────────────────

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

    if (target.hasAttribute("expandable")) return;

    const allItems = this._getAllItems();

    for (const item of allItems) {
      item.removeAttribute("selected");
      item.removeAttribute("child-parent-selected");
    }

    target.setAttribute("selected", "");
    this._markParentSelected(target, allItems);
  }

  private _markParentSelected(
    selectedItem: Element,
    _allItems: Element[],
  ): void {
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

    if (target.hasAttribute("expanded")) {
      target.removeAttribute("expanded");
    }

    if (this._activeFlyoutItem === target) {
      this._closeFlyout();
      return;
    }

    this._openFlyout(target);
  }

  private _openFlyout(item: HTMLElement): void {
    this._closeFlyout();
    this._activeFlyoutItem = item;

    const menuRect = this._menu.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    this._flyout.style.top = `${itemRect.top - menuRect.top + this._menu.offsetTop}px`;

    const itemText = Array.from(item.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(" ");
    this._flyoutTitle.textContent = itemText || item.textContent?.trim()?.split("\n")[0] || "";

    this._flyoutBody.innerHTML = "";
    const childSlot = item.shadowRoot?.querySelector(
      'slot[name="children"]',
    ) as HTMLSlotElement | null;
    if (childSlot) {
      const children = childSlot.assignedElements({ flatten: true });
      for (const child of children) {
        if (child.tagName !== "UI-SIDE-PANEL-MENU-ITEM") continue;
        const clone = document.createElement("ui-side-panel-menu-item");
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
        if (!level) clone.setAttribute("level", "secondary");
        (clone as any)._originalItem = child;
        clone.addEventListener("select", (ev: Event) => {
          ev.stopPropagation();
          const ce = ev as CustomEvent;
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
}

customElements.define("ui-side-panel-menu", UiSidePanelMenu);
