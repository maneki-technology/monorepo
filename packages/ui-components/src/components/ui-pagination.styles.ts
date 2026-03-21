import {
  ACTIVE_SUBTLE,
  BLUE_60,
  BLUE_70,
  BORDER_MODERATE,
  BW_MD,
  BW_SM,
  DISABLED_TEXT,
  FONT_PRIMARY,
  HOVER_BOLD,
  RADIUS_SM,
  SELECTED_MINIMAL,
  SP_0_25,
  SP_0_5,
  SP_1,
  SP_2,
  SURFACE_PRIMARY,
  TEXT_PRIMARY,
  TYPE_BODY_02,
  TYPE_BODY_03,
} from "@maneki/foundation";

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
    font-family: ${FONT_PRIMARY};
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
    gap: ${SP_0_25};
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
    font-family: ${FONT_PRIMARY};
    font-weight: 400;
    color: ${TEXT_PRIMARY};
    padding: 0;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .item:hover {
    background: ${HOVER_BOLD};
  }

  .item:active {
    background: ${ACTIVE_SUBTLE};
  }

  .item:focus-visible {
    outline: ${BW_MD} solid ${BLUE_60};
    outline-offset: calc(-1 * ${BW_MD});
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
    font-family: ${FONT_PRIMARY};
    color: ${TEXT_PRIMARY};
    text-align: left;
  }

  .goto-input:focus {
    outline: ${BW_MD} solid ${BLUE_60};
    outline-offset: calc(-1 * ${BW_MD});
  }

  .page-size-select {
    border-width: ${BW_SM};
    border-style: solid;
    border-color: ${BORDER_MODERATE};
    border-radius: ${RADIUS_SM};
    background: ${SURFACE_PRIMARY};
    font-family: ${FONT_PRIMARY};
    color: ${TEXT_PRIMARY};
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%233e5463' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
  }

  .page-size-select:focus {
    outline: ${BW_MD} solid ${BLUE_60};
    outline-offset: calc(-1 * ${BW_MD});
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
    ${TYPE_BODY_02}
  }

  :host .item.nav-btn,
  :host([size="m"]) .item.nav-btn {
    padding: 0 12px 0 8px;
    gap: ${SP_0_5};
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
    ${TYPE_BODY_02}
  }

  :host .goto-input,
  :host([size="m"]) .goto-input {
    width: 48px;
    height: 32px;
    padding: 6px 8px;
    ${TYPE_BODY_02}
  }

  :host .page-size-select,
  :host([size="m"]) .page-size-select {
    width: auto;
    height: 32px;
    padding: 6px 24px 6px 8px;
    ${TYPE_BODY_02}
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .item {
    height: 24px;
    min-width: 24px;
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .item.nav-btn {
    padding: 0 8px 0 4px;
    gap: ${SP_0_5};
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
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .goto-input {
    width: 40px;
    height: 24px;
    padding: 4px 8px;
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .page-size-select {
    width: auto;
    height: 24px;
    padding: 4px 20px 4px 8px;
    ${TYPE_BODY_03}
  }

  /* ── Size: xs ────────────────────────────────────────────────────────────── */

  :host([size="xs"]) .item {
    height: 20px;
    min-width: 20px;
    ${TYPE_BODY_03}
  }

  :host([size="xs"]) .item.nav-btn {
    padding: 0 4px 0 2px;
    gap: ${SP_0_25};
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
    ${TYPE_BODY_03}
  }

  :host([size="xs"]) .goto-input {
    width: 32px;
    height: 20px;
    padding: 2px 8px;
    ${TYPE_BODY_03}
  }

  :host([size="xs"]) .page-size-select {
    width: auto;
    height: 20px;
    padding: 2px 18px 2px 8px;
    ${TYPE_BODY_03}
  }
`;
