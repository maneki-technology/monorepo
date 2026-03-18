import { semanticVar, colorVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const BLUE_60 = colorVar("blue", 60);
const SURFACE_BOLD = semanticVar("surface", "bold");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");
const BORDER_FOCUS = semanticVar("border", "focus");

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
    height: 2px;
    background: ${SURFACE_BOLD};
  }

  .fill {
    position: absolute;
    height: 2px;
    background: ${BLUE_60};
  }

  /* ── Handle ──────────────────────────────────────────────────────────────── */

  .handle {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 999px;
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
    inset: 2px;
    border-radius: 999px;
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
    margin-bottom: 8px;
    background: #090F14;
    color: #ffffff;
    font-size: 12px;
    line-height: 16px;
    padding: 4px 8px;
    border-radius: 2px;
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
    border-top: 4px solid #090F14;
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
    height: 12px;
  }

  :host([size="s"]) .track,
  :host([size="s"]) .fill {
    top: 5px;
  }

  :host([size="s"]) .handle {
    width: 12px;
    height: 12px;
  }

  :host([size="s"]) .labels {
    margin-top: 2px;
  }


  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .track-area,
  :host([size="m"]) .track-area {
    height: 16px;
  }

  :host .track,
  :host .fill,
  :host([size="m"]) .track,
  :host([size="m"]) .fill {
    top: 7px;
  }

  :host .handle,
  :host([size="m"]) .handle {
    width: 16px;
    height: 16px;
  }

  :host .labels,
  :host([size="m"]) .labels {
    margin-top: 4px;
  }


  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .track-area {
    height: 24px;
  }

  :host([size="l"]) .track,
  :host([size="l"]) .fill {
    top: 11px;
  }

  :host([size="l"]) .handle {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .labels {
    margin-top: 4px;
  }


  @media (prefers-reduced-motion: reduce) {
    .handle-inner {
      transition-duration: 0.01ms !important;
    }
  }
`;
