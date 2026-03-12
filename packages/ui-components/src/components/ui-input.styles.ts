import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const TEXT_TERTIARY = semanticVar("text", "tertiary");
const HOVER_BORDER = semanticVar("stateHover", "borderModerate");
const BORDER_FOCUS = semanticVar("border", "focus");
const DISABLED_BORDER = semanticVar("stateDisabled", "border");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const STATUS_ERROR = semanticVar("statusGeneral", "error");
const STATUS_WARNING = semanticVar("statusGeneral", "warning");
const STATUS_SUCCESS = semanticVar("statusGeneral", "success");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const ICON_PRIMARY = semanticVar("icon", "primary");
const SP_05 = spaceVar("0.5");
const SP_1 = spaceVar("1");
const SP_15 = spaceVar("1.5");

// ─── Status icon map ─────────────────────────────────────────────────────────

export const STATUS_ICON_MAP: Record<string, string> = {
  warning: "warning",
  error: "error",
  success: "check_circle",
  loading: "progress_activity",
};

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    gap: ${SP_05};
    font-family: "Inter", sans-serif;
  }

  /* ── Label row ─────────────────────────────────────────────────────────── */

  .label-row {
    display: none;
    align-items: baseline;
    gap: ${SP_1};
  }

  :host([label]) .label-row {
    display: flex;
  }

  .label-row ui-label {
    display: inline;
  }

  /* ── Input container ───────────────────────────────────────────────────── */

  .input-container {
    display: flex;
    align-items: center;
    border: 1px solid var(--ui-input-border, ${FORM_INPUT_BORDER});
    border-radius: 2px;
    background-color: var(--ui-input-bg, #ffffff);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    overflow: hidden;
  }

  /* ── Native input ──────────────────────────────────────────────────────── */

  .native-input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    color: var(--ui-input-color, ${TEXT_PRIMARY});
    padding: 0;
    margin: 0;
    -moz-appearance: textfield;
  }

  .native-input::-webkit-outer-spin-button,
  .native-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .native-input::placeholder {
    color: var(--ui-input-placeholder-color, ${TEXT_TERTIARY});
  }

  /* ── Slots (leading / trailing) ────────────────────────────────────────── */

  .leading-slot,
  .trailing-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${TEXT_SECONDARY};
  }

  .leading-slot ::slotted(*) {
    display: flex;
    align-items: center;
  }

  .trailing-slot ::slotted(*) {
    display: flex;
    align-items: center;
  }

  /* ── Status icon ───────────────────────────────────────────────────────── */

  .status-icon {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: var(--_status-icon-size);
    line-height: 1;
  }

  :host([status="warning"]) .status-icon {
    display: flex;
    color: ${STATUS_WARNING};
  }

  :host([status="error"]) .status-icon,
  :host([error]) .status-icon {
    display: flex;
    color: ${STATUS_ERROR};
  }

  :host([status="success"]) .status-icon {
    display: flex;
    color: ${STATUS_SUCCESS};
  }

  :host([status="loading"]) .status-icon {
    display: flex;
    color: ${TEXT_SECONDARY};
  }

  :host([status="loading"]) .status-icon ui-icon {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* ── Clear button ──────────────────────────────────────────────────────── */

  .clear-btn {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: ${TEXT_SECONDARY};
    line-height: 1;
  }

  .clear-btn:hover {
    color: ${TEXT_PRIMARY};
  }

  :host([type="clearable"]) .clear-btn.has-value {
    display: flex;
  }

  /* ── Password toggle ──────────────────────────────────────────────────── */

  .password-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: ${ICON_PRIMARY};
    line-height: 1;
  }

  .password-toggle:hover {
    color: ${TEXT_PRIMARY};
  }

  :host([type="password"]) .password-toggle {
    display: flex;
  }

  /* ── Numeric spinner ───────────────────────────────────────────────────── */

  .numeric-controls {
    display: none;
    flex-direction: column;
    flex-shrink: 0;
    border-left: 1px solid ${BORDER_MINIMAL};
    align-self: stretch;
  }

  :host([type="numeric"]) .numeric-controls {
    display: flex;
  }

  .spinner-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    color: ${TEXT_SECONDARY};
    line-height: 1;
    --ui-icon-size: var(--_numeric-icon-size, 20px);
  }

  .spinner-btn:hover {
    background-color: ${SURFACE_SECONDARY};
    color: ${TEXT_PRIMARY};
  }

  .spinner-divider {
    height: 1px;
    background-color: ${BORDER_MINIMAL};
  }

  /* ── Supportive text ───────────────────────────────────────────────────── */

  .supportive-text {
    display: none;
    font-size: 11px;
    line-height: 16px;
    color: var(--ui-input-supportive-color, ${TEXT_SECONDARY});
  }

  :host([supportive]) .supportive-text {
    display: block;
  }

  :host([status="warning"]) .supportive-text {
    color: ${STATUS_WARNING};
  }

  :host([status="error"]) .supportive-text,
  :host([error]) .supportive-text {
    color: ${STATUS_ERROR};
  }

  :host([status="success"]) .supportive-text {
    color: ${STATUS_SUCCESS};
  }

  /* ── Size: m (default) ─────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    --_input-height: 32px;
    --_input-padding-left: ${SP_1};
    --_input-font-size: 14px;
    --_input-line-height: 20px;
    --_status-icon-size: 18px;
    --_clear-size: 16px;
    --_numeric-width: 24px;
    --_numeric-icon-size: 14px;
  }

  /* ── Size: s ───────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_input-height: 24px;
    --_input-padding-left: ${SP_1};
    --_input-font-size: 12px;
    --_input-line-height: 16px;
    --_status-icon-size: 14px;
    --_clear-size: 12px;
    --_numeric-width: 20px;
    --_numeric-icon-size: 10px;
  }

  /* ── Size: l ───────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_input-height: 40px;
    --_input-padding-left: ${SP_15};
    --_input-font-size: 16px;
    --_input-line-height: 24px;
    --_status-icon-size: 20px;
    --_clear-size: 18px;
    --_numeric-width: 28px;
    --_numeric-icon-size: 18px;
  }

  .input-container {
    height: var(--_input-height);
    padding-left: var(--_input-padding-left);
    padding-right: ${SP_1};
    gap: ${SP_05};
  }

  :host([type="numeric"]) .input-container {
    padding-right: 0;
  }

  .native-input {
    font-size: var(--_input-font-size);
    line-height: var(--_input-line-height);
  }

  .status-icon {
    width: var(--_status-icon-size);
    height: var(--_status-icon-size);
  }

  .clear-btn {
    width: var(--_clear-size);
    height: var(--_clear-size);
  }

  .numeric-controls {
    width: var(--_numeric-width);
  }

  /* ── Hover ─────────────────────────────────────────────────────────────── */

  :host(:hover:not([disabled]):not([readonly])) .input-container {
    border-color: var(--ui-input-hover-border, ${HOVER_BORDER});
  }

  /* ── Focus ─────────────────────────────────────────────────────────────── */

  :host(:focus-within:not([disabled]):not([readonly])) .input-container {
    border-color: var(--ui-input-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-input-focus-border, ${BORDER_FOCUS});
  }

  /* ── Error state ───────────────────────────────────────────────────────── */

  :host([status="error"]) .input-container,
  :host([error]) .input-container {
    border-color: ${STATUS_ERROR};
  }

  :host([status="error"]:focus-within) .input-container,
  :host([error]:focus-within) .input-container {
    border-color: ${STATUS_ERROR};
    box-shadow: 0 0 0 1px ${STATUS_ERROR};
  }

  /* ── Warning state ─────────────────────────────────────────────────────── */

  :host([status="warning"]) .input-container {
    border-color: ${STATUS_WARNING};
  }

  :host([status="warning"]:focus-within) .input-container {
    border-color: ${STATUS_WARNING};
    box-shadow: 0 0 0 1px ${STATUS_WARNING};
  }

  /* ── Success state ─────────────────────────────────────────────────────── */

  :host([status="success"]) .input-container {
    border-color: ${STATUS_SUCCESS};
  }

  :host([status="success"]:focus-within) .input-container {
    border-color: ${STATUS_SUCCESS};
    box-shadow: 0 0 0 1px ${STATUS_SUCCESS};
  }

  /* ── Disabled ──────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .input-container {
    border-color: ${DISABLED_BORDER};
    background-color: ${SURFACE_SECONDARY};
  }

  :host([disabled]) .native-input {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .native-input::placeholder {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .supportive-text {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .leading-slot,
  :host([disabled]) .trailing-slot {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .status-icon {
    color: ${DISABLED_TEXT} !important;
  }

  :host([disabled]) .numeric-controls {
    border-left-color: ${DISABLED_BORDER};
  }

  :host([disabled]) .spinner-btn {
    color: ${DISABLED_TEXT};
  }

  /* ── Readonly ──────────────────────────────────────────────────────────── */

  :host([readonly]) .input-container {
    border-color: ${BORDER_MINIMAL};
    background-color: ${SURFACE_SECONDARY};
  }

  :host([readonly]) .native-input {
    cursor: default;
    color: ${TEXT_SECONDARY};
  }

  /* ── Reduced motion ────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .input-container {
      transition-duration: 0.01ms !important;
    }
    :host([status="loading"]) .status-icon ui-icon {
      animation-duration: 0.01ms !important;
    }
  }
`;
