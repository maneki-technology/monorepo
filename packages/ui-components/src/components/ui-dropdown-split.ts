import { ICON_CHEVRON } from "../assets/icons.js";
import { STYLES } from "./ui-dropdown-split.styles.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type DropdownSplitSize = "s" | "m" | "l" | "xl";
export type DropdownSplitAction = "primary" | "secondary" | "destructive" | "info" | "contrast";
export type DropdownSplitEmphasis = "bold" | "subtle" | "minimal";
export type DropdownSplitShape = "basic" | "rounded";
export type DropdownSplitIcon = "text-only" | "leading-icon" | "trailing-icon" | "icon-only";

// ─── Size mapping for menu items ─────────────────────────────────────────────

const DROPDOWN_SPLIT_SIZE_TO_ITEM_SIZE: Record<DropdownSplitSize, "s" | "m" | "l"> = {
  s: "s",
  m: "m",
  l: "l",
  xl: "l",
};

// ─── Component ───────────────────────────────────────────────────────────────

const PROPAGATED_CHILD_TAGS = ["UI-DROPDOWN-ITEM", "UI-DROPDOWN-HEADING"];

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiDropdownSplit extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "action",
    "emphasis",
    "shape",
    "icon",
    "disabled",
    "open",
    "label",
    "multiple",
    "selectable",
  ];

  private _leftBtn!: HTMLButtonElement;
  private _rightBtn!: HTMLButtonElement;
  private _menu!: HTMLElement;
  private _chevron!: HTMLElement;
  private _textSlot!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // ── Base container ──
    const base = document.createElement("div");
    base.className = "base";

    // ── Left action button ──
    const left = document.createElement("button");
    left.className = "left";
    left.setAttribute("part", "left");
    left.setAttribute("type", "button");

    const iconStartWrapper = document.createElement("span");
    iconStartWrapper.className = "slot-icon-start";
    const iconStartSlot = document.createElement("slot");
    iconStartSlot.name = "icon-start";
    iconStartWrapper.appendChild(iconStartSlot);
    left.appendChild(iconStartWrapper);

    const textWrapper = document.createElement("span");
    textWrapper.className = "slot-text";
    const textSlot = document.createElement("slot");
    textSlot.name = "text";
    textWrapper.appendChild(textSlot);
    left.appendChild(textWrapper);

    const iconEndWrapper = document.createElement("span");
    iconEndWrapper.className = "slot-icon-end";
    const iconEndSlot = document.createElement("slot");
    iconEndSlot.name = "icon-end";
    iconEndWrapper.appendChild(iconEndSlot);
    left.appendChild(iconEndWrapper);

    base.appendChild(left);

    // ── Divider ──
    const divider = document.createElement("div");
    divider.className = "divider";
    const dividerInner = document.createElement("div");
    dividerInner.className = "divider-inner";
    divider.appendChild(dividerInner);
    base.appendChild(divider);

    // ── Right chevron button ──
    const right = document.createElement("button");
    right.className = "right";
    right.setAttribute("part", "right");
    right.setAttribute("type", "button");
    right.setAttribute("aria-haspopup", "true");
    right.setAttribute("aria-expanded", "false");
    right.setAttribute("aria-label", "Toggle menu");
    const rightId = "dds-trigger-" + Math.random().toString(36).slice(2, 8);
    right.id = rightId;

    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.innerHTML = ICON_CHEVRON;
    right.appendChild(chevron);
    base.appendChild(right);

    shadow.appendChild(base);

    // ── Menu panel ──
    const menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-labelledby", rightId);

    const menuSlot = document.createElement("slot");
    menu.appendChild(menuSlot);
    shadow.appendChild(menu);

    this._leftBtn = left;
    this._rightBtn = right;
    this._menu = menu;
    this._chevron = chevron;
    this._textSlot = textWrapper;

    // ── Set initial label text ──
    this._syncLabel();

    // ── Event listeners ──
    left.addEventListener("click", (e: Event) => {
      e.stopPropagation();
      if (!this.disabled) {
        this.dispatchEvent(
          new CustomEvent("action", { bubbles: true, composed: true }),
        );
      }
    });

    right.addEventListener("click", (e: Event) => {
      e.stopPropagation();
      if (!this.disabled) {
        this.open = !this.open;
      }
    });

    // Propagate size on slotchange
    menuSlot.addEventListener("slotchange", () => this._propagateSize());

    // Selection management
    this.addEventListener("select", this._handleItemSelect as EventListener);
  }

  connectedCallback(): void {
    document.addEventListener("click", this._handleOutsideClick);
    this.addEventListener("keydown", this._handleKeydown);
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
        this._propagateSize();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): DropdownSplitSize {
    return (this.getAttribute("size") as DropdownSplitSize) ?? "m";
  }

  set size(value: DropdownSplitSize) {
    this.setAttribute("size", value);
  }

  get action(): DropdownSplitAction {
    return (this.getAttribute("action") as DropdownSplitAction) ?? "primary";
  }

  set action(value: DropdownSplitAction) {
    this.setAttribute("action", value);
  }

  get emphasis(): DropdownSplitEmphasis {
    return (this.getAttribute("emphasis") as DropdownSplitEmphasis) ?? "bold";
  }

  set emphasis(value: DropdownSplitEmphasis) {
    this.setAttribute("emphasis", value);
  }

  get shape(): DropdownSplitShape {
    return (this.getAttribute("shape") as DropdownSplitShape) ?? "basic";
  }

  set shape(value: DropdownSplitShape) {
    this.setAttribute("shape", value);
  }

  get icon(): DropdownSplitIcon {
    return (this.getAttribute("icon") as DropdownSplitIcon) ?? "text-only";
  }

  set icon(value: DropdownSplitIcon) {
    this.setAttribute("icon", value);
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

  private _syncOpen(): void {
    const isOpen = this.open;
    this._rightBtn.setAttribute("aria-expanded", String(isOpen));
  }

  private _syncDisabled(): void {
    this._leftBtn.disabled = this.disabled;
    this._rightBtn.disabled = this.disabled;
  }

  private _syncLabel(): void {
    const slot = this._textSlot?.querySelector("slot");
    if (!slot) return;
    slot.textContent = this.label;
  }

  private _getSlottedChildren(): Element[] {
    const slot = this._menu.querySelector("slot");
    if (!slot) return [];
    return (slot as HTMLSlotElement)
      .assignedElements({ flatten: true })
      .filter((el) => PROPAGATED_CHILD_TAGS.includes(el.tagName));
  }

  private _propagateSize(): void {
    const itemSize = DROPDOWN_SPLIT_SIZE_TO_ITEM_SIZE[this.size];
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
      if (item.hasAttribute("selected")) {
        item.removeAttribute("selected");
      } else {
        item.setAttribute("selected", "");
      }
    } else {
      const items = this._getSlottedItems();
      for (const other of items) {
        if (other === item) {
          other.setAttribute("selected", "");
        } else {
          other.removeAttribute("selected");
        }
      }
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
      this._rightBtn.focus();
      return;
    }
    if (!this.open) {
      if (ke.key === "ArrowDown" && document.activeElement === this._rightBtn) {
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

customElements.define("ui-dropdown-split", UiDropdownSplit);