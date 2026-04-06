import {
  BORDER_FOCUS,
  BORDER_MINIMAL,
  DISABLED_BORDER,
  DISABLED_TEXT,
  ELEVATION_05,
  FONT_PRIMARY,
  FORM_INPUT_BORDER,
  SHADOW_FIELD,
  HOVER_BORDER_MODERATE,
  ICON_SECONDARY,
  RADIUS_PILL,
  RADIUS_SM,
  SP_0_25,
  SP_0_5,
  SP_1,
  SP_1_5,
  STATUS_GENERAL_ERROR,
  STATUS_GENERAL_SUCCESS,
  STATUS_GENERAL_WARNING,
  SURFACE_PRIMARY,
  SURFACE_SECONDARY,
  TAG_SUBTLE,
  TAG_TEXT_SUBTLE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
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
    gap: 0;
    font-family: ${FONT_PRIMARY};
  }

  /* ── Label row ─────────────────────────────────────────────────────────── */
  .label-row {
    display: flex;
    align-items: baseline;
    gap: ${SP_1};
  }
  .label-row ui-label,
  .label-row ::slotted(ui-label) {
    display: inline;
  }

  /* ── Trigger wrapper (positioning context for panel) ─────────────────── */
  .trigger-wrapper {
    position: relative;
  }

  /* ── Trigger ───────────────────────────────────────────────────────────── */
  .trigger {
    display: flex;
    align-items: center;
    border: 1px solid var(--ui-select-border, ${FORM_INPUT_BORDER});
    border-radius: ${RADIUS_SM};
    background-color: var(--ui-select-bg, ${SURFACE_PRIMARY});
    box-shadow: ${SHADOW_FIELD};
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      background-color 0.15s ease;
    cursor: pointer;
    outline: none;
  }
  .trigger:focus-visible {
    border-color: var(--ui-select-focus-border, ${BORDER_FOCUS});
    outline: 1px solid var(--ui-select-focus-border, ${BORDER_FOCUS});
  }

  /* ── Display value ─────────────────────────────────────────────────────── */
  .display-value {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: ${SP_0_5};
    overflow: hidden;
    color: var(--ui-select-color, ${TEXT_PRIMARY});
  }
  .display-value.placeholder {
    color: var(--ui-select-placeholder-color, ${TEXT_TERTIARY});
  }

  /* ── Tags (multi-select) ───────────────────────────────────────────────── */
  .tag {
    display: inline-flex;
    align-items: center;
    background: ${TAG_SUBTLE};
    border-radius: ${RADIUS_PILL};
    padding: ${SP_0_25} ${SP_1};
    gap: ${SP_0_5};
    flex-shrink: 0;
  }
  .tag-label {
    ${TYPE_BODY_03}
    color: ${TAG_TEXT_SUBTLE};
    white-space: nowrap;
  }
  .tag-dismiss {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    color: ${TAG_TEXT_SUBTLE};
    width: 12px;
    height: 12px;
    line-height: 0;
  }

  /* ── Content right ─────────────────────────────────────────────────────── */
  .content-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    overflow: clip;
    gap: ${SP_1};
  }

  /* ── Leading slot ──────────────────────────────────────────────────────── */
  .leading-slot {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${TEXT_SECONDARY};
  }
  .leading-slot.has-content {
    display: flex;
  }
  .leading-slot ::slotted(*) {
    display: flex;
    align-items: center;
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
    color: ${ICON_SECONDARY};
    line-height: 1;
    width: 14px;
    height: 14px;
  }
  .clear-btn:hover {
    color: ${TEXT_PRIMARY};
  }
  .clear-btn ui-icon {
    font-size: 14px;
  }
  .clear-btn.visible {
    display: flex;
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

  /* ── Chevron ───────────────────────────────────────────────────────────── */
  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.15s ease;
    line-height: 0;
    color: ${ICON_SECONDARY};
  }
  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  /* ── Panel ─────────────────────────────────────────────────────────────── */
  .panel {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 100%;
    padding: ${SP_0_5} 0;
    background: var(--ui-select-panel-bg, ${SURFACE_PRIMARY});
    box-shadow: var(--ui-select-panel-shadow, ${ELEVATION_05});
    border-radius: var(--ui-select-panel-radius, ${RADIUS_SM});
    margin-top: var(--ui-select-panel-gap, ${SP_0_25});
    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, visibility 0.15s ease, transform 0.15s ease;
    pointer-events: none;
    overflow: clip;
  }
  :host([open]) .panel {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  /* ── Supportive text ───────────────────────────────────────────────────── */
  .supportive-text {
    display: none;
    ${TYPE_CAPTION_01}
    color: var(--ui-select-supportive-color, ${TEXT_SECONDARY});
  }
  :host([supportive]) .supportive-text {
    display: block;
    margin-top: ${SP_0_5};
  }
  :host([status="warning"]) .supportive-text {
    color: ${STATUS_GENERAL_WARNING};
  }
  :host([status="error"]) .supportive-text,
  :host([error]) .supportive-text {
    color: ${STATUS_GENERAL_ERROR};
  }
  :host([status="success"]) .supportive-text {
    color: ${STATUS_GENERAL_SUCCESS};
  }

  /* ── Size: m (default) ─────────────────────────────────────────────────── */
  :host,
  :host([size="m"]) {
    --_select-height: 32px;
    --_select-padding-left: ${SP_1};
    --_select-padding-right: ${SP_1};
    --_select-font-size: 14px;
    --_select-line-height: 20px;
    --_select-gap: ${SP_1};
    --_status-icon-size: 18px;
    --_chevron-size: 20px;
    --_leading-size: 20px;
  }

  /* ── Size: s ───────────────────────────────────────────────────────────── */
  :host([size="s"]) {
    --_select-height: 24px;
    --_select-padding-left: ${SP_1};
    --_select-padding-right: ${SP_1};
    --_select-font-size: 12px;
    --_select-line-height: 16px;
    --_select-gap: ${SP_0_5};
    --_status-icon-size: 14px;
    --_chevron-size: 16px;
    --_leading-size: 16px;
  }

  /* ── Size: l ───────────────────────────────────────────────────────────── */
  :host([size="l"]) {
    --_select-height: 40px;
    --_select-padding-left: ${SP_1_5};
    --_select-padding-right: ${SP_1_5};
    --_select-font-size: 16px;
    --_select-line-height: 24px;
    --_select-gap: ${SP_1};
    --_status-icon-size: 20px;
    --_chevron-size: 24px;
    --_leading-size: 24px;
  }

  .trigger {
    height: var(--_select-height);
    padding-left: var(--_select-padding-left);

    gap: var(--_select-gap);
    font-size: var(--_select-font-size);
    line-height: var(--_select-line-height);
  }
  .leading-slot {
    width: var(--_leading-size);
    height: var(--_leading-size);
  }
  .content-right {
    height: var(--_select-line-height);
    padding-right: var(--_select-padding-right);
  }

  /* ── Hover ─────────────────────────────────────────────────────────────── */
  :host(:not([disabled]):not([readonly]):not([open])) .trigger:hover {
    border-color: var(--ui-select-hover-border, ${HOVER_BORDER_MODERATE});
    background-color: var(--ui-select-hover-bg, var(--ui-select-bg, ${SURFACE_PRIMARY}));
  }

  /* ── Open / Focus ──────────────────────────────────────────────────────── */
  :host([open]) .trigger {
    border-color: var(--ui-select-focus-border, ${BORDER_FOCUS});
    outline: 1px solid var(--ui-select-focus-border, ${BORDER_FOCUS});
  }

  /* ── Error state ───────────────────────────────────────────────────────── */
  :host([status="error"]) .trigger,
  :host([error]) .trigger {
    border-color: ${STATUS_GENERAL_ERROR};
  }
  :host([status="error"]) .trigger:focus-visible,
  :host([status="error"][open]) .trigger,
  :host([error]) .trigger:focus-visible,
  :host([error][open]) .trigger {
    border-color: ${STATUS_GENERAL_ERROR};
    outline: 1px solid ${STATUS_GENERAL_ERROR};
  }

  /* ── Warning state ─────────────────────────────────────────────────────── */
  :host([status="warning"]) .trigger {
    border-color: ${STATUS_GENERAL_WARNING};
  }
  :host([status="warning"]) .trigger:focus-visible,
  :host([status="warning"][open]) .trigger {
    border-color: ${STATUS_GENERAL_WARNING};
    outline: 1px solid ${STATUS_GENERAL_WARNING};
  }

  /* ── Success state ─────────────────────────────────────────────────────── */
  :host([status="success"]) .trigger {
    border-color: ${STATUS_GENERAL_SUCCESS};
  }
  :host([status="success"]) .trigger:focus-visible,
  :host([status="success"][open]) .trigger {
    border-color: ${STATUS_GENERAL_SUCCESS};
    outline: 1px solid ${STATUS_GENERAL_SUCCESS};
  }

  /* ── Disabled ──────────────────────────────────────────────────────────── */
  :host([disabled]) {
    pointer-events: none;
  }
  :host([disabled]) .trigger {
    border-color: ${DISABLED_BORDER};
    background-color: ${SURFACE_SECONDARY};
    cursor: not-allowed;
  }
  :host([disabled]) .display-value,
  :host([disabled]) .display-value.placeholder {
    color: ${DISABLED_TEXT};
  }
  :host([disabled]) .chevron {
    color: ${DISABLED_TEXT};
  }
  :host([disabled]) .supportive-text {
    color: ${DISABLED_TEXT};
  }
  :host([disabled]) .leading-slot {
    color: ${DISABLED_TEXT};
  }
  :host([disabled]) span.status-icon {
    color: ${DISABLED_TEXT};
  }

  /* ── Readonly ──────────────────────────────────────────────────────────── */
  :host([readonly]) .trigger {
    border-color: ${BORDER_MINIMAL};
    background-color: ${SURFACE_SECONDARY};
    cursor: default;
  }
  :host([readonly]) .display-value {
    color: ${TEXT_SECONDARY};
  }
  :host([readonly]) .chevron {
    color: ${DISABLED_TEXT};
  }

  /* ── Multi-select trigger height auto ──────────────────────────────────── */
  :host([multiple]) .trigger {
    height: auto;
    min-height: var(--_select-height);
    padding-top: ${SP_0_25};
    padding-bottom: ${SP_0_25};
    flex-wrap: wrap;
  }

  /* ── Reduced motion ────────────────────────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .trigger {
      transition-duration: 0.01ms !important;
    }
    .chevron {
      transition-duration: 0.01ms !important;
    }
    .panel {
      transition-duration: 0.01ms !important;
    }
    :host([status="loading"]) .status-icon ui-icon {
      animation-duration: 0.01ms !important;
    }
  }
`;
