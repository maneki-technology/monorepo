import { semanticVar, colorVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const GREEN_60 = colorVar("green", 60);
const RED_60 = colorVar("red", 60);
const DISABLED_MINIMAL = semanticVar("stateDisabled", "minimal");
const HOVER_SURFACE = semanticVar("stateHover", "surfaceMinimal");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
  }

  /* ── Base wrapper ────────────────────────────────────────────────────────── */

  .base {
    display: flex;
    align-items: flex-start;
    border-radius: 2px;
    font-family: "Inter", sans-serif;
  }

  /* Vertical orientation (default) */
  :host(:not([orientation="horizontal"])) .base {
    flex-direction: row;
  }

  /* Horizontal orientation */
  :host([orientation="horizontal"]) .base {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }

  :host([orientation="horizontal"]) .content {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  :host([orientation="horizontal"]) .value-container {
    gap: 0;
  }

  /* ── Legend bar ───────────────────────────────────────────────────────────── */

  .legend {
    display: none;
    width: 2px;
    align-self: stretch;
    border-radius: 1px;
    flex-shrink: 0;
  }

  :host([legend-color]) .legend {
    display: block;
  }

  :host([legend-color]) .base {
    gap: 8px;
  }

  /* ── Content ─────────────────────────────────────────────────────────────── */

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }

  .label {
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    color: ${TEXT_SECONDARY};
    white-space: nowrap;
  }

  .value-container {
    display: flex;
    align-items: center;
  }

  .value {
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
  }

  /* ── Delta arrow ─────────────────────────────────────────────────────────── */

  .delta-arrow {
    display: none;
    flex-shrink: 0;
  }

  :host([delta="up"]) .delta-arrow,
  :host([delta="down"]) .delta-arrow {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  :host([delta="up"]) .delta-arrow {
    color: ${GREEN_60};
  }

  :host([delta="down"]) .delta-arrow {
    color: ${RED_60};
  }

  :host([delta="down"]) .delta-arrow .arrow {
    transform: rotate(180deg);
  }

  .arrow {
    display: block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 5px solid currentColor;
  }

  /* ── Delta content row ───────────────────────────────────────────────────── */

  .delta-content {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    white-space: nowrap;
  }

  .delta-text {
    display: none;
  }

  :host([delta="up"]) .delta-text {
    display: inline;
    color: ${GREEN_60};
  }

  :host([delta="down"]) .delta-text {
    display: inline;
    color: ${RED_60};
  }

  .secondary-label {
    display: none;
    color: ${TEXT_SECONDARY};
  }

  :host([secondary-label]) .secondary-label {
    display: inline;
  }

  /* Hide delta content row when no delta and no secondary label */
  :host(:not([delta="up"]):not([delta="down"]):not([secondary-label])) .delta-content {
    display: none;
  }

  /* Show delta content when only secondary label (no delta) */
  :host([secondary-label]:not([delta="up"]):not([delta="down"])) .delta-content {
    display: flex;
  }

  /* ── Clickable ───────────────────────────────────────────────────────────── */

  :host([clickable]) .base {
    cursor: pointer;
  }

  :host([clickable]) .base:hover {
    background: ${HOVER_SURFACE};
  }

  :host([clickable]) .base:active {
    background: ${DISABLED_MINIMAL};
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .base {
    padding: 4px 8px;
  }

  :host([size="xs"][legend-color]) .base {
    padding: 4px 8px 4px 6px;
  }

  :host([size="xs"]) .content {
    gap: 0;
  }

  :host([size="xs"]) .value {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="xs"]) .delta-arrow {
    width: 16px;
    height: 16px;
  }

  :host([size="xs"]) .arrow {
    border-left-width: 3px;
    border-right-width: 3px;
    border-bottom-width: 4px;
  }

  :host([size="xs"]) .value-container {
    gap: 4px;
  }

  /* ── Size: s (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="s"]) .base {
    padding: 4px 8px;
  }

  :host([legend-color]) .base,
  :host([size="s"][legend-color]) .base {
    padding: 4px 8px 4px 6px;
  }

  :host .content,
  :host([size="s"]) .content {
    gap: 2px;
  }

  :host .value,
  :host([size="s"]) .value {
    font-size: 16px;
    line-height: 24px;
  }

  :host .delta-arrow,
  :host([size="s"]) .delta-arrow {
    width: 16px;
    height: 16px;
  }

  :host .arrow,
  :host([size="s"]) .arrow {
    border-left-width: 3px;
    border-right-width: 3px;
    border-bottom-width: 4px;
  }

  :host .value-container,
  :host([size="s"]) .value-container {
    gap: 4px;
  }

  /* ── Size: m ─────────────────────────────────────────────────────────────── */

  :host([size="m"]) .base {
    padding: 6px 12px;
  }

  :host([size="m"][legend-color]) .base {
    padding: 6px 12px 6px 8px;
  }

  :host([size="m"]) .content {
    gap: 2px;
  }

  :host([size="m"]) .value {
    font-size: 20px;
    line-height: 28px;
  }

  :host([size="m"]) .delta-arrow {
    width: 20px;
    height: 20px;
  }

  :host([size="m"]) .arrow {
    border-left-width: 4px;
    border-right-width: 4px;
    border-bottom-width: 5px;
  }

  :host([size="m"]) .value-container {
    gap: 4px;
  }

  :host([size="m"][orientation="horizontal"]) .base {
    padding: 0;
  }

  :host([size="m"][orientation="horizontal"]) .label {
    font-size: 14px;
    line-height: 20px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    padding: 8px 16px;
  }

  :host([size="l"][legend-color]) .base {
    padding: 8px 16px 8px 8px;
  }

  :host([size="l"]) .content {
    gap: 2px;
  }

  :host([size="l"]) .value {
    font-size: 32px;
    line-height: 40px;
  }

  :host([size="l"]) .delta-arrow {
    width: 20px;
    height: 20px;
  }

  :host([size="l"]) .arrow {
    border-left-width: 4px;
    border-right-width: 4px;
    border-bottom-width: 5px;
  }

  :host([size="l"]) .value-container {
    gap: 4px;
  }

  /* ── Clickable hover bg for m size ───────────────────────────────────────── */

  :host([size="m"][clickable]) .base {
    background: ${DISABLED_MINIMAL};
  }

  :host([size="m"][clickable]) .base:hover {
    background: ${HOVER_SURFACE};
  }
`;
