import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_SECONDARY = semanticVar("text", "secondary");
const SP_05 = spaceVar("0.5");   // 4px
const SP_15 = spaceVar("1.5");   // 12px
const SP_2 = spaceVar("2");      // 16px
const SP_1 = spaceVar("1");      // 8px
const SP_3 = spaceVar("3");      // 24px
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
    font-family: var(--ui-dd-heading-font-family, "Inter", sans-serif);
    font-weight: var(--ui-dd-heading-font-weight, 500);
    color: var(--ui-dd-heading-color, ${TEXT_SECONDARY});
    text-transform: uppercase;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .heading,
  :host([size="m"]) .heading {
    font-size: 12px;
    line-height: 16px;
    padding: ${SP_05} ${SP_2};
  }

  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .heading {
    font-size: 11px;
    line-height: 16px;
    padding: ${SP_05} ${SP_15};
  }

  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .heading {
    font-size: 14px;
    line-height: 20px;
    padding: ${SP_1} ${SP_3};
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiDropdownHeading extends HTMLElement {
  static readonly observedAttributes = ["size"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

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
