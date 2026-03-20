import { semanticVar, elevationVar, radiusVar, spaceVar } from "@maneki/foundation";

const ELEVATION_05 = elevationVar("05");
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
    border-radius: ${radiusVar("sm")};
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
