import {
  BORDER_FOCUS,
  BORDER_MODERATE,
  ELEVATION_03,
  FONT_PRIMARY,
  HOVER_BORDER_MODERATE,
  HOVER_MINIMAL,
  ICON_SECONDARY,
  RADIUS_SM,
  SP_0_25,
  SP_0_5,
  SP_0_75,
  SP_1,
  SP_1_5,
  SP_2,
  SP_3,
  SP_4,
  SP_5,
  SURFACE_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_HEADING_07,
} from "@maneki/foundation";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const FIELD_STYLES = /* css */ `
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
    display: block;
    width: 100%;
    font-family: ${FONT_PRIMARY};
  }

  .wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${SP_0_5} ${SP_1};
    border: 1px solid ${BORDER_MODERATE};
    background: ${SURFACE_PRIMARY};
    transition: border-color 0.15s ease;
  }

  .wrapper:hover {
    border-color: ${HOVER_BORDER_MODERATE};
  }

  .wrapper:focus-within {
    border-color: ${BORDER_FOCUS};
    outline: 1px solid ${BORDER_FOCUS};
    outline-offset: -1px;
  }

  .search-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${ICON_SECONDARY};
  }

  .search-icon .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0;
  }

  .tags {
    display: flex;
    align-items: center;
    gap: ${SP_0_5};
    flex-wrap: wrap;
  }

  .input {
    flex: 1;
    min-width: 80px;
    border: none;
    background: transparent;
    font-family: ${FONT_PRIMARY};
    color: ${TEXT_PRIMARY};
    outline: none;
  }

  .input::placeholder {
    color: ${TEXT_TERTIARY};
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .wrapper {
    padding: ${SP_0_25} ${SP_1};
    min-height: ${SP_3};
    border-radius: ${RADIUS_SM};
  }

  :host([size="s"]) .search-icon {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .search-icon .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .input {
    ${TYPE_BODY_03}
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .wrapper,
  :host([size="m"]) .wrapper {
    padding: ${SP_0_5} ${SP_1_5};
    min-height: ${SP_4};
    border-radius: ${RADIUS_SM};
  }

  :host .search-icon,
  :host([size="m"]) .search-icon {
    width: 20px;
    height: 20px;
  }

  :host .search-icon .material-symbols-outlined,
  :host([size="m"]) .search-icon .material-symbols-outlined {
    font-size: 20px;
  }

  :host .input,
  :host([size="m"]) .input {
    ${TYPE_BODY_02}
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .wrapper {
    padding: ${SP_0_75} ${SP_1_5};
    min-height: ${SP_5};
    border-radius: ${RADIUS_SM};
  }

  :host([size="l"]) .search-icon {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .search-icon .material-symbols-outlined {
    font-size: 24px;
  }

  :host([size="l"]) .input {
    ${TYPE_BODY_01}
  }

  /* ── Disabled ────────────────────────────────────────────────────────────── */

  :host([disabled]) .wrapper {
    opacity: 0.5;
    pointer-events: none;
  }

  /* ── Floating menu ───────────────────────────────────────────────────────── */

  .menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    flex-direction: column;
    min-width: 168px;
    max-width: 280px;
    background: ${SURFACE_PRIMARY};
    border-radius: ${RADIUS_SM};
    box-shadow: ${ELEVATION_03};
    padding: ${SP_0_5} 0;
    margin-top: ${SP_0_25};
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  :host([menu-open]) .menu {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  :host {
    position: relative;
  }

  .menu-heading {
    padding: ${SP_0_5} ${SP_2};
    ${TYPE_HEADING_07}
    color: ${TEXT_SECONDARY};
    text-transform: uppercase;
    white-space: nowrap;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: ${SP_1};
    padding: ${SP_0_75} ${SP_2};
    ${TYPE_BODY_02}
    color: ${TEXT_PRIMARY};
    cursor: pointer;
    white-space: nowrap;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
  }

  .menu-item:hover {
    background: ${HOVER_MINIMAL};
  }

  .menu-item.selected {
    font-weight: 500;
    color: ${BORDER_FOCUS};
  }

  @media (prefers-reduced-motion: reduce) {
    .menu {
      transition-duration: 0.01ms !important;
    }
  }
`;
