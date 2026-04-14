import { LitElement, html, css, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
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

// ─── Component ─────────────────────────────────────────────────────────────────

@customElement("ui-side-panel-menu-section")
export class UiSidePanelMenuSection extends LitElement {
  @property({ type: Boolean, reflect: true }) declare separator: boolean;

  constructor() {
    super();
    this.separator = false;
  }

  static styles = css`
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    :host {
      display: block;
    }

    .section {
      ${unsafeCSS(TYPE_HEADING_07)}
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--ui-spm-section-color, ${unsafeCSS(TEXT_SECONDARY)});
      padding: ${unsafeCSS(SP_1_5)} ${unsafeCSS(SP_2)} ${unsafeCSS(SP_0_5)} ${unsafeCSS(SP_2)};
      user-select: none;
      -webkit-user-select: none;
    }


    /* Subsequent sections get a separator + spacing */
    :host([separator]) .section {
      padding-top: ${unsafeCSS(SP_1)};
      margin-top: ${unsafeCSS(SP_0_5)};
      border-top: ${unsafeCSS(BW_SM)} solid var(--ui-spm-section-border, ${unsafeCSS(BORDER_MINIMAL)});
    }
  `;


  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("role", "presentation");
  }

  protected render(): unknown {
    return html`<div class="section" part="section"><slot></slot></div>`;
  }
}