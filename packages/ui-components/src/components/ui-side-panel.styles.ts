import {
  BORDER_FOCUS,
  BORDER_MINIMAL,
  BORDER_SUBTLE,
  BW_MD,
  ELEVATION_03,
  FONT_PRIMARY,
  ICON_PRIMARY,
  SP_1,
  SP_2,
  SURFACE_PRIMARY,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
} from "@maneki/foundation";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
    font-display: swap;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    width: var(--ui-sp-width, 300px);
    height: 100%;
    background-color: var(--ui-sp-bg, ${SURFACE_SECONDARY});
    font-family: ${FONT_PRIMARY};
    position: relative;
    transition: width 0.2s ease, transform 0.2s ease;
  }

  /* ── Dismissible panels: animate from display:none via @starting-style ── */

  :host([dismissible]) {
    display: none;
  }

  :host([dismissible][open]) {
    display: block;
    transform: translateX(0);
    transition: transform 0.2s ease, display 0.2s ease allow-discrete;
  }

  :host([dismissible]:not([open])) {
    display: block;
    transform: translateX(-100%);
    transition: transform 0.2s ease, display 0.2s ease allow-discrete;
  }

  :host([dismissible][position="right"]:not([open])) {
    transform: translateX(100%);
  }

  @starting-style {
    :host([dismissible][open]) {
      transform: translateX(-100%);
    }
    :host([dismissible][position="right"][open]) {
      transform: translateX(100%);
    }
  }


  .container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  /* ── Right border (inset shadow) ───────────────────────────────────── */

  :host(:not([overlay]):not([position="right"])) .container::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset -1px 0 0 0 var(--ui-sp-border, ${BORDER_SUBTLE});
  }

  /* ── Right position ───────────────────────────────────────────── */

  :host([position="right"]:not([overlay])) .container::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset 1px 0 0 0 var(--ui-sp-border, ${BORDER_SUBTLE});
  }

  :host(:not([overlay])) .container::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset -1px 0 0 0 var(--ui-sp-border, ${BORDER_SUBTLE});
  }

  /* ── Overlay mode ────────────────────────────────────────────────────────── */

  :host([overlay]) {
    box-shadow: var(--ui-sp-shadow, ${ELEVATION_03});
  }

  /* ── Collapsed mode ──────────────────────────────────────────────────────── */

  :host([state="collapsed"]) {
    width: var(--ui-sp-collapsed-width, 40px);
  }

  /* Mobile: host takes no layout space, container handles positioning */
  :host([mobile]) {
    width: 0;
    overflow: visible;
    transition: none;
  }
  /* ── Mobile: slide-in/out via container ─────────────────────────────────── */

  :host([mobile]) .container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100;
    background-color: var(--ui-sp-bg, ${SURFACE_SECONDARY});
    transform: translateX(0);
    transition: transform 0.25s ease;
  }

  :host([mobile][state="collapsed"]) .container {
    transform: translateX(-100%);
    pointer-events: none;
  }

  .mobile-trigger {
    display: none;
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 101;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    border: 1px solid var(--ui-sp-border, ${BORDER_SUBTLE});
    background-color: var(--ui-sp-bg, ${SURFACE_SECONDARY});
    color: var(--ui-sp-toggle-icon, ${ICON_PRIMARY});
    cursor: pointer;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-trigger .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
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

  :host([mobile][state="collapsed"]) .mobile-trigger {
    display: flex;
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */

  .header {
    display: flex;
    align-items: center;
    height: 40px;
    padding: ${SP_1};
    padding-left: ${SP_2};
    gap: ${SP_1};
    background-color: var(--ui-sp-header-bg, ${SURFACE_SECONDARY});
    flex-shrink: 0;
  }

  slot[name="header"] {
    flex: 1 0 0;
    min-width: 0;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .header-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    line-height: 0;
    color: var(--ui-sp-toggle-icon, ${ICON_PRIMARY});
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    flex-shrink: 0;
    border-radius: 2px;
  }

  .header-toggle .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: 20px;
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

  .header-toggle:focus-visible {
    outline: ${BW_MD} solid ${BORDER_FOCUS};
    outline-offset: calc(-1 * ${BW_MD});
  }

  /* ── Collapsed header ────────────────────────────────────────────────────── */

  :host([state="collapsed"]) .header {
    justify-content: center;
    padding: ${SP_1};
  }

  :host([state="collapsed"]) slot[name="header"] {
    display: none;
  }

  /* ── Separator ───────────────────────────────────────────────────────────── */

  .separator {
    height: 1px;
    background-color: var(--ui-sp-separator, ${BORDER_MINIMAL});
    flex-shrink: 0;
  }

  /* ── Body ─────────────────────────────────────────────────────────────────── */

  .body {
    flex: 1;
    min-height: 0;
  }

  /* ── Footer ──────────────────────────────────────────────────────────────── */

  .footer {
    flex-shrink: 0;
    border-top: 1px solid var(--ui-sp-separator, ${BORDER_MINIMAL});
  }

  .footer:empty {
    display: none;
  }

  :host([mobile][state="collapsed"]) .footer {
    display: none;
  }

  /* ── no-collapse: only hide desktop toggle, mobile still works ─────────── */

  :host([no-collapse]:not([mobile])) .header-toggle {
    display: none;
  }

  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    :host {
      transition-duration: 0.01ms !important;
    }
  }
`;
