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
    font-family: Inter, sans-serif;
  }

  /* ── Label row ─── */

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

  /* ── Input container ─── */

  .input-container {
    display: flex;
    align-items: center;
    border: 1px solid var(--ui-dpi-border, ${FORM_INPUT_BORDER});
    border-radius: 2px;
    background-color: var(--ui-dpi-bg, #ffffff);
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    overflow: hidden;
  }

  :host(:hover:not([disabled]):not([readonly])) .input-container {
    border-color: ${HOVER_BORDER};
  }

  :host([focused]) .input-container {
    border-color: ${BORDER_FOCUS};
    box-shadow: 0 0 0 1px ${BORDER_FOCUS};
  }

  :host([disabled]) .input-container {
    border-color: ${DISABLED_BORDER};
    cursor: default;
    opacity: 0.6;
  }

  :host([readonly]) .input-container {
    border-color: ${BORDER_MINIMAL};
    background-color: ${SURFACE_SECONDARY};
    cursor: default;
  }

  :host([status="error"]) .input-container {
    border-color: ${STATUS_ERROR};
  }

  :host([status="warning"]) .input-container {
    border-color: ${STATUS_WARNING};
  }

  :host([status="success"]) .input-container {
    border-color: ${STATUS_SUCCESS};
  }

  /* ── Icon ─── */

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${TEXT_PRIMARY};
  }

  :host([disabled]) .icon {
    color: ${DISABLED_TEXT};
  }

  /* ── Status icon ─── */

  .status-icon {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 4px;
  }

  :host([status="warning"]) .status-icon {
    display: flex;
    color: ${STATUS_WARNING};
  }

  :host([status="error"]) .status-icon {
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

  /* ── Content ─── */

  .content {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 4px;
  }

  .segment {
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
  }

  .segment-clickable {
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 2px;
  }

  .segment-clickable:hover {
    background: rgba(159, 177, 189, 0.15);
  }
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
  }

  .segment[data-placeholder] {
    color: ${TEXT_TERTIARY};
  }

  :host([disabled]) .segment {
    color: ${DISABLED_TEXT};
  }

  .separator {
    color: ${TEXT_SECONDARY};
    white-space: nowrap;
  }

  /* ── Spin controls (time type) ─── */

  .spin-controls {
    display: none;
    flex-direction: column;
    align-items: center;
    margin-left: auto;
    border-left: 1px solid ${FORM_INPUT_BORDER};
    align-self: stretch;
  }

  :host([type="time"]) .spin-controls {
    display: flex;
  }

  .spin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0 4px;
    color: ${TEXT_PRIMARY};
    flex: 1;
  }

  .spin-btn:hover {
    background: rgba(159, 177, 189, 0.15);
  }

  .spin-divider {
    width: 100%;
    height: 1px;
    background: ${FORM_INPUT_BORDER};
  }

  /* ── Supportive text ─── */

  .supportive {
    display: none;
    font-size: 11px;
    line-height: 16px;
    color: ${TEXT_SECONDARY};
  }

  :host([supportive]) .supportive {
    display: block;
  }

  :host([status="error"]) .supportive {
    color: ${STATUS_ERROR};
  }

  :host([status="warning"]) .supportive {
    color: ${STATUS_WARNING};
  }

  /* ── Size: S ─── */

  :host([size="s"]) .input-container {
    height: 24px;
    padding: 0 ${SP_05};
    gap: 4px;
  }

  :host([size="s"][type="time"]) .input-container {
    padding-right: 0;
  }
    height: 24px;
    padding-left: ${SP_05};
    gap: 4px;
  }

  :host([size="s"]) .icon {
    --ui-icon-size: 16px;
  }

  :host([size="s"]) .content {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .spin-btn {
    --ui-icon-size: 12px;
  }

  /* ── Size: M (default) ─── */

  :host([size="m"]) .input-container,
  :host(:not([size])) .input-container {
    height: 32px;
    padding: 0 ${SP_1};
    gap: 8px;
  }

  :host([size="m"][type="time"]) .input-container,
  :host(:not([size])[type="time"]) .input-container {
    padding-right: 0;
  }
  :host(:not([size])) .input-container {
    height: 32px;
    padding-left: ${SP_1};
    gap: 8px;
  }

  :host([size="m"]) .icon,
  :host(:not([size])) .icon {
    --ui-icon-size: 20px;
  }

  :host([size="m"]) .content,
  :host(:not([size])) .content {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="m"]) .spin-btn,
  :host(:not([size])) .spin-btn {
    --ui-icon-size: 14px;
  }

  /* ── Size: L ─── */

  :host([size="l"]) .input-container {
    height: 40px;
    padding: 0 12px;
    gap: 8px;
  }

  :host([size="l"][type="time"]) .input-container {
    padding-right: 0;
  }
    height: 40px;
    padding-left: 12px;
    gap: 8px;
  }

  :host([size="l"]) .icon {
    --ui-icon-size: 24px;
  }

  :host([size="l"]) .content {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .spin-btn {
    --ui-icon-size: 16px;
  }
`;
