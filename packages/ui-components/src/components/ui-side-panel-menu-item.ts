import { semanticVar, spaceVar, borderWidthVar } from "@maneki/foundation";
import "./ui-icon.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type SidePanelMenuItemLevel = "primary" | "secondary" | "tertiary";
export type SidePanelMenuItemType = "basic" | "icon-only";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const TEXT_PRIMARY = semanticVar("text", "primary");
const ICON_PRIMARY_TOKEN = semanticVar("icon", "primary");
const ICON_ACTION = semanticVar("icon", "action");
const BORDER_FOCUS = semanticVar("border", "focus");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const HOVER_MINIMAL = semanticVar("stateHover", "surfaceMinimal");
const HOVER_MODERATE = semanticVar("stateHover", "surfaceModerate");
const SELECTED_OVERLAY = semanticVar("stateSelected", "surfaceOverlay");
const SP_1 = spaceVar("1");                     // 8px
const SP_125 = spaceVar("1.25");               // 10px
const SP_15 = spaceVar("1.5");                 // 12px
const SP_2 = spaceVar("2");                     // 16px
const SP_25 = spaceVar("2.5");                 // 20px
const SP_5 = spaceVar("5");                     // 40px
const BW_MD = borderWidthVar("md");             // 2px

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

  /* ── Base row ────────────────────────────────────────────────────────────── */

  .row {
    display: flex;
    align-items: center;
    gap: ${SP_1};
    width: 100%;
    padding: ${SP_125} ${SP_1} ${SP_125} ${SP_2};
    border: none;
    margin: 0;
    background-color: var(--ui-spmi-bg, ${SURFACE_SECONDARY});
    font-family: "Geist", sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--ui-spmi-text, ${TEXT_PRIMARY});
    cursor: pointer;
    position: relative;
    text-align: left;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .row:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ── Hover ───────────────────────────────────────────────────────────────── */

  :host(:not([disabled]):not([selected]):not([child-parent-selected])) .row:hover {
    background-color: var(--ui-spmi-hover-bg, ${HOVER_MINIMAL});
  }

  :host(:not([disabled]):not([selected]):not([child-parent-selected])) .row:active {
    background-color: var(--ui-spmi-active-bg, ${HOVER_MODERATE});
  }

  /* ── Selected ────────────────────────────────────────────────────────────── */

  :host([selected]) .row {
    background-color: var(--ui-spmi-selected-bg, ${SELECTED_OVERLAY});
  }

  :host([selected]) .row::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: ${BW_MD};
    background-color: var(--ui-spmi-indicator, ${BORDER_FOCUS});
  }

  /* ── Child/Parent Selected ───────────────────────────────────────────────── */

  :host([child-parent-selected]) .row {
    background-color: var(--ui-spmi-child-selected-bg, ${HOVER_MINIMAL});
  }

  :host([child-parent-selected]) .row::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: ${BW_MD};
    background-color: var(--ui-spmi-indicator, ${BORDER_FOCUS});
  }

  :host([child-parent-selected][level="primary"]) .row {
    color: var(--ui-spmi-active-text, ${ICON_ACTION});
  }

  :host([child-parent-selected][level="primary"]) .leading-icon {
    color: var(--ui-spmi-active-icon, ${ICON_ACTION});
  }

  /* ── Level: secondary ────────────────────────────────────────────────────── */

  :host([level="secondary"]) .row {
    padding-left: 46px;
    font-weight: 400;
  }

  /* ── Level: tertiary ─────────────────────────────────────────────────────── */

  :host([level="tertiary"]) .row {
    padding-left: 62px;
    font-weight: 400;
  }

  /* ── Disabled ────────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .row {
    color: var(--ui-spmi-text, ${DISABLED_TEXT});
    cursor: default;
  }

  :host([disabled]) .leading-icon {
    color: ${DISABLED_TEXT};
  }

  /* ── Leading icon ────────────────────────────────────────────────────────── */

  .leading-icon {
    display: none;
    align-items: center;
    justify-content: center;
    width: ${SP_25};
    height: ${SP_25};
    line-height: 0;
    color: var(--ui-spmi-icon, ${ICON_PRIMARY_TOKEN});
    flex-shrink: 0;
  }

  ::slotted(svg) {
    width: ${SP_25};
    height: ${SP_25};
  }

  :host([leading-icon]) .leading-icon {
    display: inline-flex;
  }

  /* ── Label ───────────────────────────────────────────────────────────────── */

  .label {
    flex: 1 0 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Badge slot ──────────────────────────────────────────────────────────── */

  .badge {
    display: none;
    align-items: center;
    flex-shrink: 0;
  }

  :host([badge]) .badge {
    display: inline-flex;
  }

  /* ── Expand chevron ──────────────────────────────────────────────────────── */

  .expand-icon {
    display: none;
    align-items: center;
    justify-content: center;
    width: ${SP_25};
    height: ${SP_25};
    line-height: 0;
    color: var(--ui-spmi-expand-icon, ${ICON_PRIMARY_TOKEN});
    flex-shrink: 0;
    transition: transform 0.15s ease;
    --ui-icon-size: ${SP_25};
  }

  :host([expandable]) .expand-icon {
    display: inline-flex;
  }

  /* ── Icon-only mode ──────────────────────────────────────────────────────── */

  :host([type="icon-only"]) .row {
    width: ${SP_5};
    height: ${SP_5};
    padding: ${SP_125};
    justify-content: center;
  }

  :host([type="icon-only"]) .label,
  :host([type="icon-only"]) .badge,
  :host([type="icon-only"]) .expand-icon {
    display: none !important;
  }

  :host([type="icon-only"]) .leading-icon {
    display: inline-flex;
  }

  /* ── Children container ──────────────────────────────────────────────────── */

  .children {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.2s ease;
  }

  :host([expanded]) .children {
    grid-template-rows: 1fr;
  }

  .children-inner {
    overflow: hidden;
    min-height: 0;
  }

  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .expand-icon,
    .children {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSidePanelMenuItem extends HTMLElement {
  static readonly observedAttributes = [
    "level",
    "type",
    "selected",
    "child-parent-selected",
    "disabled",
    "leading-icon",
    "badge",
    "expandable",
    "expanded",
  ];

  private _row: HTMLDivElement;
  private _expandIcon: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // Row (the clickable item)
    const row = document.createElement("div");
    row.className = "row";
    row.setAttribute("role", "treeitem");
    row.setAttribute("tabindex", "0");

    // Leading icon slot
    const leadingIcon = document.createElement("span");
    leadingIcon.className = "leading-icon";
    const iconSlot = document.createElement("slot");
    iconSlot.name = "icon";
    leadingIcon.appendChild(iconSlot);
    row.appendChild(leadingIcon);

    // Label
    const label = document.createElement("span");
    label.className = "label";
    const labelSlot = document.createElement("slot");
    label.appendChild(labelSlot);
    row.appendChild(label);

    // Badge slot
    const badge = document.createElement("span");
    badge.className = "badge";
    const badgeSlot = document.createElement("slot");
    badgeSlot.name = "badge";
    badge.appendChild(badgeSlot);
    row.appendChild(badge);

    // Expand icon
    const expandIcon = document.createElement("span");
    expandIcon.className = "expand-icon";
    expandIcon.setAttribute("aria-hidden", "true");
    row.appendChild(expandIcon);

    shadow.appendChild(row);

    // Children container (for nested items)
    const children = document.createElement("div");
    children.className = "children";
    children.setAttribute("role", "group");
    const childrenInner = document.createElement("div");
    childrenInner.className = "children-inner";
    const childrenSlot = document.createElement("slot");
    childrenSlot.name = "children";
    childrenInner.appendChild(childrenSlot);
    children.appendChild(childrenInner);
    shadow.appendChild(children);

    this._row = row;
    this._expandIcon = expandIcon;

    // Click handler
    row.addEventListener("click", () => this._handleClick());
    row.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._handleClick();
      }
    });
  }

  connectedCallback(): void {
    this._syncExpandIcon();
    this._syncAria();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "expanded" || name === "expandable") {
      this._syncExpandIcon();
      this._syncAria();
    }
    if (name === "selected" || name === "disabled") {
      this._syncAria();
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get level(): SidePanelMenuItemLevel {
    return (this.getAttribute("level") as SidePanelMenuItemLevel) ?? "primary";
  }

  set level(value: SidePanelMenuItemLevel) {
    this.setAttribute("level", value);
  }

  get type(): SidePanelMenuItemType {
    return (this.getAttribute("type") as SidePanelMenuItemType) ?? "basic";
  }

  set type(value: SidePanelMenuItemType) {
    this.setAttribute("type", value);
  }

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(value: boolean) {
    if (value) this.setAttribute("selected", "");
    else this.removeAttribute("selected");
  }

  get childParentSelected(): boolean {
    return this.hasAttribute("child-parent-selected");
  }

  set childParentSelected(value: boolean) {
    if (value) this.setAttribute("child-parent-selected", "");
    else this.removeAttribute("child-parent-selected");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    if (value) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  get leadingIcon(): boolean {
    return this.hasAttribute("leading-icon");
  }

  set leadingIcon(value: boolean) {
    if (value) this.setAttribute("leading-icon", "");
    else this.removeAttribute("leading-icon");
  }

  get expandable(): boolean {
    return this.hasAttribute("expandable");
  }

  set expandable(value: boolean) {
    if (value) this.setAttribute("expandable", "");
    else this.removeAttribute("expandable");
  }

  get expanded(): boolean {
    return this.hasAttribute("expanded");
  }

  set expanded(value: boolean) {
    if (value) this.setAttribute("expanded", "");
    else this.removeAttribute("expanded");
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _handleClick(): void {
    if (this.disabled) return;

    if (this.expandable) {
      this.expanded = !this.expanded;
      this.dispatchEvent(
        new CustomEvent("toggle", {
          detail: { expanded: this.expanded },
          bubbles: true,
          composed: true,
        }),
      );
    }

    this.dispatchEvent(
      new CustomEvent("select", {
        detail: { value: this.getAttribute("value") ?? "" },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _syncExpandIcon(): void {
    if (this.expandable) {
      this._expandIcon.innerHTML = "";
      const icon = document.createElement("ui-icon") as HTMLElement;
      icon.setAttribute("name", this.expanded ? "expand_less" : "expand_more");
      this._expandIcon.appendChild(icon);
    } else {
      this._expandIcon.innerHTML = "";
    }
  }

  private _syncAria(): void {
    this._row.setAttribute(
      "aria-selected",
      String(this.selected),
    );
    this._row.setAttribute(
      "aria-disabled",
      String(this.disabled),
    );
    if (this.expandable) {
      this._row.setAttribute("aria-expanded", String(this.expanded));
    } else {
      this._row.removeAttribute("aria-expanded");
    }
  }
}

customElements.define("ui-side-panel-menu-item", UiSidePanelMenuItem);
