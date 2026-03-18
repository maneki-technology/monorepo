import { semanticVar, elevationVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const TEXT_PRIMARY = semanticVar("text", "primary");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const ELEVATION_03 = elevationVar("03");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    height: 100%;
  }

  /* ── Menu area ───────────────────────────────────────────────────────────── */

  .menu {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
  }

  /* ── Flyout submenu (collapsed mode) ─────────────────────────────────────── */

  .flyout {
    display: none;
    position: absolute;
    left: 40px;
    top: 0;
    min-width: 200px;
    max-height: 100%;
    overflow-y: auto;
    background-color: var(--ui-spm-flyout-bg, ${SURFACE_SECONDARY});
    box-shadow: var(--ui-spm-flyout-shadow, ${ELEVATION_03});
    flex-direction: column;
    z-index: 10;
    font-family: "Geist", sans-serif;
  }

  .flyout[open] {
    display: flex;
  }

  .flyout-title {
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--ui-spm-flyout-title, ${TEXT_PRIMARY});
    border-bottom: 1px solid var(--ui-spm-flyout-sep, ${BORDER_MINIMAL});
  }
`;
