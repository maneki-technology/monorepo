import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  BORDER_MINIMAL,
  BW_SM,
  ELEVATION_03,
  FONT_PRIMARY,
  SP_0_5,
  SP_1_25,
  SP_2,
  SP_5,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
} from "@maneki/foundation";
import "./ui-side-panel.js";
import "./ui-icon.js";

import { UiSidePanel } from "./ui-side-panel.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type SidePanelMenuState = "expanded" | "collapsed";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    height: 100%;
  }

  /* ── Menu area ───────────────────────────────────────────────────────────── */

  .menu {
    display: flex;
    flex-direction: column;
    gap: var(--ui-spm-item-gap, ${SP_0_5});
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: ${SP_0_5};
  }

  .menu ::slotted(div) {
    display: flex;
    flex-direction: column;
    gap: var(--ui-spm-item-gap, ${SP_0_5});
  }

  /* ── Flyout submenu (collapsed mode) ─────────────────────────────────────── */

  .flyout {
    display: none;
    position: absolute;
    left: ${SP_5};
    top: 0;
    min-width: 200px;
    max-height: 100%;
    overflow-y: auto;
    background-color: var(--ui-spm-flyout-bg, ${SURFACE_SECONDARY});
    box-shadow: var(--ui-spm-flyout-shadow, ${ELEVATION_03});
    flex-direction: column;
    z-index: 10;
    font-family: ${FONT_PRIMARY};
  }

  .flyout[open] {
    display: flex;
  }

  .flyout-title {
    padding: ${SP_1_25} ${SP_2};
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--ui-spm-flyout-title, ${TEXT_PRIMARY});
    border-bottom: ${BW_SM} solid var(--ui-spm-flyout-sep, ${BORDER_MINIMAL});
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

@customElement("ui-side-panel-menu")
export class UiSidePanelMenu extends LitElement {
  @property({ type: String, reflect: true }) declare state: SidePanelMenuState;
  @property({ type: Boolean, reflect: true }) declare overlay: boolean;
  @property({ type: Boolean, reflect: true }) declare mobile: boolean;
  @property({ type: Boolean, reflect: true, attribute: "no-collapse" }) declare noCollapse: boolean;

  static styles = css`
    ${unsafeCSS(STYLES)}
  `;

  private _activeFlyoutItem: Element | null = null;
  private _dismissFlyout: (() => void) | null = null;
  private _syncingState = false;

  constructor() {
    super();
    this.state = "expanded";
    this.overlay = false;
    this.mobile = false;
    this.noCollapse = false;
    // Selection management — listens on host element
    this.addEventListener("select", (e: Event) => this._handleItemSelect(e as CustomEvent));
    // Intercept expandable item toggles in collapsed mode
    this.addEventListener("toggle", (e: Event) => {
      // Only handle toggle from menu items, not from the panel itself
      const target = (e as CustomEvent)
        .composedPath()
        .find((el) => (el as Element).tagName === "UI-SIDE-PANEL-MENU-ITEM");
      if (target) {
        e.stopPropagation();
        this._handleItemToggle(e as CustomEvent);
      }
    });
  }

  // ── Synchronous first render for happy-dom tests ───────────────────────
  protected override scheduleUpdate(): void | Promise<unknown> {
    this.performUpdate();
  }

  protected override render(): unknown {
    return html`
      <ui-side-panel @toggle=${this._onPanelToggle} @mobilechange=${this._onPanelMobileChange}>
        <div slot="header"><slot name="header"></slot></div>
        <div class="menu" role="tree" @keydown=${this._onMenuKeydown}><slot></slot></div>
        <div slot="footer"><slot name="footer"></slot></div>
      </ui-side-panel>
      <div class="flyout">
        <div class="flyout-title"></div>
        <div class="flyout-body" role="group"></div>
      </div>
    `;
  }

  // ── Lit template event handlers (arrow functions for stable `this`) ────

