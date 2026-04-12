/**
 * <loading-bounce> — Bouncy favicon loading indicator.
 * Vanilla Web Component (no Lit) — works in both admin Lit pages and light DOM editor.
 */

const STYLES = /* css */ `
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 48px 24px;
    min-height: 200px;
  }

  .icon {
    width: var(--loading-bounce-size, 80px);
    height: var(--loading-bounce-size, 80px);
    animation: bounce 1s ease-in-out infinite;
    border-radius: 50%;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
    50% { transform: translateY(-12px) scale(1.1); opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .icon { animation-duration: 0.01ms !important; }
  }
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class LoadingBounce extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const img = document.createElement("img");
    img.className = "icon";
    img.src = "/favicon.png";
    img.alt = "Loading";
    shadow.appendChild(img);
  }
}

customElements.define("loading-bounce", LoadingBounce);
