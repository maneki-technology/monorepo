import { spaceVar } from "@maneki/foundation";
import type { ButtonAction, ButtonEmphasis, ButtonSize, ButtonShape } from "./ui-button.js";

const SP_1PX = spaceVar("1px");

const STYLES = `
  :host {
    display: inline-flex;
    gap: var(--ui-btn-group-gap, ${SP_1PX});
  }

  ::slotted(ui-button) {
    --ui-btn-radius: 0;
  }

  ::slotted(ui-button:first-child) {
    --ui-btn-radius: 2px 0 0 2px;
  }

  ::slotted(ui-button:last-child) {
    --ui-btn-radius: 0 2px 2px 0;
  }

  :host([shape="rounded"]) ::slotted(ui-button) {
    --ui-btn-radius: 0;
  }

  :host([shape="rounded"]) ::slotted(ui-button:first-child) {
    --ui-btn-radius: 999px 0 0 999px;
  }

  :host([shape="rounded"]) ::slotted(ui-button:last-child) {
    --ui-btn-radius: 0 999px 999px 0;
  }
`;

const PROPAGATED_ATTRS = ["size", "action", "emphasis"] as const;

export class UiButtonGroup extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "action",
    "emphasis",
    "shape",
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
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    this._propagateAttributes();
  }

  get size(): ButtonSize | null {
    return this.getAttribute("size") as ButtonSize | null;
  }

  set size(value: ButtonSize | null) {
    if (value) {
      this.setAttribute("size", value);
    } else {
      this.removeAttribute("size");
    }
  }

  get action(): ButtonAction | null {
    return this.getAttribute("action") as ButtonAction | null;
  }

  set action(value: ButtonAction | null) {
    if (value) {
      this.setAttribute("action", value);
    } else {
      this.removeAttribute("action");
    }
  }

  get emphasis(): ButtonEmphasis | null {
    return this.getAttribute("emphasis") as ButtonEmphasis | null;
  }

  set emphasis(value: ButtonEmphasis | null) {
    if (value) {
      this.setAttribute("emphasis", value);
    } else {
      this.removeAttribute("emphasis");
    }
  }

  get shape(): ButtonShape | null {
    return this.getAttribute("shape") as ButtonShape | null;
  }

  set shape(value: ButtonShape | null) {
    if (value) {
      this.setAttribute("shape", value);
    } else {
      this.removeAttribute("shape");
    }
  }

  private _getChildButtons(): Element[] {
    const slot = this.shadowRoot!.querySelector("slot")!;
    return slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-BUTTON");
  }

  private _propagateAttributes(): void {
    const buttons = this._getChildButtons();
    for (const attr of PROPAGATED_ATTRS) {
      const value = this.getAttribute(attr);
      for (const btn of buttons) {
        if (value) {
          btn.setAttribute(attr, value);
        } else {
          btn.removeAttribute(attr);
        }
      }
    }
  }
}

customElements.define("ui-button-group", UiButtonGroup);
