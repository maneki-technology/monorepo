import {
  BORDER_MINIMAL,
  BW_SM,
  ELEVATION_00,
  ELEVATION_01,
  ELEVATION_02,
  ELEVATION_04,
  FONT_PRIMARY,
  RADIUS_NONE,
  RADIUS_SM,
  SP_1,
  SP_1_5,
  SP_2,
  SP_2_5,
  SP_3,
  SURFACE_PRIMARY,
  TEXT_PRIMARY,
} from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type CardSize = "s" | "m" | "l";
export type CardElevation = "00" | "01" | "02" | "04";
// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: ${FONT_PRIMARY};
  }

  /* ── Base ─────────────────────────────────────────────────────────────────── */

  .base {
    display: flex;
    flex-direction: column;
    width: 100%;
    border-radius: var(--ui-card-radius, ${RADIUS_SM});
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
    border-width: ${BW_SM};
    border-style: solid;
    border-color: var(--ui-card-border-color, ${BORDER_MINIMAL});
  }

  /* ── Image slot ──────────────────────────────────────────────────────────── */

  .image-slot {
    overflow: hidden;
    border-radius: var(--ui-card-radius, ${RADIUS_SM}) var(--ui-card-radius, ${RADIUS_SM}) ${RADIUS_NONE} ${RADIUS_NONE};
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

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiCard extends HTMLElement {
  static readonly observedAttributes = ["size", "elevation", "bordered"];

  private _footerSlot: HTMLSlotElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

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
    if (!this.hasAttribute("role")) this.setAttribute("role", "group");
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
