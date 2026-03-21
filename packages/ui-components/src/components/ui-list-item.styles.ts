import {
  BORDER_MINIMAL,
  BW_SM,
  HOVER_MINIMAL,
  ICON_PRIMARY,
  SELECTED_MINIMAL,
  SP_0_5,
  SP_0_75,
  SP_1,
  SP_1_5,
  SP_2,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
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
    cursor: pointer;
    user-select: none;
  }

  :host([disabled]) {
    pointer-events: none;
    opacity: 0.5;
  }

  /* ─── Borders ─── */

  .top-border,
  .bottom-border {
    height: ${BW_SM};
    width: 100%;
    background: ${BORDER_MINIMAL};
    flex-shrink: 0;
  }

  .top-border {
    opacity: 1;
  }

  .bottom-border {
    height: 0;
  }

  :host([top-border]) .top-border {
    opacity: 1;
  }

  :host([bottom-border]) .bottom-border {
    height: ${BW_SM};
  }

  /* ─── Content row ─── */

  .content {
    display: flex;
    align-items: center;
    width: 100%;
    flex-shrink: 0;
  }

  /* ─── Leading element ─── */

  .leading {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  :host([leading="icon"]) .leading,
  :host([leading="avatar"]) .leading,
  :host([leading="radio"]) .leading,
  :host([leading="checkbox"]) .leading {
    display: flex;
  }

  /* ─── Text area ─── */

  .text-area {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
  }

  .top-row {
    display: flex;
    align-items: center;
    gap: ${SP_2};
    width: 100%;
  }

  .primary-text {
    flex: 1 1 0;
    min-width: 0;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .description {
    display: none;
    color: ${TEXT_SECONDARY};
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :host([description]) .description {
    display: block;
  }

  /* ─── Trailing ─── */

  .trailing {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    overflow: clip;
  }

  .tick {
    display: none;
    color: ${ICON_PRIMARY};
  }

  :host([selected]) .tick {
    display: flex;
  }

  .trailing-icon {
    display: none;
    color: ${ICON_PRIMARY};
  }

  :host([trailing-icon]) .trailing-icon {
    display: flex;
  }

  /* ─── States ─── */

  :host(:hover) .content {
    background: ${HOVER_MINIMAL};
  }

  :host(:hover) .content[data-active] {
    background: ${SELECTED_MINIMAL};
  }

  :host([selected]) .content {
    background: transparent;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: S                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="s"]) .content {
    min-height: 28px;
    padding: 6px 0;
  }

  :host([size="s"][description]) .content {
    min-height: 48px;
    padding: 6px 0;
  }

  :host([size="s"]) .text-area {
    gap: ${SP_0_5};
  }

  :host([size="s"]) .primary-text {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .description {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .leading {
    width: 24px;
    height: 24px;
    margin-right: ${SP_1};
  }

  :host([size="s"]) .trailing {
    height: 16px;
  }

  :host([size="s"]) .tick {
    --ui-icon-size: 16px;
  }

  /* Padding */
  :host([size="s"][padding="s"]) .content {
    padding-left: ${SP_1};
    padding-right: ${SP_1};
  }

  :host([size="s"][padding="m"]) .content {
    padding-left: ${SP_2};
    padding-right: ${SP_2};
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: M (default)                                                          */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="m"]) .content,
  :host(:not([size])) .content {
    min-height: 32px;
    padding: 8px 0;
  }

  :host([size="m"][description]) .content,
  :host(:not([size])[description]) .content {
    min-height: 52px;
    padding: 8px 0;
  }

  :host([size="m"]) .text-area,
  :host(:not([size])) .text-area {
    gap: ${SP_0_5};
  }

  :host([size="m"]) .primary-text,
  :host(:not([size])) .primary-text {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="m"]) .description,
  :host(:not([size])) .description {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="m"]) .leading,
  :host(:not([size])) .leading {
    width: 24px;
    height: 24px;
    margin-right: ${SP_1};
  }

  :host([size="m"]) .trailing,
  :host(:not([size])) .trailing {
    height: 20px;
  }

  :host([size="m"]) .tick,
  :host(:not([size])) .tick {
    --ui-icon-size: 16px;
  }

  /* Padding */
  :host([size="m"][padding="s"]) .content,
  :host(:not([size])[padding="s"]) .content {
    padding-left: ${SP_1};
    padding-right: ${SP_1};
  }

  :host([size="m"][padding="m"]) .content,
  :host(:not([size])[padding="m"]) .content {
    padding-left: ${SP_2};
    padding-right: ${SP_2};
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: L                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="l"]) .content {
    min-height: 40px;
    padding: 8px 0;
  }

  :host([size="l"][description]) .content {
    min-height: 60px;
    padding: 8px 0;
  }

  :host([size="l"]) .text-area {
    gap: ${SP_0_5};
  }

  :host([size="l"]) .primary-text {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .description {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .leading {
    width: 32px;
    height: 32px;
    margin-right: ${SP_1_5};
  }

  :host([size="l"]) .trailing {
    height: 24px;
  }

  :host([size="l"]) .tick {
    --ui-icon-size: 20px;
  }

  /* Padding */
  :host([size="l"][padding="s"]) .content {
    padding-left: ${SP_1_5};
    padding-right: ${SP_1_5};
  }

  :host([size="l"][padding="m"]) .content {
    padding-left: ${SP_2};
    padding-right: ${SP_2};
  }
`;
