import { colorVar, semanticVar, spaceVar } from "@maneki/foundation";
import { ICON_CHECK } from "../assets/icons.js";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const GRAY_10 = colorVar("gray", 10);
const SP_075 = spaceVar("0.75"); // 6px
const SP_1 = spaceVar("1");      // 8px
const SP_15 = spaceVar("1.5");   // 12px
const SP_2 = spaceVar("2");      // 16px

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

  .item {
    display: flex;
    align-items: center;
    gap: ${SP_1};
    width: 100%;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-family: var(--ui-dd-item-font-family, "Inter", sans-serif);
    font-weight: var(--ui-dd-item-font-weight, 400);
    color: var(--ui-dd-item-color, ${TEXT_PRIMARY});
    text-align: start;
  }

  .item:hover {
    background-color: var(--ui-dd-item-hover-bg, ${GRAY_10});
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .item,
  :host([size="m"]) .item {
    font-size: 14px;
    line-height: 20px;
    padding: ${SP_075} ${SP_2};
  }

  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .item {
    font-size: 12px;
    line-height: 16px;
    padding: ${SP_075} ${SP_15};
  }

  /* ── Disabled ───────────────────────────────────────────────────────────── */

  :host([disabled]) .item {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* ── Check icon ──────────────────────────────────────────────────────── */

  .check {
    display: none;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    line-height: 0;
    flex-shrink: 0;
    margin-left: auto;
  }

  :host([size="s"]) .check {
    width: 12px;
    height: 12px;
  }

  .check svg {
    width: 100%;
    height: 100%;
  }

  :host([selected]) .check {
    display: inline-flex;
  }

  /* ── Selected ─────────────────────────────────────────────────────────── */

  :host([selected]) .item {
    font-weight: 500;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiDropdownItem extends HTMLElement {
  static readonly observedAttributes = ["size", "disabled", "selected", "value"];

  private _button: HTMLButtonElement;
  private _check: HTMLSpanElement;
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

    const slot = document.createElement("slot");
    button.appendChild(slot);

    const check = document.createElement("span");
    check.className = "check";
    check.innerHTML = ICON_CHECK;
    button.appendChild(check);

    shadow.appendChild(button);
    this._button = button;
    this._check = check;
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
    _newValue: string | null,
  ): void {
    if (name === "disabled") {
      this._syncDisabled();
    }
  }

  connectedCallback(): void {
    this._syncDisabled();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): "s" | "m" {
    return (this.getAttribute("size") as "s" | "m") ?? "m";
  }

  set size(value: "s" | "m") {
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

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncDisabled(): void {
    this._button.disabled = this.disabled;
  }
}

customElements.define("ui-dropdown-item", UiDropdownItem);
