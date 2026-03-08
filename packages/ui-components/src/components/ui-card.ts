import { semanticVar, elevationVar, spaceVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type CardSize = "s" | "m" | "l";
export type CardElevation = "00" | "01" | "02" | "04";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_PRIMARY = semanticVar("surface", "primary");
const TEXT_PRIMARY = semanticVar("text", "primary");
const BORDER_MINIMAL = semanticVar("border", "minimal");

const ELEVATION_00 = elevationVar("00");
const ELEVATION_01 = elevationVar("01");
const ELEVATION_02 = elevationVar("02");
const ELEVATION_04 = elevationVar("04");

const SP_1 = spaceVar("1");
const SP_1_5 = spaceVar("1.5");
const SP_2 = spaceVar("2");
const SP_2_5 = spaceVar("2.5");
const SP_3 = spaceVar("3");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: "Goldman Sans", sans-serif;
  }

  /* ── Base ─────────────────────────────────────────────────────────────────── */

  .base {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-radius: var(--ui-card-radius, 2px);
    background-color: var(--ui-card-bg, ${SURFACE_PRIMARY});
    color: var(--ui-card-color, ${TEXT_PRIMARY});
    overflow: hidden;
  }

  /* ── Elevation ───────────────────────────────────────────────────────────── */

  :host .base,
  :host([elevation="02"]) .base {
    box-shadow: var(--ui-card-shadow, ${ELEVATION_02});
  }

  :host([elevation="00"]) .base {
    box-shadow: var(--ui-card-shadow, ${ELEVATION_00});
  }

  :host([elevation="01"]) .base {
    box-shadow: var(--ui-card-shadow, ${ELEVATION_01});
  }

  :host([elevation="04"]) .base {
    box-shadow: var(--ui-card-shadow, ${ELEVATION_04});
  }

  /* ── Bordered ────────────────────────────────────────────────────────────── */

  :host([bordered]) .base {
    border: 1px solid var(--ui-card-border-color, ${BORDER_MINIMAL});
  }

  /* ── Image slot ──────────────────────────────────────────────────────────── */

  .image-slot {
    overflow: hidden;
    border-radius: var(--ui-card-radius, 2px) var(--ui-card-radius, 2px) 0 0;
  }

  .image-slot ::slotted(*) {
    display: block;
    width: 100%;
  }

  /* ── Content ─────────────────────────────────────────────────────────────── */

  .content {
    display: flex;
    flex-direction: column;
  }

  /* ── Footer ──────────────────────────────────────────────────────────────── */

  .footer {
    display: none;
  }

  :host([has-footer]) .footer {
    display: block;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .content,
  :host([size="m"]) .content {
    padding: ${SP_1_5} ${SP_2} ${SP_2} ${SP_2};
    gap: ${SP_1_5};
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .content {
    padding: ${SP_1_5} ${SP_2} ${SP_1_5} ${SP_2};
    gap: ${SP_1};
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .content {
    padding: ${SP_2_5} ${SP_3} ${SP_3} ${SP_3};
    gap: ${SP_2_5};
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiCard extends HTMLElement {
  static readonly observedAttributes = ["size", "elevation", "bordered"];

  private _footerSlot: HTMLSlotElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // .base
    const base = document.createElement("div");
    base.className = "base";
    base.setAttribute("part", "base");

    // Image slot wrapper
    const imageSlotWrapper = document.createElement("div");
    imageSlotWrapper.className = "image-slot";
    const imageSlot = document.createElement("slot");
    imageSlot.name = "image";
    imageSlotWrapper.appendChild(imageSlot);
    base.appendChild(imageSlotWrapper);

    // .content
    const content = document.createElement("div");
    content.className = "content";
    content.setAttribute("part", "content");
    const defaultSlot = document.createElement("slot");
    content.appendChild(defaultSlot);
    base.appendChild(content);

    // .footer
    const footer = document.createElement("div");
    footer.className = "footer";
    footer.setAttribute("part", "footer");
    const footerSlot = document.createElement("slot");
    footerSlot.name = "footer";
    footer.appendChild(footerSlot);
    base.appendChild(footer);

    shadow.appendChild(base);

    this._footerSlot = footerSlot;

    // Listen for slotchange to toggle has-footer attribute
    footerSlot.addEventListener("slotchange", () => this._syncFooter());
  }

  connectedCallback(): void {
    this._syncFooter();
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    // All styling is handled via :host([attr]) CSS selectors — no JS sync needed
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): CardSize {
    return (this.getAttribute("size") as CardSize) ?? "m";
  }

  set size(value: CardSize) {
    this.setAttribute("size", value);
  }

  get elevation(): CardElevation {
    return (this.getAttribute("elevation") as CardElevation) ?? "02";
  }

  set elevation(value: CardElevation) {
    this.setAttribute("elevation", value);
  }

  get bordered(): boolean {
    return this.hasAttribute("bordered");
  }

  set bordered(value: boolean) {
    if (value) {
      this.setAttribute("bordered", "");
    } else {
      this.removeAttribute("bordered");
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncFooter(): void {
    const nodes = this._footerSlot.assignedNodes({ flatten: true });
    if (nodes.length > 0) {
      this.setAttribute("has-footer", "");
    } else {
      this.removeAttribute("has-footer");
    }
  }
}

customElements.define("ui-card", UiCard);
