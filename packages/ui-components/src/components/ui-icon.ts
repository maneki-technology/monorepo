import { semanticVar, ICON_CODEPOINTS } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type IconSize = "xxs" | "xs" | "s" | "m" | "l";
export type IconState =
  | "enabled"
  | "enabled-inverse"
  | "hover"
  | "hover-inverse"
  | "active"
  | "active-inverse"
  | "focus"
  | "focus-inverse"
  | "disabled"
  | "disabled-inverse";

// ─── Token constants ─────────────────────────────────────────────────────────

const ICON_PRIMARY = semanticVar("icon", "primary");
const ICON_REVERSED = semanticVar("icon", "reversed");
const ICON_ACTION = semanticVar("icon", "action");
const DISABLED_MINIMAL = semanticVar("stateDisabled", "minimal");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
  }

  /* ── Base icon ─────────────────────────────────────────────────────────────── */

  .icon {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-variation-settings: 'FILL' 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'liga';
  }

  /* ── Filled variant ────────────────────────────────────────────────────────── */

  :host([filled]) .icon {
    font-variation-settings: 'FILL' 1;
  }

  /* ── Size: s (default) ─────────────────────────────────────────────────────── */

  :host .icon,
  :host([size="s"]) .icon {
    font-size: var(--ui-icon-size, 16px);
    width: var(--ui-icon-size, 16px);
    height: var(--ui-icon-size, 16px);
  }

  /* ── Size: xxs ─────────────────────────────────────────────────────────────── */

  :host([size="xxs"]) .icon {
    font-size: var(--ui-icon-size, 12px);
    width: var(--ui-icon-size, 12px);
    height: var(--ui-icon-size, 12px);
  }

  /* ── Size: xs ──────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .icon {
    font-size: var(--ui-icon-size, 14px);
    width: var(--ui-icon-size, 14px);
    height: var(--ui-icon-size, 14px);
  }

  /* ── Size: m ───────────────────────────────────────────────────────────────── */

  :host([size="m"]) .icon {
    font-size: var(--ui-icon-size, 20px);
    width: var(--ui-icon-size, 20px);
    height: var(--ui-icon-size, 20px);
  }

  /* ── Size: l ───────────────────────────────────────────────────────────────── */

  :host([size="l"]) .icon {
    font-size: var(--ui-icon-size, 24px);
    width: var(--ui-icon-size, 24px);
    height: var(--ui-icon-size, 24px);
  }

  /* ── State: enabled (default) ──────────────────────────────────────────────── */

  :host .icon,
  :host([state="enabled"]) .icon {
    color: var(--ui-icon-color, ${ICON_PRIMARY});
    background: var(--ui-icon-bg, none);
  }

  /* ── State: enabled-inverse ────────────────────────────────────────────────── */

  :host([state="enabled-inverse"]) .icon {
    color: var(--ui-icon-color, ${ICON_REVERSED});
    background: var(--ui-icon-bg, none);
  }

  /* ── State: hover ──────────────────────────────────────────────────────────── */

  :host([state="hover"]) .icon {
    color: var(--ui-icon-color, ${ICON_ACTION});
    background: var(--ui-icon-bg, none);
  }

  /* ── State: hover-inverse ──────────────────────────────────────────────────── */

  :host([state="hover-inverse"]) .icon {
    color: var(--ui-icon-color, ${ICON_REVERSED});
    background: var(--ui-icon-bg, rgba(255, 255, 255, 0.1));
  }

  /* ── State: active ─────────────────────────────────────────────────────────── */

  :host([state="active"]) .icon {
    color: var(--ui-icon-color, ${ICON_ACTION});
    background: var(--ui-icon-bg, none);
  }

  /* ── State: active-inverse ─────────────────────────────────────────────────── */

  :host([state="active-inverse"]) .icon {
    color: var(--ui-icon-color, ${ICON_REVERSED});
    background: var(--ui-icon-bg, rgba(255, 255, 255, 0.2));
  }

  /* ── State: focus ──────────────────────────────────────────────────────────── */

  :host([state="focus"]) .icon {
    color: var(--ui-icon-color, ${ICON_ACTION});
    background: var(--ui-icon-bg, none);
  }

  /* ── State: focus-inverse ──────────────────────────────────────────────────── */

  :host([state="focus-inverse"]) .icon {
    color: var(--ui-icon-color, ${ICON_REVERSED});
    background: var(--ui-icon-bg, none);
  }

  /* ── State: disabled ───────────────────────────────────────────────────────── */

  :host([state="disabled"]) .icon {
    color: var(--ui-icon-color, ${DISABLED_MINIMAL});
    background: var(--ui-icon-bg, none);
  }

  /* ── State: disabled-inverse ───────────────────────────────────────────────── */

  :host([state="disabled-inverse"]) .icon {
    color: var(--ui-icon-color, rgba(255, 255, 255, 0.3));
    background: var(--ui-icon-bg, none);
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiIcon extends HTMLElement {
  static readonly observedAttributes = [
    "name",
    "size",
    "state",
    "filled",
    "label",
  ];

  #iconEl: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // .icon
    const iconEl = document.createElement("span");
    iconEl.className = "icon";
    this.#iconEl = iconEl;

    // default accessibility: presentational
    this.setAttribute("role", "presentation");
    this.setAttribute("aria-hidden", "true");

    shadow.appendChild(iconEl);
  }

  attributeChangedCallback(
    attrName: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    if (attrName === "name") {
      this.#updateIcon();
    } else if (attrName === "label") {
      this.#updateAccessibility(newValue);
    }
    // size, state, filled are handled via :host([attr]) CSS selectors
  }

  #updateIcon(): void {
    const name = this.getAttribute("name") ?? "";
    const codepoint = ICON_CODEPOINTS[name];
    this.#iconEl.textContent = codepoint ?? name;
  }

  #updateAccessibility(label: string | null): void {
    if (label) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", label);
      this.removeAttribute("aria-hidden");
    } else {
      this.setAttribute("role", "presentation");
      this.removeAttribute("aria-label");
      this.setAttribute("aria-hidden", "true");
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get name(): string {
    return this.getAttribute("name") ?? "";
  }

  set name(value: string) {
    this.setAttribute("name", value);
  }

  get size(): IconSize {
    return (this.getAttribute("size") as IconSize) ?? "s";
  }

  set size(value: IconSize) {
    this.setAttribute("size", value);
  }

  get state(): IconState {
    return (this.getAttribute("state") as IconState) ?? "enabled";
  }

  set state(value: IconState) {
    this.setAttribute("state", value);
  }

  get filled(): boolean {
    return this.hasAttribute("filled");
  }

  set filled(value: boolean) {
    if (value) {
      this.setAttribute("filled", "");
    } else {
      this.removeAttribute("filled");
    }
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }

  set label(value: string) {
    if (value) {
      this.setAttribute("label", value);
    } else {
      this.removeAttribute("label");
    }
  }
}

customElements.define("ui-icon", UiIcon);
