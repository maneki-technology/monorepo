import { semanticVar, colorVar, spaceVar, radiusVar, borderWidthVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const BORDER_MODERATE = semanticVar("border", "moderate");
const BLUE_60 = colorVar("blue", 60);
const BLUE_70 = colorVar("blue", 70);
const SELECTED_MINIMAL = semanticVar("stateSelected", "surfaceMinimal");
const HOVER_SURFACE = semanticVar("stateHover", "surfaceBold");
const ACTIVE_SURFACE = semanticVar("stateActive", "surfaceSubtle");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const SURFACE_PRIMARY = semanticVar("surface", "primary");

const SP_025 = spaceVar("0.25");   // 2px
const SP_05 = spaceVar("0.5");     // 4px
const SP_1 = spaceVar("1");         // 8px
const SP_2 = spaceVar("2");         // 16px
const RADIUS_SM = radiusVar("sm");
const BW_SM = borderWidthVar("sm");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
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
    font-family: "Geist", sans-serif;
  }

  /* ── Layout ──────────────────────────────────────────────────────────────── */

  .wrapper {
    display: flex;
    align-items: center;
    gap: ${SP_2};
    width: 100%;
  }

  .nav {
    display: flex;
    align-items: center;
    gap: ${SP_025};
  }

  .addon {
    display: flex;
    align-items: center;
    gap: ${SP_2};
    margin-left: auto;
  }

  /* ── Pagination item (button) ────────────────────────────────────────────── */

  .item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: ${RADIUS_SM};
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: "Geist", sans-serif;
    font-weight: 400;
    color: ${TEXT_PRIMARY};
    padding: 0;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .item:hover {
    background: ${HOVER_SURFACE};
  }

  .item:active {
    background: ${ACTIVE_SURFACE};
  }

  .item:focus-visible {
    outline: 2px solid ${BLUE_60};
    outline-offset: -2px;
  }

  .item[aria-current="page"] {
    background: ${SELECTED_MINIMAL};
    color: ${BLUE_70};
  }

  .item[aria-current="page"]:hover {
    background: ${SELECTED_MINIMAL};
    filter: brightness(0.95);
  }

  .item[disabled] {
    color: ${DISABLED_TEXT};
    cursor: default;
    pointer-events: none;
  }

  .item .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }


  .item .icon .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    display: inline-block;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Goto / page status ──────────────────────────────────────────────────── */

  .goto,
  .page-status {
    display: flex;
    align-items: center;
    gap: ${SP_1};
    font-weight: 400;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
  }

  .goto-input {
    border-width: ${BW_SM};
    border-style: solid;
    border-color: ${BORDER_MODERATE};
    border-radius: ${RADIUS_SM};
    background: ${SURFACE_PRIMARY};
    font-family: "Geist", sans-serif;
    color: ${TEXT_PRIMARY};
    text-align: left;
  }

  .goto-input:focus {
    outline: 2px solid ${BLUE_60};
    outline-offset: -2px;
  }

  .page-size-select {
    border-width: ${BW_SM};
    border-style: solid;
    border-color: ${BORDER_MODERATE};
    border-radius: ${RADIUS_SM};
    background: ${SURFACE_PRIMARY};
    font-family: "Geist", sans-serif;
    color: ${TEXT_PRIMARY};
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%233e5463' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
  }

  .page-size-select:focus {
    outline: 2px solid ${BLUE_60};
    outline-offset: -2px;
  }

  /* ── Minimal layout ──────────────────────────────────────────────────────── */

  :host([type="minimal"]) .wrapper {
    gap: ${SP_1};
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .item,
  :host([size="m"]) .item {
    height: 32px;
    min-width: 32px;
    font-size: 14px;
    line-height: 20px;
  }

  :host .item.nav-btn,
  :host([size="m"]) .item.nav-btn {
    padding: 0 12px 0 8px;
    gap: ${SP_05};
  }

  :host .item.nav-btn.nav-next,
  :host .item.nav-btn.nav-last,
  :host([size="m"]) .item.nav-btn.nav-next,
  :host([size="m"]) .item.nav-btn.nav-last {
    padding: 0 8px 0 12px;
  }

  :host .item.nav-icon,
  :host([size="m"]) .item.nav-icon {
    padding: 0 8px;
    width: 32px;
  }

  :host .item .icon,
  :host([size="m"]) .item .icon {
    width: 20px;
    height: 20px;
  }

  :host .item .icon .material-symbols-outlined,
  :host([size="m"]) .item .icon .material-symbols-outlined {
    font-size: 20px;
  }

  :host .goto,
  :host .page-status,
  :host([size="m"]) .goto,
  :host([size="m"]) .page-status {
    font-size: 14px;
    line-height: 20px;
  }

  :host .goto-input,
  :host([size="m"]) .goto-input {
    width: 48px;
    height: 32px;
    padding: 6px 8px;
    font-size: 14px;
    line-height: 20px;
  }

  :host .page-size-select,
  :host([size="m"]) .page-size-select {
    width: auto;
    height: 32px;
    padding: 6px 24px 6px 8px;
    font-size: 14px;
    line-height: 20px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .item {
    height: 24px;
    min-width: 24px;
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .item.nav-btn {
    padding: 0 8px 0 4px;
    gap: ${SP_05};
  }

  :host([size="s"]) .item.nav-btn.nav-next,
  :host([size="s"]) .item.nav-btn.nav-last {
    padding: 0 4px 0 8px;
  }

  :host([size="s"]) .item.nav-icon {
    padding: 0 4px;
    width: 24px;
  }

  :host([size="s"]) .item .icon {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .item .icon .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .goto,
  :host([size="s"]) .page-status {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .goto-input {
    width: 40px;
    height: 24px;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .page-size-select {
    width: auto;
    height: 24px;
    padding: 4px 20px 4px 8px;
    font-size: 12px;
    line-height: 16px;
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .item {
    height: 20px;
    min-width: 20px;
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="xs"]) .item.nav-btn {
    padding: 0 4px 0 2px;
    gap: ${SP_025};
  }

  :host([size="xs"]) .item.nav-btn.nav-next,
  :host([size="xs"]) .item.nav-btn.nav-last {
    padding: 0 2px 0 4px;
  }

  :host([size="xs"]) .item.nav-icon {
    padding: 0 2px;
    width: 20px;
  }

  :host([size="xs"]) .item .icon {
    width: 16px;
    height: 16px;
  }

  :host([size="xs"]) .item .icon .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="xs"]) .goto,
  :host([size="xs"]) .page-status {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="xs"]) .goto-input {
    width: 32px;
    height: 20px;
    padding: 2px 8px;
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="xs"]) .page-size-select {
    width: auto;
    height: 20px;
    padding: 2px 18px 2px 8px;
    font-size: 12px;
    line-height: 16px;
  }
`;
