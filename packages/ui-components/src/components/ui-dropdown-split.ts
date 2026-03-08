import { colorVar, semanticVar, spaceVar, elevationVar } from "@maneki/foundation";
import { ICON_CHEVRON } from "../assets/icons.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type DropdownSplitSize = "s" | "m" | "l" | "xl";
export type DropdownSplitAction = "primary" | "secondary" | "destructive" | "info" | "contrast";
export type DropdownSplitEmphasis = "bold" | "subtle" | "minimal";
export type DropdownSplitShape = "basic" | "rounded";
export type DropdownSplitIcon = "text-only" | "leading-icon" | "trailing-icon" | "icon-only";

// ─── Token constants ─────────────────────────────────────────────────────────

const BLUE_60 = colorVar("blue", 60);
const GRAY_20 = colorVar("gray", 20);
const GRAY_90 = colorVar("gray", 90);
const RED_60 = colorVar("red", 60);
const BLUE_100 = colorVar("blue", 100);
const SURFACE_PRIMARY = semanticVar("surface", "primary");
const ELEVATION_05 = elevationVar("05");
const SP_05 = spaceVar("0.5");
const SP_075 = spaceVar("0.75");
const SP_1 = spaceVar("1");
const SP_15 = spaceVar("1.5");
const SP_2 = spaceVar("2");
const SP_25 = spaceVar("2.5");
const SP_3 = spaceVar("3");
const SP_4 = spaceVar("4");

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

  /* ── Base container ─────────────────────────────────────────────────────── */

  .base {
    display: inline-flex;
    flex-direction: row;
    align-items: stretch;
    border: 1px solid transparent;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Shape ─────────────────────────────────────────────────────────────── */

  :host .base {
    border-radius: var(--ui-dds-radius, 2px);
  }

  :host([shape="rounded"]) .base {
    border-radius: var(--ui-dds-radius, 999px);
  }

  /* ── Shared button reset ────────────────────────────────────────────────── */

  .left,
  .right {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    background-color: transparent;
    background-image: none;
    color: inherit;
    font-family: var(--ui-dds-font-family, "Inter", sans-serif);
    font-weight: var(--ui-dds-font-weight, 500);
    transition:
      background-image 0.15s ease,
      background-color 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }

  .left {
    gap: ${SP_05};
  }

  /* ── Border-radius on outer corners only ────────────────────────────────── */

  :host .left {
    border-radius: 2px 0 0 2px;
  }

  :host .right {
    border-radius: 0 2px 2px 0;
  }

  :host([shape="rounded"]) .left {
    border-radius: 999px 0 0 999px;
  }

  :host([shape="rounded"]) .right {
    border-radius: 0 999px 999px 0;
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .left,
  :host([size="m"]) .left {
    font-size: 14px;
    line-height: 20px;
    padding: ${SP_075} ${SP_15} ${SP_075} ${SP_2};
  }

  :host([shape="rounded"]) .left,
  :host([shape="rounded"][size="m"]) .left {
    padding: ${SP_075} ${SP_15} ${SP_075} ${SP_25};
  }

  :host .right,
  :host([size="m"]) .right {
    padding: ${SP_075};
  }

  :host([shape="rounded"]) .right,
  :host([shape="rounded"][size="m"]) .right {
    padding: ${SP_075} ${SP_15} ${SP_075} ${SP_075};
  }

  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .left {
    font-size: 12px;
    line-height: 16px;
    padding: ${SP_05} ${SP_1};
  }

  :host([size="s"][shape="rounded"]) .left {
    padding: ${SP_05} ${SP_1} ${SP_05} ${SP_2};
  }

  :host([size="s"]) .right {
    padding: ${SP_05};
  }

  :host([size="s"][shape="rounded"]) .right {
    padding: ${SP_05} ${SP_1} ${SP_05} ${SP_05};
  }

  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .left {
    font-size: 16px;
    line-height: 24px;
    padding: ${SP_1} ${SP_2} ${SP_1} ${SP_25};
  }

  :host([size="l"][shape="rounded"]) .left {
    padding: ${SP_1} ${SP_2} ${SP_1} ${SP_3};
  }

  :host([size="l"]) .right {
    padding: ${SP_1};
  }

  :host([size="l"][shape="rounded"]) .right {
    padding: ${SP_1} ${SP_15} ${SP_1} ${SP_1};
  }

  /* ── Size: xl ───────────────────────────────────────────────────────────── */

  :host([size="xl"]) .left {
    font-size: 16px;
    line-height: 24px;
    padding: ${SP_15} ${SP_4};
  }

  :host([size="xl"][shape="rounded"]) .left {
    padding: ${SP_15} ${SP_4} ${SP_15} ${SP_3};
  }

  :host([size="xl"]) .right {
    padding: ${SP_15};
  }

  :host([size="xl"][shape="rounded"]) .right {
    padding: ${SP_15};
  }
  /* ── Icon-only padding (square) ────────────────────────────────────────── */
  :host([icon="icon-only"]) .left,
  :host([icon="icon-only"][size="m"]) .left {
    padding: ${SP_075};
  }
  :host([icon="icon-only"][size="s"]) .left {
    padding: ${SP_05};
  }
  :host([icon="icon-only"][size="l"]) .left {
    padding: ${SP_15};
  }
  :host([icon="icon-only"][size="xl"]) .left {
    padding: ${SP_15};
  }
  /* ── Leading-icon padding adjustments ───────────────────────────────────── */
  :host([icon="leading-icon"]) .left,
  :host([icon="leading-icon"][size="m"]) .left {
    padding: ${SP_075} ${SP_15} ${SP_075} ${SP_1};
  }
  :host([icon="leading-icon"][size="s"]) .left {
    padding: ${SP_05} ${SP_1} ${SP_05} ${SP_05};
  }
  :host([icon="leading-icon"][size="l"]) .left {
    padding: ${SP_15} ${SP_2} ${SP_15} ${SP_1};
  }
  :host([icon="leading-icon"][size="xl"]) .left {
    padding: ${SP_15} ${SP_4} ${SP_15} ${SP_2};
  }
  /* ── Trailing-icon padding adjustments ──────────────────────────────────── */
  :host([icon="trailing-icon"]) .left,
  :host([icon="trailing-icon"][size="m"]) .left {
    padding: ${SP_075} ${SP_1} ${SP_075} ${SP_2};
  }
  :host([icon="trailing-icon"][size="s"]) .left {
    padding: ${SP_05} ${SP_05} ${SP_05} ${SP_1};
  }
  :host([icon="trailing-icon"][size="l"]) .left {
    padding: ${SP_15} ${SP_1} ${SP_15} ${SP_25};
  }
  :host([icon="trailing-icon"][size="xl"]) .left {
    padding: ${SP_15} ${SP_2} ${SP_15} ${SP_4};
  }
  /* ── Icon slot visibility ───────────────────────────────────────────────── */
  .slot-icon-start,
  .slot-icon-end {
    display: none;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }
  :host([icon="leading-icon"]) .slot-icon-start,
  :host([icon="icon-only"]) .slot-icon-start {
    display: inline-flex;
  }
  :host([icon="trailing-icon"]) .slot-icon-end {
    display: inline-flex;
  }
  :host([icon="icon-only"]) .slot-text {
    display: none;
  }
  /* ── Action × Emphasis: PRIMARY ──────────────────────────────────────── */
  :host .base,
  :host([action="primary"]) .base,
  :host([action="primary"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, ${BLUE_60});
    color: var(--ui-dds-color, #ffffff);
    border-color: var(--ui-dds-border-color, ${BLUE_60});
  }
  :host([emphasis="subtle"]) .base,
  :host([action="primary"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${BLUE_60});
    border-color: var(--ui-dds-border-color, ${BLUE_60});
  }
  :host([emphasis="minimal"]) .base,
  :host([action="primary"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${BLUE_60});
    border-color: transparent;
  }
  /* ── Action × Emphasis: SECONDARY ────────────────────────────────────── */
  :host([action="secondary"]) .base,
  :host([action="secondary"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, ${GRAY_20});
    color: var(--ui-dds-color, ${GRAY_90});
    border-color: var(--ui-dds-border-color, ${GRAY_20});
  }
  :host([action="secondary"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${GRAY_90});
    border-color: var(--ui-dds-border-color, ${GRAY_90});
  }
  :host([action="secondary"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${GRAY_90});
    border-color: transparent;
  }
  /* ── Action × Emphasis: DESTRUCTIVE ───────────────────────────────────── */
  :host([action="destructive"]) .base,
  :host([action="destructive"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, ${RED_60});
    color: var(--ui-dds-color, #ffffff);
    border-color: var(--ui-dds-border-color, ${RED_60});
  }
  :host([action="destructive"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${RED_60});
    border-color: var(--ui-dds-border-color, ${RED_60});
  }
  :host([action="destructive"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${RED_60});
    border-color: transparent;
  }
  /* ── Action × Emphasis: INFO ─────────────────────────────────────────── */
  :host([action="info"]) .base,
  :host([action="info"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, ${BLUE_100});
    color: var(--ui-dds-color, #ffffff);
    border-color: var(--ui-dds-border-color, ${BLUE_100});
  }
  :host([action="info"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${BLUE_100});
    border-color: var(--ui-dds-border-color, ${BLUE_100});
  }
  :host([action="info"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${BLUE_100});
    border-color: transparent;
  }
  /* ── Action × Emphasis: CONTRAST ──────────────────────────────────────── */
  :host([action="contrast"]) .base,
  :host([action="contrast"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, #ffffff);
    color: var(--ui-dds-color, ${GRAY_90});
    border-color: var(--ui-dds-border-color, #ffffff);
  }
  :host([action="contrast"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, #ffffff);
    border-color: var(--ui-dds-border-color, #ffffff);
  }
  :host([action="contrast"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, #ffffff);
    border-color: transparent;
  }
  /* ── Hover state (independent per button) ─────────────────────────────── */
  .left:hover,
  .right:hover {
    background-image: linear-gradient(rgba(14, 23, 31, 0.1), rgba(14, 23, 31, 0.1));
  }
  :host([emphasis="subtle"]) .left:hover,
  :host([emphasis="subtle"]) .right:hover,
  :host([emphasis="minimal"]) .left:hover,
  :host([emphasis="minimal"]) .right:hover {
    background-image: none;
    background-color: rgba(14, 23, 31, 0.06);
  }
  /* ── Active state ────────────────────────────────────────────────────── */
  .left:active,
  .right:active {
    background-image: linear-gradient(rgba(14, 23, 31, 0.2), rgba(14, 23, 31, 0.2));
  }
  :host([emphasis="subtle"]) .left:active,
  :host([emphasis="subtle"]) .right:active,
  :host([emphasis="minimal"]) .left:active,
  :host([emphasis="minimal"]) .right:active {
    background-image: none;
    background-color: rgba(14, 23, 31, 0.12);
  }
  /* ── Focus-visible (double ring) ─────────────────────────────────────── */
  .left:focus-visible,
  .right:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 2px ${BLUE_60};
  }
  :host([action="secondary"]) .left:focus-visible,
  :host([action="secondary"]) .right:focus-visible {
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 2px ${GRAY_90};
  }
  :host([action="destructive"]) .left:focus-visible,
  :host([action="destructive"]) .right:focus-visible {
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 2px ${RED_60};
  }
  :host([action="info"]) .left:focus-visible,
  :host([action="info"]) .right:focus-visible {
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 2px ${BLUE_100};
  }
  :host([action="contrast"]) .left:focus-visible,
  :host([action="contrast"]) .right:focus-visible {
    box-shadow: 0 0 0 1px ${GRAY_90}, 0 0 0 2px #ffffff;
  }
  /* ── Disabled ────────────────────────────────────────────────────────── */
  :host([disabled]) .base {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
  :host([disabled]) .left,
  :host([disabled]) .right {
    cursor: not-allowed;
    pointer-events: none;
  }
  /* ── Divider ─────────────────────────────────────────────────────────── */
  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1px;
    flex-shrink: 0;
  }
  .divider-inner {
    width: 1px;
    height: 100%;
    background-color: var(--ui-dds-divider-color, rgba(255, 255, 255, 0.3));
  }
  /* Divider height per size */
  :host .divider,
  :host([size="m"]) .divider {
    height: 32px;
  }
  :host([size="s"]) .divider {
    height: 24px;
  }
  :host([size="l"]) .divider {
    height: 40px;
  }
  :host([size="xl"]) .divider {
    height: 48px;
  }
  /* Divider color overrides for secondary/contrast bold */
  :host([action="secondary"]) .divider-inner,
  :host([action="secondary"][emphasis="bold"]) .divider-inner {
    background-color: var(--ui-dds-divider-color, rgba(0, 0, 0, 0.15));
  }
  :host([action="contrast"]) .divider-inner,
  :host([action="contrast"][emphasis="bold"]) .divider-inner {
    background-color: var(--ui-dds-divider-color, rgba(0, 0, 0, 0.15));
  }
  /* Divider color for subtle/minimal — action color at 30% */
  :host([emphasis="subtle"]) .divider-inner,
  :host([emphasis="minimal"]) .divider-inner {
    background-color: var(--ui-dds-divider-color, rgba(14, 23, 31, 0.15));
  }
  :host([emphasis="minimal"]) .divider {
    display: none;
  }
  :host([action="contrast"]) .divider {
    display: none;
  }
  /* ── Chevron ─────────────────────────────────────────────────────────── */
  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    transition: transform 0.15s ease;
  }
  :host([open]) .chevron {
    transform: rotate(180deg);
  }
  /* Chevron size per component size */
  :host .chevron,
  :host([size="m"]) .chevron {
    width: 20px;
    height: 20px;
  }
  :host([size="s"]) .chevron {
    width: 16px;
    height: 16px;
  }
  :host([size="l"]) .chevron,
  :host([size="xl"]) .chevron {
    width: 24px;
    height: 24px;
  }
  .chevron svg {
    width: 100%;
    height: 100%;
  }
  /* ── Menu panel ─────────────────────────────────────────────────────── */
  .menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 240px;
    padding: ${SP_05} 0;
    background-color: var(--ui-dds-menu-bg, ${SURFACE_PRIMARY});
    box-shadow: var(--ui-dds-menu-shadow, ${ELEVATION_05});
    border-radius: 2px;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  :host([open]) .menu {
    display: block;
  }
  .menu.visible {
    opacity: 1;
    transform: translateY(0);
  }
  /* ── Reduced motion ──────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .left,
    .right {
      transition-duration: 0.01ms !important;
    }
    .chevron {
      transition-duration: 0.01ms !important;
    }
    .menu {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Size mapping for menu items ─────────────────────────────────────────────

const DROPDOWN_SPLIT_SIZE_TO_ITEM_SIZE: Record<DropdownSplitSize, "s" | "m"> = {
  s: "s",
  m: "m",
  l: "m",
  xl: "m",
};

// ─── Component ───────────────────────────────────────────────────────────────

const PROPAGATED_CHILD_TAGS = ["UI-DROPDOWN-ITEM", "UI-DROPDOWN-HEADING"];

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

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

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

    if (isOpen) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._menu.classList.add("visible");
        });
      });
    } else {
      this._menu.classList.remove("visible");
    }
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
    if ((e as KeyboardEvent).key === "Escape" && this.open) {
      this.open = false;
    }
  };
}

customElements.define("ui-dropdown-split", UiDropdownSplit);