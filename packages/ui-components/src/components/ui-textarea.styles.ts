import {
  BORDER_FOCUS,
  BORDER_MINIMAL,
  BW_SM,
  DISABLED_BORDER,
  DISABLED_TEXT,
  FONT_PRIMARY,
  FORM_INPUT_BORDER,
  HOVER_BORDER_MODERATE,
  RADIUS_SM,
  SP_0_5,
  SP_1,
  SP_1_5,
  STATUS_GENERAL_ERROR,
  STATUS_GENERAL_SUCCESS,
  STATUS_GENERAL_WARNING,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  TYPE_CAPTION_01,
  SURFACE_PRIMARY,
} from "@maneki/foundation";

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
    gap: ${SP_0_5};
    font-family: ${FONT_PRIMARY};
  }

  /* ── Label row ─────────────────────────────────────────────────────────── */

  .label-row {
    display: flex;
    align-items: center;
    gap: ${SP_1};
  }


  .label-row ui-label,
  .label-row ::slotted(ui-label) {
    display: inline;
    flex: 1;
  }

  .char-count {
    display: none;
    ${TYPE_CAPTION_01}
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
    border-width: ${BW_SM};
    border-style: solid;
    border-color: var(--ui-textarea-border, ${FORM_INPUT_BORDER});
    border-radius: ${RADIUS_SM};
    background-color: var(--ui-textarea-bg, ${SURFACE_PRIMARY});
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
    color: ${STATUS_GENERAL_WARNING};
  }

  :host([status="error"]) .status-icon,
  :host([error]) .status-icon {
    display: flex;
    color: ${STATUS_GENERAL_ERROR};
  }

  :host([status="success"]) .status-icon {
    display: flex;
    color: ${STATUS_GENERAL_SUCCESS};
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
    ${TYPE_CAPTION_01}
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
    border-color: var(--ui-textarea-hover-border, ${HOVER_BORDER_MODERATE});
  }

  /* ── Focus ─────────────────────────────────────────────────────────────── */

  :host(:focus-within:not([disabled]):not([readonly])) .textarea-container {
    border-color: var(--ui-textarea-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-textarea-focus-border, ${BORDER_FOCUS});
  }

  /* ── Error state ───────────────────────────────────────────────────────── */

  :host([status="error"]) .textarea-container,
  :host([error]) .textarea-container {
    border-color: ${STATUS_GENERAL_ERROR};
  }

  :host([status="error"]:focus-within) .textarea-container,
  :host([error]:focus-within) .textarea-container {
    border-color: ${STATUS_GENERAL_ERROR};
    box-shadow: 0 0 0 1px ${STATUS_GENERAL_ERROR};
  }

  /* ── Warning state ─────────────────────────────────────────────────────── */

  :host([status="warning"]) .textarea-container {
    border-color: ${STATUS_GENERAL_WARNING};
  }

  :host([status="warning"]:focus-within) .textarea-container {
    border-color: ${STATUS_GENERAL_WARNING};
    box-shadow: 0 0 0 1px ${STATUS_GENERAL_WARNING};
  }

  /* ── Success state ─────────────────────────────────────────────────────── */

  :host([status="success"]) .textarea-container {
    border-color: ${STATUS_GENERAL_SUCCESS};
  }

  :host([status="success"]:focus-within) .textarea-container {
    border-color: ${STATUS_GENERAL_SUCCESS};
    box-shadow: 0 0 0 1px ${STATUS_GENERAL_SUCCESS};
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

  :host([disabled]) span.status-icon {
    color: ${DISABLED_TEXT};
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
    color: ${STATUS_GENERAL_WARNING};
  }

  :host([status="error"]) .secondary-label,
  :host([error]) .secondary-label {
    color: ${STATUS_GENERAL_ERROR};
  }

  :host([status="success"]) .secondary-label {
    color: ${STATUS_GENERAL_SUCCESS};
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
