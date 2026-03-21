import {
  BLUE_60,
  BORDER_FOCUS,
  BW_MD,
  DISABLED_TEXT,
  GRAY_110,
  RADIUS_PILL,
  RADIUS_SM,
  SP_0_25,
  SP_0_5,
  SP_1,
  SP_1_5,
  SP_2,
  SP_3,
  SURFACE_BOLD,
  TEXT_PRIMARY,
} from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SliderSize = "s" | "m" | "l";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    width: 100%;
    font-family: "Geist", sans-serif;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* ── Track area ──────────────────────────────────────────────────────────── */

  .track-area {
    position: relative;
    width: 100%;
    cursor: pointer;
  }

  .track {
    position: absolute;
    left: 0;
    right: 0;
    height: ${BW_MD};
    background: ${SURFACE_BOLD};
  }

  .fill {
    position: absolute;
    height: ${BW_MD};
    background: ${BLUE_60};
  }

  /* ── Handle ──────────────────────────────────────────────────────────────── */

  .handle {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: ${RADIUS_PILL};
    background: ${BLUE_60};
    cursor: grab;
    z-index: 1;
    touch-action: none;
  }

  .handle:active {
    cursor: grabbing;
  }

  .handle-inner {
    position: absolute;
    inset: ${BW_MD};
    border-radius: ${RADIUS_PILL};
    background: #ffffff;
    transition: background 0.1s ease;
  }

  .handle.active .handle-inner {
    background: ${BLUE_60};
  }

  .handle:focus-visible {
    outline: 2px solid ${BORDER_FOCUS};
    outline-offset: 2px;
  }

  /* ── Labels ──────────────────────────────────────────────────────────────── */

  .labels {
    display: none;
    justify-content: space-between;
    font-size: 12px;
    line-height: 16px;
    color: ${TEXT_PRIMARY};
  }

  :host([labels]) .labels {
    display: flex;
  }

  /* ── Tooltip ─────────────────────────────────────────────────────────────── */

  .tooltip {
    display: none;
    position: absolute;
    left: 50%;
    bottom: 100%;
    transform: translateX(-50%);
    margin-bottom: ${SP_1};
    background: ${GRAY_110};
    color: #ffffff;
    font-size: 12px;
    line-height: 16px;
    padding: ${SP_0_5} ${SP_1};
    border-radius: ${RADIUS_SM};
    white-space: nowrap;
    pointer-events: none;
    z-index: 2;
  }

  .tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -4px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid ${GRAY_110};
  }

  .handle.active .tooltip {
    display: block;
  }

  /* ── Disabled ────────────────────────────────────────────────────────────── */

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }

  :host([disabled]) .handle {
    cursor: default;
  }

  /* ── Size: S ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .track-area {
    height: ${SP_1_5};
  }

  :host([size="s"]) .track,
  :host([size="s"]) .fill {
    top: 5px;
  }

  :host([size="s"]) .handle {
    width: ${SP_1_5};
    height: ${SP_1_5};
  }

  :host([size="s"]) .labels {
    margin-top: ${SP_0_25};
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .track-area,
  :host([size="m"]) .track-area {
    height: ${SP_2};
  }

  :host .track,
  :host .fill,
  :host([size="m"]) .track,
  :host([size="m"]) .fill {
    top: 7px;
  }

  :host .handle,
  :host([size="m"]) .handle {
    width: ${SP_2};
    height: ${SP_2};
  }

  :host .labels,
  :host([size="m"]) .labels {
    margin-top: ${SP_0_5};
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .track-area {
    height: ${SP_3};
  }

  :host([size="l"]) .track,
  :host([size="l"]) .fill {
    top: 11px;
  }

  :host([size="l"]) .handle {
    width: ${SP_3};
    height: ${SP_3};
  }

  :host([size="l"]) .labels {
    margin-top: ${SP_0_5};
  }

  @media (prefers-reduced-motion: reduce) {
    .handle-inner {
      transition-duration: 0.01ms !important;
    }
  }
`;
