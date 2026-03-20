import { semanticVar, spaceVar, radiusVar, elevationVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const TEXT_TERTIARY = semanticVar("text", "tertiary");
const BORDER_MODERATE = semanticVar("border", "moderate");
const SURFACE_PRIMARY = semanticVar("surface", "primary");
const ICON_SECONDARY = semanticVar("icon", "secondary");
const HOVER_BORDER = semanticVar("stateHover", "borderModerate");
const FOCUS_BORDER = semanticVar("border", "focus");
const HOVER_MINIMAL = semanticVar("stateHover", "surfaceMinimal");

const RADIUS_SM = radiusVar("sm");         // 2px
const ELEV_03 = elevationVar("03");
const SP_025 = spaceVar("0.25");           // 2px
const SP_05 = spaceVar("0.5");             // 4px
const SP_075 = spaceVar("0.75");           // 6px
const SP_1 = spaceVar("1");                 // 8px
const SP_15 = spaceVar("1.5");             // 12px
const SP_2 = spaceVar("2");                 // 16px
const SP_3 = spaceVar("3");                 // 24px
const SP_4 = spaceVar("4");                 // 32px
const SP_5 = spaceVar("5");                 // 40px
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
    font-family: "Geist", sans-serif;
  }

  .wrapper {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: ${SP_05} ${SP_1};
    border: 1px solid ${BORDER_MODERATE};
    background: ${SURFACE_PRIMARY};
    transition: border-color 0.15s ease;
  }

  .wrapper:hover {
    border-color: ${HOVER_BORDER};
  }

  .wrapper:focus-within {
    border-color: ${FOCUS_BORDER};
    outline: 1px solid ${FOCUS_BORDER};
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
    gap: ${SP_05};
    flex-wrap: wrap;
  }

  .input {
    flex: 1;
    min-width: 80px;
    border: none;
    background: transparent;
    font-family: "Geist", sans-serif;
    color: ${TEXT_PRIMARY};
    outline: none;
  }

  .input::placeholder {
    color: ${TEXT_TERTIARY};
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .wrapper {
    padding: ${SP_025} ${SP_1};
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
    font-size: 12px;
    line-height: 16px;
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .wrapper,
  :host([size="m"]) .wrapper {
    padding: ${SP_05} ${SP_15};
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
    font-size: 14px;
    line-height: 20px;
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .wrapper {
    padding: ${SP_075} ${SP_15};
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
    font-size: 16px;
    line-height: 24px;
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
    box-shadow: ${ELEV_03};
    padding: ${SP_05} 0;
    margin-top: ${SP_025};
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
    padding: ${SP_05} ${SP_2};
    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
    color: ${TEXT_SECONDARY};
    text-transform: uppercase;
    white-space: nowrap;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: ${SP_1};
    padding: ${SP_075} ${SP_2};
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    color: ${TEXT_PRIMARY};
    cursor: pointer;
    white-space: nowrap;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    font-family: "Geist", sans-serif;
  }

  .menu-item:hover {
    background: ${HOVER_MINIMAL};
  }

  .menu-item.selected {
    font-weight: 500;
    color: ${FOCUS_BORDER};
  }

  @media (prefers-reduced-motion: reduce) {
    .menu {
      transition-duration: 0.01ms !important;
    }
  }
`;
