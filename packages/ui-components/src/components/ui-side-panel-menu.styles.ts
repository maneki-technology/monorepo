import {
  BORDER_MINIMAL,
  BW_SM,
  ELEVATION_03,
  FONT_PRIMARY,
  SP_0_5,
  SP_1_25,
  SP_2,
  SP_5,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
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
    height: 100%;
  }

  /* ── Menu area ───────────────────────────────────────────────────────────── */

  .menu {
    display: flex;
    flex-direction: column;
    gap: var(--ui-spm-item-gap, ${SP_0_5});
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .menu ::slotted(div) {
    display: flex;
    flex-direction: column;
    gap: var(--ui-spm-item-gap, ${SP_0_5});
  }

  /* ── Flyout submenu (collapsed mode) ─────────────────────────────────────── */

  .flyout {
    display: none;
    position: absolute;
    left: ${SP_5};
    top: 0;
    min-width: 200px;
    max-height: 100%;
    overflow-y: auto;
    background-color: var(--ui-spm-flyout-bg, ${SURFACE_SECONDARY});
    box-shadow: var(--ui-spm-flyout-shadow, ${ELEVATION_03});
    flex-direction: column;
    z-index: 10;
    font-family: ${FONT_PRIMARY};
  }

  .flyout[open] {
    display: flex;
  }

  .flyout-title {
    padding: ${SP_1_25} ${SP_2};
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: var(--ui-spm-flyout-title, ${TEXT_PRIMARY});
    border-bottom: ${BW_SM} solid var(--ui-spm-flyout-sep, ${BORDER_MINIMAL});
  }
`;
