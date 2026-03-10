import { semanticVar } from "@maneki/foundation";
import { ICON_CHEVRON_RIGHT } from "../assets/icons.js";
import { STYLES } from "./ui-dropdown-item.styles.js";

// ─── Token constants (used in SVG generation) ────────────────────────────────

const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const SELECTED_BOLD = semanticVar("stateSelected", "surfaceBold");
const BORDER_CONTRAST = semanticVar("border", "contrast");

// ─── Type exports ────────────────────────────────────────────────────────────

export type DropdownItemSize = "s" | "m" | "l";
export type DropdownItemLeading = "icon" | "checkbox" | "radio" | "avatar";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiDropdownItem extends HTMLElement {
  static readonly observedAttributes = [
    "size", "disabled", "selected", "value",
    "leading", "secondary", "description", "submenu",
  ];

  private _button: HTMLButtonElement;
  private _leadingEl: HTMLSpanElement | null = null;
  private _contentEl: HTMLSpanElement;
  private _secondaryEl: HTMLSpanElement | null = null;
  private _descriptionEl: HTMLSpanElement | null = null;
  private _submenuEl: HTMLSpanElement | null = null;
  private _rightEl: HTMLSpanElement;
  private _closeTimer: ReturnType<typeof setTimeout> | null = null;
  private _submenuSlot: HTMLSlotElement | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    const button = document.createElement("button");
    button.className = "item";
    button.setAttribute("role", "menuitem");
    button.setAttribute("part", "item");

    // Content wrapper
    const content = document.createElement("span");
    content.className = "content";

    // Head row (label + right section)
    const head = document.createElement("span");
    head.className = "head";

    const label = document.createElement("span");
    label.className = "label";
    const slot = document.createElement("slot");
    label.appendChild(slot);
    head.appendChild(label);

    // Right section (secondary + submenu)
    const right = document.createElement("span");
    right.className = "right";
    this._rightEl = right;


    head.appendChild(right);
    content.appendChild(head);

    button.appendChild(content);
    shadow.appendChild(button);

    // Submenu slot (outside button, after it in shadow DOM)
    const submenuSlot = document.createElement("slot");
    submenuSlot.name = "submenu";
    shadow.appendChild(submenuSlot);
    this._submenuSlot = submenuSlot;

    this._button = button;
    this._contentEl = content;

    button.addEventListener("click", () => {
      if (!this.disabled) {
        this.dispatchEvent(
          new CustomEvent("select", {
            bubbles: true,
            composed: true,
            detail: { selected: this.selected },
          }),
        );
      }
    });
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    if (name === "disabled") {
      this._syncDisabled();
    } else if (name === "leading") {
      this._syncLeading();
    } else if (name === "secondary") {
      this._syncSecondary();
    } else if (name === "description") {
      this._syncDescription();
    } else if (name === "submenu") {
      this._syncSubmenu();
    } else if (name === "selected") {
      this._syncLeadingState();
    }
  }

  connectedCallback(): void {
    this._syncDisabled();
    this._syncLeading();
    this._syncSecondary();
    this._syncDescription();
    this._syncSubmenu();

    // Submenu hover handlers on host
    this.addEventListener("mouseenter", this._handleHostMouseenter);
    this.addEventListener("mouseleave", this._handleHostMouseleave);
    this.addEventListener("keydown", this._handleSubmenuKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener("mouseenter", this._handleHostMouseenter);
    this.removeEventListener("mouseleave", this._handleHostMouseleave);
    this.removeEventListener("keydown", this._handleSubmenuKeydown);
    this._cancelCloseTimer();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): DropdownItemSize {
    return (this.getAttribute("size") as DropdownItemSize) ?? "m";
  }

  set size(value: DropdownItemSize) {
    this.setAttribute("size", value);
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

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean) {
    if (value) {
      this.setAttribute("selected", "");
    } else {
      this.removeAttribute("selected");
    }
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  get leading(): DropdownItemLeading | null {
    return this.getAttribute("leading") as DropdownItemLeading | null;
  }

  set leading(value: DropdownItemLeading | null) {
    if (value) {
      this.setAttribute("leading", value);
    } else {
      this.removeAttribute("leading");
    }
  }

  get secondary(): string | null {
    return this.getAttribute("secondary");
  }

  set secondary(value: string | null) {
    if (value !== null) {
      this.setAttribute("secondary", value);
    } else {
      this.removeAttribute("secondary");
    }
  }

  get description(): string | null {
    return this.getAttribute("description");
  }

  set description(value: string | null) {
    if (value !== null) {
      this.setAttribute("description", value);
    } else {
      this.removeAttribute("description");
    }
  }

  get submenu(): boolean {
    return this.hasAttribute("submenu");
  }

  set submenu(value: boolean) {
    if (value) {
      this.setAttribute("submenu", "");
    } else {
      this.removeAttribute("submenu");
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncDisabled(): void {
    this._button.disabled = this.disabled;
  }

  private _syncLeading(): void {
    const leadingType = this.leading;

    if (!leadingType) {
      // Remove leading element if it exists
      if (this._leadingEl) {
        this._leadingEl.remove();
        this._leadingEl = null;
      }
      return;
    }

    // Create leading container if needed
    if (!this._leadingEl) {
      this._leadingEl = document.createElement("span");
      this._leadingEl.className = "leading";
      // Insert before content
      this._button.insertBefore(this._leadingEl, this._contentEl);
    }

    // Clear previous content
    this._leadingEl.innerHTML = "";

    if (leadingType === "icon") {
      const iconSlot = document.createElement("slot");
      iconSlot.name = "icon";
      this._leadingEl.appendChild(iconSlot);
    } else if (leadingType === "avatar") {
      const avatarSlot = document.createElement("slot");
      avatarSlot.name = "avatar";
      this._leadingEl.appendChild(avatarSlot);
    } else if (leadingType === "checkbox") {
      this._leadingEl.innerHTML = this._renderCheckbox();
    } else if (leadingType === "radio") {
      this._leadingEl.innerHTML = this._renderRadio();
    }
  }

  private _syncLeadingState(): void {
    const leadingType = this.leading;
    if (leadingType === "checkbox" && this._leadingEl) {
      this._leadingEl.innerHTML = this._renderCheckbox();
    } else if (leadingType === "radio" && this._leadingEl) {
      this._leadingEl.innerHTML = this._renderRadio();
    }
  }

  private _renderCheckbox(): string {
    const checked = this.selected;
    if (checked) {
      return `<svg class="leading-checkbox" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="14" height="14" fill="${SELECTED_BOLD}" stroke="${SELECTED_BOLD}" stroke-width="1.5"/><path d="M4.5 8L7 10.5L11.5 5.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    return `<svg class="leading-checkbox" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="14" height="14" fill="none" stroke="${FORM_INPUT_BORDER}" stroke-width="1.5"/></svg>`;
  }

  private _renderRadio(): string {
    const selected = this.selected;
    if (selected) {
      return `<svg class="leading-radio" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="radio-outer" cx="8" cy="8" r="7" fill="none" stroke="${BORDER_CONTRAST}" stroke-width="1.5"/><circle class="radio-inner" cx="8" cy="8" r="4" fill="${SELECTED_BOLD}"/></svg>`;
    }
    return `<svg class="leading-radio" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle class="radio-outer" cx="8" cy="8" r="7" fill="none" stroke="${FORM_INPUT_BORDER}" stroke-width="1.5"/></svg>`;
  }

  private _syncSecondary(): void {
    const text = this.secondary;

    if (!text) {
      if (this._secondaryEl) {
        this._secondaryEl.remove();
        this._secondaryEl = null;
      }
      return;
    }

    if (!this._secondaryEl) {
      this._secondaryEl = document.createElement("span");
      this._secondaryEl.className = "secondary";
      // Insert before submenu and check in the right section
      this._rightEl.insertBefore(this._secondaryEl, this._rightEl.firstChild);
    }

    this._secondaryEl.textContent = text;
  }

  private _syncDescription(): void {
    const text = this.description;

    if (!text) {
      if (this._descriptionEl) {
        this._descriptionEl.remove();
        this._descriptionEl = null;
      }
      return;
    }

    if (!this._descriptionEl) {
      this._descriptionEl = document.createElement("span");
      this._descriptionEl.className = "description";
      this._contentEl.appendChild(this._descriptionEl);
    }

    this._descriptionEl.textContent = text;
  }

  private _syncSubmenu(): void {
    const hasSubmenu = this.submenu;

    if (!hasSubmenu) {
      if (this._submenuEl) {
        this._submenuEl.remove();
        this._submenuEl = null;
      }
      return;
    }

    if (!this._submenuEl) {
      this._submenuEl = document.createElement("span");
      this._submenuEl.className = "submenu";
      this._submenuEl.innerHTML = ICON_CHEVRON_RIGHT;
      // Insert at end of right section
      this._rightEl.appendChild(this._submenuEl);
    }

    // Propagate size to slotted submenu
    this._propagateSizeToSubmenu();
  }

  // ── Submenu behavior ──────────────────────────────────────────────────

  _getSubmenu(): HTMLElement | null {
    if (!this._submenuSlot) return null;
    const assigned = this._submenuSlot.assignedElements({ flatten: true });
    return (assigned.find((el) => el.tagName === "UI-MENU") as HTMLElement) ?? null;
  }

  _openSubmenu(): void {
    const menu = this._getSubmenu();
    if (menu) {
      this._propagateSizeToSubmenu();
      menu.setAttribute("open", "");
    }
  }

  _closeSubmenu(): void {
    const menu = this._getSubmenu();
    if (menu) {
      menu.removeAttribute("open");
    }
  }

  private _propagateSizeToSubmenu(): void {
    const menu = this._getSubmenu();
    if (menu) {
      menu.setAttribute("size", this.size);
    }
  }

  private _cancelCloseTimer(): void {
    if (this._closeTimer !== null) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
  }

  private _handleHostMouseenter = (): void => {
    this._cancelCloseTimer();
    if (this.submenu) {
      this._openSubmenu();
    }
  };

  private _handleHostMouseleave = (): void => {
    if (this.submenu) {
      this._cancelCloseTimer();
      this._closeTimer = setTimeout(() => {
        this._closeSubmenu();
        this._closeTimer = null;
      }, 150);
    }
  };

  private _handleSubmenuKeydown = (e: Event): void => {
    if (!this.submenu) return;
    const key = (e as KeyboardEvent).key;

    if (key === "ArrowRight") {
      e.stopPropagation();
      this._openSubmenu();
      // Focus first item in submenu
      const menu = this._getSubmenu();
      if (menu) {
        const firstItem = menu.querySelector("ui-dropdown-item") as HTMLElement | null;
        const firstButton = firstItem?.shadowRoot?.querySelector("button") as HTMLElement | null;
        if (firstButton) firstButton.focus();
      }
    } else if (key === "ArrowLeft" || key === "Escape") {
      const menu = this._getSubmenu();
      if (menu && menu.hasAttribute("open")) {
        e.stopPropagation();
        this._closeSubmenu();
        this._button.focus();
      }
    }
  };
}

customElements.define("ui-dropdown-item", UiDropdownItem);
