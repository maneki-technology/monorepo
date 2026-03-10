import { semanticVar, spaceVar } from "@maneki/foundation";
import { ICON_CHEVRON_RIGHT } from "../assets/icons.js";

// ─── Type exports ────────────────────────────────────────────────────────────

export type DropdownItemSize = "s" | "m" | "l";
export type DropdownItemLeading = "icon" | "checkbox" | "radio" | "avatar";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SELECTED = semanticVar("text", "selected");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const SELECTED_BOLD = semanticVar("stateSelected", "surfaceBold");
const BORDER_CONTRAST = semanticVar("border", "contrast");
const SP_05 = spaceVar("0.5");   // 4px — description gap
const SP_075 = spaceVar("0.75"); // 6px
const SP_1 = spaceVar("1");      // 8px
// SP_125 (10px) has no foundation token — inlined in CSS
const SP_15 = spaceVar("1.5");   // 12px
const SP_2 = spaceVar("2");      // 16px
const SP_3 = spaceVar("3");      // 24px

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

  :host([submenu]) {
    position: relative;
  }

  ::slotted(ui-menu) {
    position: absolute;
    top: 0;
    left: 100%;
    margin-top: -4px;
    display: none;
  }

  ::slotted(ui-menu[open]) {
    display: block;
  }

  .item {
    display: flex;
    align-items: center;
    width: 100%;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-family: var(--ui-dd-item-font-family, "Inter", sans-serif);
    font-weight: var(--ui-dd-item-font-weight, 400);
    color: var(--ui-dd-item-color, ${TEXT_PRIMARY});
    text-align: start;
    padding: 0;
    margin: 0;
  }

  .item:hover {
    background-color: var(--ui-dd-item-hover-bg, rgba(159, 177, 189, 0.1));
  }

  .item:active {
    background-color: var(--ui-dd-item-active-bg, rgba(159, 177, 189, 0.2));
  }

  .item:focus-visible {
    background-color: var(--ui-dd-item-focus-bg, rgba(159, 177, 189, 0.4));
    outline: none;
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .item,
  :host([size="m"]) .item {
    font-size: 14px;
    line-height: 20px;
    padding: ${SP_075} ${SP_2};
    gap: ${SP_1};
  }

  :host .leading,
  :host([size="m"]) .leading {
    width: 20px;
    height: 20px;
  }

  :host .secondary,
  :host([size="m"]) .secondary {
    font-size: 12px;
    line-height: 16px;
  }

  :host .description,
  :host([size="m"]) .description {
    font-size: 12px;
    line-height: 16px;
  }

  :host .submenu,
  :host([size="m"]) .submenu {
    width: 20px;
    height: 20px;
  }


  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .item {
    font-size: 12px;
    line-height: 16px;
    padding: ${SP_075} ${SP_15};
    gap: ${SP_1};
  }

  :host([size="s"]) .leading {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .secondary {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .description {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .submenu {
    width: 16px;
    height: 16px;
  }


  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .item {
    font-size: 16px;
    line-height: 24px;
    padding: 10px ${SP_2} 10px ${SP_3};
    gap: ${SP_15};
  }

  :host([size="l"]) .leading {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .secondary {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .description {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .submenu {
    width: 24px;
    height: 24px;
  }


  /* ── Disabled ───────────────────────────────────────────────────────────── */

  :host([disabled]) .item {
    color: var(--ui-dd-item-disabled-color, rgba(91, 114, 130, 0.5));
    cursor: not-allowed;
    pointer-events: none;
  }

  :host([disabled]) .item:hover {
    background-color: transparent;
  }

  /* ── Leading element ────────────────────────────────────────────────────── */

  .leading {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 0;
  }

  .leading svg {
    width: 100%;
    height: 100%;
  }

  .leading ::slotted(*) {
    width: 100%;
    height: 100%;
  }

  /* ── Content area ───────────────────────────────────────────────────────── */

  .content {
    display: flex;
    flex-direction: column;
    gap: ${SP_05};
    flex: 1;
    min-width: 0;
  }

  .head {
    display: flex;
    align-items: center;
    gap: ${SP_1};
  }

  .label {
    flex: 1;
    min-width: 0;
  }

  .right {
    display: flex;
    align-items: center;
    gap: ${SP_1};
    margin-left: auto;
    flex-shrink: 0;
  }

  /* ── Secondary label ────────────────────────────────────────────────────── */

  .secondary {
    color: var(--ui-dd-item-secondary-color, ${TEXT_SECONDARY});
    white-space: nowrap;
  }

  /* ── Description ────────────────────────────────────────────────────────── */

  .description {
    color: var(--ui-dd-item-description-color, ${TEXT_SECONDARY});
  }

  /* ── Submenu arrow ──────────────────────────────────────────────────────── */

  .submenu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 0;
  }

  .submenu svg {
    width: 100%;
    height: 100%;
  }


  /* ── Selected ───────────────────────────────────────────────────────────── */

  :host([selected]) .item {
    color: var(--ui-dd-item-selected-color, ${TEXT_SELECTED});
    font-weight: 500;
  }

  /* ── Leading checkbox/radio selected colors ─────────────────────────────── */

  :host([selected]) .leading-checkbox rect {
    fill: ${SELECTED_BOLD};
    stroke: ${SELECTED_BOLD};
  }

  :host([selected]) .leading-radio .radio-outer {
    stroke: ${BORDER_CONTRAST};
  }

  :host([selected]) .leading-radio .radio-inner {
    fill: ${SELECTED_BOLD};
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

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

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

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
