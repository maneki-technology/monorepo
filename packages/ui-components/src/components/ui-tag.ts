import { colorVar, semanticVar, spaceVar } from "@maneki/foundation";
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

// ─── Token constants ─────────────────────────────────────────────────────────

const TAG_BOLD = semanticVar("tag", "bold");
const TAG_SUBTLE = semanticVar("tag", "subtle");
const TAG_TEXT_BOLD = semanticVar("tag", "textBold");
const TAG_TEXT_SUBTLE = semanticVar("tag", "textSubtle");
const TAG_TEXT_MINIMAL = semanticVar("tag", "textMinimal");
const BORDER_MODERATE = semanticVar("border", "moderate");
const BUTTON_SECONDARY = semanticVar("button", "secondary");
const BORDER_FOCUS = semanticVar("border", "focus");
const DISABLED_MINIMAL = semanticVar("stateDisabled", "minimal");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const TEXT_PRIMARY = semanticVar("text", "primary");

// Color tokens (60 = bold bg, 20 = subtle bg, 70 = subtle/minimal text)
const RED_60 = colorVar("red", 60);
const YELLOW_30 = colorVar("yellow", 30);
const GREEN_60 = colorVar("green", 60);
const BLUE_60 = colorVar("blue", 60);
const LIME_60 = colorVar("lime", 60);
const TEAL_60 = colorVar("teal", 60);
const TURQUOISE_60 = colorVar("turquoise", 60);
const AQUA_60 = colorVar("aqua", 60);
const ULTRAMARINE_60 = colorVar("ultramarine", 60);
const PINK_60 = colorVar("pink", 60);
const PURPLE_60 = colorVar("purple", 60);
const ORANGE_60 = colorVar("orange", 60);

const RED_20 = colorVar("red", 20);
const YELLOW_10 = colorVar("yellow", 10);
const GREEN_20 = colorVar("green", 20);
const BLUE_20 = colorVar("blue", 20);
const LIME_20 = colorVar("lime", 20);
const TEAL_20 = colorVar("teal", 20);
const TURQUOISE_20 = colorVar("turquoise", 20);
const AQUA_20 = colorVar("aqua", 20);
const ULTRAMARINE_20 = colorVar("ultramarine", 20);
const PINK_20 = colorVar("pink", 20);
const PURPLE_20 = colorVar("purple", 20);
const ORANGE_20 = colorVar("orange", 20);

const RED_70 = colorVar("red", 70);
const GREEN_70 = colorVar("green", 70);
const BLUE_70 = colorVar("blue", 70);
const LIME_70 = colorVar("lime", 70);
const TEAL_70 = colorVar("teal", 70);
const TURQUOISE_70 = colorVar("turquoise", 70);
const AQUA_70 = colorVar("aqua", 70);
const ULTRAMARINE_70 = colorVar("ultramarine", 70);
const PINK_70 = colorVar("pink", 70);
const PURPLE_70 = colorVar("purple", 70);
const ORANGE_70 = colorVar("orange", 70);
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
    font-family: "Inter", sans-serif;
    white-space: nowrap;
    border: 1px solid transparent;
    cursor: default;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="m"]) .base {
    font-size: 14px;
    line-height: 20px;
    padding: 2px 8px;
    border-radius: 200px;
  }

  :host .base .content,
  :host([size="m"]) .base .content {
    padding: 0 4px;
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .base {
    font-size: 11px;
    line-height: 16px;
    padding: 0 6px;
    border-radius: 200px;
  }

  :host([size="xs"]) .base .content {
    padding: 0 2px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .base {
    font-size: 12px;
    line-height: 16px;
    padding: 2px 8px;
    border-radius: 200px;
  }

  :host([size="s"]) .base .content {
    padding: 0 4px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    font-size: 14px;
    line-height: 20px;
    padding: 6px 10px;
    border-radius: 200px;
  }

  :host([size="l"]) .base .content {
    padding: 0 6px;
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
    border-radius: 2px;
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
    border: 2px solid var(--ui-tag-border, ${BORDER_FOCUS});
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
