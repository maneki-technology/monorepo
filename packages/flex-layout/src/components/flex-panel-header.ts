import { semanticVar, spaceVar, borderWidthVar } from "@maneki/foundation";

// ---------------------------------------------------------------------------
// Token constants
// ---------------------------------------------------------------------------

const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const TEXT_PRIMARY = semanticVar("text", "primary");
const ICON_ACTION = semanticVar("icon", "action");

// ---------------------------------------------------------------------------
// Size presets (from Figma)
// ---------------------------------------------------------------------------

export type FlexPanelHeaderSize = "large" | "medium" | "small";

interface SizePreset {
  height: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  paddingLeft: string;
  paddingRight: string;
  paddingTop: string;
  paddingBottom: string;
  iconSize: string;
}

const SIZE_PRESETS: Record<FlexPanelHeaderSize, SizePreset> = {
  large: {
    height: spaceVar("4"),        // 32px
    fontSize: "12px",
    fontWeight: "500",
    lineHeight: "16px",
    paddingLeft: spaceVar("2"),    // 16px
    paddingRight: spaceVar("1"),   // 8px
    paddingTop: spaceVar("1"),     // 8px
    paddingBottom: spaceVar("1"),  // 8px
    iconSize: spaceVar("2"),       // 16px
  },
  medium: {
    height: spaceVar("3"),        // 24px
    fontSize: "12px",
    fontWeight: "500",
    lineHeight: "16px",
    paddingLeft: spaceVar("2"),    // 16px
    paddingRight: spaceVar("1"),   // 8px
    paddingTop: spaceVar("0.5"),   // 4px
    paddingBottom: "3px",          // no exact token
    iconSize: spaceVar("1.5"),    // 12px
  },
  small: {
    height: spaceVar("2.5"),      // 20px
    fontSize: "11px",
    fontWeight: "500",
    lineHeight: "16px",
    paddingLeft: spaceVar("2"),    // 16px
    paddingRight: spaceVar("1"),   // 8px
    paddingTop: spaceVar("0.25"),  // 2px
    paddingBottom: spaceVar("0.25"), // 2px
    iconSize: spaceVar("1.5"),    // 12px
  },
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const STYLES = `
:host {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  background: var(--flex-header-bg, ${SURFACE_SECONDARY});
  overflow: visible;
}

.title-bar {
  display: flex;
  align-items: center;
  gap: ${spaceVar("1")};
  box-sizing: border-box;
  min-height: var(--flex-header-height, ${spaceVar("3")});
  padding-left: var(--flex-header-padding-left, ${spaceVar("2")});
  padding-right: var(--flex-header-padding-right, ${spaceVar("1")});
  padding-top: var(--flex-header-padding-top, ${spaceVar("0.5")});
  padding-bottom: var(--flex-header-padding-bottom, 3px);
}

.title-text {
  flex: 1 1 0%;
  min-width: 0;
  font-family: "Geist", sans-serif;
  font-size: var(--flex-header-font-size, 12px);
  font-weight: var(--flex-header-font-weight, 500);
  line-height: var(--flex-header-line-height, 16px);
  color: var(--flex-header-color, ${TEXT_PRIMARY});
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.action-icon {
  flex-shrink: 0;
  width: var(--flex-header-icon-size, ${spaceVar("1.5")});
  height: var(--flex-header-icon-size, ${spaceVar("1.5")});
  color: var(--flex-header-icon-color, ${ICON_ACTION});
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.action-icon ::slotted(*) {
  width: 100%;
  height: 100%;
}

.divider {
  height: ${borderWidthVar("sm")};
  background: var(--flex-header-divider, ${BORDER_MINIMAL});
  flex-shrink: 0;
}

/* Tabs slot */
.tabs-bar {
  display: none;
  flex-shrink: 0;
  width: 100%;
  overflow: visible;
  align-items: flex-end;
  padding-left: ${spaceVar("2")};
  padding-right: ${spaceVar("1")};
  box-sizing: border-box;
  margin-bottom: -1px;
  position: relative;
  z-index: 1;
}

.tabs-bar ::slotted(*) {
  width: 100%;
  --ui-tab-group-border: none;
  --ui-tab-group-border-shadow: none;
}

:host([variant="tabs"]) .tabs-bar,
:host([variant="title-tabs"]) .tabs-bar {
  display: flex;
}

:host([variant="tabs"]) .title-bar {
  display: none;
}

/* The header's own .divider provides the full-width bottom line.
   Tab-group's internal border is suppressed via --ui-tab-group-border: none. */
/* Title-tabs: stacked column layout (title above tabs) */
:host([variant="title-tabs"]) .title-bar {
  border-bottom: ${borderWidthVar("sm")} solid ${BORDER_MINIMAL};
}

:host([variant="title-tabs"]) .tabs-bar {
  width: 100%;
}

/* Size: large */
:host([size="large"]) .title-bar {
  min-height: ${spaceVar("4")};
  padding-left: ${spaceVar("2")};
  padding-right: ${spaceVar("1")};
  padding-top: ${spaceVar("1")};
  padding-bottom: ${spaceVar("1")};
}

:host([size="large"]) .title-text {
  font-size: 12px;
  line-height: 16px;
}

:host([size="large"]) .action-icon {
  width: ${spaceVar("2")};
  height: ${spaceVar("2")};
}

:host([size="large"]) .tabs-bar {
  min-height: ${spaceVar("4")};
}

/* Size: medium (default) */
:host([size="medium"]) .title-bar {
  min-height: ${spaceVar("3")};
  padding-left: ${spaceVar("2")};
  padding-right: ${spaceVar("1")};
  padding-top: ${spaceVar("0.5")};
  padding-bottom: 3px;
}

:host([size="medium"]) .title-text {
  font-size: 12px;
  line-height: 16px;
}

:host([size="medium"]) .action-icon {
  width: ${spaceVar("1.5")};
  height: ${spaceVar("1.5")};
}

:host([size="medium"]) .tabs-bar {
  min-height: ${spaceVar("3")};
}

/* Size: small */
:host([size="small"]) .title-bar {
  min-height: ${spaceVar("2.5")};
  padding-left: ${spaceVar("2")};
  padding-right: ${spaceVar("1")};
  padding-top: ${spaceVar("0.25")};
  padding-bottom: ${spaceVar("0.25")};
}

:host([size="small"]) .title-text {
  font-size: 11px;
  line-height: 16px;
}

:host([size="small"]) .action-icon {
  width: ${spaceVar("1.5")};
  height: ${spaceVar("1.5")};
}

:host([size="small"]) .tabs-bar {
  min-height: ${spaceVar("2.5")};
}
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class FlexPanelHeaderElement extends HTMLElement {
  static observedAttributes = ["variant", "size", "heading"];

  private _shadow: ShadowRoot;
  private _titleText: HTMLSpanElement;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._shadow.adoptedStyleSheets = [sheet];

    // Title bar
    const titleBar = document.createElement("div");
    titleBar.className = "title-bar";

    this._titleText = document.createElement("span");
    this._titleText.className = "title-text";
    titleBar.appendChild(this._titleText);

    const actionIcon = document.createElement("div");
    actionIcon.className = "action-icon";
    const actionSlot = document.createElement("slot");
    actionSlot.name = "action";
    actionIcon.appendChild(actionSlot);
    titleBar.appendChild(actionIcon);

    this._shadow.appendChild(titleBar);

    // Tabs bar (slot for tab content)
    const tabsBar = document.createElement("div");
    tabsBar.className = "tabs-bar";
    const tabsSlot = document.createElement("slot");
    tabsSlot.name = "tabs";
    tabsBar.appendChild(tabsSlot);
    this._shadow.appendChild(tabsBar);

    // Bottom divider
    const divider = document.createElement("div");
    divider.className = "divider";
    this._shadow.appendChild(divider);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "toolbar");
    }
    this._updateHeading();
  }

  attributeChangedCallback(name: string): void {
    if (name === "heading") {
      this._updateHeading();
    }
  }

  private _updateHeading(): void {
    this._titleText.textContent = this.getAttribute("heading") || "";
  }

  // --- variant ---
  get variant(): "title" | "tabs" | "title-tabs" {
    return (this.getAttribute("variant") as "title" | "tabs" | "title-tabs") || "title";
  }

  set variant(value: "title" | "tabs" | "title-tabs") {
    this.setAttribute("variant", value);
  }

  // --- size ---
  get size(): FlexPanelHeaderSize {
    return (this.getAttribute("size") as FlexPanelHeaderSize) || "medium";
  }

  set size(value: FlexPanelHeaderSize) {
    this.setAttribute("size", value);
  }

  // --- heading ---
  get heading(): string {
    return this.getAttribute("heading") || "";
  }

  set heading(value: string) {
    this.setAttribute("heading", value);
  }
}

customElements.define("flex-panel-header", FlexPanelHeaderElement);
