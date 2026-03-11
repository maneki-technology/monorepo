import { semanticVar, spaceVar } from "@maneki/foundation";

// ---------------------------------------------------------------------------
// Token constants
// ---------------------------------------------------------------------------

const SURFACE_PRIMARY = semanticVar("surface", "primary");
const BORDER_MINIMAL = semanticVar("border", "minimal");

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const STYLES = `
:host {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  flex: var(--flex-panel-flex, 1 1 0%);
  overflow: hidden;
}

:host([width]) {
  flex: none;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1 1 0%;
  min-height: 0;
  background: var(--flex-panel-bg, ${SURFACE_PRIMARY});
  padding: var(--flex-panel-padding, ${spaceVar("2")});
  overflow: auto;
}

:host([no-padding]) .content {
  padding: 0;
}

.content ::slotted(*) {
  min-width: 0;
  min-height: 0;
}

/* Divider between header and content — hidden by default because
   flex-panel-header provides its own bottom border in all variants
   (title → .divider, tabs/title-tabs → tab-group border-bottom). */
.divider {
  height: 1px;
  background: var(--flex-panel-divider, ${BORDER_MINIMAL});
  flex-shrink: 0;
  display: none;
}
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class FlexPanelElement extends HTMLElement {
  static observedAttributes = ["width", "flex", "no-padding"];

  private _shadow: ShadowRoot;
  private _headerSlot: HTMLSlotElement;
  private _divider: HTMLDivElement;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.adoptedStyleSheets = [sheet];

    // Header slot (named)
    this._headerSlot = document.createElement("slot");
    this._headerSlot.name = "header";
    this._shadow.appendChild(this._headerSlot);

    // Divider between header and content
    this._divider = document.createElement("div");
    this._divider.className = "divider";
    this._shadow.appendChild(this._divider);

    // Content area
    const content = document.createElement("div");
    content.className = "content";
    const contentSlot = document.createElement("slot");
    content.appendChild(contentSlot);
    this._shadow.appendChild(content);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }
    this._updateDividerVisibility();
    this._headerSlot.addEventListener("slotchange", this._onHeaderSlotChange);
  }

  disconnectedCallback(): void {
    this._headerSlot.removeEventListener("slotchange", this._onHeaderSlotChange);
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null): void {
    if (name === "width") {
      this.style.width = value ? `${value}px` : "";
      this.style.flex = value ? "none" : "";
    } else if (name === "flex") {
      if (value && !this.hasAttribute("width")) {
        this.style.flex = value;
      }
    }
  }

  private _onHeaderSlotChange = (): void => {
    this._updateDividerVisibility();
  };

  private _updateDividerVisibility(): void {
    const hasHeader = this._headerSlot.assignedElements().length > 0;
    this._divider.style.display = hasHeader ? "" : "none";
  }

  // --- width (fixed px) ---
  get width(): number | null {
    const attr = this.getAttribute("width");
    return attr ? Number(attr) : null;
  }

  set width(value: number | null) {
    if (value === null) {
      this.removeAttribute("width");
    } else {
      this.setAttribute("width", String(value));
    }
  }

  // --- no-padding ---
  get noPadding(): boolean {
    return this.hasAttribute("no-padding");
  }

  set noPadding(value: boolean) {
    if (value) {
      this.setAttribute("no-padding", "");
    } else {
      this.removeAttribute("no-padding");
    }
  }
}

customElements.define("flex-panel", FlexPanelElement);
