import { semanticVar, colorVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");

const SP_05 = spaceVar("0.5");     // 4px
const SP_1 = spaceVar("1");         // 8px
const SP_3 = spaceVar("3");         // 24px

// ─── Status color maps ─────────────────────────────────────────────────────────

// Fill colors (the progress indicator)
const STATUS_FILL: Record<string, string> = {
  none: semanticVar("statusSurface", "noneBold"),
  information: semanticVar("statusSurface", "informationBold"),
  success: semanticVar("statusSurface", "successBold"),
  warning: semanticVar("statusSurface", "warningBold"),
  error: semanticVar("statusSurface", "errorBold"),
  open: semanticVar("statusSurface", "openBold"),
  complete: semanticVar("statusSurface", "completeBold"),
  suspended: semanticVar("statusSurface", "suspendedBold"),
  cancelled: semanticVar("statusSurface", "cancelledBold"),
};

// Track colors (the background)
const STATUS_TRACK: Record<string, string> = {
  none: semanticVar("statusSurface", "noneSubtle"),
  information: semanticVar("statusSurface", "noneSubtle"),
  success: semanticVar("statusSurface", "noneSubtle"),
  warning: semanticVar("statusSurface", "noneSubtle"),
  error: semanticVar("statusSurface", "noneSubtle"),
  open: semanticVar("statusSurface", "openSubtle"),
  complete: semanticVar("statusSurface", "completeSubtle"),
  suspended: semanticVar("statusSurface", "suspendedSubtle"),
  cancelled: semanticVar("statusSurface", "cancelledSubtle"),
};

// Inner label fill (lighter shades for inner-label mode)
const STATUS_INNER_FILL: Record<string, string> = {
  none: colorVar("gray", 50),
  information: colorVar("blue", 40),
  success: semanticVar("statusSurface", "successBold"),
  warning: semanticVar("statusSurface", "warningBold"),
  error: semanticVar("statusSurface", "errorBold"),
  open: semanticVar("statusSurface", "openBold"),
  complete: semanticVar("statusSurface", "completeBold"),
  suspended: semanticVar("statusSurface", "suspendedBold"),
  cancelled: semanticVar("statusSurface", "cancelledBold"),
};

const STATUS_INNER_TRACK: Record<string, string> = {
  none: semanticVar("statusSurface", "noneSubtle"),
  information: semanticVar("statusSurface", "informationSubtle"),
  success: semanticVar("statusSurface", "noneSubtle"),
  warning: semanticVar("statusSurface", "noneSubtle"),
  error: semanticVar("statusSurface", "noneSubtle"),
  open: semanticVar("statusSurface", "openSubtle"),
  complete: semanticVar("statusSurface", "completeSubtle"),
  suspended: semanticVar("statusSurface", "suspendedSubtle"),
  cancelled: semanticVar("statusSurface", "cancelledSubtle"),
}

export {
  TEXT_PRIMARY,
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
    gap: ${SP_1};
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
    gap: ${SP_1};
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
    gap: ${SP_05};
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
    gap: ${SP_1};
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
    height: ${SP_3};
  }

  :host .inner-label,
  :host([size="m"]) .inner-label {
    font-size: 12px;
    line-height: 16px;
    padding: ${SP_05} ${SP_1};
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .wrapper {
    gap: ${SP_1};
  }

  :host([size="l"]) .top-label {
    font-size: 16px;
    line-height: ${SP_3};
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
    padding: ${SP_05} ${SP_1};
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition-duration: 0.01ms !important;
    }
  }
`;