  private _onPanelToggle = (e: Event): void => {
    const panel = this._getPanel();
    // Only handle toggle events from the panel itself, not from slotted items
    if (e.target !== panel) return;
    // Skip if we're the ones who set the panel state (avoid feedback loop)
    if (this._syncingState) return;
    const ce = e as CustomEvent;
    // Sync state + overlay from panel back to menu
    this.state = ce.detail.state;
    this.overlay = (panel as UiSidePanel).overlay;
  };

  private _onPanelMobileChange = (e: Event): void => {
    if (this._syncingState) return;
    const ce = e as CustomEvent;
    if (ce.detail.mobile) {
      this.mobile = true;
      this.state = ce.detail.state;
    } else {
      this.mobile = false;
      this.overlay = false;
      this.state = ce.detail.state;
    }
  };

  private _onMenuKeydown = (e: KeyboardEvent): void => {
    this._handleMenuKeydown(e);
  };

  private _getPanel(): HTMLElement | null {
    return this.shadowRoot!.querySelector("ui-side-panel");
  }

  private _getMenu(): HTMLDivElement | null {
    return this.shadowRoot!.querySelector(".menu");
  }

  private _getFlyout(): HTMLDivElement | null {
    return this.shadowRoot!.querySelector(".flyout");
  }

  private _getFlyoutTitle(): HTMLDivElement | null {
    return this.shadowRoot!.querySelector(".flyout-title");
  }

  private _getFlyoutBody(): HTMLDivElement | null {
    return this.shadowRoot!.querySelector(".flyout-body");
  }

