import { colorVar } from "@maneki/foundation";
import { ICON_USER } from "../assets/icons.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type AvatarSize = "xs" | "s" | "m" | "l" | "xl";
export type AvatarType = "text" | "icon" | "image";
export type AvatarEmphasis = "bold" | "subtle";
export type AvatarShape = "circle" | "square";
export type AvatarStatus =
  | "none"
  | "error"
  | "warning"
  | "success"
  | "information";
export type AvatarColor =
  | "none"
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "lime"
  | "teal"
  | "turquoise"
  | "aqua"
  | "ultramarine"
  | "purple"
  | "pink";

// ─── Token constants ─────────────────────────────────────────────────────────

const GRAY_60 = colorVar("gray", 60);
const GRAY_20 = colorVar("gray", 20);
const RED_60 = colorVar("red", 60);
const ORANGE_60 = colorVar("orange", 60);
const YELLOW_30 = colorVar("yellow", 30);
const GREEN_60 = colorVar("green", 60);
const BLUE_60 = colorVar("blue", 60);
const LIME_60 = colorVar("lime", 60);
const TEAL_60 = colorVar("teal", 60);
const TURQUOISE_60 = colorVar("turquoise", 60);
const AQUA_60 = colorVar("aqua", 60);
const ULTRAMARINE_60 = colorVar("ultramarine", 60);
const PURPLE_60 = colorVar("purple", 60);
const PINK_60 = colorVar("pink", 60);

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
  }

  /* ── Base ─────────────────────────────────────────────────────────────────── */

  .base {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    color: #ffffff;
  }

  /* ── Type visibility ─────────────────────────────────────────────────────── */

  .text,
  .icon,
  .image {
    display: none;
    align-items: center;
    justify-content: center;
  }

  :host .text,
  :host([type="text"]) .text {
    display: inline-flex;
  }
  :host .icon,
  :host([type="text"]) .icon,
  :host([type="text"]) .image {
    display: none;
  }

  :host([type="icon"]) .icon {
    display: inline-flex;
  }
  :host([type="icon"]) .text,
  :host([type="icon"]) .image {
    display: none;
  }

  :host([type="image"]) .image {
    display: inline-flex;
  }
  :host([type="image"]) .text,
  :host([type="image"]) .icon {
    display: none;
  }

  .text {
    line-height: 1;
    white-space: nowrap;
    user-select: none;
  }

  .icon {
    line-height: 0;
  }

  .icon svg,
  .icon ::slotted(*) {
    width: 100%;
    height: 100%;
  }

  .image {
    width: 100%;
    height: 100%;
  }

  .image ::slotted(*) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* ── Shape ────────────────────────────────────────────────────────────────── */

  :host .base,
  :host([shape="circle"]) .base {
    border-radius: 999px;
  }

  :host([shape="square"]) .base {
    border-radius: 2px;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="m"]) .base {
    width: var(--ui-avatar-size, 32px);
    height: var(--ui-avatar-size, 32px);
  }

  :host .text,
  :host([size="m"]) .text {
    font-size: 16px;
    line-height: 24px;
  }

  :host .icon,
  :host([size="m"]) .icon {
    width: 24px;
    height: 24px;
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .base {
    width: var(--ui-avatar-size, 16px);
    height: var(--ui-avatar-size, 16px);
  }

  :host([size="xs"]) .text {
    font-size: 8px;
    line-height: 16px;
  }

  :host([size="xs"]) .icon {
    width: 12px;
    height: 12px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .base {
    width: var(--ui-avatar-size, 24px);
    height: var(--ui-avatar-size, 24px);
  }

  :host([size="s"]) .text {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .icon {
    width: 18px;
    height: 18px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    width: var(--ui-avatar-size, 40px);
    height: var(--ui-avatar-size, 40px);
  }

  :host([size="l"]) .text {
    font-size: 20px;
    line-height: 28px;
  }

  :host([size="l"]) .icon {
    width: 30px;
    height: 30px;
  }

  /* ── Size: xl ────────────────────────────────────────────────────────────── */

  :host([size="xl"]) .base {
    width: var(--ui-avatar-size, 48px);
    height: var(--ui-avatar-size, 48px);
  }

  :host([size="xl"]) .text {
    font-size: 24px;
    line-height: 32px;
  }

  :host([size="xl"]) .icon {
    width: 36px;
    height: 36px;
  }

  /* ── Emphasis: bold (default) + color: none (default) ────────────────────── */

  :host .base,
  :host([emphasis="bold"]) .base,
  :host([color="none"]) .base,
  :host([color="none"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${GRAY_60});
    color: var(--ui-avatar-text, #ffffff);
  }

  /* ── Bold color variants ─────────────────────────────────────────────────── */

  :host([color="gray"]) .base,
  :host([color="gray"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${GRAY_60});
  }

  :host([color="red"]) .base,
  :host([color="red"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${RED_60});
  }

  :host([color="orange"]) .base,
  :host([color="orange"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${ORANGE_60});
  }

  :host([color="yellow"]) .base,
  :host([color="yellow"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${YELLOW_30});
  }

  :host([color="green"]) .base,
  :host([color="green"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${GREEN_60});
  }

  :host([color="blue"]) .base,
  :host([color="blue"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${BLUE_60});
  }

  :host([color="lime"]) .base,
  :host([color="lime"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${LIME_60});
  }

  :host([color="teal"]) .base,
  :host([color="teal"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${TEAL_60});
  }

  :host([color="turquoise"]) .base,
  :host([color="turquoise"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${TURQUOISE_60});
  }

  :host([color="aqua"]) .base,
  :host([color="aqua"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${AQUA_60});
  }

  :host([color="ultramarine"]) .base,
  :host([color="ultramarine"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${ULTRAMARINE_60});
  }

  :host([color="purple"]) .base,
  :host([color="purple"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${PURPLE_60});
  }

  :host([color="pink"]) .base,
  :host([color="pink"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${PINK_60});
  }

  /* ── Status overrides (bold) ─────────────────────────────────────────────── */

  :host([status="error"]) .base,
  :host([status="error"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${RED_60});
    color: var(--ui-avatar-text, #ffffff);
  }

  :host([status="warning"]) .base,
  :host([status="warning"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${YELLOW_30});
    color: var(--ui-avatar-text, #ffffff);
  }

  :host([status="success"]) .base,
  :host([status="success"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${GREEN_60});
    color: var(--ui-avatar-text, #ffffff);
  }

  :host([status="information"]) .base,
  :host([status="information"][emphasis="bold"]) .base {
    background-color: var(--ui-avatar-bg, ${BLUE_60});
    color: var(--ui-avatar-text, #ffffff);
  }

  /* ── Emphasis: subtle ────────────────────────────────────────────────────── */

  :host([emphasis="subtle"]) .base {
    background-color: var(--ui-avatar-bg, ${GRAY_20});
    color: var(--ui-avatar-text, ${GRAY_60});
  }

  /* ── Status overrides (subtle) ───────────────────────────────────────────── */

  :host([status="error"][emphasis="subtle"]) .base {
    background-color: var(--ui-avatar-bg, ${GRAY_20});
    color: var(--ui-avatar-text, ${GRAY_60});
  }

  :host([status="warning"][emphasis="subtle"]) .base {
    background-color: var(--ui-avatar-bg, ${GRAY_20});
    color: var(--ui-avatar-text, ${GRAY_60});
  }

  :host([status="success"][emphasis="subtle"]) .base {
    background-color: var(--ui-avatar-bg, ${GRAY_20});
    color: var(--ui-avatar-text, ${GRAY_60});
  }

  :host([status="information"][emphasis="subtle"]) .base {
    background-color: var(--ui-avatar-bg, ${GRAY_20});
    color: var(--ui-avatar-text, ${GRAY_60});
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiAvatar extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "type",
    "emphasis",
    "shape",
    "status",
    "color",
  ];

  private _iconSlot: HTMLSlotElement;
  private _defaultIcon: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // .base
    const base = document.createElement("div");
    base.className = "base";

    // .text (default slot)
    const text = document.createElement("span");
    text.className = "text";
    const textSlot = document.createElement("slot");
    text.appendChild(textSlot);
    base.appendChild(text);

    // .icon (named slot + default SVG)
    const icon = document.createElement("span");
    icon.className = "icon";

    const defaultIcon = document.createElement("span");
    defaultIcon.className = "default-icon";
    defaultIcon.innerHTML = ICON_USER;
    icon.appendChild(defaultIcon);

    const iconSlot = document.createElement("slot");
    iconSlot.name = "icon";
    icon.appendChild(iconSlot);
    base.appendChild(icon);

    // .image (named slot)
    const image = document.createElement("span");
    image.className = "image";
    const imageSlot = document.createElement("slot");
    imageSlot.name = "image";
    image.appendChild(imageSlot);
    base.appendChild(image);

    shadow.appendChild(base);

    this._iconSlot = iconSlot;
    this._defaultIcon = defaultIcon;

    // Listen for slotchange to toggle default icon visibility
    iconSlot.addEventListener("slotchange", () => this._syncIconSlot());
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "img");
    }
    this._syncIconSlot();
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    // All styling is handled via :host([attr]) CSS selectors — no JS sync needed
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): AvatarSize {
    return (this.getAttribute("size") as AvatarSize) ?? "m";
  }

  set size(value: AvatarSize) {
    this.setAttribute("size", value);
  }

  get type(): AvatarType {
    return (this.getAttribute("type") as AvatarType) ?? "text";
  }

  set type(value: AvatarType) {
    this.setAttribute("type", value);
  }

  get emphasis(): AvatarEmphasis {
    return (this.getAttribute("emphasis") as AvatarEmphasis) ?? "bold";
  }

  set emphasis(value: AvatarEmphasis) {
    this.setAttribute("emphasis", value);
  }

  get shape(): AvatarShape {
    return (this.getAttribute("shape") as AvatarShape) ?? "circle";
  }

  set shape(value: AvatarShape) {
    this.setAttribute("shape", value);
  }

  get status(): AvatarStatus {
    return (this.getAttribute("status") as AvatarStatus) ?? "none";
  }

  set status(value: AvatarStatus) {
    this.setAttribute("status", value);
  }

  get color(): AvatarColor {
    return (this.getAttribute("color") as AvatarColor) ?? "none";
  }

  set color(value: AvatarColor) {
    this.setAttribute("color", value);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncIconSlot(): void {
    const nodes = this._iconSlot.assignedNodes({ flatten: true });
    if (nodes.length > 0) {
      this._defaultIcon.style.display = "none";
    } else {
      this._defaultIcon.style.display = "";
    }
  }
}

customElements.define("ui-avatar", UiAvatar);
