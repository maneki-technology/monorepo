import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const BORDER_MINIMAL = semanticVar("border", "minimal");

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

  ::slotted(ui-list-header) {
    flex-shrink: 0;
  }

  ::slotted(ui-list-item) {
    flex-shrink: 0;
  }

  :host([collapsed]) .items {
    display: none;
  }

  .items {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
`;
