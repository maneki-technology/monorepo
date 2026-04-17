import {
  BORDER_FOCUS,
  BORDER_MINIMAL,
  BW_MD,
  ELEVATION_05,
  RADIUS_LG,
  RADIUS_SM,
  SP_2,
  SURFACE_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY_02,
} from "@maneki/foundation";

// ─── CalendarPanel Styles ────────────────────────────────────────────────────

export const PANEL_STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-block;
    contain: content;
  }

  .panel {
    display: flex;
    flex-direction: column;
    width: var(--cal-panel-width, 284px);
    background: var(--cal-panel-bg, ${SURFACE_PRIMARY});
    border-radius: var(--cal-panel-radius, ${RADIUS_LG});
    box-shadow: var(--cal-panel-shadow, ${ELEVATION_05});
    overflow: hidden;
  }

  /* ─── Slot containers ─── */

  .slot-top {
    padding: ${SP_2} ${SP_2} 0;
  }

  .slot-top:empty {
    display: none;
  }

  .slot-calendar {
    padding: 0 ${SP_2};
  }

  .slot-time {
    padding: 0 ${SP_2};
  }

  .slot-time:empty {
    display: none;
  }

  .slot-bottom {
    padding: 0 ${SP_2} ${SP_2};
  }

  .slot-bottom:empty {
    display: none;
  }

  /* ─── Strip calendar elevation when slotted inside panel ─── */

  ::slotted(maneki-calendar) {
    --cal-elevation: none;
    --cal-bg: transparent;
    --cal-header-py: 0;
    --cal-header-min-h: auto;
    width: 100%;
  }

  /* ─── Actions bar (OK / Cancel) ─── */

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 8px ${SP_2} ${SP_2};
    border-top: 1px solid var(--cal-panel-divider, ${BORDER_MINIMAL});
  }

  .actions:empty {
    display: none;
  }

  .action-btn {
    ${TYPE_BODY_02}
    font-weight: 500;
    padding: 6px 16px;
    border-radius: ${RADIUS_SM};
    border: none;
    cursor: pointer;
    outline: none;
    background: transparent;
    color: var(--cal-panel-action-text, ${TEXT_SECONDARY});
  }

  .action-btn:hover {
    opacity: 0.8;
  }

  .action-btn:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  .action-btn[data-primary] {
    color: var(--cal-panel-action-primary, ${TEXT_PRIMARY});
    font-weight: 600;
  }
`;
