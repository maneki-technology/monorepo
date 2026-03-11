import { semanticVar, spaceVar } from "@maneki/foundation";

// ---------------------------------------------------------------------------
// Token constants
// ---------------------------------------------------------------------------

const SURFACE_MODERATE = semanticVar("surface", "moderate");

// ---------------------------------------------------------------------------
// Size presets (from Figma)
// ---------------------------------------------------------------------------

export type FlexLayoutSize = "large" | "medium" | "small";

const SIZE_CONFIG: Record<FlexLayoutSize, { gap: string; padding: string }> = {
  large: { gap: spaceVar("1"), padding: spaceVar("1") },   // 8px
  medium: { gap: spaceVar("1"), padding: spaceVar("1") },  // 8px
  small: { gap: spaceVar("0.5"), padding: spaceVar("0.5") }, // 4px
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const STYLES = `
:host {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  background: var(--flex-bg, ${SURFACE_MODERATE});
  gap: var(--flex-gap, ${SIZE_CONFIG.medium.gap});
  padding: var(--flex-padding, ${SIZE_CONFIG.medium.padding});
  flex-direction: var(--flex-direction, row);
  align-items: var(--flex-align, stretch);
  overflow: hidden;
}

:host([direction="column"]) {
  flex-direction: column;
}

:host([direction="row"]) {
  flex-direction: row;
}

:host([size="large"]) {
  gap: var(--flex-gap, ${SIZE_CONFIG.large.gap});
  padding: var(--flex-padding, ${SIZE_CONFIG.large.padding});
}

:host([size="medium"]) {
  gap: var(--flex-gap, ${SIZE_CONFIG.medium.gap});
  padding: var(--flex-padding, ${SIZE_CONFIG.medium.padding});
}

:host([size="small"]) {
  gap: var(--flex-gap, ${SIZE_CONFIG.small.gap});
  padding: var(--flex-padding, ${SIZE_CONFIG.small.padding});
}

::slotted(*) {
  min-width: 0;
  min-height: 0;
}
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class FlexLayoutElement extends HTMLElement {
  static observedAttributes = ["size", "direction"];

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.adoptedStyleSheets = [sheet];

    const slot = document.createElement("slot");
    this._shadow.appendChild(slot);
  }

  connectedCallback(): void {
    // No default role — flex-layout is a generic container.
    // Consumers can add role="region" + aria-label if needed.
  }

  // --- size ---
  get size(): FlexLayoutSize {
    return (this.getAttribute("size") as FlexLayoutSize) || "medium";
  }

  set size(value: FlexLayoutSize) {
    this.setAttribute("size", value);
  }

  // --- direction ---
  get direction(): "row" | "column" {
    return (this.getAttribute("direction") as "row" | "column") || "row";
  }

  set direction(value: "row" | "column") {
    this.setAttribute("direction", value);
  }
}

customElements.define("flex-layout", FlexLayoutElement);
