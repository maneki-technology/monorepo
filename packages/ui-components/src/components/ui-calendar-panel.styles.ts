import {
  BORDER_MINIMAL,
  ELEVATION_05,
  RADIUS_SM,
  SURFACE_PRIMARY,
} from "@maneki/foundation";

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    border-radius: ${RADIUS_SM};
    box-shadow: var(--ui-calendar-panel-elevation, ${ELEVATION_05});
    overflow: hidden;
  }

  .body {
    display: flex;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .actions {
    display: none;
    justify-content: flex-end;
    gap: 8px;
    padding: 8px 12px;
    border-top: 1px solid ${BORDER_MINIMAL};
    background: ${SURFACE_PRIMARY};
  }

  :host([show-actions]) .actions {
    display: flex;
  }

  /* Reset children elevation + border-radius */
  ::slotted(ui-calendar) {
    --ui-calendar-elevation: none;
    border-radius: 0 !important;
  }

  ::slotted(ui-calendar-quicklinks) {
    border-radius: 0 !important;
  }

  ::slotted(ui-calendar-time) {
    border-radius: 0 !important;
  }
`;
