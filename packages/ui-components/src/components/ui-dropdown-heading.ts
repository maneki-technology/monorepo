import {
  SP_0_5,
  SP_1,
  SP_1_5,
  SP_2,
  SP_3,
  TEXT_SECONDARY,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
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

  .heading {
    font-family: var(--ui-dd-heading-font-family, "Geist", sans-serif);
    font-weight: var(--ui-dd-heading-font-weight, 500);
    color: var(--ui-dd-heading-color, ${TEXT_SECONDARY});
    text-transform: uppercase;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .heading,
  :host([size="m"]) .heading {
    ${TYPE_BODY_03}
    padding: ${SP_0_5} ${SP_2};
  }

  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .heading {
    ${TYPE_CAPTION_01}
    padding: ${SP_0_5} ${SP_1_5};
  }

  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .heading {
    ${TYPE_BODY_02}
    padding: ${SP_1} ${SP_3};
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiDropdownHeading extends HTMLElement {
  static readonly observedAttributes = ["size"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    const heading = document.createElement("div");
    heading.className = "heading";
    heading.setAttribute("part", "heading");

    const slot = document.createElement("slot");
    heading.appendChild(slot);

    shadow.appendChild(heading);
  }
  connectedCallback(): void {
    this.setAttribute("role", "presentation");
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): "s" | "m" | "l" {
    return (this.getAttribute("size") as "s" | "m" | "l") ?? "m";
  }

  set size(value: "s" | "m" | "l") {
    this.setAttribute("size", value);
  }
}

customElements.define("ui-dropdown-heading", UiDropdownHeading);
