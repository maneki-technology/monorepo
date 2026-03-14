import { semanticVar, spaceVar, elevationVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_PRIMARY = semanticVar("surface", "primary");
const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const TEXT_PRIMARY = semanticVar("text", "primary");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const BORDER_FOCUS = semanticVar("border", "focus");
const BUTTON_SECONDARY = semanticVar("button", "secondary");
const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const ICON_PRIMARY = semanticVar("icon", "primary");
const ELEVATION_05 = elevationVar("05");
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
    background: ${SURFACE_PRIMARY};
    box-shadow: var(--ui-clock-elevation, ${ELEVATION_05});
    border-radius: 2px;
    font-family: Inter, sans-serif;
  }

  .clock {
    display: flex;
    flex-direction: column;
  }

  /* ─── Hour/Minute toggle ─── */

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 8px;
  }

  .toggle-label {
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    opacity: 0.4;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  .toggle-label:hover {
    opacity: 0.7;
  }

  .toggle-label.toggle-active {
    opacity: 1;
    color: ${BORDER_FOCUS};
  }

  .toggle-sep {
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    opacity: 0.4;
  }
    display: flex;
    flex-direction: column;
  }

  /* ─── Analog clock ─── */

  .clock-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clock-face {
    position: relative;
    border-radius: 50%;
    background: ${SURFACE_SECONDARY};
  }

  .clock-number {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${TEXT_PRIMARY};
    cursor: pointer;
    user-select: none;
    border-radius: 50%;
  }

  .clock-number:hover {
    opacity: 0.7;
  }

  .clock-number[data-selected] {
    background: ${BORDER_FOCUS};
    color: #ffffff;
  }

  .clock-track {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 2px;
    transform-origin: left center;
    background: ${BORDER_FOCUS};
    pointer-events: none;
  }

  .clock-center {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    margin: -3px 0 0 -3px;
    border-radius: 50%;
    background: ${BORDER_FOCUS};
    pointer-events: none;
  }

  /* ─── 24-hour digital ─── */

  .digital-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .digital-row {
    display: flex;
    align-items: center;
  }

  .digital-label {
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    text-align: center;
  }

  .spin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: ${BUTTON_SECONDARY};
    border-radius: 2px;
    cursor: pointer;
    color: ${ICON_PRIMARY};
    flex-shrink: 0;
  }

  .spin-btn:hover {
    opacity: 0.8;
  }

  .digital-input {
    border: 1px solid ${FORM_INPUT_BORDER};
    border-radius: 2px;
    background: ${SURFACE_PRIMARY};
    text-align: center;
    font-family: Inter, sans-serif;
    color: ${TEXT_PRIMARY};
    outline: none;
  }

  .digital-input:focus {
    border-color: ${BORDER_FOCUS};
    box-shadow: 0 0 0 1px ${BORDER_FOCUS};
  }


  /* ─── Size: S ─── */

  :host([size="s"]) .clock-container {
    width: 212px;
    height: 212px;
    padding: 12px;
  }

  :host([size="s"]) .clock-face {
    width: 188px;
    height: 188px;
  }

  :host([size="s"]) .clock-number {
    width: 24px;
    height: 24px;
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .digital-container {
    width: 212px;
    padding: 12px;
    gap: 8px;
  }

  :host([size="s"]) .digital-row {
    gap: 4px;
  }

  :host([size="s"]) .spin-btn {
    padding: 4px;
    --ui-icon-size: 16px;
  }

  :host([size="s"]) .digital-input {
    width: 56px;
    height: 24px;
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .digital-label {
    font-size: 12px;
    line-height: 16px;
    width: 56px;
  }

  /* ─── Size: M (default) ─── */

  :host([size="m"]) .clock-container,
  :host(:not([size])) .clock-container {
    width: 228px;
    height: 228px;
    padding: 16px;
  }

  :host([size="m"]) .clock-face,
  :host(:not([size])) .clock-face {
    width: 196px;
    height: 196px;
  }

  :host([size="m"]) .clock-number,
  :host(:not([size])) .clock-number {
    width: 28px;
    height: 28px;
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="m"]) .digital-container,
  :host(:not([size])) .digital-container {
    width: 228px;
    padding: 16px;
    gap: 12px;
  }

  :host([size="m"]) .digital-row,
  :host(:not([size])) .digital-row {
    gap: 8px;
  }

  :host([size="m"]) .spin-btn,
  :host(:not([size])) .spin-btn {
    padding: 6px;
    --ui-icon-size: 20px;
  }

  :host([size="m"]) .digital-input,
  :host(:not([size])) .digital-input {
    width: 70px;
    height: 32px;
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="m"]) .digital-label,
  :host(:not([size])) .digital-label {
    font-size: 14px;
    line-height: 20px;
    width: 70px;
  }

  /* ─── Size: L ─── */

  :host([size="l"]) .clock-container {
    width: 256px;
    height: 256px;
    padding: 16px;
  }

  :host([size="l"]) .clock-face {
    width: 224px;
    height: 224px;
  }

  :host([size="l"]) .clock-number {
    width: 32px;
    height: 32px;
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .digital-container {
    width: 256px;
    padding: 24px;
    gap: 20px;
  }

  :host([size="l"]) .digital-row {
    gap: 12px;
  }

  :host([size="l"]) .spin-btn {
    padding: 8px;
    --ui-icon-size: 24px;
  }

  :host([size="l"]) .digital-input {
    width: 80px;
    height: 40px;
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .digital-label {
    font-size: 16px;
    line-height: 24px;
    width: 80px;
  }
`;
