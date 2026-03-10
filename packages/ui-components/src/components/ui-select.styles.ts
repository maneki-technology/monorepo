import { semanticVar, spaceVar, elevationVar, ICON_WARNING, ICON_ERROR, ICON_CHECK_CIRCLE, ICON_PROGRESS_ACTIVITY } from "@maneki/foundation";

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
const SURFACE_PRIMARY = semanticVar("surface", "primary");
const ICON_SECONDARY = semanticVar("icon", "secondary");
const ELEVATION_05 = elevationVar("05");
const SP_05 = spaceVar("0.5");
const SP_1 = spaceVar("1");
const SP_15 = spaceVar("1.5");

// ─── Status icon map ─────────────────────────────────────────────────────────

export const STATUS_ICON_MAP: Record<string, string> = {
  warning: ICON_WARNING,
  error: ICON_ERROR,
  success: ICON_CHECK_CIRCLE,
  loading: ICON_PROGRESS_ACTIVITY,
};

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }
  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: inherit;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  :host {
    display: inline-flex;
    flex-direction: column;
    gap: 0;
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
    margin-bottom: ${SP_05};
  }
  .label-row ui-label {
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
    border-radius: 2px;
    background-color: var(--ui-select-bg, #ffffff);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    overflow: hidden;
    cursor: pointer;
    outline: none;
  }
  .trigger:focus-visible {
    border-color: var(--ui-select-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-select-focus-border, ${BORDER_FOCUS});
  }

  /* ── Display value ─────────────────────────────────────────────────────── */
  .display-value {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: ${SP_05};
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
    background: #D4E4FA;
    border-radius: 200px;
    padding: 2px 8px;
    gap: 4px;
    flex-shrink: 0;
  }
  .tag-label {
    font-size: 12px;
    line-height: 16px;
    color: #0D4EA6;
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
    color: #0D4EA6;
    width: 12px;
    height: 12px;
    line-height: 0;
  }
  .tag-dismiss .material-symbols-outlined {
    font-size: 12px;
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
  .clear-btn .material-symbols-outlined {
    font-size: 14px;
    font-variation-settings: 'FILL' 1;
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
  .status-icon .material-symbols-outlined {
    font-variation-settings: 'FILL' 1;
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
  :host([status="loading"]) .status-icon .material-symbols-outlined {
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
  .chevron .material-symbols-outlined {
    font-size: var(--_chevron-size);
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
    padding: ${SP_05} 0;
    background-color: var(--ui-select-panel-bg, ${SURFACE_PRIMARY});
    box-shadow: var(--ui-select-panel-shadow, ${ELEVATION_05});
    border-radius: 2px;
    overflow: visible;
    margin-top: 2px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, visibility 0.15s ease, transform 0.15s ease;
    pointer-events: none;
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
    font-size: 11px;
    line-height: 16px;
    color: var(--ui-select-supportive-color, ${TEXT_SECONDARY});
  }
  :host([supportive]) .supportive-text {
    display: block;
    margin-top: ${SP_05};
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
    --_select-gap: ${SP_05};
    --_status-icon-size: 14px;
    --_chevron-size: 16px;
    --_leading-size: 16px;
  }

  /* ── Size: l ───────────────────────────────────────────────────────────── */
  :host([size="l"]) {
    --_select-height: 40px;
    --_select-padding-left: ${SP_15};
    --_select-padding-right: ${SP_15};
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
    border-color: var(--ui-select-hover-border, ${HOVER_BORDER});
  }

  /* ── Open / Focus ──────────────────────────────────────────────────────── */
  :host([open]) .trigger {
    border-color: var(--ui-select-focus-border, ${BORDER_FOCUS});
    box-shadow: 0 0 0 1px var(--ui-select-focus-border, ${BORDER_FOCUS});
  }

  /* ── Error state ───────────────────────────────────────────────────────── */
  :host([status="error"]) .trigger,
  :host([error]) .trigger {
    border-color: ${STATUS_ERROR};
  }
  :host([status="error"]) .trigger:focus-visible,
  :host([status="error"][open]) .trigger,
  :host([error]) .trigger:focus-visible,
  :host([error][open]) .trigger {
    border-color: ${STATUS_ERROR};
    box-shadow: 0 0 0 1px ${STATUS_ERROR};
  }

  /* ── Warning state ─────────────────────────────────────────────────────── */
  :host([status="warning"]) .trigger {
    border-color: ${STATUS_WARNING};
  }
  :host([status="warning"]) .trigger:focus-visible,
  :host([status="warning"][open]) .trigger {
    border-color: ${STATUS_WARNING};
    box-shadow: 0 0 0 1px ${STATUS_WARNING};
  }

  /* ── Success state ─────────────────────────────────────────────────────── */
  :host([status="success"]) .trigger {
    border-color: ${STATUS_SUCCESS};
  }
  :host([status="success"]) .trigger:focus-visible,
  :host([status="success"][open]) .trigger {
    border-color: ${STATUS_SUCCESS};
    box-shadow: 0 0 0 1px ${STATUS_SUCCESS};
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
  :host([disabled]) .status-icon {
    color: ${DISABLED_TEXT} !important;
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
    padding-top: 2px;
    padding-bottom: 2px;
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
    :host([status="loading"]) .status-icon .material-symbols-outlined {
      animation-duration: 0.01ms !important;
    }
  }
`;
