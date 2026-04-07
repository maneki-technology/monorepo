import {
  BORDER_FOCUS,
  BORDER_MINIMAL,
  BW_MD,
  DISABLED_TEXT,
  ELEVATION_05,
  HOVER_MODERATE,
  ICON_PRIMARY,
  RADIUS_PILL,
  RADIUS_SM,
  SELECTED_BOLD,
  SELECTED_OVERLAY,
  SP_0_5,
  SP_1,
  SP_2,
  SURFACE_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
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
    contain: content;
  }

  .calendar {
    display: flex;
    flex-direction: column;
    background: var(--cal-bg, ${SURFACE_PRIMARY});
  }

  /* ─── Navigation header ─── */

  .header {
    display: flex;
    align-items: center;
    min-height: var(--cal-header-min-h, 56px);
    padding: var(--cal-header-py, 16px) 0;
  }

  .header-label {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    font-weight: 500;
    color: var(--cal-text, ${TEXT_PRIMARY});
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
  }

  .nav-group {
    display: flex;
    align-items: center;
    gap: 0;
    flex-shrink: 0;
  }
  .header-label:hover {
    opacity: 0.8;
  }

  .chevron-expand {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex-shrink: 0;
    transition: transform 0.15s ease;
  }

  .chevron-expand.rotated {
    transform: rotate(90deg);
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: var(--cal-nav-padding, 4px);
    color: var(--cal-icon, ${ICON_PRIMARY});
    border-radius: var(--cal-nav-radius, ${RADIUS_SM});
    outline: none;
  }

  .nav-btn:focus-visible {
    box-shadow: 0 0 0 2px ${BORDER_FOCUS};
  }

  .nav-btn:hover {
    background: var(--cal-hover, ${HOVER_MODERATE});
  }

  .nav-btn svg {
    width: var(--cal-nav-icon, 16px);
    height: var(--cal-nav-icon, 16px);
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  /* ─── DOW row ─── */

  .dow-row {
    display: flex;
    flex-direction: row;
    padding: var(--cal-dow-py, 8px) 0;
  }

  .dow-cell {
    flex: 1 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    color: var(--cal-muted, ${TEXT_SECONDARY});
  }

  /* ─── Day grid ─── */

  .day-grid {
    display: flex;
    flex-direction: column;
    padding: var(--cal-grid-py, 8px) 0;
    gap: var(--cal-row-gap, 2px);
  }

  .day-grid[role="grid"] {
    outline: none;
  }

  .day-row {
    display: flex;
    flex-direction: row;
  }

  .day-cell {
    flex: 1 0 0;
    aspect-ratio: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cal-cell-radius, ${RADIUS_PILL});
    cursor: pointer;
    color: var(--cal-text, ${TEXT_PRIMARY});
    background: transparent;
    user-select: none;
    outline: none;
    border: none;
    padding: 0;
    font: inherit;
  }

  .day-cell:hover:not([data-disabled]):not([data-hidden]) {
    background: var(--cal-hover, ${HOVER_MODERATE});
  }

  .day-cell[data-outside] {
    opacity: 0.5;
    color: var(--cal-muted, ${TEXT_SECONDARY});
  }

  .day-cell[data-hidden] {
    display: none;
  }

  .day-cell[data-today] {
    color: var(--cal-accent, ${BORDER_FOCUS});
    font-weight: 600;
  }

  .day-cell[data-selected] {
    background: var(--cal-selected-bg, ${SELECTED_BOLD});
    color: var(--cal-selected-text, #fcfcfc);
  }

  .day-cell[data-selected]:hover {
    background: var(--cal-selected-bg, ${SELECTED_BOLD});
  }

  .day-cell[data-disabled] {
    opacity: 0.5;
    color: var(--cal-disabled, ${DISABLED_TEXT});
    cursor: default;
    pointer-events: none;
  }

  /* ─── Range selection ─── */

  .day-cell[data-range-start],
  .day-cell[data-range-end] {
    background: var(--cal-selected-bg, ${SELECTED_BOLD});
    color: var(--cal-selected-text, #fcfcfc);
  }

  .day-cell[data-range-start]:hover,
  .day-cell[data-range-end]:hover {
    background: var(--cal-selected-bg, ${SELECTED_BOLD});
  }

  .day-cell[data-in-range] {
    background: var(--cal-range-bg, ${SELECTED_OVERLAY});
    color: var(--cal-accent, ${BORDER_FOCUS});
    border-radius: 0;
  }

  .day-cell[data-range-hover] {
    background: var(--cal-hover, ${HOVER_MODERATE});
  }

  .day-cell:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ─── Event dots ─── */

  .event-dots {
    position: absolute;
    bottom: var(--cal-dot-bottom, 4px);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 2px;
    pointer-events: none;
  }

  .event-dot {
    width: var(--cal-dot-size, 3px);
    height: var(--cal-dot-size, 3px);
    border-radius: ${RADIUS_PILL};
    background: var(--cal-muted, ${TEXT_SECONDARY});
  }

  .day-cell[data-selected] .event-dot,
  .day-cell[data-range-start] .event-dot,
  .day-cell[data-range-end] .event-dot {
    background: var(--cal-selected-text, #fcfcfc);
  }

  /* ─── Month grid ─── */

  .month-grid {
    display: flex;
    flex-direction: column;
    gap: var(--cal-month-gap, 4px);
    padding: var(--cal-grid-py, 8px) 0;
  }

  .month-row {
    display: flex;
    flex-direction: row;
    gap: var(--cal-month-gap, 4px);
  }

  .month-cell {
    flex: 1 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cal-cell-radius, ${RADIUS_PILL});
    cursor: pointer;
    color: var(--cal-text, ${TEXT_PRIMARY});
    background: transparent;
    user-select: none;
    outline: none;
    border: none;
    padding: 8px 0;
    font: inherit;
  }

  .month-cell:hover {
    background: var(--cal-hover, ${HOVER_MODERATE});
  }

  .month-cell[data-selected] {
    background: var(--cal-selected-bg, ${SELECTED_BOLD});
    color: var(--cal-selected-text, #fcfcfc);
  }

  .month-cell[data-today] {
    color: var(--cal-accent, ${BORDER_FOCUS});
    font-weight: 600;
  }

  .month-cell:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ─── Year grid ─── */

  .year-grid {
    display: flex;
    flex-direction: column;
    gap: var(--cal-month-gap, 4px);
    padding: var(--cal-grid-py, 8px) 0;
  }

  .year-row {
    display: flex;
    flex-direction: row;
    gap: var(--cal-month-gap, 4px);
  }

  .year-cell {
    flex: 1 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--cal-cell-radius, ${RADIUS_PILL});
    cursor: pointer;
    color: var(--cal-text, ${TEXT_PRIMARY});
    background: transparent;
    user-select: none;
    outline: none;
    border: none;
    padding: 8px 0;
    font: inherit;
  }

  .year-cell:hover {
    background: var(--cal-hover, ${HOVER_MODERATE});
  }

  .year-cell[data-selected] {
    background: var(--cal-selected-bg, ${SELECTED_BOLD});
    color: var(--cal-selected-text, #fcfcfc);
  }

  .year-cell[data-today] {
    color: var(--cal-accent, ${BORDER_FOCUS});
    font-weight: 600;
  }

  .year-cell:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: S                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="s"]) .calendar {
    width: var(--cal-width, 220px);
    padding: ${SP_0_5};
  }

  :host([size="s"]) .header {
    min-height: 40px;
    padding: 8px 0;
  }

  :host([size="s"]) .header-label {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .nav-btn svg {
    width: 14px;
    height: 14px;
  }

  :host([size="s"]) .dow-cell {
    ${TYPE_CAPTION_01}
  }

  :host([size="s"]) .day-cell {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .month-cell,
  :host([size="s"]) .year-cell {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .event-dot {
    width: 2px;
    height: 2px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: M (default)                                                          */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="m"]) .calendar,
  :host(:not([size])) .calendar {
    width: var(--cal-width, 252px);
  }

  :host([size="m"]) .header-label,
  :host(:not([size])) .header-label {
    ${TYPE_BODY_02}
    font-weight: 500;
  }

  :host([size="m"]) .dow-cell,
  :host(:not([size])) .dow-cell {
    ${TYPE_BODY_02}
    font-weight: 500;
  }

  :host([size="m"]) .day-cell,
  :host(:not([size])) .day-cell {
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .month-cell,
  :host(:not([size])) .month-cell,
  :host([size="m"]) .year-cell,
  :host(:not([size])) .year-cell {
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .event-dot,
  :host(:not([size])) .event-dot {
    width: 3px;
    height: 3px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: L                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="l"]) .calendar {
    width: var(--cal-width, 320px);
    padding: ${SP_1};
  }

  :host([size="l"]) .header {
    min-height: 64px;
    padding: 20px 0;
  }

  :host([size="l"]) .header-label {
    ${TYPE_BODY_01}
    font-weight: 500;
  }

  :host([size="l"]) .nav-btn svg {
    width: 20px;
    height: 20px;
  }

  :host([size="l"]) .dow-cell {
    ${TYPE_BODY_02}
    font-weight: 500;
  }

  :host([size="l"]) .day-cell {
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .month-cell,
  :host([size="l"]) .year-cell {
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .event-dot {
    width: 4px;
    height: 4px;
  }

  /* ─── Reduced motion ─── */

  @media (prefers-reduced-motion: reduce) {
    .chevron-expand {
      transition: none;
    }
  }
`;
