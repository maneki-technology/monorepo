import type { AccordionSize, AccordionEmphasis } from "./ui-accordion-item.js";

const STYLES = `
  :host {
    display: flex;
    flex-direction: column;
  }
`;

const PROPAGATED_ATTRS = ["size", "emphasis"] as const;

export class UiAccordionGroup extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "emphasis",
    "exclusive",
  ];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${STYLES}</style><slot></slot>`;
  }

  connectedCallback(): void {
    this.shadowRoot!.querySelector("slot")!.addEventListener(
      "slotchange",
      () => this._propagateAttributes(),
    );
    this._propagateAttributes();
    this.addEventListener("toggle", this._handleToggle as EventListener);
  }

  disconnectedCallback(): void {
    this.removeEventListener("toggle", this._handleToggle as EventListener);
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    this._propagateAttributes();
  }

  get size(): AccordionSize | null {
    return this.getAttribute("size") as AccordionSize | null;
  }

  set size(value: AccordionSize | null) {
    if (value) {
      this.setAttribute("size", value);
    } else {
      this.removeAttribute("size");
    }
  }

  get emphasis(): AccordionEmphasis | null {
    return this.getAttribute("emphasis") as AccordionEmphasis | null;
  }

  set emphasis(value: AccordionEmphasis | null) {
    if (value) {
      this.setAttribute("emphasis", value);
    } else {
      this.removeAttribute("emphasis");
    }
  }

  get exclusive(): boolean {
    return this.hasAttribute("exclusive");
  }

  set exclusive(value: boolean) {
    if (value) {
      this.setAttribute("exclusive", "");
    } else {
      this.removeAttribute("exclusive");
    }
  }

  private _getChildItems(): Element[] {
    const slot = this.shadowRoot!.querySelector("slot")!;
    return slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-ACCORDION-ITEM");
  }

  private _propagateAttributes(): void {
    const items = this._getChildItems();
    for (const attr of PROPAGATED_ATTRS) {
      const value = this.getAttribute(attr);
      for (const item of items) {
        if (value) {
          item.setAttribute(attr, value);
        } else {
          item.removeAttribute(attr);
        }
      }
    }
  }

  private _handleToggle = (e: Event): void => {
    if (!this.exclusive) return;
    const target = e.target as Element;
    if (target.tagName !== "UI-ACCORDION-ITEM") return;
    const detail = (e as CustomEvent).detail;
    if (!detail?.expanded) return;

    const items = this._getChildItems();
    for (const item of items) {
      if (item !== target && item.hasAttribute("expanded")) {
        item.removeAttribute("expanded");
      }
    }
  };
}

customElements.define("ui-accordion-group", UiAccordionGroup);
