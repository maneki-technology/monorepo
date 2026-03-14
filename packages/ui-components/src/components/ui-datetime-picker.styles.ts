import { semanticVar, elevationVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_PRIMARY = semanticVar("surface", "primary");
const ELEVATION_05 = elevationVar("05");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const TEXT_PRIMARY = semanticVar("text", "primary");
const SP_1 = spaceVar("1");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-block;
    position: relative;
    font-family: Inter, sans-serif;
  }

  :host([match-panel]) {
    display: inline-flex;
    flex-direction: column;
  }

  :host([match-panel]) ui-datetime-picker-input {
    width: 100%;
  }

  :host([match-panel][size="s"]) {
    min-width: 232px;
  }

  :host([match-panel][size="m"]),
  :host([match-panel]:not([size])) {
    min-width: 296px;
  }

  :host([match-panel][size="l"]) {
    min-width: 360px;
  }

  /* Time type uses clock panel widths (smaller) */
  :host([match-panel][type="time"][size="s"]) {
    min-width: 212px;
  }

  :host([match-panel][type="time"][size="m"]),
  :host([match-panel][type="time"]:not([size])) {
    min-width: 228px;
  }

  :host([match-panel][type="time"][size="l"]) {
    min-width: 256px;
  }

  /* ── Dropdown panel ─── */

  .panel {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    margin-top: 4px;
    background: ${SURFACE_PRIMARY};
    box-shadow: ${ELEVATION_05};
    border-radius: 2px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);
    pointer-events: none;
    transition: opacity 0.15s ease, visibility 0.15s ease, transform 0.15s ease;
    overflow: hidden;
  }

  .panel ui-calendar {
    --ui-calendar-elevation: none;
  }

  .panel ui-clock {
    --ui-clock-elevation: none;
  }

  :host([open]) .panel {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      transition: none;
    }
  }

  /* ── Actions bar ─── */

  .actions {
    display: none;
    justify-content: flex-end;
    padding: ${SP_1};
    gap: 4px;
    border-top: 1px solid ${BORDER_MINIMAL};
  }

  :host([show-actions]) .actions {
    display: flex;
  }

  .action-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: Inter, sans-serif;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    padding: 6px 16px;
    border-radius: 2px;
  }

  .action-btn:hover {
    opacity: 0.8;
  }

  .cancel-btn {
    color: ${TEXT_PRIMARY};
  }

  .ok-btn {
    color: var(--fd-border-focus, #186ADE);
  }
`;
