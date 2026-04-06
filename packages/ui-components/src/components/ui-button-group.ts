
import {
  RADIUS_LG, RADIUS_PILL, BORDER_MINIMAL,
  SURFACE_ACTION, SURFACE_ACTION_CONTRAST, SURFACE_DESTRUCTIVE,
  SURFACE_PRIMARY, DEFAULT_DEFAULT,
} from "@maneki/foundation";
import type { ButtonAction, ButtonEmphasis, ButtonSize, ButtonShape } from "./ui-button.js";
const STYLES = `
  :host {
    display: inline-flex;
    align-items: stretch;
    overflow: clip;
    border-radius: var(--ui-btn-group-radius, ${RADIUS_LG});
    background: var(--ui-btn-group-bg, ${SURFACE_ACTION});
  }

  :host([shape="rounded"]) {
    border-radius: var(--ui-btn-group-radius, ${RADIUS_PILL});
  }

  /* Group bg matches button bg per action */
  :host([action="primary"]) { --ui-btn-group-bg: ${SURFACE_ACTION}; }
  :host([action="secondary"]) { --ui-btn-group-bg: ${DEFAULT_DEFAULT}; }
  :host([action="destructive"]) { --ui-btn-group-bg: ${SURFACE_DESTRUCTIVE}; }
  :host([action="info"]) { --ui-btn-group-bg: ${SURFACE_ACTION_CONTRAST}; }
  :host([action="contrast"]) { --ui-btn-group-bg: ${SURFACE_PRIMARY}; }

  /* Subtle/minimal: transparent bg (no fill) */
  :host([emphasis="subtle"]),
  :host([emphasis="minimal"]) {
    background: transparent;
  }

  #c {
    display: inline-flex;
    align-items: stretch;
    width: 100%;
  }

  /* Kill individual button borders; group handles visual separation */
  ::slotted(ui-button) {
    --ui-btn-radius: 0;
    --ui-btn-border-color: transparent;
    flex: 0 0 auto;
  }

  /* Divider: short centered line (50% height, matches Figma) */
  .divider {
    width: 1px;
    align-self: center;
    height: 50%;
    background: rgba(255, 255, 255, 0.3);
    flex: 0 0 1px;
  }

  /* Subtle: container border + opaque dividers */
  :host([emphasis="subtle"]) {
    border: 1px solid ${BORDER_MINIMAL};
  }

  :host([emphasis="subtle"]) .divider {
    background: ${BORDER_MINIMAL};
  }

  /* Minimal: no dividers */
  :host([emphasis="minimal"]) .divider {
    display: none;
  }

  /* Override button hover to use overlay instead of bg-color change */
  ::slotted(ui-button:hover) {
    --ui-btn-bg-hover: unset;
  }

  ::slotted(ui-button:first-of-type) {
    --ui-btn-radius: var(--ui-btn-group-radius, ${RADIUS_LG}) 0 0 var(--ui-btn-group-radius, ${RADIUS_LG});
  }

  ::slotted(ui-button:last-of-type) {
    --ui-btn-radius: 0 var(--ui-btn-group-radius, ${RADIUS_LG}) var(--ui-btn-group-radius, ${RADIUS_LG}) 0;
  }

  ::slotted(ui-button:only-of-type) {
    --ui-btn-radius: var(--ui-btn-group-radius, ${RADIUS_LG});
  }

  :host([shape="rounded"]) ::slotted(ui-button:first-of-type) {
    --ui-btn-radius: var(--ui-btn-group-radius, ${RADIUS_PILL}) 0 0 var(--ui-btn-group-radius, ${RADIUS_PILL});
  }

  :host([shape="rounded"]) ::slotted(ui-button:last-of-type) {
    --ui-btn-radius: 0 var(--ui-btn-group-radius, ${RADIUS_PILL}) var(--ui-btn-group-radius, ${RADIUS_PILL}) 0;
  }

  :host([shape="rounded"]) ::slotted(ui-button:only-of-type) {
    --ui-btn-radius: var(--ui-btn-group-radius, ${RADIUS_PILL});
  }
`;

const PROPAGATED_ATTRS = ["size", "action", "emphasis"] as const;

export class UiButtonGroup extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "action",
    "emphasis",
    "shape",
    "aria-label",
  ];

  private _container: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${STYLES}</style><div id="c"></div>`;
    this._container = shadow.getElementById("c")!;
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "toolbar");
    }
    this._observer = new MutationObserver(() => this._rebuild());
    this._observer.observe(this, { childList: true });
    this._rebuild();
  }

  disconnectedCallback(): void {
    this._observer?.disconnect();
  }

  private _observer: MutationObserver | null = null;

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    this._rebuild();
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

  private _rebuild(): void {
    const buttons = Array.from(this.children).filter(
      (el) => el.tagName === "UI-BUTTON",
    );

    // Propagate group attributes to child buttons
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

    // Assign named slots and build shadow container with dividers
    const c = this._container;
    c.innerHTML = "";
    buttons.forEach((btn, i) => {
      const slotName = `b${i}`;
      btn.setAttribute("slot", slotName);
      const slot = document.createElement("slot");
      slot.name = slotName;
      if (i > 0) {
        const div = document.createElement("div");
        div.className = "divider";
        div.setAttribute("aria-hidden", "true");
        c.appendChild(div);
      }
      c.appendChild(slot);
    });
  }
}

customElements.define("ui-button-group", UiButtonGroup);
