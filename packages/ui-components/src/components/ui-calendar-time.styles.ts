import {
  BORDER_MINIMAL,
  FORM_INPUT_BORDER,
  RADIUS_PILL,
  RADIUS_SM,
  SELECTED_BOLD,
  SP_0_5,
  SP_1,
  SP_1_25,
  SURFACE_PRIMARY,
  TEXT_PRIMARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
} from "@maneki/foundation";

export const SELECTED_SUBTLE = "rgba(173, 204, 247, 1)"; // #ADCCF7 — switch track
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
    border-radius: ${RADIUS_SM};
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
    border-radius: ${RADIUS_PILL};
    background: ${SELECTED_SUBTLE};
  }

  .switch-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border-radius: ${RADIUS_PILL};
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
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .colon {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .toggle-group {
    gap: 6px;
  }

  :host([size="s"]) .toggle-label {
    ${TYPE_BODY_03}
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
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .colon,
  :host(:not([size])) .colon {
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .toggle-group,
  :host(:not([size])) .toggle-group {
    gap: 8px;
  }

  :host([size="m"]) .toggle-label,
  :host(:not([size])) .toggle-label {
    ${TYPE_BODY_02}
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
    gap: ${SP_1_25};
  }

  :host([size="l"]) .time-input {
    width: 44px;
    height: 40px;
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .colon {
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .toggle-group {
    gap: ${SP_1_25};
  }

  :host([size="l"]) .toggle-label {
    ${TYPE_BODY_01}
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
