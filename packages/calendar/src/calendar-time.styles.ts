import {
  BORDER_FOCUS,
  BW_MD,
  RADIUS_MD,
  RADIUS_PILL,
  SP_1,
  SP_1_5,
  SP_2,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY_02,
} from "@maneki/foundation";

// ─── CalendarTime Styles ─────────────────────────────────────────────────────

export const TIME_STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    contain: content;
  }

  .time-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: var(--cal-time-pt, ${SP_1_5});
    min-height: var(--cal-time-min-h, 48px);
  }

  .time-label {
    ${TYPE_BODY_02}
    font-weight: 500;
    color: var(--cal-time-label, ${TEXT_PRIMARY});
    user-select: none;
  }

  /* ─── Input wrapper ─── */

  .time-input {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--cal-time-input-bg, ${SURFACE_SECONDARY});
    border-radius: ${RADIUS_PILL};
    padding: 8px ${SP_1_5};
    min-height: 32px;
  }

  /* ─── Segments ─── */

  .segment {
    ${TYPE_BODY_02}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    padding: 0 2px;
    border-radius: ${RADIUS_MD};
    color: var(--cal-time-segment, ${TEXT_SECONDARY});
    border: none;
    background: transparent;
    cursor: pointer;
    outline: none;
    text-align: center;
    font-variant-numeric: tabular-nums;
    user-select: none;
  }

  .segment[data-filled] {
    color: var(--cal-time-segment-filled, ${TEXT_PRIMARY});
  }

  .segment:focus-visible {
    background: var(--cal-time-segment-focus-bg, ${BORDER_FOCUS});
    color: var(--cal-time-segment-focus-text, #fcfcfc);
    outline: none;
  }

  .separator {
    ${TYPE_BODY_02}
    color: var(--cal-time-separator, ${TEXT_SECONDARY});
    user-select: none;
    pointer-events: none;
  }

  .period {
    ${TYPE_BODY_02}
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 0 2px;
    border-radius: ${RADIUS_MD};
    color: var(--cal-time-segment, ${TEXT_SECONDARY});
    border: none;
    background: transparent;
    cursor: pointer;
    outline: none;
    text-align: center;
    user-select: none;
    margin-left: 2px;
  }

  .period[data-filled] {
    color: var(--cal-time-segment-filled, ${TEXT_PRIMARY});
  }

  .period:focus-visible {
    background: var(--cal-time-segment-focus-bg, ${BORDER_FOCUS});
    color: var(--cal-time-segment-focus-text, #fcfcfc);
    outline: none;
  }

  .timezone {
    ${TYPE_BODY_02}
    color: var(--cal-time-tz, ${TEXT_SECONDARY});
    margin-left: 4px;
    user-select: none;
    pointer-events: none;
  }
`;
