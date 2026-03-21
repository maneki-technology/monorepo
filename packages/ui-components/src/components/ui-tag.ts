
import {
  AQUA_20,
  AQUA_60,
  AQUA_70,
  BLUE_20,
  BLUE_60,
  BLUE_70,
  BORDER_FOCUS,
  BORDER_MODERATE,
  BUTTON_SECONDARY,
  BW_MD,
  BW_SM,
  DISABLED_MINIMAL,
  DISABLED_TEXT,
  FONT_PRIMARY,
  GREEN_20,
  GREEN_60,
  GREEN_70,
  LIME_20,
  LIME_60,
  LIME_70,
  ORANGE_20,
  ORANGE_60,
  ORANGE_70,
  PINK_20,
  PINK_60,
  PINK_70,
  PURPLE_20,
  PURPLE_60,
  PURPLE_70,
  RADIUS_PILL,
  RADIUS_SM,
  RED_20,
  RED_60,
  RED_70,
  SP_0_25,
  SP_0_5,
  SP_0_75,
  SP_1,
  SP_1_25,
  TAG_BOLD,
  TAG_SUBTLE,
  TAG_TEXT_BOLD,
  TAG_TEXT_MINIMAL,
  TAG_TEXT_SUBTLE,
  TEAL_20,
  TEAL_60,
  TEAL_70,
  TEXT_PRIMARY,
  TURQUOISE_20,
  TURQUOISE_60,
  TURQUOISE_70,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
  ULTRAMARINE_20,
  ULTRAMARINE_60,
  ULTRAMARINE_70,
  YELLOW_10,
  YELLOW_30,
} from "@maneki/foundation";
import "./ui-icon.js";
import type { UiIcon } from "./ui-icon.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type TagSize = "xs" | "s" | "m" | "l";
export type TagType = "basic" | "selectable" | "toggle";
export type TagEmphasis = "bold" | "subtle" | "minimal";
export type TagState = "enabled" | "selected" | "disabled";
export type TagColor =
  | "none"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "lime"
  | "teal"
  | "turquoise"
  | "aqua"
  | "ultramarine"
  | "pink"
  | "purple"
  | "orange";
// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
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
    font-family: ${FONT_PRIMARY};
    white-space: nowrap;
    border: ${BW_SM} solid transparent;
    cursor: default;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="m"]) .base {
    ${TYPE_BODY_02}
    padding: ${SP_0_25} ${SP_1};
    border-radius: ${RADIUS_PILL};
  }

  :host .base .content,
  :host([size="m"]) .base .content {
    padding: 0 ${SP_0_5};
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .base {
    ${TYPE_CAPTION_01}
    padding: 0 ${SP_0_75};
    border-radius: ${RADIUS_PILL};
  }

  :host([size="xs"]) .base .content {
    padding: 0 ${SP_0_25};
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .base {
    ${TYPE_BODY_03}
    padding: ${SP_0_25} ${SP_1};
    border-radius: ${RADIUS_PILL};
  }

  :host([size="s"]) .base .content {
    padding: 0 ${SP_0_5};
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    ${TYPE_BODY_02}
    padding: ${SP_0_75} ${SP_1_25};
    border-radius: ${RADIUS_PILL};
  }

  :host([size="l"]) .base .content {
    padding: 0 ${SP_0_75};
  }

  /* ── Emphasis: bold (default) — basic type only ─────────────────────────── */

  :host .base,
  :host([emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${TAG_BOLD});
    color: var(--ui-tag-color, ${TAG_TEXT_BOLD});
  }

  /* ── Emphasis: subtle — basic type only ─────────────────────────────────── */

  :host([emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${TAG_SUBTLE});
    color: var(--ui-tag-color, ${TAG_TEXT_SUBTLE});
  }

  /* ── Emphasis: minimal — basic type only ────────────────────────────────── */

  :host([emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    color: var(--ui-tag-color, ${TAG_TEXT_MINIMAL});
    border-color: var(--ui-tag-border, ${BORDER_MODERATE});
  }

  /* ── Bold color variants ─────────────────────────────────────────────────── */

  :host([color="red"]) .base,
  :host([color="red"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${RED_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="yellow"]) .base,
  :host([color="yellow"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${YELLOW_30});
    color: var(--ui-tag-color, ${TEXT_PRIMARY});
  }

  :host([color="green"]) .base,
  :host([color="green"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${GREEN_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="blue"]) .base,
  :host([color="blue"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${BLUE_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="lime"]) .base,
  :host([color="lime"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${LIME_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="teal"]) .base,
  :host([color="teal"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${TEAL_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="turquoise"]) .base,
  :host([color="turquoise"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${TURQUOISE_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="aqua"]) .base,
  :host([color="aqua"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${AQUA_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="ultramarine"]) .base,
  :host([color="ultramarine"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${ULTRAMARINE_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="pink"]) .base,
  :host([color="pink"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${PINK_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="purple"]) .base,
  :host([color="purple"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${PURPLE_60});
    color: var(--ui-tag-color, #ffffff);
  }

  :host([color="orange"]) .base,
  :host([color="orange"][emphasis="bold"]) .base {
    background-color: var(--ui-tag-bg, ${ORANGE_60});
    color: var(--ui-tag-color, #ffffff);
  }

  /* ── Subtle color variants ───────────────────────────────────────────────── */

  :host([color="red"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${RED_20});
    color: var(--ui-tag-color, ${RED_70});
  }

  :host([color="yellow"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${YELLOW_10});
    color: var(--ui-tag-color, ${TEXT_PRIMARY});
  }

  :host([color="green"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${GREEN_20});
    color: var(--ui-tag-color, ${GREEN_70});
  }

  :host([color="blue"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${BLUE_20});
    color: var(--ui-tag-color, ${BLUE_70});
  }

  :host([color="lime"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${LIME_20});
    color: var(--ui-tag-color, ${LIME_70});
  }

  :host([color="teal"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${TEAL_20});
    color: var(--ui-tag-color, ${TEAL_70});
  }

  :host([color="turquoise"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${TURQUOISE_20});
    color: var(--ui-tag-color, ${TURQUOISE_70});
  }

  :host([color="aqua"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${AQUA_20});
    color: var(--ui-tag-color, ${AQUA_70});
  }

  :host([color="ultramarine"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${ULTRAMARINE_20});
    color: var(--ui-tag-color, ${ULTRAMARINE_70});
  }

  :host([color="pink"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${PINK_20});
    color: var(--ui-tag-color, ${PINK_70});
  }

  :host([color="purple"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${PURPLE_20});
    color: var(--ui-tag-color, ${PURPLE_70});
  }

  :host([color="orange"][emphasis="subtle"]) .base {
    background-color: var(--ui-tag-bg, ${ORANGE_20});
    color: var(--ui-tag-color, ${ORANGE_70});
  }

  /* ── Minimal color variants ──────────────────────────────────────────────── */

  :host([color="red"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${RED_60});
    color: var(--ui-tag-color, ${RED_60});
  }

  :host([color="yellow"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${YELLOW_30});
    color: var(--ui-tag-color, ${TEXT_PRIMARY});
  }

  :host([color="green"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${GREEN_60});
    color: var(--ui-tag-color, ${GREEN_60});
  }

  :host([color="blue"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${BLUE_60});
    color: var(--ui-tag-color, ${BLUE_60});
  }

  :host([color="lime"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${LIME_60});
    color: var(--ui-tag-color, ${LIME_60});
  }

  :host([color="teal"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${TEAL_60});
    color: var(--ui-tag-color, ${TEAL_60});
  }

  :host([color="turquoise"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${TURQUOISE_60});
    color: var(--ui-tag-color, ${TURQUOISE_60});
  }

  :host([color="aqua"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${AQUA_60});
    color: var(--ui-tag-color, ${AQUA_60});
  }

  :host([color="ultramarine"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${ULTRAMARINE_60});
    color: var(--ui-tag-color, ${ULTRAMARINE_60});
  }

  :host([color="pink"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${PINK_60});
    color: var(--ui-tag-color, ${PINK_60});
  }

  :host([color="purple"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${PURPLE_60});
    color: var(--ui-tag-color, ${PURPLE_60});
  }

  :host([color="orange"][emphasis="minimal"]) .base {
    background-color: var(--ui-tag-bg, transparent);
    border: 1px solid var(--ui-tag-border, ${ORANGE_60});
    color: var(--ui-tag-color, ${ORANGE_60});
  }

  /* ── Type: selectable — enabled ─────────────────────────────────────────── */

  :host([type="selectable"]) .base {
    background-color: var(--ui-tag-bg, ${BUTTON_SECONDARY});
    color: var(--ui-tag-color, ${TAG_TEXT_MINIMAL});
    cursor: pointer;
  }

  /* ── Type: selectable — selected ────────────────────────────────────────── */

  :host([type="selectable"][state="selected"]) .base {
    background-color: var(--ui-tag-bg, ${TAG_BOLD});
    color: var(--ui-tag-color, #ffffff);
  }

  /* ── Type: selectable — disabled ────────────────────────────────────────── */

  :host([type="selectable"][state="disabled"]) .base {
    background-color: var(--ui-tag-bg, ${DISABLED_MINIMAL});
    color: var(--ui-tag-color, ${DISABLED_TEXT});
    cursor: not-allowed;
  }

  /* ── Type: toggle ───────────────────────────────────────────────────────── */

  :host([type="toggle"]) .base {
    background-color: var(--ui-tag-bg, ${BUTTON_SECONDARY});
    color: var(--ui-tag-color, ${TAG_TEXT_MINIMAL});
    border-radius: ${RADIUS_SM};
    text-transform: uppercase;
    font-weight: 500;
    cursor: pointer;
  }

  /* ── Icon wrappers ──────────────────────────────────────────────────────── */

  .check-icon,
  .dismiss-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    --ui-icon-size: 12px;
    line-height: 0;
  }

  .check-icon {
    display: none;
  }

  :host([check]) .check-icon {
    display: inline-flex;
  }

  .dismiss-icon {
    display: none;
  }

  :host([dismissible]) .dismiss-icon {
    display: inline-flex;
    cursor: pointer;
  }

  /* ── Content wrapper ────────────────────────────────────────────────────── */

  .content {
    display: inline-flex;
    align-items: center;
  }

  /* ── Editable: idle state ─────────────────────────────────────────────── */

  :host([editable]) .base {
    background-color: var(--ui-tag-bg, ${BUTTON_SECONDARY});
    color: var(--ui-tag-color, ${TAG_TEXT_MINIMAL});
    cursor: pointer;
  }

  :host([editable]) .add-icon {
    display: flex;
    align-items: center;
    --ui-icon-size: 12px;
  }

  :host(:not([editable])) .add-icon {
    display: none;
  }

  /* ── Editable: editing state ─────────────────────────────────────────── */

  :host([editable]) .base.editing {
    background-color: #ffffff;
    border: ${BW_MD} solid var(--ui-tag-border, ${BORDER_FOCUS});
    cursor: text;
  }

  :host([editable]) .base.editing .add-icon,
  :host([editable]) .base.editing .content {
    display: none;
  }

  :host([editable]) .tag-input {
    display: none;
    border: none;
    outline: none;
    background: transparent;
    font: inherit;
    color: var(--ui-tag-color, ${TAG_TEXT_MINIMAL});
    padding: 0;
    width: 60px;
    min-width: 40px;
  }

  :host([editable]) .base.editing .tag-input {
    display: block;
  }

  :host(:not([editable])) .tag-input {
    display: none;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTag extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "type",
    "emphasis",
    "state",
    "dismissible",
    "check",
    "color",
    "editable",
  ];

  private _checkIcon: HTMLElement | null = null;
  private _dismissIcon: HTMLElement | null = null;
  private _connected = false;
  private _editing = false;
  private _input: HTMLInputElement | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // .base
    const base = document.createElement("span");
    base.className = "base";

    // check icon wrapper
    const checkWrap = document.createElement("span");
    checkWrap.className = "check-icon";
    base.appendChild(checkWrap);

    // add icon wrapper (for editable mode)
    const addWrap = document.createElement("span");
    addWrap.className = "add-icon";
    base.appendChild(addWrap);

    // content wrapper
    const content = document.createElement("span");
    content.className = "content";
    const slot = document.createElement("slot");
    content.appendChild(slot);
    base.appendChild(content);

    // tag input (for editable mode)
    const input = document.createElement("input");
    input.className = "tag-input";
    input.type = "text";
    this._input = input;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this._exitEditMode(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        this._exitEditMode(false);
      }
    });
    input.addEventListener("blur", () => {
      if (this._editing) this._exitEditMode(true);
    });
    base.appendChild(input);

    // dismiss icon wrapper
    const dismissWrap = document.createElement("span");
    dismissWrap.className = "dismiss-icon";
    dismissWrap.addEventListener("click", () => this._handleDismiss());
    base.addEventListener("click", () => this._handleClick());
    base.appendChild(dismissWrap);

    shadow.appendChild(base);
  }

  connectedCallback(): void {
    if (this._connected) return;
    this._connected = true;

    const shadow = this.shadowRoot!;

    // Create check icon
    const checkWrap = shadow.querySelector(".check-icon")!;
    const checkIcon = document.createElement("ui-icon") as UiIcon;
    checkIcon.setAttribute("name", "check");
    checkWrap.appendChild(checkIcon);
    this._checkIcon = checkIcon as unknown as HTMLElement;

    // Create dismiss icon
    const dismissWrap = shadow.querySelector(".dismiss-icon")!;
    const dismissIcon = document.createElement("ui-icon") as UiIcon;
    dismissIcon.setAttribute("name", "close");
    dismissWrap.appendChild(dismissIcon);
    this._dismissIcon = dismissIcon as unknown as HTMLElement;

    // Create add icon (for editable mode)
    const addWrap = shadow.querySelector(".add-icon")!;
    const addIcon = document.createElement("ui-icon") as UiIcon;
    addIcon.setAttribute("name", "add");
    addWrap.appendChild(addIcon);
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    // All styling is handled via :host([attr]) CSS selectors — no JS sync needed
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): TagSize {
    return (this.getAttribute("size") as TagSize) ?? "m";
  }

  set size(value: TagSize) {
    this.setAttribute("size", value);
  }

  get type(): TagType {
    return (this.getAttribute("type") as TagType) ?? "basic";
  }

  set type(value: TagType) {
    this.setAttribute("type", value);
  }

  get emphasis(): TagEmphasis {
    return (this.getAttribute("emphasis") as TagEmphasis) ?? "bold";
  }

  set emphasis(value: TagEmphasis) {
    this.setAttribute("emphasis", value);
  }

  get state(): TagState {
    return (this.getAttribute("state") as TagState) ?? "enabled";
  }

  set state(value: TagState) {
    this.setAttribute("state", value);
  }

  get dismissible(): boolean {
    return this.hasAttribute("dismissible");
  }

  set dismissible(value: boolean) {
    if (value) {
      this.setAttribute("dismissible", "");
    } else {
      this.removeAttribute("dismissible");
    }
  }

  get check(): boolean {
    return this.hasAttribute("check");
  }

  set check(value: boolean) {
    if (value) {
      this.setAttribute("check", "");
    } else {
      this.removeAttribute("check");
    }
  }

  get color(): TagColor {
    return (this.getAttribute("color") as TagColor) ?? "none";
  }

  set color(value: TagColor) {
    this.setAttribute("color", value);
  }

  get editable(): boolean {
    return this.hasAttribute("editable");
  }

  set editable(value: boolean) {
    if (value) {
      this.setAttribute("editable", "");
    } else {
      this.removeAttribute("editable");
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _handleDismiss(): void {
    if (this.type === "selectable" && this.state === "disabled") return;
    const event = new CustomEvent("dismiss", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
    if (!event.defaultPrevented) {
      this.remove();
    }
  }

  private _handleClick(): void {
    if (this.editable && !this._editing) {
      this._enterEditMode();
      return;
    }
    if (this.type !== "selectable") return;
    if (this.state === "disabled") return;

    const newState = this.state === "selected" ? "enabled" : "selected";
    this.state = newState;

    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { selected: newState === "selected" },
      }),
    );
  }

  private _enterEditMode(): void {
    if (!this.editable) return;
    this._editing = true;
    const base = this.shadowRoot!.querySelector(".base")!;
    base.classList.add("editing");
    if (this._input) {
      this._input.focus();
    }
  }

  private _exitEditMode(submit: boolean): void {
    this._editing = false;
    const base = this.shadowRoot!.querySelector(".base")!;
    base.classList.remove("editing");
    if (submit && this._input && this._input.value.trim()) {
      this.dispatchEvent(
        new CustomEvent("create", {
          bubbles: true,
          composed: true,
          detail: { value: this._input.value.trim() },
        }),
      );
    }
    if (this._input) this._input.value = "";
  }
}

customElements.define("ui-tag", UiTag);
