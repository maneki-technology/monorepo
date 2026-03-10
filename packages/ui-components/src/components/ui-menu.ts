import { semanticVar, spaceVar, elevationVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type MenuSize = "s" | "m" | "l";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_PRIMARY = semanticVar("surface", "primary");
const ELEVATION_05 = elevationVar("05");
const SP_05 = spaceVar("0.5"); // 4px

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    position: absolute;
    z-index: 1000;
    min-width: var(--ui-menu-min-width, 240px);
    padding: ${SP_05} 0;
    background-color: var(--ui-menu-bg, ${SURFACE_PRIMARY});
    box-shadow: var(--ui-menu-shadow, ${ELEVATION_05});
    border-radius: var(--ui-menu-radius, 2px);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, visibility 0.15s ease, transform 0.15s ease;
    pointer-events: none;
  }

  :host([open]) {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    :host {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Propagated child tags ───────────────────────────────────────────────────

const PROPAGATED_CHILD_TAGS = ["UI-DROPDOWN-ITEM", "UI-DROPDOWN-HEADING"];

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiMenu extends HTMLElement {
  static readonly observedAttributes = [
    "open",
    "size",
    "selectable",
    "multiple",
  ];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    const slot = document.createElement("slot");
    shadow.appendChild(slot);

    this.setAttribute("role", "menu");

    // Propagate size on slotchange
    slot.addEventListener("slotchange", () => this._propagateSize());

    // Selection management
    this.addEventListener("select", this._handleItemSelect as EventListener);
  }

  connectedCallback(): void {
    // Only register dismiss handlers when standalone (not composed inside another shadow root)
    const root = this.getRootNode();
    if (!(root instanceof ShadowRoot)) {
      document.addEventListener("click", this._handleOutsideClick);
      this.addEventListener("keydown", this._handleKeydown);
    }
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
      case "size":
        this._propagateSize();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

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

  get size(): MenuSize {
    return (this.getAttribute("size") as MenuSize) ?? "m";
  }

  set size(value: MenuSize) {
    this.setAttribute("size", value);
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

  private _syncOpen(): void {
    const isOpen = this.open;

    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { open: isOpen },
      }),
    );
  }

  private _getSlottedChildren(): Element[] {
    const slot = this.shadowRoot?.querySelector("slot");
    if (!slot) return [];
    return (slot as HTMLSlotElement)
      .assignedElements({ flatten: true })
      .filter((el) => PROPAGATED_CHILD_TAGS.includes(el.tagName));
  }

  private _propagateSize(): void {
    const children = this._getSlottedChildren();
    for (const child of children) {
      child.setAttribute("size", this.size);
    }
  }

  private _getSlottedItems(): Element[] {
    const slot = this.shadowRoot?.querySelector("slot");
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
      return;
    }
    if (!this.open) return;
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
}

customElements.define("ui-menu", UiMenu);
