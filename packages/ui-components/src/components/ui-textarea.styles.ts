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
    align-items: center;
    gap: ${SP_1};
  }

  :host([label]) .label-row {
    display: flex;
  }

  .label-row ui-label {
    display: inline;
    flex: 1;
  }

  .char-count {
    display: none;
    font-size: 11px;
    line-height: 16px;
    color: ${TEXT_SECONDARY};
    flex-shrink: 0;
    white-space: nowrap;
  }

  :host([maxlength]) .char-count {
    display: block;
  }

  /* ── Textarea container ─────────────────────────────────────────────────── */

  .textarea-container {
    display: flex;
    position: relative;
    border: 1px solid var(--ui-textarea-border, ${FORM_INPUT_BORDER});
    border-radius: 2px;
    background-color: var(--ui-textarea-bg, #ffffff);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    overflow: hidden;
    flex: 1;
    min-height: 0;
  }

  /* ── Native textarea ────────────────────────────────────────────────────── */

  .native-textarea {
    flex: 1;
    min-width: 0;
    min-height: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    color: var(--ui-textarea-color, ${TEXT_PRIMARY});
    padding: var(--_textarea-padding);
    margin: 0;
    resize: both;
  }

  .native-textarea::placeholder {
    color: var(--ui-textarea-placeholder-color, ${TEXT_TERTIARY});
  }

  /* ── Status icon ───────────────────────────────────────────────────────── */

  .status-icon {
    display: none;
    position: absolute;
    top: var(--_textarea-padding);
    right: var(--_textarea-padding);
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    --ui-icon-size: var(--_status-icon-size);
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

  /* ── Secondary label ────────────────────────────────────────────────────── */

  .secondary-label {
    display: none;
    font-size: 11px;
    line-height: 16px;
    color: var(--ui-textarea-secondary-color, ${TEXT_SECONDARY});
  }

  :host([secondary-label]) .secondary-label {
    display: block;
  }

  /* ── Size: m (default) ─────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    --_textarea-padding: 7px;
    --_textarea-font-size: 14px;
    --_textarea-line-height: 20px;
    --_status-icon-size: 16px;
  }

  /* ── Size: s ───────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_textarea-padding: 7px;
    --_textarea-font-size: 12px;
    --_textarea-line-height: 16px;
    --_status-icon-size: 12px;
  }

  /* ── Size: l ───────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_textarea-padding: 7px;
    --_textarea-font-size: 16px;
    --_textarea-line-height: 24px;
    --_status-icon-size: 20px;
  }

  .native-textarea {
    font-size: var(--_textarea-font-size);
    line-height: var(--_textarea-line-height);
  }

  /* ── Hover ─────────────────────────────────────────────────────────────── */

  :host(:hover:not([disabled]):not([readonly])) .textarea-container {
    border-color: var(--ui-textarea-hover-border, ${HOVER_BORDER});
  }

  /* ── Focus ─────────────────────────────────────────────────────────────── */

  :host(:focus-within:not([disabled]):not([readonly])) .textarea-container {
    border-color: var(--ui-textarea-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-textarea-focus-border, ${BORDER_FOCUS});
  }

  /* ── Error state ───────────────────────────────────────────────────────── */

  :host([status="error"]) .textarea-container,
  :host([error]) .textarea-container {
    border-color: ${STATUS_ERROR};
  }

  :host([status="error"]:focus-within) .textarea-container,
  :host([error]:focus-within) .textarea-container {
    border-color: ${STATUS_ERROR};
    box-shadow: 0 0 0 1px ${STATUS_ERROR};
  }

  /* ── Warning state ─────────────────────────────────────────────────────── */

  :host([status="warning"]) .textarea-container {
    border-color: ${BORDER_FOCUS};
  }

  :host([status="warning"]:focus-within) .textarea-container {
    border-color: ${BORDER_FOCUS};
    box-shadow: 0 0 0 1px ${BORDER_FOCUS};
  }

  /* ── Success state ─────────────────────────────────────────────────────── */

  :host([status="success"]) .textarea-container {
    border-color: ${STATUS_SUCCESS};
  }

  :host([status="success"]:focus-within) .textarea-container {
    border-color: ${STATUS_SUCCESS};
    box-shadow: 0 0 0 1px ${STATUS_SUCCESS};
  }

  /* ── Disabled ──────────────────────────────────────────────────────────── */

  :host([disabled]) {
    pointer-events: none;
  }

  :host([disabled]) .textarea-container {
    border-color: ${DISABLED_BORDER};
    background-color: ${SURFACE_SECONDARY};
  }

  :host([disabled]) .native-textarea {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .native-textarea::placeholder {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .secondary-label {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .char-count {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .status-icon {
    color: ${DISABLED_TEXT} !important;
  }

  /* ── Readonly ──────────────────────────────────────────────────────────── */

  :host([readonly]) .textarea-container {
    border-color: ${BORDER_MINIMAL};
    background-color: ${SURFACE_SECONDARY};
  }

  :host([readonly]) .native-textarea {
    cursor: default;
    color: ${TEXT_PRIMARY};
    resize: none;
  }

  /* ── Status secondary label color ──────────────────────────────────────── */

  :host([status="warning"]) .secondary-label {
    color: ${STATUS_WARNING};
  }

  :host([status="error"]) .secondary-label,
  :host([error]) .secondary-label {
    color: ${STATUS_ERROR};
  }

  :host([status="success"]) .secondary-label {
    color: ${STATUS_SUCCESS};
  }

  /* ── Reduced motion ────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .textarea-container {
      transition-duration: 0.01ms !important;
    }
    :host([status="loading"]) .status-icon ui-icon {
      animation-duration: 0.01ms !important;
    }
  }
`;
