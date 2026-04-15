/**
 * <loading-bounce> — Bouncy favicon loading indicator.
 * Lit component — works in both admin Lit pages and public pages.
 */

import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("loading-bounce")
export class LoadingBounce extends LitElement {
  static styles = css`
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
      0%,
      100% {
        transform: translateY(0) scale(1);
        opacity: 0.7;
      }
      50% {
        transform: translateY(-12px) scale(1.1);
        opacity: 1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .icon {
        animation-duration: 0.01ms !important;
      }
    }
  `;

  protected render(): unknown {
    return html`<img class="icon" src="/favicon.png" alt="Loading" />`;
  }
}
