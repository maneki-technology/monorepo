import {
  BORDER_FOCUS,
  BORDER_MINIMAL,
  BW_MD,
  DISABLED_TEXT,
  ELEVATION_05,
  HOVER_MODERATE,
  ICON_PRIMARY,
  RADIUS_MD,
  RADIUS_PILL,
  RADIUS_SM,
  SELECTED_BOLD,
  SELECTED_OVERLAY,
  SP_0_5,
  SP_1,
  SP_1_5,
  SURFACE_PRIMARY,
  TAG_TEXT_SUBTLE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
} from "@maneki/foundation";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-block;
    background: ${SURFACE_PRIMARY};
    box-shadow: var(--ui-calendar-elevation, ${ELEVATION_05});
    border-radius: ${RADIUS_MD};
    font-family: Inter, sans-serif;
  }

  .calendar {
    display: flex;
    flex-direction: column;
  }

  /* ─── Header: month/year nav ─── */

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${SURFACE_PRIMARY};
    padding: 0 ${SP_0_5};
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: ${ICON_PRIMARY};
  }

  .nav-btn:hover {
    opacity: 0.8;
  }

  .header-label {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    overflow: hidden;
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
    cursor: pointer;
  }

  .header-label:hover {
    opacity: 0.8;
  }

  /* ─── DOW row ─── */

  .dow-row {
    display: grid;
  }

  .dow-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    color: ${TEXT_SECONDARY};
  }

  /* ─── Day grid ─── */

  .day-grid {
    display: grid;
  }

  .day-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: ${TEXT_PRIMARY};
    background: ${SURFACE_PRIMARY};
    user-select: none;
  }

  .day-cell:hover {
    background: ${HOVER_MODERATE};
    border-radius: ${RADIUS_SM};
  }

  .day-cell[data-outside] {
    color: ${TEXT_TERTIARY};
  }

  .day-cell[data-today] {
    box-shadow: inset 0 0 0 1px ${BORDER_FOCUS};
    color: ${TAG_TEXT_SUBTLE};
  }

  .day-cell[data-selected] {
    background: ${SELECTED_BOLD};
    color: #ffffff;
    box-shadow: none;
    border-radius: ${RADIUS_SM};
  }

  .day-cell[data-disabled] {
    color: ${DISABLED_TEXT};
    cursor: default;
    pointer-events: none;
  }

  .day-cell[data-disabled]:hover {
    background: ${SURFACE_PRIMARY};
  }

  /* ─── Range selection ─── */

  .day-cell[data-range-start] {
    background: ${SELECTED_BOLD};
    color: #ffffff;
    box-shadow: none;
    border-radius: ${RADIUS_SM} 0 0 ${RADIUS_SM};
  }

  .day-cell[data-range-end] {
    background: ${SELECTED_BOLD};
    color: #ffffff;
    box-shadow: none;
    border-radius: 0 ${RADIUS_SM} ${RADIUS_SM} 0;
  }

  .day-cell[data-range-start][data-range-end] {
    border-radius: ${RADIUS_SM};
  }

  .day-cell[data-in-range] {
    background: ${SELECTED_OVERLAY};
    color: ${TAG_TEXT_SUBTLE};
  }

  .day-cell[data-range-hover] {
    background: ${HOVER_MODERATE};
  }

  .day-cell[data-today][data-in-range] {
    box-shadow: inset 0 0 0 1px ${BORDER_FOCUS};
    background: rgba(24, 106, 222, 0.3);
    color: ${TAG_TEXT_SUBTLE};
  }

  .day-cell:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ─── Monthly grid ─── */

  .month-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .month-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: ${TEXT_PRIMARY};
    background: ${SURFACE_PRIMARY};
    border: 1px solid transparent;
    user-select: none;
  }

  .month-cell:hover {
    background: ${HOVER_MODERATE};
  }

  .month-cell[data-selected] {
    background: ${SELECTED_BOLD};
    color: #ffffff;
    border-color: transparent;
  }

  .month-cell[data-today] {
    border-color: ${BORDER_FOCUS};
    color: ${TAG_TEXT_SUBTLE};
  }

  .month-cell:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ─── Event dots ─── */

  .event-dots {
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
  }

  .event-dot {
    border-radius: ${RADIUS_PILL};
  }

  /* ─── Legend ─── */

  .legend {
    border-top: 1px solid ${BORDER_MINIMAL};
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
  }

  :host([size="s"]) .legend {
    margin: 0 calc(-1 * ${SP_0_5}) calc(-1 * ${SP_0_5});
  }

  :host([size="m"]) .legend,
  :host(:not([size])) .legend {
    margin: 0 calc(-1 * ${SP_1}) calc(-1 * ${SP_1});
  }

  :host([size="l"]) .legend {
    margin: 0 calc(-1 * ${SP_1_5}) calc(-1 * ${SP_1_5});
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legend-dot {
    width: 6px;
    height: 6px;
    border-radius: ${RADIUS_MD};
    flex-shrink: 0;
  }

  .legend-label {
    ${TYPE_BODY_03}
    color: ${TEXT_PRIMARY};
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: S                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="s"]) .calendar {
    width: 232px;
    padding: ${SP_0_5};
    gap: ${SP_0_5};
  }

  :host([size="s"]) .header {
    padding: ${SP_0_5} 0;
  }

  :host([size="s"]) .nav-btn {
    width: 16px;
    height: 16px;
    --ui-icon-size: 16px;
  }

  :host([size="s"]) .header-label {
    height: 16px;
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .dow-row,
  :host([size="s"]) .day-grid {
    grid-template-columns: repeat(7, 32px);
  }

  :host([size="s"]) .dow-cell {
    height: 16px;
    ${TYPE_CAPTION_01}
  }

  :host([size="s"]) .day-cell {
    height: 28px;
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .month-cell {
    height: 28px;
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .month-grid {
    gap: 4px;
  }

  :host([size="s"]) .event-dot {
    width: 3px;
    height: 3px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: M (default)                                                          */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="m"]) .calendar,
  :host(:not([size])) .calendar {
    width: 296px;
    padding: ${SP_1};
    gap: ${SP_0_5};
  }

  :host([size="m"]) .header,
  :host(:not([size])) .header {
    padding: ${SP_0_5} 0;
  }

  :host([size="m"]) .nav-btn,
  :host(:not([size])) .nav-btn {
    width: 20px;
    height: 20px;
    --ui-icon-size: 20px;
  }

  :host([size="m"]) .header-label,
  :host(:not([size])) .header-label {
    height: 20px;
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .dow-row,
  :host(:not([size])) .dow-row,
  :host([size="m"]) .day-grid,
  :host(:not([size])) .day-grid {
    grid-template-columns: repeat(7, 40px);
  }

  :host([size="m"]) .dow-cell,
  :host(:not([size])) .dow-cell {
    height: 16px;
    ${TYPE_CAPTION_01}
  }

  :host([size="m"]) .day-cell,
  :host(:not([size])) .day-cell {
    height: 36px;
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .month-cell,
  :host(:not([size])) .month-cell {
    height: 36px;
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .month-grid,
  :host(:not([size])) .month-grid {
    gap: 8px;
  }

  :host([size="m"]) .event-dot,
  :host(:not([size])) .event-dot {
    width: 4px;
    height: 4px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: L                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="l"]) .calendar {
    width: 360px;
    padding: 12px;
    gap: ${SP_1};
  }

  :host([size="l"]) .header {
    padding: ${SP_0_5} 0;
  }

  :host([size="l"]) .nav-btn {
    width: 24px;
    height: 24px;
    --ui-icon-size: 24px;
  }

  :host([size="l"]) .header-label {
    height: 24px;
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .dow-row,
  :host([size="l"]) .day-grid {
    grid-template-columns: repeat(7, 48px);
  }

  :host([size="l"]) .dow-cell {
    height: 20px;
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .day-cell {
    height: 44px;
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .month-cell {
    height: 44px;
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .month-grid {
    gap: 12px;
  }

  :host([size="l"]) .event-dot {
    width: 4px;
    height: 4px;
  }
`;
