import { BORDER_MINIMAL } from "@maneki/foundation";

export type ToolbarOrientation = "horizontal" | "vertical";

const STYLES = `
  :host {
    display: inline-flex;
    align-items: var(--ui-toolbar-align, center);
    gap: var(--ui-toolbar-gap, 8px);
    flex-direction: row;
  }

  :host([orientation="horizontal"]) {
    flex-direction: row;
  }

  :host([orientation="vertical"]) {
    flex-direction: column;
  }

  /* Attached variant — floating toolbar */
  :host([attached]) {
    padding: var(--ui-toolbar-attached-padding, 4px);
    border-radius: var(--ui-toolbar-attached-radius, 32px);
    box-shadow: var(--ui-toolbar-attached-shadow, 0px 2px 8px 0px rgba(0,0,0,0.06), 0px -6px 12px 0px rgba(0,0,0,0.03), 0px 14px 28px 0px rgba(0,0,0,0.08));
    position: relative;
    isolation: isolate;
  }

  /* Frosted glass background for attached */
  :host([attached])::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--ui-toolbar-attached-bg, var(--fd-surface-primary, rgba(255, 255, 255, 0.85)));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: -1;
  }
`;

export class UiToolbar extends HTMLElement {
  static readonly observedAttributes = ["orientation", "attached", "aria-label"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${STYLES}</style><slot></slot>`;
    shadow.querySelector("slot")!.addEventListener("slotchange", () => {
      this._propagateOrientation();
    });
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "toolbar");
    }
    this._syncAriaOrientation();
    this._propagateOrientation();
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (name === "orientation") {
      this._syncAriaOrientation();
      this._propagateOrientation();
    }
  }

  get orientation(): ToolbarOrientation {
    return (this.getAttribute("orientation") as ToolbarOrientation) || "horizontal";
  }

  set orientation(value: ToolbarOrientation) {
    this.setAttribute("orientation", value);
  }

  get attached(): boolean {
    return this.hasAttribute("attached");
  }

  set attached(value: boolean) {
    if (value) {
      this.setAttribute("attached", "");
    } else {
      this.removeAttribute("attached");
    }
  }

  private _syncAriaOrientation(): void {
    this.setAttribute("aria-orientation", this.orientation);
  }

  private _propagateOrientation(): void {
    const orient = this.orientation;
    // Separators inside a horizontal toolbar are vertical lines, and vice versa
    const sepOrientation = orient === "horizontal" ? "vertical" : "horizontal";
    for (const child of Array.from(this.children)) {
      if (child.tagName === "UI-TOOLBAR-SEPARATOR") {
        child.setAttribute("orientation", sepOrientation);
      }
    }
  }
}

customElements.define("ui-toolbar", UiToolbar);
