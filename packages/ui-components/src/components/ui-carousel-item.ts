// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    flex-shrink: 0;
    scroll-snap-align: start;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiCarouselItem extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const slot = document.createElement("slot");
    shadow.appendChild(slot);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }
    if (!this.hasAttribute("aria-roledescription")) {
      this.setAttribute("aria-roledescription", "slide");
    }
  }
}

customElements.define("ui-carousel-item", UiCarouselItem);
