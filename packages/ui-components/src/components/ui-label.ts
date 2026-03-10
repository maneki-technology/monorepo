import { semanticVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type LabelSize = "s" | "m" | "l";
export type LabelEmphasis = "bold" | "subtle";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_SECONDARY = semanticVar("text", "secondary");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const STATUS_ERROR = semanticVar("statusGeneral", "error");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    align-items: baseline;
    font-family: "Inter", sans-serif;
    color: var(--ui-label-color, ${TEXT_SECONDARY});
  }

  .text {
    font-size: var(--_font-size);
    line-height: var(--_line-height);
    font-weight: var(--_font-weight);
  }

  .required {
    color: ${STATUS_ERROR};
    font-size: var(--_font-size);
    line-height: var(--_line-height);
    margin-left: 2px;
  }

  :host(:not([required])) .required {
    display: none;
  }

  /* ── Emphasis ─────────────────────────────────────────────────────────────── */

  :host,
  :host([emphasis="bold"]) {
    --_font-weight: 500;
  }

  :host([emphasis="subtle"]) {
    --_font-weight: 400;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    --_font-size: 14px;
    --_line-height: 20px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_font-size: 12px;
    --_line-height: 16px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_font-size: 16px;
    --_line-height: 24px;
  }

  /* ── Disabled ────────────────────────────────────────────────────────────── */

  :host([disabled]) {
    color: var(--ui-label-color, ${DISABLED_TEXT});
  }

  :host([disabled]) .required {
    color: ${DISABLED_TEXT};
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const OBSERVED = ["size", "emphasis", "disabled", "required"] as const;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

class UiLabel extends HTMLElement {
  static observedAttributes = [...OBSERVED];

  private _textEl: HTMLSpanElement;
  private _requiredEl: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    this._textEl = document.createElement("span");
    this._textEl.className = "text";
    const slot = document.createElement("slot");
    this._textEl.appendChild(slot);
    shadow.appendChild(this._textEl);

    this._requiredEl = document.createElement("span");
    this._requiredEl.className = "required";
    this._requiredEl.setAttribute("aria-hidden", "true");
    this._requiredEl.textContent = "*";
    shadow.appendChild(this._requiredEl);
  }

  // ── Attribute accessors ──────────────────────────────────────────────────

  get size(): LabelSize {
    return (this.getAttribute("size") as LabelSize) ?? "m";
  }
  set size(v: LabelSize) {
    this.setAttribute("size", v);
  }

  get emphasis(): LabelEmphasis {
    return (this.getAttribute("emphasis") as LabelEmphasis) ?? "bold";
  }
  set emphasis(v: LabelEmphasis) {
    this.setAttribute("emphasis", v);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(v: boolean) {
    v ? this.setAttribute("disabled", "") : this.removeAttribute("disabled");
  }

  get required(): boolean {
    return this.hasAttribute("required");
  }
  set required(v: boolean) {
    v ? this.setAttribute("required", "") : this.removeAttribute("required");
  }
}

customElements.define("ui-label", UiLabel);

export { UiLabel };
