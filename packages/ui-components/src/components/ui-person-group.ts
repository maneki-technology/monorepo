import { semanticVar, spaceVar } from "@maneki/foundation";
import type { PersonItemSize } from "./ui-person-item.js";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    font-family: "Geist", sans-serif;
  }

  .title {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: ${TEXT_PRIMARY};
    padding-bottom: ${spaceVar("1")};
  }

  .title:empty {
    display: none;
  }

  .items {
    display: flex;
    flex-direction: column;
  }

  ::slotted(ui-person-item) {
    width: 100%;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiPersonGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "title"];

  #titleEl!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    this.#titleEl = document.createElement("div");
    this.#titleEl.className = "title";

    const items = document.createElement("div");
    items.className = "items";
    const slot = document.createElement("slot");
    items.appendChild(slot);

    shadow.append(this.#titleEl, items);
  }

  connectedCallback(): void {
    this.shadowRoot!.querySelector("slot")!.addEventListener(
      "slotchange",
      () => this._propagateSize(),
    );
    this._propagateSize();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "title":
        this.#titleEl.textContent = newValue ?? "";
        break;
      case "size":
        this._propagateSize();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): PersonItemSize {
    return (this.getAttribute("size") as PersonItemSize) ?? "s";
  }
  set size(v: PersonItemSize) {
    this.setAttribute("size", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _propagateSize(): void {
    const size = this.getAttribute("size");
    if (!size) return;
    const slot = this.shadowRoot!.querySelector("slot")!;
    for (const node of slot.assignedElements()) {
      if (node.tagName === "UI-PERSON-ITEM") {
        node.setAttribute("size", size);
      }
    }
  }
}

customElements.define("ui-person-group", UiPersonGroup);
