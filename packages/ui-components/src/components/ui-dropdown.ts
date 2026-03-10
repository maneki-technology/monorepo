import { colorVar, semanticVar, spaceVar, elevationVar } from "@maneki/foundation";
import "./ui-button.js";
import { ICON_CHEVRON } from "../assets/icons.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type DropdownSize = "s" | "m" | "l" | "xl";
export type DropdownAction = "primary" | "secondary" | "destructive" | "info" | "contrast";
export type DropdownEmphasis = "bold" | "subtle" | "minimal";
export type DropdownShape = "basic" | "rounded";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_PRIMARY = semanticVar("surface", "primary");
const ELEVATION_05 = elevationVar("05");
const SP_05 = spaceVar("0.5"); // 4px
const SP_075 = spaceVar("0.75"); // 6px
const SP_1 = spaceVar("1");     // 8px
const SP_15 = spaceVar("1.5");  // 12px
const SP_2 = spaceVar("2");     // 16px

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-block;
    position: relative;
  }

  /* ── Trigger right-padding override (Figma: pr is half of pl) ───────────── */

  ui-button::part(button) {
    padding-right: ${SP_1};
  }

  :host([size="s"]) ui-button::part(button) {
    padding-right: ${SP_075};
  }

  :host([size="l"]) ui-button::part(button) {
    padding-right: ${SP_15};
  }

  :host([size="xl"]) ui-button::part(button) {
    padding-right: ${SP_2};
  }

  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    transition: transform 0.15s ease;
    line-height: 0;
  }

  .chevron svg {
    width: 100%;
    height: 100%;
  }

  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  /* ── Menu panel ─────────────────────────────────────────────────────────── */

  .menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 240px;
    padding: ${SP_05} 0;
    background-color: var(--ui-dd-menu-bg, ${SURFACE_PRIMARY});
    box-shadow: var(--ui-dd-menu-shadow, ${ELEVATION_05});
    border-radius: 2px;
    overflow: visible;
  }

  :host([open]) .menu {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Size mapping for menu items ─────────────────────────────────────────────

const DROPDOWN_SIZE_TO_ITEM_SIZE: Record<DropdownSize, "s" | "m" | "l"> = {
  s: "s",
  m: "m",
  l: "l",
  xl: "l",
};

// ─── Component ───────────────────────────────────────────────────────────────

const PROPAGATED_CHILD_TAGS = ["UI-DROPDOWN-ITEM", "UI-DROPDOWN-HEADING"];

export class UiDropdown extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "action",
    "emphasis",
    "shape",
    "disabled",
    "open",
    "label",
    "multiple",
    "selectable",
  ];

  private _trigger!: HTMLElement;
  private _menu!: HTMLElement;
  private _chevron!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // Trigger button (reuse ui-button)
    const trigger = document.createElement("ui-button");
    trigger.setAttribute("icon", "trailing-icon");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");
    trigger.textContent = "Button";
    const triggerId = "dd-trigger-" + Math.random().toString(36).slice(2, 8);
    trigger.id = triggerId;

    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.setAttribute("slot", "icon-end");
    chevron.innerHTML = ICON_CHEVRON;
    trigger.appendChild(chevron);

    shadow.appendChild(trigger);

    // Menu panel
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-labelledby", triggerId);

    const slot = document.createElement("slot");
    menu.appendChild(slot);

    shadow.appendChild(menu);

    this._trigger = trigger;
    this._menu = menu;
    this._chevron = chevron;

    // Toggle on trigger click
    trigger.addEventListener("click", (e: Event) => {
      e.stopPropagation();
      if (!this.disabled) {
        this.open = !this.open;
      }
    });

    // Propagate size on slotchange
    slot.addEventListener("slotchange", () => this._propagateSize());

    // Selection management
    this.addEventListener("select", this._handleItemSelect as EventListener);
  }

  connectedCallback(): void {
    document.addEventListener("click", this._handleOutsideClick);
    this.addEventListener("keydown", this._handleKeydown);
    this._syncTrigger();
    this._propagateSize();
  }

  disconnectedCallback(): void {
    document.removeEventListener("click", this._handleOutsideClick);
    this.removeEventListener("keydown", this._handleKeydown);
    this.removeEventListener("select", this._handleItemSelect as EventListener);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (name) {
      case "open":
        this._syncOpen();
        break;
      case "disabled":
        this._syncDisabled();
        break;
      case "label":
        this._syncLabel();
        break;
      case "size":
        this._syncTriggerAttr("size");
        this._propagateSize();
        break;
      case "action":
        this._syncTriggerAttr("action");
        break;
      case "emphasis":
        this._syncTriggerAttr("emphasis");
        break;
      case "shape":
        this._syncTriggerAttr("shape");
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): DropdownSize {
    return (this.getAttribute("size") as DropdownSize) ?? "m";
  }

  set size(value: DropdownSize) {
    this.setAttribute("size", value);
  }

  get action(): DropdownAction {
    return (this.getAttribute("action") as DropdownAction) ?? "primary";
  }

  set action(value: DropdownAction) {
    this.setAttribute("action", value);
  }

  get emphasis(): DropdownEmphasis {
    return (this.getAttribute("emphasis") as DropdownEmphasis) ?? "bold";
  }

  set emphasis(value: DropdownEmphasis) {
    this.setAttribute("emphasis", value);
  }

  get shape(): DropdownShape {
    return (this.getAttribute("shape") as DropdownShape) ?? "basic";
  }

  set shape(value: DropdownShape) {
    this.setAttribute("shape", value);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    if (value) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  get label(): string {
    return this.getAttribute("label") ?? "Button";
  }

  set label(value: string) {
    this.setAttribute("label", value);
  }

  get multiple(): boolean {
    return this.hasAttribute("multiple");
  }

  set multiple(value: boolean) {
    if (value) {
      this.setAttribute("multiple", "");
    } else {
      this.removeAttribute("multiple");
    }
  }

  get selectable(): boolean {
    return this.hasAttribute("selectable");
  }

  set selectable(value: boolean) {
    if (value) {
      this.setAttribute("selectable", "");
    } else {
      this.removeAttribute("selectable");
    }
  }

  get value(): string | string[] {
    const items = this._getSlottedItems();
    const selected = items.filter(el => el.hasAttribute("selected"));
    if (this.multiple) {
      return selected.map(el => el.getAttribute("value") ?? el.textContent?.trim() ?? "");
    }
    const first = selected[0];
    return first ? (first.getAttribute("value") ?? first.textContent?.trim() ?? "") : "";
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncTrigger(): void {
    const attrs = ["size", "action", "emphasis", "shape"] as const;
    for (const attr of attrs) {
      this._syncTriggerAttr(attr);
    }
    this._syncLabel();
    this._syncDisabled();
    this._syncOpen();
  }

  private _syncTriggerAttr(attr: string): void {
    const value = this.getAttribute(attr);
    if (value) {
      this._trigger.setAttribute(attr, value);
    } else {
      this._trigger.removeAttribute(attr);
    }
  }

  private _syncLabel(): void {
    // Set text content on trigger, preserving the chevron icon child
    const label = this.label;
    // The first child text node is the label
    const firstChild = this._trigger.firstChild;
    if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
      firstChild.textContent = label;
    } else {
      this._trigger.insertBefore(
        document.createTextNode(label),
        this._trigger.firstChild,
      );
    }
  }

  private _syncDisabled(): void {
    if (this.disabled) {
      this._trigger.setAttribute("disabled", "");
    } else {
      this._trigger.removeAttribute("disabled");
    }
  }

  private _syncOpen(): void {
    const isOpen = this.open;
    this._trigger.setAttribute("aria-expanded", String(isOpen));

    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { open: isOpen },
      }),
    );
  }

  private _getSlottedChildren(): Element[] {
    const slot = this._menu.querySelector("slot");
    if (!slot) return [];
    return (slot as HTMLSlotElement)
      .assignedElements({ flatten: true })
      .filter((el) => PROPAGATED_CHILD_TAGS.includes(el.tagName));
  }

  private _propagateSize(): void {
    const itemSize = DROPDOWN_SIZE_TO_ITEM_SIZE[this.size];
    const children = this._getSlottedChildren();
    for (const child of children) {
      child.setAttribute("size", itemSize);
    }
  }

  private _getSlottedItems(): Element[] {
    const slot = this._menu.querySelector("slot");
    if (!slot) return [];
    return (slot as HTMLSlotElement)
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-DROPDOWN-ITEM");
  }

  private _handleItemSelect = (e: Event): void => {
    const item = e.target as HTMLElement;
    if (item.tagName !== "UI-DROPDOWN-ITEM") return;
    if (!this.selectable) return;

    if (this.multiple) {
      // Multi-select: toggle the clicked item
      if (item.hasAttribute("selected")) {
        item.removeAttribute("selected");
      } else {
        item.setAttribute("selected", "");
      }
    } else {
      // Single-select: select clicked item, deselect others
      const items = this._getSlottedItems();
      for (const other of items) {
        if (other === item) {
          other.setAttribute("selected", "");
        } else {
          other.removeAttribute("selected");
        }
      }
      // Close menu after single selection
      this.open = false;
    }

    this.dispatchEvent(new CustomEvent("change", {
      bubbles: true,
      composed: true,
      detail: { value: this.value },
    }));
  };

  private _handleOutsideClick = (e: Event): void => {
    if (this.open && !e.composedPath().includes(this)) {
      this.open = false;
    }
  };

  private _handleKeydown = (e: Event): void => {
    const ke = e as KeyboardEvent;
    if (ke.key === "Escape" && this.open) {
      this.open = false;
      this._trigger.focus();
      return;
    }
    if (!this.open) {
      // ArrowDown opens the menu
      if (ke.key === "ArrowDown") {
        ke.preventDefault();
        this.open = true;
        this._focusMenuItem(0);
      }
      return;
    }
    const items = this._getSlottedItems().filter((el) => !el.hasAttribute("disabled")) as HTMLElement[];
    if (items.length === 0) return;
    const active = items.findIndex((el) => el === document.activeElement || el.shadowRoot?.activeElement);
    let next: number | null = null;
    switch (ke.key) {
      case "ArrowDown":
        next = active < 0 ? 0 : (active + 1) % items.length;
        break;
      case "ArrowUp":
        next = active < 0 ? items.length - 1 : (active - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      default:
        return;
    }
    ke.preventDefault();
    items[next].focus();
  };

  private _focusMenuItem(index: number): void {
    requestAnimationFrame(() => {
      const items = this._getSlottedItems().filter((el) => !el.hasAttribute("disabled")) as HTMLElement[];
      if (items.length > 0 && index < items.length) {
        items[index].focus();
      }
    });
  }

}

customElements.define("ui-dropdown", UiDropdown);
