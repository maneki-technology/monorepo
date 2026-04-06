import { BORDER_MINIMAL } from "@maneki/foundation";

export type ToolbarSeparatorOrientation = "horizontal" | "vertical";

const STYLES = `
  :host {
    display: block;
    flex-shrink: 0;
    align-self: center;
  }

  /* Vertical separator (default, inside horizontal toolbar) */
  :host,
  :host([orientation="vertical"]) {
    width: 1px;
    height: 18px;
    background: var(--ui-toolbar-separator-color, ${BORDER_MINIMAL});
  }

  /* Horizontal separator (inside vertical toolbar) */
  :host([orientation="horizontal"]) {
    width: 18px;
    height: 1px;
    background: var(--ui-toolbar-separator-color, ${BORDER_MINIMAL});
  }
`;

export class UiToolbarSeparator extends HTMLElement {
  static readonly observedAttributes = ["orientation"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${STYLES}</style>`;
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "separator");
    }
    this._syncAriaOrientation();
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null): void {
    if (name === "orientation") {
      this._syncAriaOrientation();
    }
  }

  get orientation(): ToolbarSeparatorOrientation {
    return (this.getAttribute("orientation") as ToolbarSeparatorOrientation) || "vertical";
  }

  set orientation(value: ToolbarSeparatorOrientation) {
    this.setAttribute("orientation", value);
  }

  private _syncAriaOrientation(): void {
    this.setAttribute("aria-orientation", this.orientation);
  }
}

customElements.define("ui-toolbar-separator", UiToolbarSeparator);
