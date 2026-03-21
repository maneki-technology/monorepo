import {
  BORDER_MINIMAL,
  BW_SM,
  ICON_PRIMARY,
  TEXT_PRIMARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
} from "@maneki/foundation";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    font-family: Inter, sans-serif;
  }

  .top-border {
    height: ${BW_SM};
    width: 100%;
    background: ${BORDER_MINIMAL};
    flex-shrink: 0;
    opacity: 0;
  }

  :host([top-border]) .top-border {
    opacity: 1;
  }

  .content {
    display: flex;
    align-items: center;
    width: 100%;
    flex-shrink: 0;
  }

  .heading {
    flex: 1 1 0;
    min-width: 0;
    color: ${TEXT_PRIMARY};
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .collapse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    color: ${ICON_PRIMARY};
  }

  .collapse-btn:hover {
    opacity: 0.7;
  }

  .bottom-border {
    height: ${BW_SM};
    width: 100%;
    background: ${BORDER_MINIMAL};
    flex-shrink: 0;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: S                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="s"]) .content {
    height: 34px;
    padding: 0 6px 0 26px;
  }

  :host([size="s"]) .heading {
    ${TYPE_BODY_02}
  }

  :host([size="s"]) .collapse-btn {
    width: 20px;
    height: 20px;
    --ui-icon-size: 20px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: M (default)                                                          */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="m"]) .content,
  :host(:not([size])) .content {
    height: 36px;
    padding: 0 8px 0 28px;
  }

  :host([size="m"]) .heading,
  :host(:not([size])) .heading {
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .collapse-btn,
  :host(:not([size])) .collapse-btn {
    width: 20px;
    height: 20px;
    --ui-icon-size: 20px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: L                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="l"]) .content {
    height: 44px;
    padding: 0 12px 0 32px;
  }

  :host([size="l"]) .heading {
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .collapse-btn {
    width: 24px;
    height: 24px;
    --ui-icon-size: 24px;
  }
`;
