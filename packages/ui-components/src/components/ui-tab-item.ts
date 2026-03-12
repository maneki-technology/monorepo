import { semanticVar, spaceVar } from "@maneki/foundation";
import "./ui-icon.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type TabItemSize = "s" | "m";
export type TabItemOrientation = "horizontal" | "vertical";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_LINK = semanticVar("text", "link");
const SELECTED_BOLD = semanticVar("stateSelected", "surfaceBold");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const ICON_PRIMARY = semanticVar("icon", "primary");
const ICON_SECONDARY = semanticVar("icon", "secondary");
const ICON_ACTION = semanticVar("icon", "action");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const SP_1 = spaceVar("1");
const SP_0_5 = spaceVar("0.5");
const SP_1_5 = spaceVar("1.5");
const SP_2 = spaceVar("2");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    outline: none;
    position: relative;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* ── Base container ──────────────────────────────────────────────────────── */

  .base {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    flex: 1 1 0%;
    font-family: "Inter", sans-serif;
    font-weight: var(--ui-tab-font-weight, 400);
    color: var(--ui-tab-text-color, ${TEXT_PRIMARY});
    position: relative;
    transition: color 0.15s ease, font-weight 0.15s ease;
  }

  .label-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Highlight bar ───────────────────────────────────────────────────────── */

  .highlight {
    position: absolute;
    background-color: var(--ui-tab-highlight-color, transparent);
    transition: background-color 0.15s ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .base,
    .highlight {
      transition: none;
    }
  }

  /* ── Horizontal (default): highlight at bottom ──────────────────────────── */

  :host,
  :host([orientation="horizontal"]) {
    flex-direction: column;
  }

  :host .highlight,
  :host([orientation="horizontal"]) .highlight {
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
  }

  /* ── Vertical: highlight on left ────────────────────────────────────────── */

  :host([orientation="vertical"]) {
    flex-direction: row;
  }
  :host([orientation="vertical"]) .base {
    justify-content: flex-start;
  }

  :host([orientation="vertical"]) .highlight {
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    height: 100%;
  }

  :host([orientation="vertical"]) .label-container {
    padding-left: 12px;
    padding-right: ${SP_1};
  }

  /* ── Slots ───────────────────────────────────────────────────────────────── */

  .leading-icon,
  .trailing-icon {
    display: none;
    align-items: center;
    justify-content: center;
    color: var(--ui-tab-icon-color, ${ICON_PRIMARY});
    flex-shrink: 0;
  }

  .leading-icon.has-content,
  .trailing-icon.has-content {
    display: inline-flex;
  }

  .chevron {
    display: none;
    align-items: center;
    justify-content: center;
    color: var(--ui-tab-icon-color, ${ICON_SECONDARY});
    flex-shrink: 0;
  }

  :host([sub-menu]) .chevron {
    display: inline-flex;
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    height: 40px;
  }

  :host .base,
  :host([size="m"]) .base {
    font-size: 14px;
    line-height: 20px;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  :host .label-container,
  :host([size="m"]) .label-container {
    gap: ${SP_1};
  }

  :host .leading-icon,
  :host([size="m"]) .leading-icon,
  :host .trailing-icon,
  :host([size="m"]) .trailing-icon,
  :host .chevron,
  :host([size="m"]) .chevron {
    width: 20px;
    height: 20px;
    font-size: 20px;
    --ui-icon-size: 20px;
  }

  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    height: 32px;
  }

  :host([size="s"]) .base {
    font-size: 12px;
    line-height: 16px;
    padding-top: 4px;
    padding-bottom: 4px;
  }

  :host([size="s"]) .label-container {
    gap: ${SP_0_5};
  }

  :host([size="s"]) .leading-icon,
  :host([size="s"]) .trailing-icon,
  :host([size="s"]) .chevron {
    width: 16px;
    height: 16px;
    font-size: 16px;
    --ui-icon-size: 16px;
  }

  /* ── State: enabled (default) ───────────────────────────────────────────── */

  :host {
    --ui-tab-text-color: ${TEXT_PRIMARY};
    --ui-tab-font-weight: 400;
    --ui-tab-highlight-color: transparent;
  }

  /* ── State: hover ─────────────────────────────────────────────────────── */

  :host(:hover:not([selected]):not([disabled])) {
    --ui-tab-text-color: ${TEXT_PRIMARY};
    --ui-tab-highlight-color: ${BORDER_MINIMAL};
  }

  /* ── State: selected ────────────────────────────────────────────────────── */

  :host([selected]) {
    --ui-tab-text-color: ${TEXT_LINK};
    --ui-tab-font-weight: 500;
    --ui-tab-highlight-color: ${SELECTED_BOLD};
  }

  :host([selected]) .leading-icon,
  :host([selected]) .trailing-icon,
  :host([selected]) .close-btn {
    color: var(--ui-tab-icon-color, ${ICON_ACTION});
  }

  /* ── State: disabled ────────────────────────────────────────────────────── */

  :host([disabled]) {
    --ui-tab-text-color: ${DISABLED_TEXT};
    --ui-tab-font-weight: 400;
    --ui-tab-highlight-color: transparent;
    pointer-events: none;
    cursor: default;
  }

  :host([disabled]) .leading-icon,
  :host([disabled]) .trailing-icon,
  :host([disabled]) .chevron {
    color: ${DISABLED_TEXT};
  }

  /* ── Close button ──────────────────────────────────────────────────────── */

  .close-btn {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    color: var(--ui-tab-icon-color, ${ICON_PRIMARY});
    border-radius: 2px;
    transition: color 0.15s ease;
  }

  :host([closable]) .close-btn {
    display: inline-flex;
  }

  .close-btn:hover {
    color: var(--ui-tab-text-color, ${TEXT_PRIMARY});
    background: rgba(0, 0, 0, 0.08);
  }

  .close-btn:focus-visible {
    outline: 2px solid ${semanticVar("border", "focus")};
    outline-offset: -1px;
  }

  :host([disabled]) .close-btn {
    color: ${DISABLED_TEXT};
    pointer-events: none;
  }

  /* Close button sizes */
  :host .close-btn,
  :host([size="m"]) .close-btn {
    width: 16px;
    height: 16px;
    font-size: 16px;
    --ui-icon-size: 16px;
  }

  :host([size="s"]) .close-btn {
    width: 12px;
    height: 12px;
    font-size: 12px;
    --ui-icon-size: 12px;
  }

  @media (prefers-reduced-motion: reduce) {
    .close-btn {
      transition: none;
    }
  }

  /* ── Reduced motion ─────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .highlight {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTabItem extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "selected",
    "disabled",
    "orientation",
    "label",
    "sub-menu",
    "value",
    "closable",
  ];

  private _labelEl!: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // .base
    const base = document.createElement("div");
    base.className = "base";

    // .highlight bar
    const highlight = document.createElement("div");
    highlight.className = "highlight";

    // .label-container
    const labelContainer = document.createElement("div");
    labelContainer.className = "label-container";

    // Leading icon slot
    const leadingIcon = document.createElement("span");
    leadingIcon.className = "leading-icon";
    const leadingSlot = document.createElement("slot");
    leadingSlot.name = "leading-icon";
    leadingIcon.appendChild(leadingSlot);

    // Label text
    const labelSpan = document.createElement("span");
    labelSpan.className = "label-text";
    this._labelEl = labelSpan;

    // Trailing icon slot
    const trailingIcon = document.createElement("span");
    trailingIcon.className = "trailing-icon";
    const trailingSlot = document.createElement("slot");
    trailingSlot.name = "trailing-icon";
    trailingIcon.appendChild(trailingSlot);

    // Chevron (sub-menu)
    const chevron = document.createElement("span");
    chevron.className = "chevron";
    const chevronIcon = document.createElement("ui-icon") as HTMLElement;
    chevronIcon.setAttribute("name", "expand_more");
    chevron.appendChild(chevronIcon);

    // Slot change listeners to toggle icon visibility
    leadingSlot.addEventListener("slotchange", () => {
      const hasContent = leadingSlot.assignedElements().length > 0;
      leadingIcon.classList.toggle("has-content", hasContent);
    });
    trailingSlot.addEventListener("slotchange", () => {
      const hasContent = trailingSlot.assignedElements().length > 0;
      trailingIcon.classList.toggle("has-content", hasContent);
    });

    labelContainer.appendChild(leadingIcon);
    labelContainer.appendChild(labelSpan);
    labelContainer.appendChild(trailingIcon);
    labelContainer.appendChild(chevron);

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("aria-label", "Close tab");
    closeBtn.setAttribute("tabindex", "-1");
    const closeBtnIcon = document.createElement("ui-icon") as HTMLElement;
    closeBtnIcon.setAttribute("name", "close");
    closeBtn.appendChild(closeBtnIcon);
    closeBtn.addEventListener("click", (e: Event) => {
      e.stopPropagation();
      if (this.disabled) return;
      this.dispatchEvent(
        new CustomEvent("tab-close", { bubbles: true, composed: true, detail: { value: this.value } }),
      );
    });
    labelContainer.appendChild(closeBtn);

    base.appendChild(labelContainer);
    base.appendChild(highlight);

    shadow.appendChild(base);

    // Event listeners
    this.addEventListener("click", this._handleClick.bind(this));
    this.addEventListener("keydown", this._handleKeydown.bind(this));
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "tab");
    }
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
    this._syncAria();
    this._syncLabel();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "selected" || name === "disabled") {
      this._syncAria();
    }
    if (name === "label") {
      this._syncLabel();
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

  get label(): string {
    return this.getAttribute("label") ?? "";
  }

  set label(value: string) {
    this.setAttribute("label", value);
  }

  get subMenu(): boolean {
    return this.hasAttribute("sub-menu");
  }

  set subMenu(value: boolean) {
    if (value) {
      this.setAttribute("sub-menu", "");
    } else {
      this.removeAttribute("sub-menu");
    }
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  get closable(): boolean {
    return this.hasAttribute("closable");
  }

  set closable(value: boolean) {
    if (value) {
      this.setAttribute("closable", "");
    } else {
      this.removeAttribute("closable");
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _handleClick(): void {
    if (this.disabled) return;
    this._select();
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._select();
    }
  }

  private _select(): void {
    this.dispatchEvent(
      new CustomEvent("tab-select", { bubbles: true, composed: true }),
    );
  }

  private _syncAria(): void {
    this.setAttribute("aria-selected", this.selected ? "true" : "false");
    this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
  }

  private _syncLabel(): void {
    if (this._labelEl) {
      const text = this.label;
      this._labelEl.textContent = text;
      this._labelEl.style.display = text ? "" : "none";
    }
  }
}

customElements.define("ui-tab-item", UiTabItem);
