import {
  ACTIVE_SUBTLE,
  FONT_PRIMARY,
  GREEN_60,
  HOVER_MINIMAL,
  RADIUS_SM,
  RED_60,
  SP_0_25,
  SP_0_5,
  SP_0_75,
  SP_1,
  SP_1_5,
  SP_2,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_HEADING_02,
  TYPE_HEADING_04,
} from "@maneki/foundation";

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
    border-radius: ${RADIUS_SM};
    font-family: ${FONT_PRIMARY};
  }

  /* Vertical orientation (default) */
  :host(:not([orientation="horizontal"])) .base {
    flex-direction: row;
  }

  /* Horizontal orientation */
  :host([orientation="horizontal"]) .base {
    flex-direction: row;
    align-items: center;
    gap: ${SP_1};
    white-space: nowrap;
  }

  :host([orientation="horizontal"]) .content {
    flex-direction: row;
    align-items: center;
    gap: ${SP_1};
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
    gap: ${SP_1};
  }

  /* ── Content ─────────────────────────────────────────────────────────────── */

  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${SP_0_25};
  }

  .label {
    ${TYPE_BODY_03}
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
    gap: ${SP_0_5};
    ${TYPE_BODY_03}
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
    background: ${HOVER_MINIMAL};
  }

  :host([clickable]) .base:active {
    background: ${ACTIVE_SUBTLE};
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .base {
    padding: ${SP_0_5} ${SP_1};
  }

  :host([size="xs"][legend-color]) .base {
    padding: ${SP_0_5} ${SP_1} ${SP_0_5} ${SP_0_75};
  }

  :host([size="xs"]) .content {
    gap: 0;
  }

  :host([size="xs"]) .value {
    ${TYPE_BODY_02}
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
    gap: ${SP_0_5};
  }

  /* ── Size: s (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="s"]) .base {
    padding: ${SP_0_5} ${SP_1};
  }

  :host([legend-color]) .base,
  :host([size="s"][legend-color]) .base {
    padding: ${SP_0_5} ${SP_1} ${SP_0_5} ${SP_0_75};
  }

  :host .content,
  :host([size="s"]) .content {
    gap: ${SP_0_25};
  }

  :host .value,
  :host([size="s"]) .value {
    ${TYPE_BODY_01}
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
    gap: ${SP_0_5};
  }

  /* ── Size: m ─────────────────────────────────────────────────────────────── */

  :host([size="m"]) .base {
    padding: ${SP_0_75} ${SP_1_5};
  }

  :host([size="m"][legend-color]) .base {
    padding: ${SP_0_75} ${SP_1_5} ${SP_0_75} ${SP_1};
  }

  :host([size="m"]) .content {
    gap: ${SP_0_25};
  }

  :host([size="m"]) .value {
    ${TYPE_HEADING_04}
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
    gap: ${SP_0_5};
  }

  :host([size="m"][orientation="horizontal"]) .base {
    padding: 0;
  }

  :host([size="m"][orientation="horizontal"]) .label {
    ${TYPE_BODY_02}
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    padding: ${SP_1} ${SP_2};
  }

  :host([size="l"][legend-color]) .base {
    padding: ${SP_1} ${SP_2} ${SP_1} ${SP_1};
  }

  :host([size="l"]) .content {
    gap: ${SP_0_25};
  }

  :host([size="l"]) .value {
    ${TYPE_HEADING_02}
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
    gap: ${SP_0_5};
  }

  /* ── Clickable hover bg for m size ───────────────────────────────────────── */

  :host([size="m"][clickable]) .base {
    background: ${ACTIVE_SUBTLE};
  }

  :host([size="m"][clickable]) .base:hover {
    background: ${HOVER_MINIMAL};
  }
`;
