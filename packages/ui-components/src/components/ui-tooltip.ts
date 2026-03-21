import { ICON_CLOSE, colorVar } from "@maneki/foundation";
import { spaceVar, radiusVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const GRAY_110 = colorVar("gray", 110);
const RADIUS_SM = radiusVar("sm");           // 2px
const SP_025 = spaceVar("0.25");             // 2px
const SP_05 = spaceVar("0.5");               // 4px
const SP_075 = spaceVar("0.75");             // 6px
const SP_1 = spaceVar("1");                   // 8px
const SP_15 = spaceVar("1.5");               // 12px
const SP_125 = spaceVar("1.25");             // 10px
const SP_2 = spaceVar("2");                   // 16px

// ─── Types ───────────────────────────────────────────────────────────────

export type TooltipSize = "xs" | "s" | "m" | "l";
export type TooltipPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

// ─── Styles ──────────────────────────────────────────────────────────────

const STYLES = /* css */ `
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
    position: relative;
    width: fit-content;
    font-family: "Geist", sans-serif;
  }

  /* ── Tooltip panel ───────────────────────────────────────────────────────── */

  .panel {
    position: absolute;
    z-index: 1000;
    display: none;
    background: ${GRAY_110};
    color: #ffffff;
    border-radius: ${RADIUS_SM};
    white-space: nowrap;
    pointer-events: none;
  }

  :host([open]) .panel {
    display: flex;
    align-items: center;
    pointer-events: auto;
  }

  .text {
    text-align: center;
  }

  /* ── Close button ────────────────────────────────────────────────────────── */

  .close {
    display: none;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    color: #ffffff;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
  }

  :host([dismissible]) .close {
    display: inline-flex;
  }

  .close .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0;
  }

  /* ── Arrow ───────────────────────────────────────────────────────────────── */

  .arrow {
    position: absolute;
    width: 8px;
    height: 4px;
    overflow: hidden;
  }

  .arrow::after {
    content: "";
    position: absolute;
    width: 6px;
    height: 6px;
    background: ${GRAY_110};
    transform: rotate(45deg);
  }

  /* Arrow for top placements (arrow at bottom of panel, pointing down) */
  :host([placement="top"]) .arrow,
  :host([placement="top-left"]) .arrow,
  :host([placement="top-right"]) .arrow {
    bottom: -4px;
  }

  :host([placement="top"]) .arrow::after,
  :host([placement="top-left"]) .arrow::after,
  :host([placement="top-right"]) .arrow::after {
    top: -3px;
    left: 1px;
  }

  :host([placement="top"]) .arrow {
    left: 50%;
    transform: translateX(-50%);
  }

  :host([placement="top-left"]) .arrow {
    left: 12px;
  }

  :host([placement="top-right"]) .arrow {
    right: 12px;
  }

  /* Arrow for bottom placements (arrow at top of panel, pointing up) */
  :host([placement="bottom"]) .arrow,
  :host([placement="bottom-left"]) .arrow,
  :host([placement="bottom-right"]) .arrow {
    top: -4px;
  }

  :host([placement="bottom"]) .arrow::after,
  :host([placement="bottom-left"]) .arrow::after,
  :host([placement="bottom-right"]) .arrow::after {
    bottom: -3px;
    left: 1px;
  }

  :host([placement="bottom"]) .arrow {
    left: 50%;
    transform: translateX(-50%);
  }

  :host([placement="bottom-left"]) .arrow {
    left: 12px;
  }

  :host([placement="bottom-right"]) .arrow {
    right: 12px;
  }

  /* Arrow for left placement (arrow at right of panel, pointing right) */
  :host([placement="left"]) .arrow {
    right: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 8px;
  }

  :host([placement="left"]) .arrow::after {
    top: 1px;
    left: -3px;
  }

  /* Arrow for right placement (arrow at left of panel, pointing left) */
  :host([placement="right"]) .arrow {
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 8px;
  }

  :host([placement="right"]) .arrow::after {
    top: 1px;
    right: -3px;
    left: auto;
  }

  /* ── Panel positioning ───────────────────────────────────────────────────── */

  :host([placement="top"]) .panel,
  :host([placement="top-left"]) .panel,
  :host([placement="top-right"]) .panel {
    bottom: 100%;
    margin-bottom: ${SP_075};
  }

  :host([placement="top"]) .panel {
    left: 50%;
    transform: translateX(-50%);
  }

  :host([placement="top-left"]) .panel {
    left: 0;
  }

  :host([placement="top-right"]) .panel {
    right: 0;
  }

  :host([placement="bottom"]) .panel,
  :host([placement="bottom-left"]) .panel,
  :host([placement="bottom-right"]) .panel {
    top: 100%;
    margin-top: ${SP_075};
  }

  :host([placement="bottom"]) .panel {
    left: 50%;
    transform: translateX(-50%);
  }

  :host([placement="bottom-left"]) .panel {
    left: 0;
  }

  :host([placement="bottom-right"]) .panel {
    right: 0;
  }

  :host([placement="left"]) .panel {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: ${SP_075};
  }

  :host([placement="right"]) .panel {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: ${SP_075};
  }

  /* ── Size: XS ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .panel {
    padding: ${SP_025} ${SP_05};
    gap: ${SP_05};
  }

  :host([size="xs"]) .text {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="xs"]) .close {
    width: 12px;
    height: 12px;
  }

  :host([size="xs"]) .close .material-symbols-outlined {
    font-size: 12px;
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .panel {
    padding: ${SP_05} ${SP_1};
    gap: ${SP_05};
  }

  :host([size="s"]) .text {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .close {
    width: 14px;
    height: 14px;
  }

  :host([size="s"]) .close .material-symbols-outlined {
    font-size: 14px;
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .panel,
  :host([size="m"]) .panel {
    padding: ${SP_075} ${SP_15};
    gap: ${SP_1};
  }

  :host .text,
  :host([size="m"]) .text {
    font-size: 14px;
    line-height: 20px;
  }

  :host .close,
  :host([size="m"]) .close {
    width: 14px;
    height: 14px;
  }

  :host .close .material-symbols-outlined,
  :host([size="m"]) .close .material-symbols-outlined {
    font-size: 14px;
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .panel {
    padding: ${SP_125} ${SP_2};
    gap: ${SP_1};
  }

  :host([size="l"]) .text {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .close {
    width: 20px;
    height: 20px;
  }

  :host([size="l"]) .close .material-symbols-outlined {
    font-size: 20px;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiTooltip extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "placement",
    "text",
    "dismissible",
    "open",
    "trigger",
  ];

  #panel!: HTMLElement;
  #textEl!: HTMLElement;
  #closeBtn!: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Trigger slot
    const triggerSlot = document.createElement("slot");

    // Panel
    this.#panel = document.createElement("div");
    this.#panel.className = "panel";
    this.#panel.setAttribute("role", "tooltip");

    // Arrow
    const arrow = document.createElement("div");
    arrow.className = "arrow";

    // Text
    this.#textEl = document.createElement("span");
    this.#textEl.className = "text";

    // Close button
    this.#closeBtn = document.createElement("button");
    this.#closeBtn.className = "close";
    this.#closeBtn.type = "button";
    this.#closeBtn.setAttribute("aria-label", "Close");
    const closeIcon = document.createElement("span");
    closeIcon.className = "material-symbols-outlined";
    closeIcon.textContent = ICON_CLOSE;
    this.#closeBtn.appendChild(closeIcon);

    this.#panel.append(this.#textEl, this.#closeBtn, arrow);
    shadow.append(triggerSlot, this.#panel);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    if (!this.hasAttribute("placement")) this.setAttribute("placement", "top");
    if (!this.hasAttribute("trigger")) this.setAttribute("trigger", "hover");

    this.#closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._close();
    });

    // Hover trigger
    this.addEventListener("mouseenter", () => {
      if (this.trigger === "hover") this._open();
    });
    this.addEventListener("mouseleave", () => {
      if (this.trigger === "hover" && !this.hasAttribute("dismissible")) this._close();
    });

    // Focus trigger
    this.addEventListener("focusin", () => {
      if (this.trigger === "hover") this._open();
    });
    this.addEventListener("focusout", () => {
      if (this.trigger === "hover" && !this.hasAttribute("dismissible")) this._close();
    });
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "text":
        this.#textEl.textContent = newValue ?? "";
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): TooltipSize {
    return (this.getAttribute("size") as TooltipSize) ?? "m";
  }
  set size(v: TooltipSize) {
    this.setAttribute("size", v);
  }

  get placement(): TooltipPlacement {
    return (this.getAttribute("placement") as TooltipPlacement) ?? "top";
  }
  set placement(v: TooltipPlacement) {
    this.setAttribute("placement", v);
  }

  get text(): string {
    return this.getAttribute("text") ?? "";
  }
  set text(v: string) {
    this.setAttribute("text", v);
  }

  get dismissible(): boolean {
    return this.hasAttribute("dismissible");
  }
  set dismissible(v: boolean) {
    if (v) this.setAttribute("dismissible", "");
    else this.removeAttribute("dismissible");
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) this._open();
    else this._close();
  }

  get trigger(): string {
    return this.getAttribute("trigger") ?? "hover";
  }
  set trigger(v: string) {
    this.setAttribute("trigger", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _open(): void {
    this.setAttribute("open", "");
  }

  private _close(): void {
    this.removeAttribute("open");
  }
}

customElements.define("ui-tooltip", UiTooltip);
