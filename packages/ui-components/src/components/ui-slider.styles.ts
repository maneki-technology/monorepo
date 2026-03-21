import { semanticVar, colorVar, spaceVar, radiusVar, borderWidthVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const BLUE_60 = colorVar("blue", 60);
const GRAY_110 = colorVar("gray", 110);
const SURFACE_BOLD = semanticVar("surface", "bold");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const BORDER_FOCUS = semanticVar("border", "focus");
const RADIUS_SM = radiusVar("sm");             // 2px
const RADIUS_PILL = radiusVar("pill");         // 999px
const BW_MD = borderWidthVar("md");             // 2px
const SP_025 = spaceVar("0.25");               // 2px
const SP_05 = spaceVar("0.5");                 // 4px
const SP_1 = spaceVar("1");                     // 8px
const SP_15 = spaceVar("1.5");                 // 12px
const SP_2 = spaceVar("2");                     // 16px
const SP_3 = spaceVar("3");                     // 24px
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
    padding: ${SP_05} ${SP_1};
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
    height: ${SP_15};
  }

  :host([size="s"]) .track,
  :host([size="s"]) .fill {
    top: 5px;
  }

  :host([size="s"]) .handle {
    width: ${SP_15};
    height: ${SP_15};
  }

  :host([size="s"]) .labels {
    margin-top: ${SP_025};
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
    margin-top: ${SP_05};
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
    margin-top: ${SP_05};
  }


  @media (prefers-reduced-motion: reduce) {
    .handle-inner {
      transition-duration: 0.01ms !important;
    }
  }
`;
