import { semanticVar, colorVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const SURFACE_TERTIARY = semanticVar("surface", "tertiary");

// ─── Status color maps ───────────────────────────────────────────────────────

// Fill colors (the progress indicator)
const STATUS_FILL: Record<string, string> = {
  none: "#5B7282",
  information: "#186ADE",
  success: "#077D55",
  warning: "#F5C518",
  error: "#D91F11",
  open: "#43C478",
  complete: "#077D55",
  suspended: "#F7E379",
  cancelled: "#FABBB4",
};

// Track colors (the background)
const STATUS_TRACK: Record<string, string> = {
  none: "#DCE3E8",
  information: "#DCE3E8",
  success: "#DCE3E8",
  warning: "#DCE3E8",
  error: "#DCE3E8",
  open: "#C7EBD1",
  complete: "#DCE3E8",
  suspended: "#FAF6CF",
  cancelled: "#FADCD9",
};

// Inner label fill (lighter shades for inner-label mode)
const STATUS_INNER_FILL: Record<string, string> = {
  none: "#9FB1BD",
  information: "#75B1FF",
  success: "#077D55",
  warning: "#F5C518",
  error: "#D91F11",
  open: "#43C478",
  complete: "#077D55",
  suspended: "#F7E379",
  cancelled: "#FABBB4",
};

const STATUS_INNER_TRACK: Record<string, string> = {
  none: "#DCE3E8",
  information: "#D4E4FA",
  success: "#DCE3E8",
  warning: "#DCE3E8",
  error: "#DCE3E8",
  open: "#C7EBD1",
  complete: "#DCE3E8",
  suspended: "#FAF6CF",
  cancelled: "#FADCD9",
};

export {
  TEXT_PRIMARY,
  SURFACE_TERTIARY,
  STATUS_FILL,
  STATUS_TRACK,
  STATUS_INNER_FILL,
  STATUS_INNER_TRACK,
};

// ─── Styles ──────────────────────────────────────────────────────────────────

export const BAR_STYLES = /* css */ `
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
    flex-direction: column;
    width: 100%;
  }

  /* ── Top label ───────────────────────────────────────────────────────────── */

  .top-label {
    display: none;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    color: ${TEXT_PRIMARY};
  }

  :host([label="top-label"]) .top-label {
    display: flex;
  }

  .top-label .label-text {
    flex: 1;
    min-width: 0;
  }

  .top-label .value-text {
    flex-shrink: 0;
    text-align: right;
    white-space: nowrap;
  }

  /* ── Bar ──────────────────────────────────────────────────────────────────── */

  .bar {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .track {
    position: absolute;
    inset: 0;
  }

  .fill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    transition: width 0.3s ease;
  }

  /* ── Inner label ─────────────────────────────────────────────────────────── */

  .inner-label {
    display: none;
    position: absolute;
    inset: 0;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    color: ${TEXT_PRIMARY};
  }

  :host([label="inner-label"]) .inner-label {
    display: flex;
  }

  :host([label="inner-label"]) .bar-wrapper {
    position: relative;
  }

  .inner-label .label-text {
    flex: 1;
    min-width: 0;
  }

  .inner-label .value-text {
    flex-shrink: 0;
    text-align: right;
    white-space: nowrap;
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .wrapper {
    gap: 4px;
  }

  :host([size="s"]) .top-label {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .bar {
    height: 2px;
  }

  /* S has no inner-label mode */

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .wrapper,
  :host([size="m"]) .wrapper {
    gap: 8px;
  }

  :host .top-label,
  :host([size="m"]) .top-label {
    font-size: 14px;
    line-height: 20px;
  }

  :host .bar,
  :host([size="m"]) .bar {
    height: 4px;
  }

  :host([size="m"][label="inner-label"]) .bar,
  :host([label="inner-label"]) .bar {
    height: 24px;
  }

  :host .inner-label,
  :host([size="m"]) .inner-label {
    font-size: 12px;
    line-height: 16px;
    padding: 4px 8px;
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .wrapper {
    gap: 8px;
  }

  :host([size="l"]) .top-label {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .bar {
    height: 8px;
  }

  :host([size="l"][label="inner-label"]) .bar {
    height: 30px;
  }

  :host([size="l"]) .inner-label {
    font-size: 14px;
    line-height: 20px;
    padding: 4px 8px;
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition-duration: 0.01ms !important;
    }
  }
`;
