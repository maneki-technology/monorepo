import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  BORDER_FOCUS,
  BORDER_MINIMAL,
  BORDER_SUBTLE,
  BW_MD,
  ELEVATION_03,
  FONT_PRIMARY,
  ICON_KEYBOARD_DOUBLE_ARROW_LEFT,
  ICON_KEYBOARD_DOUBLE_ARROW_RIGHT,
  ICON_PRIMARY,
  SP_1,
  SP_2,
  SURFACE_SECONDARY,
} from "@maneki/foundation";
import "./ui-scrollbar.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SidePanelState = "expanded" | "collapsed";

// ─── Styles (exported for tests) ─────────────────────────────────────────────

export const STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
    font-display: swap;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    width: var(--ui-sp-width, 300px);
    height: 100%;
    background-color: var(--ui-sp-bg, ${SURFACE_SECONDARY});
    font-family: ${FONT_PRIMARY};
    position: relative;
    transition: width 0.2s ease, transform 0.2s ease;
  }

  /* ── Dismissible panels: animate from display:none via @starting-style ── */

  :host([dismissible]) {
    display: none;
  }

  :host([dismissible][open]) {
    display: block;
    transform: translateX(0);
    transition: transform 0.2s ease, display 0.2s ease allow-discrete;
  }

  :host([dismissible]:not([open])) {
    display: block;
    transform: translateX(-100%);
    transition: transform 0.2s ease, display 0.2s ease allow-discrete;
  }

  :host([dismissible][position="right"]:not([open])) {
    transform: translateX(100%);
  }

  @starting-style {
    :host([dismissible][open]) {
      transform: translateX(-100%);
    }
    :host([dismissible][position="right"][open]) {
      transform: translateX(100%);
    }
  }


  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  /* ── Right border (inset shadow) ───────────────────────────────────── */

  :host(:not([overlay]):not([position="right"])) .container::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset -1px 0 0 0 var(--ui-sp-border, ${BORDER_SUBTLE});
  }

  /* ── Right position ───────────────────────────────────────────── */

  :host([position="right"]:not([overlay])) .container::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset 1px 0 0 0 var(--ui-sp-border, ${BORDER_SUBTLE});
  }

  :host(:not([overlay])) .container::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset -1px 0 0 0 var(--ui-sp-border, ${BORDER_SUBTLE});
  }

  /* ── Overlay mode ────────────────────────────────────────────────────────── */

  :host([overlay]) {
    box-shadow: var(--ui-sp-shadow, ${ELEVATION_03});
  }

  /* ── Collapsed mode ──────────────────────────────────────────────────────── */

  :host([state="collapsed"]) {
    width: var(--ui-sp-collapsed-width, 40px);
  }

  /* Mobile: host takes no layout space, container handles positioning */
  :host([mobile]) {
    width: 0;
    overflow: visible;
    transition: none;
  }
  /* ── Mobile: slide-in/out via container ─────────────────────────────────── */

  :host([mobile]) .container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    background-color: var(--ui-sp-bg, ${SURFACE_SECONDARY});
    transform: translateX(0);
    transition: transform 0.25s ease;
  }

  :host([mobile][state="collapsed"]) .container {
    transform: translateX(-100%);
    pointer-events: none;
  }

  .mobile-trigger {
    display: none;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 101;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--ui-sp-border, ${BORDER_SUBTLE});
    background-color: var(--ui-sp-bg, ${SURFACE_SECONDARY});
    color: var(--ui-sp-toggle-icon, ${ICON_PRIMARY});
    cursor: pointer;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-trigger .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0;
  }

  :host([mobile][state="collapsed"]) .mobile-trigger {
    display: flex;
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */

  .header {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${SP_1};
    padding-left: ${SP_2};
    gap: ${SP_1};
    background-color: var(--ui-sp-header-bg, ${SURFACE_SECONDARY});
    flex-shrink: 0;
  }

  slot[name="header"] {
    flex: 1 0 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .header-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    line-height: 0;
    color: var(--ui-sp-toggle-icon, ${ICON_PRIMARY});
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    border-radius: 2px;
  }

  .header-toggle .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0;
  }

  .header-toggle:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ── Collapsed header ────────────────────────────────────────────────────── */

  :host([state="collapsed"]) .header {
    justify-content: center;
    padding: ${SP_1};
  }

  :host([state="collapsed"]) slot[name="header"] {
    display: none;
  }

  /* ── Separator ───────────────────────────────────────────────────────────── */

  .separator {
    height: 1px;
    background-color: var(--ui-sp-separator, ${BORDER_MINIMAL});
    flex-shrink: 0;
  }

  /* ── Body ─────────────────────────────────────────────────────────────────── */

  .body {
    flex: 1;
    min-height: 0;
  }

  /* ── Footer ──────────────────────────────────────────────────────────────── */

  .footer {
    flex-shrink: 0;
    border-top: 1px solid var(--ui-sp-separator, ${BORDER_MINIMAL});
  }

  .footer:empty {
    display: none;
  }

  :host([mobile][state="collapsed"]) .footer {
    display: none;
  }

  /* ── no-collapse: only hide desktop toggle, mobile still works ─────────── */

  :host([no-collapse]:not([mobile])) .header-toggle {
    display: none;
  }

  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    :host {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const MOBILE_QUERY = "(max-width: 767px)";

@customElement("ui-side-panel")
export class UiSidePanel extends LitElement {
  @property({ type: String, reflect: true }) declare state: SidePanelState;
  @property({ type: Boolean, reflect: true }) declare overlay: boolean;
  @property({ type: Boolean, reflect: true }) declare mobile: boolean;
  @property({ type: Boolean, reflect: true, attribute: "no-collapse" }) declare noCollapse: boolean;
  @property({ type: String, reflect: true }) declare position: "left" | "right";
  @property({ type: Boolean, reflect: true }) declare dismissible: boolean;
  @property({ type: Boolean, reflect: true }) declare open: boolean;
  @property({ type: String, attribute: "scrollbar-emphasis" }) declare scrollbarEmphasis: string;

  static styles = css`
    ${unsafeCSS(STYLES)}
  `;

  private _mql: MediaQueryList | null = null;
  private _mqlHandler: ((e: MediaQueryListEvent) => void) | null = null;
  private _outsideClickHandler: ((e: MouseEvent) => void) | null = null;


  constructor() {
    super();
    this.state = "expanded";
    this.overlay = false;
    this.mobile = false;
    this.noCollapse = false;
    this.position = "left";
    this.dismissible = false;
    this.open = false;
    this.scrollbarEmphasis = "minimal";
  }

  // ── Synchronous first render for happy-dom tests ───────────────────────
  protected override scheduleUpdate(): void | Promise<unknown> {
    this.performUpdate();
  }

  protected override render(): unknown {
    const isCollapsed = this.state === "collapsed";
    const toggleIcon = isCollapsed ? ICON_KEYBOARD_DOUBLE_ARROW_RIGHT : ICON_KEYBOARD_DOUBLE_ARROW_LEFT;
    const toggleLabel = isCollapsed ? "Expand panel" : "Collapse panel";

    return html`
      <div class="container">
        <div class="header">
          <slot name="header"></slot>
          <button class="header-toggle" type="button" aria-label=${toggleLabel} @click=${this._onToggleClick}>
            <span class="material-symbols-outlined">${toggleIcon}</span>
          </button>
        </div>
        <div class="separator"></div>
        <ui-scrollbar class="body" emphasis=${this.scrollbarEmphasis}>
          <slot></slot>
        </ui-scrollbar>
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </div>
      <button class="mobile-trigger" type="button" aria-label="Open navigation" @click=${this._onMobileTriggerClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute("state")) this.setAttribute("state", "expanded");

    // Lit may not use adoptedStyleSheets in all environments (e.g. happy-dom).
    // Manually adopt so tests that check adoptedStyleSheets.length pass.
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(STYLES);
    this.shadowRoot!.adoptedStyleSheets = [sheet];

    this._setupMobileDetection();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardownMobileDetection();
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("open")) {
      if (this.open) {
        this._onOpen();
      } else if (changedProperties.get("open") !== undefined) {
        this._onClose();
      }
    }
  }


  // ── Public API ──────────────────────────────────────────────────────────

  toggle(): void {
    const next: SidePanelState = this.state === "expanded" ? "collapsed" : "expanded";
    this.state = next;

    // On mobile, toggle overlay when expanding
    if (this.mobile) {
      this.overlay = next === "expanded";
    }

    this.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { state: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  // ── Private ─────────────────────────────────────────────────────────────────────

  private _onToggleClick = (): void => {
    this.toggle();
  };

  private _onMobileTriggerClick = (): void => {
    this.toggle();
  };

  private _onOpen(): void {
    setTimeout(() => {
      this._outsideClickHandler = (e: MouseEvent) => {
        if (this.hasAttribute("dismissible")) {
          // Use composedPath to handle clicks inside floating elements (dropdowns, selects)
          // that render outside the side panel's DOM tree but originate from within it
          const path = e.composedPath();
          if (!path.includes(this)) {
            this.hide();
          }
        }
      };
      document.addEventListener("click", this._outsideClickHandler);
    }, 0);

    this.dispatchEvent(new CustomEvent("open", { bubbles: true, composed: true }));
  }

  private _onClose(): void {
    if (this._outsideClickHandler) {
      document.removeEventListener("click", this._outsideClickHandler);
      this._outsideClickHandler = null;
    }

    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  private _setupMobileDetection(): void {
    if (typeof window.matchMedia !== "function") return;
    this._mql = window.matchMedia(MOBILE_QUERY);
    this._mqlHandler = (e: MediaQueryListEvent) => this._syncMobileState(e.matches);
    this._mql.addEventListener("change", this._mqlHandler);
    this._syncMobileState(this._mql.matches);
  }

  private _teardownMobileDetection(): void {
    if (this._mql && this._mqlHandler) {
      this._mql.removeEventListener("change", this._mqlHandler);
    }
    this._mql = null;
    this._mqlHandler = null;
  }

  private _syncMobileState(isMobile: boolean): void {
    // Reset state on mobile/desktop transition so defaults apply
    if (isMobile) {
      this.setAttribute("mobile", "");
      this.setAttribute("state", "collapsed");
    } else {
      this.removeAttribute("mobile");
      this.removeAttribute("overlay");
      this.setAttribute("state", "expanded");
    }
    this.dispatchEvent(
      new CustomEvent("mobilechange", {
        detail: { mobile: isMobile, state: this.state },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
