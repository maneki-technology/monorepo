import {
  BORDER_CONTRAST,
  DISABLED_TEXT,
  FORM_INPUT_BORDER,
  HOVER_MINIMAL,
  HOVER_MODERATE,
  SELECTED_BOLD,
  SP_0_5,
  SP_0_75,
  SP_1,
  SP_1_25,
  SP_1_5,
  SP_2,
  SP_3,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_SELECTED,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
} from "@maneki/foundation";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
  }

  :host([submenu]) {
    position: relative;
  }

  ::slotted(ui-menu) {
    position: absolute;
    top: 0;
    left: 100%;
    margin-top: -4px;
    display: none;
  }

  ::slotted(ui-menu[open]) {
    display: block;
  }

  .item {
    display: flex;
    align-items: center;
    width: 100%;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-family: var(--ui-dd-item-font-family, "Geist", sans-serif);
    font-weight: var(--ui-dd-item-font-weight, 400);
    color: var(--ui-dd-item-color, ${TEXT_PRIMARY});
    text-align: start;
    padding: 0;
    margin: 0;
  }

  .item:hover {
    background-color: var(--ui-dd-item-hover-bg, ${HOVER_MINIMAL});
  }

  .item:active {
    background-color: var(--ui-dd-item-active-bg, ${HOVER_MODERATE});
  }

  .item:focus-visible {
    background-color: var(--ui-dd-item-focus-bg, rgba(159, 177, 189, 0.4));
    outline: none;
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .item,
  :host([size="m"]) .item {
    ${TYPE_BODY_02}
    padding: ${SP_0_75} ${SP_2};
    gap: ${SP_1};
  }

  :host .leading,
  :host([size="m"]) .leading {
    width: 20px;
    height: 20px;
  }

  :host .secondary,
  :host([size="m"]) .secondary {
    ${TYPE_BODY_03}
  }

  :host .description,
  :host([size="m"]) .description {
    ${TYPE_BODY_03}
  }

  :host .submenu,
  :host([size="m"]) .submenu {
    width: 20px;
    height: 20px;
  }

  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .item {
    ${TYPE_BODY_03}
    padding: ${SP_0_75} ${SP_1_5};
    gap: ${SP_1};
  }

  :host([size="s"]) .leading {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .secondary {
    ${TYPE_CAPTION_01}
  }

  :host([size="s"]) .description {
    ${TYPE_CAPTION_01}
  }

  :host([size="s"]) .submenu {
    width: 16px;
    height: 16px;
  }

  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .item {
    ${TYPE_BODY_01}
    padding: ${SP_1_25} ${SP_2} ${SP_1_25} ${SP_3};
    gap: ${SP_1_5};
  }

  :host([size="l"]) .leading {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .secondary {
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .description {
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .submenu {
    width: 24px;
    height: 24px;
  }

  /* ── Disabled ───────────────────────────────────────────────────────────── */

  :host([disabled]) .item {
    color: var(--ui-dd-item-disabled-color, ${DISABLED_TEXT});
    cursor: not-allowed;
    pointer-events: none;
  }

  :host([disabled]) .item:hover {
    background-color: transparent;
  }

  /* ── Leading element ────────────────────────────────────────────────────── */

  .leading {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 0;
  }

  .leading svg {
    width: 100%;
    height: 100%;
  }

  .leading ::slotted(*) {
    width: 100%;
    height: 100%;
  }

  /* ── Content area ───────────────────────────────────────────────────────── */

  .content {
    display: flex;
    flex-direction: column;
    gap: ${SP_0_5};
    flex: 1;
    min-width: 0;
  }

  .head {
    display: flex;
    align-items: center;
    gap: ${SP_1};
  }

  .label {
    flex: 1;
    min-width: 0;
  }

  .right {
    display: flex;
    align-items: center;
    gap: ${SP_1};
    margin-left: auto;
    flex-shrink: 0;
  }

  /* ── Secondary label ────────────────────────────────────────────────────── */

  .secondary {
    color: var(--ui-dd-item-secondary-color, ${TEXT_SECONDARY});
    white-space: nowrap;
  }

  /* ── Description ────────────────────────────────────────────────────────── */

  .description {
    color: var(--ui-dd-item-description-color, ${TEXT_SECONDARY});
  }

  /* ── Submenu arrow ──────────────────────────────────────────────────────── */

  .submenu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    line-height: 0;
  }

  /* ── Selected ───────────────────────────────────────────────────────────── */

  :host([selected]) .item {
    color: var(--ui-dd-item-selected-color, ${TEXT_SELECTED});
    font-weight: 500;
  }

  /* ── Leading checkbox/radio selected colors ─────────────────────────────── */

  :host([selected]) .leading-checkbox rect {
    fill: ${SELECTED_BOLD};
    stroke: ${SELECTED_BOLD};
  }

  :host([selected]) .leading-radio .radio-outer {
    stroke: ${BORDER_CONTRAST};
  }

  :host([selected]) .leading-radio .radio-inner {
    fill: ${SELECTED_BOLD};
  }
`;
