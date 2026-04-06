import {
  BORDER_MINIMAL,
  BW_SM,
  SP_0_5,
  SP_1,
  SP_1_5,
  SP_2,
  TEXT_SECONDARY,
  TYPE_HEADING_07,
} from "@maneki/foundation";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
  }

  .section {
    ${TYPE_HEADING_07}
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--ui-spm-section-color, ${TEXT_SECONDARY});
    padding: ${SP_1_5} ${SP_2} ${SP_0_5} ${SP_2};
    user-select: none;
    -webkit-user-select: none;
  }

  ::slotted(*) {
    margin-bottom: var(--ui-spm-item-gap, 0);
  }

  ::slotted(*:last-child) {
    margin-bottom: 0;
  }

  /* Subsequent sections get a separator + spacing */
  :host([separator]) .section {
    padding-top: ${SP_1};
    margin-top: ${SP_0_5};
    border-top: ${BW_SM} solid var(--ui-spm-section-border, ${BORDER_MINIMAL});
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSidePanelMenuSection extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const section = document.createElement("div");
    section.className = "section";
    section.setAttribute("part", "section");

    const slot = document.createElement("slot");
    section.appendChild(slot);

    shadow.appendChild(section);
  }

  connectedCallback(): void {
    this.setAttribute("role", "presentation");
  }
}

customElements.define("ui-side-panel-menu-section", UiSidePanelMenuSection);
