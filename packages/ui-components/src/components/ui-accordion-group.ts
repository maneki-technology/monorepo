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
    this.addEventListener("keydown", this._handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener("toggle", this._handleToggle as EventListener);
    this.removeEventListener("keydown", this._handleKeydown);
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
  /** WAI-ARIA Accordion: Arrow keys move focus between headers, Home/End jump to first/last. */
  private _handleKeydown = (e: KeyboardEvent): void => {
    const items = this._getChildItems();
    if (items.length === 0) return;
    // Find which item currently has focus (header inside its shadow DOM)
    const currentIndex = items.findIndex((item) => {
      const header = item.shadowRoot?.querySelector(".header");
      return header && header === item.shadowRoot?.activeElement;
    });
    if (currentIndex === -1) return;
    let nextIndex: number | null = null;
    switch (e.key) {
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    const nextHeader = items[nextIndex].shadowRoot?.querySelector(".header") as HTMLElement | null;
    if (nextHeader) nextHeader.focus();
  };
}

customElements.define("ui-accordion-group", UiAccordionGroup);
