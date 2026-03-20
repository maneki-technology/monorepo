import { semanticVar, colorVar, spaceVar, borderWidthVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const ICON_PRIMARY = semanticVar("icon", "primary");
const BORDER_FOCUS = semanticVar("border", "focus");
const HOVER_MINIMAL = semanticVar("stateHover", "surfaceMinimal");
const HOVER_MODERATE = semanticVar("stateHover", "surfaceModerate");
const SELECTED_OVERLAY = semanticVar("stateSelected", "surfaceOverlay");
const BW_MD = borderWidthVar("md");             // 2px
const SP_05 = spaceVar("0.5");                 // 4px
const SP_075 = spaceVar("0.75");               // 6px
const SP_1 = spaceVar("1");                     // 8px
const SP_3 = spaceVar("3");                     // 24px
const SP_4 = spaceVar("4");                     // 32px
const SP_7 = spaceVar("7");                     // 56px
const SP_10 = spaceVar("10");                   // 80px
// ─── Types ───────────────────────────────────────────────────────────────────

export type TreeItemSize = "s" | "m" | "l";
export type TreeItemLevel = "parent" | "child-1" | "child-2" | "child-3";
export type TreeItemArrow = "none" | "closed" | "open";
export type TreeItemState = "enabled" | "hover" | "selected";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const TREE_ITEM_STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    align-items: center;
    width: 100%;
    font-family: "Geist", sans-serif;
    cursor: pointer;
    overflow: hidden;
    max-height: 100px;
    transition: max-height 0.2s ease, opacity 0.2s ease;
    opacity: 1;
  }

  :host([hidden]) {
    max-height: 0;
    opacity: 0;
    padding: 0;
    pointer-events: none;
  }

  .base {
    display: flex;
    flex: 1 0 0;
    gap: ${SP_05};
    align-items: center;
    min-width: 0;
    transition: background 0.15s ease;
  }

  /* ── Chevron ─────────────────────────────────────────────────────────────── */

  .chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${ICON_PRIMARY};
    transition: transform 0.2s ease;
  }

  :host([arrow="open"]) .chevron {
    transform: rotate(0deg);
  }

  :host([arrow="closed"]) .chevron {
    transform: rotate(-90deg);
  }

  .chevron .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0;
  }

  :host([arrow="none"]) .chevron {
    visibility: hidden;
  }

  /* ── Content ─────────────────────────────────────────────────────────────── */

  .content {
    display: flex;
    flex: 1 0 0;
    gap: ${SP_05};
    align-items: center;
    min-width: 0;
  }

  .leading-icon {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${ICON_PRIMARY};
  }

  :host([leading-icon]) .leading-icon {
    display: flex;
  }

  .leading-icon .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0;
  }

  .checkbox-slot {
    display: none;
    flex-shrink: 0;
  }

  :host([checkbox]) .checkbox-slot {
    display: flex;
  }

  .label {
    flex: 1 0 0;
    min-width: 0;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .secondary-label {
    display: none;
    flex: 1 0 0;
    min-width: 0;
    color: ${TEXT_SECONDARY};
    text-align: right;
    white-space: nowrap;
  }

  :host([secondary-label]) .secondary-label {
    display: block;
  }

  /* ── States ──────────────────────────────────────────────────────────────── */

  :host(:hover) .base {
    background: ${HOVER_MINIMAL};
  }

  :host([selected]) .base {
    background: ${SELECTED_OVERLAY};
  }

  :host(:focus-visible) {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .base {
    padding: ${SP_05} ${SP_075};
  }

  :host([size="s"]) .chevron {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .chevron .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .leading-icon {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .leading-icon .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .label {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .secondary-label {
    font-size: 12px;
    line-height: 16px;
  }

  /* Level indents for S */
  :host([size="s"][level="parent"]) .base { padding-left: ${SP_075} }
  :host([size="s"][level="child-1"]) .base { padding-left: ${SP_3} }
  :host([size="s"][level="child-2"]) .base { padding-left: 42px }
  :host([size="s"][level="child-3"]) .base { padding-left: 60px }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="m"]) .base {
    padding: ${SP_05} ${SP_1};
  }

  :host .chevron,
  :host([size="m"]) .chevron {
    width: 20px;
    height: 20px;
  }

  :host .chevron .material-symbols-outlined,
  :host([size="m"]) .chevron .material-symbols-outlined {
    font-size: 20px;
  }

  :host .leading-icon,
  :host([size="m"]) .leading-icon {
    width: 18px;
    height: 18px;
  }

  :host .leading-icon .material-symbols-outlined,
  :host([size="m"]) .leading-icon .material-symbols-outlined {
    font-size: 18px;
  }

  :host .label,
  :host([size="m"]) .label {
    font-size: 14px;
    line-height: 20px;
  }

  :host .secondary-label,
  :host([size="m"]) .secondary-label {
    font-size: 12px;
    line-height: 20px;
  }

  /* Level indents for M */
  :host([size="m"][level="parent"]) .base,
  :host([level="parent"]) .base { padding-left: ${SP_1} }
  :host([size="m"][level="child-1"]) .base,
  :host([level="child-1"]) .base { padding-left: ${SP_4} }
  :host([size="m"][level="child-2"]) .base,
  :host([level="child-2"]) .base { padding-left: ${SP_7} }
  :host([size="m"][level="child-3"]) .base,
  :host([level="child-3"]) .base { padding-left: ${SP_10} }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    padding: ${SP_1};
  }

  :host([size="l"]) .chevron {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .chevron .material-symbols-outlined {
    font-size: 24px;
  }

  :host([size="l"]) .leading-icon {
    width: 20px;
    height: 20px;
  }

  :host([size="l"]) .leading-icon .material-symbols-outlined {
    font-size: 20px;
  }

  :host([size="l"]) .content {
    gap: ${SP_075};
  }

  :host([size="l"]) .label {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .secondary-label {
    font-size: 14px;
    line-height: 24px;
  }

  /* Level indents for L */
  :host([size="l"][level="parent"]) .base { padding-left: ${SP_1} }
  :host([size="l"][level="child-1"]) .base { padding-left: ${SP_4} }
  :host([size="l"][level="child-2"]) .base { padding-left: ${SP_7} }
  :host([size="l"][level="child-3"]) .base { padding-left: ${SP_10} }

  @media (prefers-reduced-motion: reduce) {
    :host,
    .base,
    .chevron {
      transition-duration: 0.01ms !important;
    }
  }
`;
