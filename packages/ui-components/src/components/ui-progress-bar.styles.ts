import {
  BLUE_40,
  FONT_PRIMARY,
  GRAY_50,
  SP_0_5,
  SP_1,
  SP_3,
  STATUS_SURFACE_CANCELLED_BOLD,
  STATUS_SURFACE_CANCELLED_SUBTLE,
  STATUS_SURFACE_COMPLETE_BOLD,
  STATUS_SURFACE_COMPLETE_SUBTLE,
  STATUS_SURFACE_ERROR_BOLD,
  STATUS_SURFACE_INFO_BOLD,
  STATUS_SURFACE_INFO_SUBTLE,
  STATUS_SURFACE_NONE_BOLD,
  STATUS_SURFACE_NONE_SUBTLE,
  STATUS_SURFACE_OPEN_BOLD,
  STATUS_SURFACE_OPEN_SUBTLE,
  STATUS_SURFACE_SUCCESS_BOLD,
  STATUS_SURFACE_SUSPENDED_BOLD,
  STATUS_SURFACE_SUSPENDED_SUBTLE,
  STATUS_SURFACE_WARNING_BOLD,
  TEXT_PRIMARY,
  TYPE_BODY_02,
  TYPE_BODY_03,
} from "@maneki/foundation";

// ─── Status color maps ─────────────────────────────────────────────────────────

// Fill colors (the progress indicator)
const STATUS_FILL: Record<string, string> = {
  none: STATUS_SURFACE_NONE_BOLD,
  information: STATUS_SURFACE_INFO_BOLD,
  success: STATUS_SURFACE_SUCCESS_BOLD,
  warning: STATUS_SURFACE_WARNING_BOLD,
  error: STATUS_SURFACE_ERROR_BOLD,
  open: STATUS_SURFACE_OPEN_BOLD,
  complete: STATUS_SURFACE_COMPLETE_BOLD,
  suspended: STATUS_SURFACE_SUSPENDED_BOLD,
  cancelled: STATUS_SURFACE_CANCELLED_BOLD,
};

// Track colors (the background)
const STATUS_TRACK: Record<string, string> = {
  none: STATUS_SURFACE_NONE_SUBTLE,
  information: STATUS_SURFACE_NONE_SUBTLE,
  success: STATUS_SURFACE_NONE_SUBTLE,
  warning: STATUS_SURFACE_NONE_SUBTLE,
  error: STATUS_SURFACE_NONE_SUBTLE,
  open: STATUS_SURFACE_OPEN_SUBTLE,
  complete: STATUS_SURFACE_COMPLETE_SUBTLE,
  suspended: STATUS_SURFACE_SUSPENDED_SUBTLE,
  cancelled: STATUS_SURFACE_CANCELLED_SUBTLE,
};

// Inner label fill (lighter shades for inner-label mode)
const STATUS_INNER_FILL: Record<string, string> = {
  none: GRAY_50,
  information: BLUE_40,
  success: STATUS_SURFACE_SUCCESS_BOLD,
  warning: STATUS_SURFACE_WARNING_BOLD,
  error: STATUS_SURFACE_ERROR_BOLD,
  open: STATUS_SURFACE_OPEN_BOLD,
  complete: STATUS_SURFACE_COMPLETE_BOLD,
  suspended: STATUS_SURFACE_SUSPENDED_BOLD,
  cancelled: STATUS_SURFACE_CANCELLED_BOLD,
};

const STATUS_INNER_TRACK: Record<string, string> = {
  none: STATUS_SURFACE_NONE_SUBTLE,
  information: STATUS_SURFACE_INFO_SUBTLE,
  success: STATUS_SURFACE_NONE_SUBTLE,
  warning: STATUS_SURFACE_NONE_SUBTLE,
  error: STATUS_SURFACE_NONE_SUBTLE,
  open: STATUS_SURFACE_OPEN_SUBTLE,
  complete: STATUS_SURFACE_COMPLETE_SUBTLE,
  suspended: STATUS_SURFACE_SUSPENDED_SUBTLE,
  cancelled: STATUS_SURFACE_CANCELLED_SUBTLE,
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
    font-family: ${FONT_PRIMARY};
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
    gap: ${SP_0_5};
  }

  :host([size="s"]) .top-label {
    ${TYPE_BODY_03}
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
    ${TYPE_BODY_02}
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
    ${TYPE_BODY_03}
    padding: ${SP_0_5} ${SP_1};
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
    ${TYPE_BODY_02}
    padding: ${SP_0_5} ${SP_1};
  }

  @media (prefers-reduced-motion: reduce) {
    .fill {
      transition-duration: 0.01ms !important;
    }
  }
`;
