import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SELECTED = semanticVar("text", "selected");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const FORM_INPUT_BORDER = semanticVar("form", "inputBorder");
const SELECTED_BOLD = semanticVar("stateSelected", "surfaceBold");
const BORDER_CONTRAST = semanticVar("border", "contrast");
const SP_05 = spaceVar("0.5");   // 4px — description gap
const SP_075 = spaceVar("0.75"); // 6px
const SP_1 = spaceVar("1");      // 8px
// SP_125 (10px) has no foundation token — inlined in CSS
const SP_15 = spaceVar("1.5");   // 12px
const SP_2 = spaceVar("2");      // 16px
const SP_3 = spaceVar("3");      // 24px

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
    font-family: var(--ui-dd-item-font-family, "Inter", sans-serif);
    font-weight: var(--ui-dd-item-font-weight, 400);
    color: var(--ui-dd-item-color, ${TEXT_PRIMARY});
    text-align: start;
    padding: 0;
    margin: 0;
  }

  .item:hover {
    background-color: var(--ui-dd-item-hover-bg, rgba(159, 177, 189, 0.1));
  }

  .item:active {
    background-color: var(--ui-dd-item-active-bg, rgba(159, 177, 189, 0.2));
  }

  .item:focus-visible {
    background-color: var(--ui-dd-item-focus-bg, rgba(159, 177, 189, 0.4));
    outline: none;
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .item,
  :host([size="m"]) .item {
    font-size: 14px;
    line-height: 20px;
    padding: ${SP_075} ${SP_2};
    gap: ${SP_1};
  }

  :host .leading,
  :host([size="m"]) .leading {
    width: 20px;
    height: 20px;
  }

  :host .secondary,
  :host([size="m"]) .secondary {
    font-size: 12px;
    line-height: 16px;
  }

  :host .description,
  :host([size="m"]) .description {
    font-size: 12px;
    line-height: 16px;
  }

  :host .submenu,
  :host([size="m"]) .submenu {
    width: 20px;
    height: 20px;
  }


  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .item {
    font-size: 12px;
    line-height: 16px;
    padding: ${SP_075} ${SP_15};
    gap: ${SP_1};
  }

  :host([size="s"]) .leading {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .secondary {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .description {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .submenu {
    width: 16px;
    height: 16px;
  }


  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .item {
    font-size: 16px;
    line-height: 24px;
    padding: 10px ${SP_2} 10px ${SP_3};
    gap: ${SP_15};
  }

  :host([size="l"]) .leading {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .secondary {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .description {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .submenu {
    width: 24px;
    height: 24px;
  }


  /* ── Disabled ───────────────────────────────────────────────────────────── */

  :host([disabled]) .item {
    color: var(--ui-dd-item-disabled-color, rgba(91, 114, 130, 0.5));
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
    gap: ${SP_05};
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
