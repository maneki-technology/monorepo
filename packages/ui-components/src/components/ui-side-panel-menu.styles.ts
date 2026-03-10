import { semanticVar, elevationVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_SECONDARY = semanticVar("surface", "secondary");
const TEXT_PRIMARY = semanticVar("text", "primary");
const ICON_PRIMARY_TOKEN = semanticVar("icon", "primary");
const BORDER_MINIMAL = semanticVar("border", "minimal");
const BORDER_MODERATE = semanticVar("border", "moderate");
const ELEVATION_03 = elevationVar("03");
const BORDER_FOCUS = semanticVar("border", "focus");
const SP_1 = spaceVar("1");       // 8px
const SP_2 = spaceVar("2");       // 16px

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    width: 300px;
    height: 100%;
    background-color: var(--ui-spm-bg, ${SURFACE_SECONDARY});
    font-family: "Inter", sans-serif;
    position: relative;
    transition: width 0.2s ease;
  }

  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  /* ── Right border (inset shadow) ─────────────────────────────────────────── */

  :host(:not([overlay])) .container::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset -1px 0 0 0 var(--ui-spm-border, ${BORDER_MODERATE});
  }

  /* ── Overlay mode ────────────────────────────────────────────────────────── */

  :host([overlay]) {
    box-shadow: var(--ui-spm-shadow, ${ELEVATION_03});
  }

  /* ── Collapsed mode ──────────────────────────────────────────────────────── */

  :host([state="collapsed"]) {
    width: 40px;
  }

  /* ── Mobile full-width overlay ───────────────────────────────────────────── */

  :host([mobile][state="expanded"]) {
    position: fixed;
    inset: 0;
    width: 100%;
    z-index: 100;
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */

  .header {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${SP_1};
    padding-left: ${SP_2};
    gap: ${SP_1};
    background-color: var(--ui-spm-header-bg, ${SURFACE_SECONDARY});
    flex-shrink: 0;
  }

  .header-title {
    flex: 1 0 0;
    min-width: 0;
    overflow: hidden;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    color: var(--ui-spm-header-text, ${TEXT_PRIMARY});
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .header-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    line-height: 0;
    color: var(--ui-spm-toggle-icon, ${ICON_PRIMARY_TOKEN});
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    border-radius: 2px;
  }

  .header-toggle:focus-visible {
    outline: 2px solid ${BORDER_FOCUS};
    outline-offset: -2px;
  }

  .header-toggle svg {
    width: 100%;
    height: 100%;
  }

  /* ── Collapsed header ────────────────────────────────────────────────────── */

  :host([state="collapsed"]) .header {
    justify-content: center;
    padding: ${SP_1};
  }

  :host([state="collapsed"]) .header-title {
    display: none;
  }

  /* ── Separator ───────────────────────────────────────────────────────────── */

  .separator {
    height: 1px;
    background-color: var(--ui-spm-separator, ${BORDER_MINIMAL});
    flex-shrink: 0;
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
    font-family: "Inter", sans-serif;
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

  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    :host {
      transition-duration: 0.01ms !important;
    }
  }
`;
