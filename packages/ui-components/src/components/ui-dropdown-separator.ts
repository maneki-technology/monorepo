import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const BORDER_MINIMAL = semanticVar("border", "minimal");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    padding: 3px 0;
  }

  .line {
    height: 1px;
    background-color: var(--ui-dd-separator-color, ${BORDER_MINIMAL});
    width: 100%;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiDropdownSeparator extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    const line = document.createElement("div");
    line.className = "line";
    shadow.appendChild(line);

    this.setAttribute("role", "separator");
    this.setAttribute("aria-hidden", "true");
  }
}

customElements.define("ui-dropdown-separator", UiDropdownSeparator);
