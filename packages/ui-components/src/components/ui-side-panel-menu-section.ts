import {
  FONT_PRIMARY,
  SP_0_5,
  SP_1_5,
  SP_2,
  TEXT_TERTIARY,
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
    font-family: ${FONT_PRIMARY};
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--ui-spm-section-color, ${TEXT_TERTIARY});
    padding: ${SP_2} ${SP_2} ${SP_0_5} ${SP_2};
    user-select: none;
    -webkit-user-select: none;
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
