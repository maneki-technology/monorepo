import { semanticVar } from "@maneki/foundation";

const ELEVATION_05 = "0px 8px 10px 0px rgba(0,0,0,0.14), 0px 3px 14px 0px rgba(0,0,0,0.12), 0px 5px 5px 0px rgba(0,0,0,0.2)";
const BORDER_MINIMAL = semanticVar("border", "minimal");
const SURFACE_PRIMARY = semanticVar("surface", "primary");

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    border-radius: 2px;
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