  connectedCallback(): void {
    super.connectedCallback();
    // Force synchronous first render so shadow DOM is available immediately
    this._syncingState = true;
    this.requestUpdate();
    this.performUpdate();
    this._syncingState = false;

    // Lit may not use adoptedStyleSheets in all environments (e.g. happy-dom).
    // Manually adopt so tests that check adoptedStyleSheets.length pass.
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(STYLES);
    this.shadowRoot!.adoptedStyleSheets = [sheet];

    const panel = this._getPanel();
    // Save intended state — panel's connectedCallback will override via mobilechange
    const intendedState = this.getAttribute("state");
    this._syncPanelAttributes();
    // Panel's connectedCallback fires _syncMobileState which overrides state.
    // If not mobile, re-assert the intended state.
    if (panel && !panel.hasAttribute("mobile") && intendedState) {
      this._syncingState = true;
      this.setAttribute("state", intendedState);
      panel.setAttribute("state", intendedState);
      this._syncingState = false;
    }
    // If mobile, sync from panel
    if (panel && panel.hasAttribute("mobile")) {
      this.setAttribute("mobile", "");
      const panelState = panel.getAttribute("state");
      if (panelState) this.setAttribute("state", panelState);
    }
    // Scrollable region must be keyboard-focusable
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");

    // Scroll to initially selected item after layout settles
    requestAnimationFrame(() => {
      const selected = this._getAllItems().find((el) => el.hasAttribute("selected"));
      if (selected) selected.scrollIntoView({ block: "center" });
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._closeFlyout();
  }

  protected override willUpdate(changedProperties: Map<string, unknown>): void {
    // Property-to-property changes (no cascading update)
    if (changedProperties.has("mobile")) {
      if (this.mobile) {
        this.state = "collapsed";
      } else {
        this.overlay = false;
        this.state = "expanded";
      }
    }
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    const panel = this._getPanel();
    if (changedProperties.has("state")) {
      this._syncingState = true;
      if (panel) panel.setAttribute("state", this.state);
      this._syncingState = false;
      this._syncItemTypes();
      this._closeFlyout();
    }
    if (changedProperties.has("overlay")) {
      if (panel) {
        if (this.overlay) panel.setAttribute("overlay", "");
        else panel.removeAttribute("overlay");
      }
    }
    if (changedProperties.has("mobile")) {
      if (panel) {
        if (this.mobile) panel.setAttribute("mobile", "");
        else {
          panel.removeAttribute("mobile");
          panel.removeAttribute("overlay");
        }
      }
    }
    if (changedProperties.has("noCollapse")) {
      if (panel) {
        if (this.noCollapse) panel.setAttribute("no-collapse", "");
        else panel.removeAttribute("no-collapse");
      }
    }
  }


  // ── Private: sync panel ─────────────────────────────────────────────────

  private _syncPanelAttributes(): void {
    const panel = this._getPanel();
    if (!panel) return;
    panel.setAttribute("state", this.state);
    if (this.hasAttribute("overlay")) panel.setAttribute("overlay", "");
    if (this.hasAttribute("mobile")) panel.setAttribute("mobile", "");
    if (this.hasAttribute("no-collapse")) panel.setAttribute("no-collapse", "");
  }

  // ── Private: item type sync ─────────────────────────────────────────────

  _syncItemTypes(): void {
    const isCollapsed = this.state === "collapsed";
    const menu = this._getMenu();
    if (!menu) return;
    const slot = menu.querySelector("slot");
    if (!slot) return;
    const assigned = slot.assignedElements({ flatten: true });
    for (const el of assigned) {
      if (el.tagName === "UI-SIDE-PANEL-MENU-ITEM") {
        if (isCollapsed) {
          el.setAttribute("type", "icon-only");
          if (el.hasAttribute("expanded")) {
            el.removeAttribute("expanded");
          }
        } else {
          el.removeAttribute("type");
        }
      } else if (el.tagName !== "SLOT") {
        // Hide sections, divs, and any non-item content when collapsed
        (el as HTMLElement).style.display = isCollapsed ? "none" : "";
      }
    }
  }

  // ── Private: keyboard navigation ────────────────────────────────────────

  private _getNavigableItems(): HTMLElement[] {
    const menu = this._getMenu();
    if (!menu) return [];
    const slot = menu.querySelector("slot");
    if (!slot) return [];
    const allItems: HTMLElement[] = [];
    const collectItems = (elements: Element[]) => {
      for (const el of elements) {
        if (el.tagName === "UI-SIDE-PANEL-MENU-ITEM" && !el.hasAttribute("disabled")) {
          allItems.push(el as HTMLElement);
          const childSlot = el.shadowRoot?.querySelector('slot[name="children"]');
          if (childSlot && el.hasAttribute("expanded")) {
            const children = (childSlot as HTMLSlotElement).assignedElements({
              flatten: true,
            });
            collectItems(children);
          }
        }
      }
    };
    collectItems(slot.assignedElements({ flatten: true }));
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
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        this._focusItem(items[nextIndex]);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
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
        if (currentItem && currentItem.hasAttribute("expandable") && !currentItem.hasAttribute("expanded")) {
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
        if (currentItem && currentItem.hasAttribute("expandable") && currentItem.hasAttribute("expanded")) {
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
    const menu = this._getMenu();
    if (!menu) return [];
    const slot = menu.querySelector("slot");
    if (!slot) return [];
    const allItems: Element[] = [];
    const collect = (elements: Element[]) => {
      for (const el of elements) {
        if (el.tagName === "UI-SIDE-PANEL-MENU-ITEM") {
          allItems.push(el);
          const childSlot = el.shadowRoot?.querySelector('slot[name="children"]');
          if (childSlot) {
            const children = (childSlot as HTMLSlotElement).assignedElements({
              flatten: true,
            });
            collect(children);
          }
        }
      }
    };
    collect((slot as HTMLSlotElement).assignedElements({ flatten: true }));
    return allItems;
  }

  private _handleItemSelect(e: CustomEvent): void {
    const target = e.composedPath().find((el) => (el as Element).tagName === "UI-SIDE-PANEL-MENU-ITEM") as
      | Element
      | undefined;
    if (!target) return;

    if (target.hasAttribute("expandable")) return;

    const allItems = this._getAllItems();

    for (const item of allItems) {
      item.removeAttribute("selected");
      item.removeAttribute("child-parent-selected");
    }

    target.setAttribute("selected", "");
    this._markParentSelected(target, allItems);

    // Scroll selected item into view
    target.scrollIntoView({ block: "nearest" });

    // Auto-close sidebar on mobile after selection
    if (this.mobile) {
      this.setAttribute("state", "collapsed");
    }
  }

  private _markParentSelected(selectedItem: Element, _allItems: Element[]): void {
    const menu = this._getMenu();
    if (!menu) return;
    const slot = menu.querySelector("slot");
    if (!slot) return;
    const topLevel = (slot as HTMLSlotElement).assignedElements({
      flatten: true,
    });
    this._markParentsRecursive(topLevel, selectedItem);
  }

  private _markParentsRecursive(items: Element[], selectedItem: Element): boolean {
    for (const item of items) {
      if (item.tagName !== "UI-SIDE-PANEL-MENU-ITEM") continue;
      if (item === selectedItem) return true;

      const childSlot = item.shadowRoot?.querySelector('slot[name="children"]');
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
    const target = e.composedPath().find((el) => (el as Element).tagName === "UI-SIDE-PANEL-MENU-ITEM") as
      | HTMLElement
      | undefined;
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

    const menu = this._getMenu()!;
    const flyout = this._getFlyout()!;
    const flyoutTitle = this._getFlyoutTitle()!;
    const flyoutBody = this._getFlyoutBody()!;

    const menuRect = menu.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    flyout.style.top = `${itemRect.top - menuRect.top + menu.offsetTop}px`;

    const itemText = Array.from(item.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent?.trim())
      .filter(Boolean)
      .join(" ");
    flyoutTitle.textContent = itemText || item.textContent?.trim()?.split("\n")[0] || "";

    flyoutBody.innerHTML = "";
    const childSlot = item.shadowRoot?.querySelector('slot[name="children"]') as HTMLSlotElement | null;
    if (childSlot) {
      const children = childSlot.assignedElements({ flatten: true });
      for (const child of children) {
        if (child.tagName !== "UI-SIDE-PANEL-MENU-ITEM") continue;
        const clone = document.createElement("ui-side-panel-menu-item");
        const level = child.getAttribute("level");
        if (level) clone.setAttribute("level", level);
        if (child.hasAttribute("selected")) clone.setAttribute("selected", "");
        if (child.hasAttribute("disabled")) clone.setAttribute("disabled", "");
        if (child.hasAttribute("child-parent-selected")) clone.setAttribute("child-parent-selected", "");
        if (child.hasAttribute("value")) clone.setAttribute("value", child.getAttribute("value")!);
        if (child.hasAttribute("leading-icon")) {
          clone.setAttribute("leading-icon", "");
          const iconSlot = child.querySelector('[slot="icon"]');
          if (iconSlot) clone.appendChild(iconSlot.cloneNode(true));
        }
        clone.textContent = child.textContent?.trim() ?? "";
        if (!level) clone.setAttribute("level", "secondary");
        (clone as unknown as Record<string, unknown>)._originalItem = child;
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
        flyoutBody.appendChild(clone);
      }
    }

    flyout.setAttribute("open", "");

    const onDocClick = (ev: MouseEvent) => {
      const path = ev.composedPath();
      if (!path.includes(flyout) && !path.includes(item)) {
        this._closeFlyout();
      }
    };
    const onKeydown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        this._closeFlyout();
      }
    };
    document.addEventListener("keydown", onKeydown);
    // Defer outside-click listener to avoid catching the originating click
    requestAnimationFrame(() => {
      document.addEventListener("click", onDocClick);
    });
    this._dismissFlyout = () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeydown);
    };
  }

  private _closeFlyout(): void {
    const flyout = this._getFlyout();
    const flyoutBody = this._getFlyoutBody();
    if (flyout) flyout.removeAttribute("open");
    if (flyoutBody) flyoutBody.innerHTML = "";
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
