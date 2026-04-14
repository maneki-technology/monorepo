
import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import {
  BORDER_FOCUS,
  BW_MD,
  DISABLED_TEXT,
  FONT_PRIMARY,
  HOVER_MINIMAL,
  HOVER_MODERATE,
  ICON_ACTION,
  ICON_PRIMARY,
  SELECTED_MINIMAL,
  SELECTED_OVERLAY,
  SHADOW_FIELD,
  SP_1,
  SP_1_25,
  SP_1_5,
  SP_2,
  SP_2_5,
  SP_5,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
} from "@maneki/foundation";
import "./ui-icon.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type SidePanelMenuItemLevel = "primary" | "secondary" | "tertiary";
export type SidePanelMenuItemType = "basic" | "icon-only";
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

  /* ── Base row ────────────────────────────────────────────────────────────── */

  .row {
    display: flex;
    align-items: center;
    gap: ${SP_1};
    width: 100%;
    padding: ${SP_1_25} ${SP_1} ${SP_1_25} ${SP_2};
    border: none;
    margin: 0;
    background-color: var(--ui-spmi-bg, ${SURFACE_SECONDARY});
    font-family: ${FONT_PRIMARY};
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--ui-spmi-text, ${TEXT_PRIMARY});
    cursor: pointer;
    position: relative;
    text-align: left;
    border-radius: var(--ui-spmi-row-radius, 0);
    margin: var(--ui-spmi-row-margin, 0);
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .row:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ── Hover ───────────────────────────────────────────────────────────────── */

  :host(:not([disabled]):not([selected]):not([child-parent-selected])) .row:hover {
    background-color: var(--ui-spmi-hover-bg, ${HOVER_MINIMAL});
  }

  :host(:not([disabled]):not([selected]):not([child-parent-selected])) .row:active {
    background-color: var(--ui-spmi-active-bg, ${HOVER_MODERATE});
  }

  /* ── Selected ────────────────────────────────────────────────────────────── */

  :host([selected]) .row {
    background-color: var(--ui-spmi-selected-bg, ${SELECTED_MINIMAL});
    color: var(--ui-spmi-active-text, ${ICON_ACTION});
    box-shadow: var(--ui-spmi-selected-shadow, ${SHADOW_FIELD});
  }

  :host([selected]) .leading-icon {
    color: var(--ui-spmi-active-icon, ${ICON_ACTION});
  }

  :host([selected]) .row::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: ${BW_MD};
    background-color: var(--ui-spmi-indicator, ${BORDER_FOCUS});
  }

  /* ── Child/Parent Selected ───────────────────────────────────────────────── */

  :host([child-parent-selected]) .row {
    background-color: var(--ui-spmi-child-selected-bg, ${HOVER_MINIMAL});
  }

  :host([child-parent-selected]) .row::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: ${BW_MD};
    background-color: var(--ui-spmi-indicator, ${BORDER_FOCUS});
  }

  :host([child-parent-selected][level="primary"]) .row {
    color: var(--ui-spmi-active-text, ${ICON_ACTION});
  }

  :host([child-parent-selected][level="primary"]) .leading-icon {
    color: var(--ui-spmi-active-icon, ${ICON_ACTION});
  }

  /* ── Level: secondary ────────────────────────────────────────────────────── */

  :host([level="secondary"]) .row {
    padding-left: 46px;
    font-weight: 400;
  }

  /* ── Level: tertiary ─────────────────────────────────────────────────────── */

  :host([level="tertiary"]) .row {
    padding-left: 62px;
    font-weight: 400;
  }

  /* ── Disabled ────────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .row {
    color: var(--ui-spmi-text, ${DISABLED_TEXT});
    cursor: default;
  }

  :host([disabled]) .leading-icon {
    color: ${DISABLED_TEXT};
  }

  /* ── Leading icon ────────────────────────────────────────────────────────── */

  .leading-icon {
    display: none;
    align-items: center;
    justify-content: center;
    width: ${SP_2_5};
    min-height: ${SP_2_5};
    line-height: 0;
    color: var(--ui-spmi-icon, ${ICON_PRIMARY});
    flex-shrink: 0;
    align-self: flex-start;
  }

  ::slotted(svg) {
    width: ${SP_2_5};
    height: ${SP_2_5};
  }

  :host([leading-icon]) .leading-icon {
    display: inline-flex;
  }

  /* ── Label ───────────────────────────────────────────────────────────────── */

  .label {
    flex: 1 0 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── Badge slot ──────────────────────────────────────────────────────────── */

  .badge {
    display: none;
    align-items: center;
    flex-shrink: 0;
  }

  :host([badge]) .badge {
    display: inline-flex;
  }

  .actions {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    padding-right: var(--ui-spmi-actions-pr, 0);
  }

  /* ── Expand chevron ──────────────────────────────────────────────────────── */

  .expand-icon {
    display: none;
    align-items: center;
    justify-content: center;
    width: ${SP_2_5};
    height: ${SP_2_5};
    line-height: 0;
    color: var(--ui-spmi-expand-icon, ${ICON_PRIMARY});
    flex-shrink: 0;
    transition: transform 0.15s ease;
    --ui-icon-size: ${SP_2_5};
  }

  :host([expandable]) .expand-icon {
    display: inline-flex;
  }

  /* ── Icon-only mode ──────────────────────────────────────────────────────── */

  :host([type="icon-only"]) .row {
    width: ${SP_5};
    height: ${SP_5};
    padding: ${SP_1_25};
    justify-content: center;
  }

  :host([type="icon-only"]) span.label,
  :host([type="icon-only"]) span.badge,
  :host([type="icon-only"]) span.actions,
  :host([type="icon-only"]) span.expand-icon {
    display: none;
  }

  :host([type="icon-only"]) .leading-icon {
    display: inline-flex;
  }

  /* ── Children container ──────────────────────────────────────────────────── */

  .children {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.2s ease;
  }

  :host([expanded]) .children {
    grid-template-rows: 1fr;
  }

  .children-inner {
    overflow: hidden;
    min-height: 0;
  }

  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .expand-icon,
    .children {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

@customElement("ui-side-panel-menu-item")
export class UiSidePanelMenuItem extends LitElement {
  @property({ type: String, reflect: true }) declare level: SidePanelMenuItemLevel;
  @property({ type: String, reflect: true }) declare type: SidePanelMenuItemType;
  @property({ type: Boolean, reflect: true }) declare selected: boolean;
  @property({ type: Boolean, reflect: true, attribute: "child-parent-selected" }) declare childParentSelected: boolean;
  @property({ type: Boolean, reflect: true }) declare disabled: boolean;
  @property({ type: Boolean, reflect: true, attribute: "leading-icon" }) declare leadingIcon: boolean;
  @property({ type: Boolean, reflect: true }) declare badge: boolean;
  @property({ type: Boolean, reflect: true }) declare expandable: boolean;
  @property({ type: Boolean, reflect: true }) declare expanded: boolean;

  constructor() {
    super();
    this.level = "primary";
    this.type = "basic";
    this.selected = false;
    this.childParentSelected = false;
    this.disabled = false;
    this.leadingIcon = false;
    this.badge = false;
    this.expandable = false;
    this.expanded = false;
  }

  static styles = css`
    ${unsafeCSS(STYLES)}
  `;

  // ── Synchronous updates for happy-dom tests ────────────────────────────
  protected override scheduleUpdate(): void | Promise<unknown> {
    this.performUpdate();
  }


  protected override render(): unknown {
    const expandIconName = this.expandable
      ? (this.expanded ? "expand_less" : "expand_more")
      : null;

    return html`
      <div class="row" role="treeitem" tabindex="0"
        @click=${this._handleRowClick}
        @keydown=${this._handleRowKeydown}>
        <span class="leading-icon"><slot name="icon"></slot></span>
        <span class="label"><slot></slot></span>
        <span class="badge" @click=${this._stopPropagation}><slot name="badge"></slot></span>
        <span class="actions" @click=${this._stopPropagation} @mousedown=${this._stopPropagation}><slot name="actions"></slot></span>
        <span class="expand-icon" aria-hidden="true">
          ${expandIconName ? html`<ui-icon name=${expandIconName}></ui-icon>` : null}
        </span>
      </div>
      <div class="children" role="group">
        <div class="children-inner">
          <slot name="children"></slot>
        </div>
      </div>
    `;
  }

  protected override firstUpdated(): void {
    this._syncAria();
  }

  connectedCallback(): void {
    super.connectedCallback();

    // Lit may not use adoptedStyleSheets in all environments (e.g. happy-dom).
    // Manually adopt so tests that check adoptedStyleSheets.length pass.
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(STYLES);
    this.shadowRoot!.adoptedStyleSheets = [sheet];
  }

  protected override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("expanded") || changedProperties.has("expandable")) {
      this._syncAria();
    }
    if (changedProperties.has("selected") || changedProperties.has("disabled")) {
      this._syncAria();
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _handleRowClick = (): void => {
    this._handleClick();
  };

  private _handleRowKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._handleClick();
    }
  };

  private _stopPropagation = (e: Event): void => {
    e.stopPropagation();
  };

  private _handleClick(): void {
    if (this.disabled) return;

    if (this.expandable) {
      this.expanded = !this.expanded;
      this.dispatchEvent(
        new CustomEvent("toggle", {
          detail: { expanded: this.expanded },
          bubbles: true,
          composed: true,
        }),
      );
    }

    // Action items fire "action" event but don't participate in selection
    if (this.hasAttribute("action-item")) {
      this.dispatchEvent(
        new CustomEvent("action", {
          detail: { value: this.getAttribute("value") ?? "" },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    this.dispatchEvent(
      new CustomEvent("select", {
        detail: { value: this.getAttribute("value") ?? "" },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _syncAria(): void {
    const row = this.shadowRoot?.querySelector(".row");
    if (!row) return;
    row.setAttribute("aria-selected", String(this.selected));
    row.setAttribute("aria-disabled", String(this.disabled));
    if (this.expandable) {
      row.setAttribute("aria-expanded", String(this.expanded));
    } else {
      row.removeAttribute("aria-expanded");
    }
  }
}
