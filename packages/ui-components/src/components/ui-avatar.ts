
import {
  AQUA_60,
  BLUE_60,
  FONT_PRIMARY,
  GRAY_20,
  GRAY_60,
  GRAY_80,
  GRAY_90,
  GREEN_60,
  LIME_60,
  ORANGE_60,
  PINK_60,
  PURPLE_60,
  RADIUS_PILL,
  RADIUS_SM,
  RED_60,
  SP_1_5,
  SP_2,
  SP_3,
  SP_4,
  SP_5,
  SP_6,
  TEAL_60,
  TURQUOISE_60,
  TYPE_BODY_01,
  TYPE_BODY_03,
  TYPE_HEADING_04,
  TYPE_UI_01,
  ULTRAMARINE_60,
  YELLOW_30,
} from "@maneki/foundation";
import "./ui-icon.js";

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
    font-family: ${FONT_PRIMARY};
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
    border-radius: ${RADIUS_PILL};
  }

  :host([shape="square"]) .base {
    border-radius: ${RADIUS_SM};
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="m"]) .base {
    width: var(--ui-avatar-size, ${SP_4});
    height: var(--ui-avatar-size, ${SP_4});
  }

  :host .text,
  :host([size="m"]) .text {
    ${TYPE_BODY_01}
  }

  :host .icon,
  :host([size="m"]) .icon {
    width: ${SP_3};
    height: ${SP_3};
    --ui-icon-size: 24px;
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .base {
    width: var(--ui-avatar-size, ${SP_2});
    height: var(--ui-avatar-size, ${SP_2});
  }

  :host([size="xs"]) .text {
    font-size: 8px;
    line-height: 16px;
  }

  :host([size="xs"]) .icon {
    width: ${SP_1_5};
    height: ${SP_1_5};
    --ui-icon-size: 12px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .base {
    width: var(--ui-avatar-size, ${SP_3});
    height: var(--ui-avatar-size, ${SP_3});
  }

  :host([size="s"]) .text {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .icon {
    width: 18px;
    height: 18px;
    --ui-icon-size: 18px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    width: var(--ui-avatar-size, ${SP_5});
    height: var(--ui-avatar-size, ${SP_5});
  }

  :host([size="l"]) .text {
    ${TYPE_HEADING_04}
  }

  :host([size="l"]) .icon {
    width: 30px;
    height: 30px;
    --ui-icon-size: 30px;
  }

  /* ── Size: xl ────────────────────────────────────────────────────────────── */

  :host([size="xl"]) .base {
    width: var(--ui-avatar-size, ${SP_6});
    height: var(--ui-avatar-size, ${SP_6});
  }

  :host([size="xl"]) .text {
    ${TYPE_UI_01}
  }

  :host([size="xl"]) .icon {
    width: 36px;
    height: 36px;
    --ui-icon-size: 36px;
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
    color: var(--ui-avatar-text, ${GRAY_90});
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
    color: var(--ui-avatar-text, ${GRAY_90});
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
    color: var(--ui-avatar-text, ${GRAY_80});
  }

  /* ── Status overrides (subtle) ───────────────────────────────────────────── */

  :host([status="error"][emphasis="subtle"]) .base,
  :host([status="warning"][emphasis="subtle"]) .base,
  :host([status="success"][emphasis="subtle"]) .base,
  :host([status="information"][emphasis="subtle"]) .base {
    background-color: var(--ui-avatar-bg, ${GRAY_20});
    color: var(--ui-avatar-text, ${GRAY_80});
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiAvatar extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "type",
    "emphasis",
    "shape",
    "status",
    "color",
    "label",
  ];

  private _iconSlot: HTMLSlotElement;
  private _defaultIcon: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

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

    const defaultIcon = document.createElement("ui-icon") as HTMLElement;
    defaultIcon.className = "default-icon";
    defaultIcon.setAttribute("name", "person");

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
    if (!this.hasAttribute("aria-label")) {
      const text = this.textContent?.trim();
      this.setAttribute("aria-label", text || "Avatar");
    }
    this._syncIconSlot();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    if (name === "label") {
      this.setAttribute("aria-label", newValue || "Avatar");
    }
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
