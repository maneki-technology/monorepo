import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

export const SURFACE_PRIMARY = semanticVar("surface", "primary");
export const TEXT_PRIMARY = semanticVar("text", "primary");
export const BORDER_MINIMAL = semanticVar("border", "minimal");
export const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
export const SELECTED_BOLD = semanticVar("stateSelected", "surfaceBold");
export const SELECTED_SUBTLE = "rgba(173, 204, 247, 1)"; // #ADCCF7 — switch track
export const SP_1 = spaceVar("1");
export const SP_0_5 = spaceVar("0.5");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    background: ${SURFACE_PRIMARY};
    font-family: Inter, sans-serif;
  }

  .container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .separator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${BORDER_MINIMAL};
  }

  .time-group {
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  /* ─── Inputs ─── */

  .time-input {
    border: 1px solid ${FORM_INPUT_BORDER};
    border-radius: 2px;
    background: ${SURFACE_PRIMARY};
    color: ${TEXT_PRIMARY};
    font-family: Inter, sans-serif;
    text-align: center;
    padding: 0;
    outline: none;
    -moz-appearance: textfield;
  }

  .time-input::-webkit-inner-spin-button,
  .time-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .time-input:focus {
    border-color: ${SELECTED_BOLD};
  }

  .colon {
    color: ${TEXT_PRIMARY};
    font-weight: 500;
    user-select: none;
  }

  /* ─── AM/PM Toggle ─── */

  .toggle-group {
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  .toggle-label {
    font-family: Inter, sans-serif;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
  }

  .toggle-label[data-active] {
    color: ${SELECTED_BOLD};
  }

  .switch {
    position: relative;
    cursor: pointer;
    flex-shrink: 0;
  }

  .switch-track {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    border-radius: 999px;
    background: ${SELECTED_SUBTLE};
  }

  .switch-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 999px;
    background: ${SELECTED_BOLD};
    transition: left 0.15s ease, right 0.15s ease;
  }

  .switch[data-pm] .switch-handle {
    left: auto;
    right: 0;
  }

  .switch:not([data-pm]) .switch-handle {
    left: 0;
    right: auto;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: S                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="s"]) .container {
    height: 40px;
    gap: 12px;
  }

  :host([size="s"]) .time-group {
    gap: 4px;
  }

  :host([size="s"]) .time-input {
    width: 28px;
    height: 24px;
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .colon {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .toggle-group {
    gap: 6px;
  }

  :host([size="s"]) .toggle-label {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .switch {
    width: 24px;
    height: 14px;
  }

  :host([size="s"]) .switch-track {
    height: 3px;
  }

  :host([size="s"]) .switch-handle {
    width: 14px;
    height: 14px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: M (default)                                                          */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="m"]) .container,
  :host(:not([size])) .container {
    height: 48px;
    gap: 16px;
  }

  :host([size="m"]) .time-group,
  :host(:not([size])) .time-group {
    gap: 8px;
  }

  :host([size="m"]) .time-input,
  :host(:not([size])) .time-input {
    width: 36px;
    height: 32px;
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="m"]) .colon,
  :host(:not([size])) .colon {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="m"]) .toggle-group,
  :host(:not([size])) .toggle-group {
    gap: 8px;
  }

  :host([size="m"]) .toggle-label,
  :host(:not([size])) .toggle-label {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="m"]) .switch,
  :host(:not([size])) .switch {
    width: 28px;
    height: 16px;
  }

  :host([size="m"]) .switch-track,
  :host(:not([size])) .switch-track {
    height: 4px;
  }

  :host([size="m"]) .switch-handle,
  :host(:not([size])) .switch-handle {
    width: 16px;
    height: 16px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: L                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="l"]) .container {
    height: 56px;
    gap: 20px;
  }

  :host([size="l"]) .time-group {
    gap: 10px;
  }

  :host([size="l"]) .time-input {
    width: 44px;
    height: 40px;
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .colon {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .toggle-group {
    gap: 10px;
  }

  :host([size="l"]) .toggle-label {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .switch {
    width: 32px;
    height: 20px;
  }

  :host([size="l"]) .switch-track {
    height: 5px;
  }

  :host([size="l"]) .switch-handle {
    width: 20px;
    height: 20px;
  }
`;
