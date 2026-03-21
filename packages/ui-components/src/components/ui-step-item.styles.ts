import {
  BLUE_60,
  BW_MD,
  DISABLED_MINIMAL,
  DISABLED_TEXT,
  RADIUS_PILL,
  SP_0_5,
  SP_1,
  SP_1_5,
  STATUS_GENERAL_WARNING,
  STATUS_SURFACE_ERROR_BOLD,
  SURFACE_BOLD,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type StepSize = "s" | "m";
export type StepStatus = "complete" | "active" | "incomplete" | "disabled" | "error" | "warning";
export type StepOrientation = "horizontal" | "vertical";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STEP_ITEM_STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }

  :host {
    display: flex;
    min-width: 0;
    min-height: 0;
    font-family: "Geist", sans-serif;
  }

  /* ── Horizontal (default) ────────────────────────────────────────────────── */

  :host,
  :host([orientation="horizontal"]) {
    flex-direction: column;
    align-items: center;
  }

  .progress {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
  }

  .line {
    flex: 1 0 0;
    min-width: 0;
    min-height: 0;
    position: relative;
  }

  .line-inner {
    position: absolute;
    background: ${SURFACE_BOLD};
  }

  .line-inner.completed {
    background: ${BLUE_60};
  }

  .line.hidden .line-inner {
    display: none;
  }

  .dot {
    border-radius: ${RADIUS_PILL};
    flex-shrink: 0;
  }

  .labels {
    display: none;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
  }

  :host([labels]) .labels {
    display: flex;
  }

  .label {
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    width: 100%;
  }

  .sublabel {
    font-weight: 400;
    color: ${TEXT_SECONDARY};
    width: 100%;
  }

  /* ── Vertical ────────────────────────────────────────────────────────────── */

  :host([orientation="vertical"]) {
    flex-direction: row;
    align-items: center;
  }

  :host([orientation="vertical"]) .progress {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: auto;
    height: 100%;
  }

  :host([orientation="vertical"]) .labels {
    align-items: flex-start;
    text-align: left;
    width: auto;
    white-space: nowrap;
    height: 100%;
    justify-content: center;
  }

  /* ── Status colors ───────────────────────────────────────────────────────── */

  :host([status="complete"]) .dot {
    background: ${BLUE_60};
  }

  :host([status="active"]) .dot {
    background: transparent;
    border: ${BW_MD} solid ${BLUE_60};
  }

  :host([status="incomplete"]) .dot {
    background: transparent;
    border: ${BW_MD} solid ${SURFACE_BOLD};
  }

  :host([status="disabled"]) .dot {
    background: transparent;
    border: ${BW_MD} solid ${DISABLED_MINIMAL};
  }

  :host([status="disabled"]) .label,
  :host([status="disabled"]) .sublabel {
    color: ${DISABLED_TEXT};
  }

  :host([status="error"]) .dot {
    background: ${STATUS_SURFACE_ERROR_BOLD};
  }

  :host([status="warning"]) .dot {
    background: ${STATUS_GENERAL_WARNING};
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .dot {
    width: ${SP_1};
    height: ${SP_1};
  }

  :host([size="s"]) .line {
    height: ${SP_1};
  }

  :host([size="s"]) .line-inner {
    height: ${BW_MD};
    left: 0;
    right: 0;
    top: 3px;
  }

  :host([size="s"]) .labels {
    gap: 0;
  }

  :host([size="s"]) .label {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .sublabel {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"][orientation="horizontal"]) {
    gap: ${SP_0_5};
  }

  :host([size="s"][orientation="vertical"]) {
    gap: ${SP_0_5};
  }

  :host([size="s"][orientation="vertical"]) .line {
    width: ${SP_1};
    height: auto;
  }

  :host([size="s"][orientation="vertical"]) .line-inner {
    width: ${BW_MD};
    height: auto;
    left: 3px;
    top: 0;
    bottom: 0;
    right: auto;
  }

  :host([size="s"][orientation="vertical"]) .labels {
    padding: ${SP_1} 0;
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .dot,
  :host([size="m"]) .dot {
    width: 18px;
    height: 18px;
    position: relative;
  }

  :host .line,
  :host([size="m"]) .line {
    height: 18px;
  }

  :host .line-inner,
  :host([size="m"]) .line-inner {
    height: ${BW_MD};
    left: 0;
    right: 0;
    top: ${SP_1};
  }

  :host .labels,
  :host([size="m"]) .labels {
    gap: 0;
  }

  :host .label,
  :host([size="m"]) .label {
    font-size: 14px;
    line-height: 20px;
  }

  :host .sublabel,
  :host([size="m"]) .sublabel {
    font-size: 11px;
    line-height: 16px;
  }

  :host([orientation="horizontal"]),
  :host([size="m"][orientation="horizontal"]) {
    gap: ${SP_1};
  }

  :host([size="m"][orientation="vertical"]) {
    gap: ${SP_1};
  }

  :host([size="m"][orientation="vertical"]) .line {
    width: 18px;
    height: auto;
  }

  :host([size="m"][orientation="vertical"]) .line-inner {
    width: ${BW_MD};
    height: auto;
    left: ${SP_1};
    top: 0;
    bottom: 0;
    right: auto;
  }

  :host([size="m"][orientation="vertical"]) .labels {
    padding: ${SP_1_5} 0;
  }

  /* ── Dot icon (M size only) ──────────────────────────────────────────────── */

  .dot-icon {
    display: none;
    position: absolute;
    inset: 0;
    align-items: center;
    justify-content: center;
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 1;
    color: #ffffff;
    font-size: 14px;
  }

  :host([size="m"][status="complete"]) .dot-icon,
  :host([size="m"][status="error"]) .dot-icon,
  :host([size="m"][status="warning"]) .dot-icon {
    display: flex;
  }

  /* ── Clickable ──────────────────────────────────────────────────────────── */

  :host([clickable]) {
    cursor: pointer;
  }

  :host([clickable]) .dot {
    transition: transform 0.15s ease;
  }

  :host([clickable]:hover) .dot {
    transform: scale(1.2);
  }

  :host([clickable]:hover) .label {
    color: ${BLUE_60};
  }

  :host([clickable][status="disabled"]) {
    cursor: default;
    pointer-events: none;
  }

  .dot-icon svg {
    width: 10px;
    height: 10px;
    fill: #ffffff;
  }
`;
