import {
  ACTIVE_BOLD,
  ACTIVE_SUBTLE,
  BORDER_FOCUS,
  BW_SM,
  ELEVATION_05,
  HOVER_BOLD,
  HOVER_SUBTLE,
  RADIUS_NONE,
  RADIUS_PILL,
  RADIUS_SM,
  SP_0_5,
  SP_0_75,
  SP_1,
  SP_1_5,
  SP_2,
  SP_2_5,
  SP_3,
  SP_4,
  SURFACE_ACTION,
  SURFACE_ACTION_CONTRAST,
  SURFACE_DESTRUCTIVE,
  SURFACE_PRIMARY,
  SURFACE_TERTIARY,
  TEXT_PRIMARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
} from "@maneki/foundation";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-block;
    position: relative;
  }

  /* ── Base container ─────────────────────────────────────────────────────── */

  .base {
    display: inline-flex;
    flex-direction: row;
    align-items: stretch;
    border-width: ${BW_SM};
    border-style: solid;
    border-color: transparent;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Shape ─────────────────────────────────────────────────────────────── */

  :host .base {
    border-radius: var(--ui-dds-radius, ${RADIUS_SM});
  }

  :host([shape="rounded"]) .base {
    border-radius: var(--ui-dds-radius, ${RADIUS_PILL});
  }

  /* ── Shared button reset ────────────────────────────────────────────────── */

  .left,
  .right {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    background-color: transparent;
    background-image: none;
    color: inherit;
    font-family: var(--ui-dds-font-family, "Geist", sans-serif);
    font-weight: var(--ui-dds-font-weight, 500);
    transition:
      background-image 0.15s ease,
      background-color 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }

  .left {
    gap: ${SP_0_5};
  }

  /* ── Border-radius on outer corners only ────────────────────────────────── */

  :host .left {
    border-radius: ${RADIUS_SM} ${RADIUS_NONE} ${RADIUS_NONE} ${RADIUS_SM};
  }

  :host .right {
    border-radius: ${RADIUS_NONE} ${RADIUS_SM} ${RADIUS_SM} ${RADIUS_NONE};
  }

  :host([shape="rounded"]) .left {
    border-radius: ${RADIUS_PILL} ${RADIUS_NONE} ${RADIUS_NONE} ${RADIUS_PILL};
  }

  :host([shape="rounded"]) .right {
    border-radius: ${RADIUS_NONE} ${RADIUS_PILL} ${RADIUS_PILL} ${RADIUS_NONE};
  }

  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .left,
  :host([size="m"]) .left {
    ${TYPE_BODY_02}
    padding: ${SP_0_75} ${SP_1_5} ${SP_0_75} ${SP_2};
  }

  :host([shape="rounded"]) .left,
  :host([shape="rounded"][size="m"]) .left {
    padding: ${SP_0_75} ${SP_1_5} ${SP_0_75} ${SP_2_5};
  }

  :host .right,
  :host([size="m"]) .right {
    padding: ${SP_0_75};
  }

  :host([shape="rounded"]) .right,
  :host([shape="rounded"][size="m"]) .right {
    padding: ${SP_0_75} ${SP_1_5} ${SP_0_75} ${SP_0_75};
  }

  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .left {
    ${TYPE_BODY_03}
    padding: ${SP_0_5} ${SP_1};
  }

  :host([size="s"][shape="rounded"]) .left {
    padding: ${SP_0_5} ${SP_1} ${SP_0_5} ${SP_2};
  }

  :host([size="s"]) .right {
    padding: ${SP_0_5};
  }

  :host([size="s"][shape="rounded"]) .right {
    padding: ${SP_0_5} ${SP_1} ${SP_0_5} ${SP_0_5};
  }

  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .left {
    ${TYPE_BODY_01}
    padding: ${SP_1} ${SP_2} ${SP_1} ${SP_2_5};
  }

  :host([size="l"][shape="rounded"]) .left {
    padding: ${SP_1} ${SP_2} ${SP_1} ${SP_3};
  }

  :host([size="l"]) .right {
    padding: ${SP_1};
  }

  :host([size="l"][shape="rounded"]) .right {
    padding: ${SP_1} ${SP_1_5} ${SP_1} ${SP_1};
  }

  /* ── Size: xl ───────────────────────────────────────────────────────────── */

  :host([size="xl"]) .left {
    ${TYPE_BODY_01}
    padding: ${SP_1_5} ${SP_4};
  }

  :host([size="xl"][shape="rounded"]) .left {
    padding: ${SP_1_5} ${SP_4} ${SP_1_5} ${SP_3};
  }

  :host([size="xl"]) .right {
    padding: ${SP_1_5};
  }

  :host([size="xl"][shape="rounded"]) .right {
    padding: ${SP_1_5};
  }
  /* ── Icon-only padding (square) ────────────────────────────────────────── */
  :host([icon="icon-only"]) .left,
  :host([icon="icon-only"][size="m"]) .left {
    padding: ${SP_0_75};
  }
  :host([icon="icon-only"][size="s"]) .left {
    padding: ${SP_0_5};
  }
  :host([icon="icon-only"][size="l"]) .left {
    padding: ${SP_1_5};
  }
  :host([icon="icon-only"][size="xl"]) .left {
    padding: ${SP_1_5};
  }
  /* ── Leading-icon padding adjustments ───────────────────────────────────── */
  :host([icon="leading-icon"]) .left,
  :host([icon="leading-icon"][size="m"]) .left {
    padding: ${SP_0_75} ${SP_1_5} ${SP_0_75} ${SP_1};
  }
  :host([icon="leading-icon"][size="s"]) .left {
    padding: ${SP_0_5} ${SP_1} ${SP_0_5} ${SP_0_5};
  }
  :host([icon="leading-icon"][size="l"]) .left {
    padding: ${SP_1_5} ${SP_2} ${SP_1_5} ${SP_1};
  }
  :host([icon="leading-icon"][size="xl"]) .left {
    padding: ${SP_1_5} ${SP_4} ${SP_1_5} ${SP_2};
  }
  /* ── Trailing-icon padding adjustments ──────────────────────────────────── */
  :host([icon="trailing-icon"]) .left,
  :host([icon="trailing-icon"][size="m"]) .left {
    padding: ${SP_0_75} ${SP_1} ${SP_0_75} ${SP_2};
  }
  :host([icon="trailing-icon"][size="s"]) .left {
    padding: ${SP_0_5} ${SP_0_5} ${SP_0_5} ${SP_1};
  }
  :host([icon="trailing-icon"][size="l"]) .left {
    padding: ${SP_1_5} ${SP_1} ${SP_1_5} ${SP_2_5};
  }
  :host([icon="trailing-icon"][size="xl"]) .left {
    padding: ${SP_1_5} ${SP_2} ${SP_1_5} ${SP_4};
  }
  /* ── Icon slot visibility ───────────────────────────────────────────────── */
  .slot-icon-start,
  .slot-icon-end {
    display: none;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }
  :host([icon="leading-icon"]) .slot-icon-start,
  :host([icon="icon-only"]) .slot-icon-start {
    display: inline-flex;
  }
  :host([icon="trailing-icon"]) .slot-icon-end {
    display: inline-flex;
  }
  :host([icon="icon-only"]) .slot-text {
    display: none;
  }
  /* ── Action × Emphasis: PRIMARY ──────────────────────────────────────── */
  :host .base,
  :host([action="primary"]) .base,
  :host([action="primary"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, ${SURFACE_ACTION});
    color: var(--ui-dds-color, #ffffff);
    border-color: var(--ui-dds-border-color, ${SURFACE_ACTION});
  }
  :host([emphasis="subtle"]) .base,
  :host([action="primary"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${SURFACE_ACTION});
    border-color: var(--ui-dds-border-color, ${SURFACE_ACTION});
  }
  :host([emphasis="minimal"]) .base,
  :host([action="primary"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${SURFACE_ACTION});
    border-color: transparent;
  }
  /* ── Action × Emphasis: SECONDARY ────────────────────────────────────── */
  :host([action="secondary"]) .base,
  :host([action="secondary"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, ${SURFACE_TERTIARY});
    color: var(--ui-dds-color, ${TEXT_PRIMARY});
    border-color: var(--ui-dds-border-color, ${SURFACE_TERTIARY});
  }
  :host([action="secondary"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${TEXT_PRIMARY});
    border-color: var(--ui-dds-border-color, ${TEXT_PRIMARY});
  }
  :host([action="secondary"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${TEXT_PRIMARY});
    border-color: transparent;
  }
  /* ── Action × Emphasis: DESTRUCTIVE ───────────────────────────────────── */
  :host([action="destructive"]) .base,
  :host([action="destructive"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, ${SURFACE_DESTRUCTIVE});
    color: var(--ui-dds-color, #ffffff);
    border-color: var(--ui-dds-border-color, ${SURFACE_DESTRUCTIVE});
  }
  :host([action="destructive"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${SURFACE_DESTRUCTIVE});
    border-color: var(--ui-dds-border-color, ${SURFACE_DESTRUCTIVE});
  }
  :host([action="destructive"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${SURFACE_DESTRUCTIVE});
    border-color: transparent;
  }
  /* ── Action × Emphasis: INFO ─────────────────────────────────────────── */
  :host([action="info"]) .base,
  :host([action="info"][emphasis="bold"]) .base {
    background-color: var(--ui-dds-bg, ${SURFACE_ACTION_CONTRAST});
    color: var(--ui-dds-color, #ffffff);
    border-color: var(--ui-dds-border-color, ${SURFACE_ACTION_CONTRAST});
  }
  :host([action="info"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${SURFACE_ACTION_CONTRAST});
    border-color: var(--ui-dds-border-color, ${SURFACE_ACTION_CONTRAST});
  }
  :host([action="info"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, ${SURFACE_ACTION_CONTRAST});
    border-color: transparent;
  }
  /* ── Action × Emphasis: CONTRAST ──────────────────────────────────────── */
  :host([action="contrast"]) .base,
  :host([action="contrast"][emphasis="bold"]) .base {
    color: var(--ui-dds-color, ${TEXT_PRIMARY});
    border-color: var(--ui-dds-border-color, ${SURFACE_PRIMARY});
  }
  :host([action="contrast"][emphasis="subtle"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, #ffffff);
    border-color: var(--ui-dds-border-color, ${SURFACE_PRIMARY});
  }
  :host([action="contrast"][emphasis="minimal"]) .base {
    background-color: transparent;
    color: var(--ui-dds-color, #ffffff);
    border-color: transparent;
  }
  /* ── Hover state (independent per button) ─────────────────────────────── */
  .left:hover,
  .right:hover {
    background-image: linear-gradient(${HOVER_BOLD}, ${HOVER_BOLD});
  }
  :host([emphasis="subtle"]) .left:hover,
  :host([emphasis="subtle"]) .right:hover,
  :host([emphasis="minimal"]) .left:hover,
  :host([emphasis="minimal"]) .right:hover {
    background-image: none;
    background-color: ${HOVER_SUBTLE};
  }
  /* ── Active state ────────────────────────────────────────────────────── */
  .left:active,
  .right:active {
    background-image: linear-gradient(${ACTIVE_BOLD}, ${ACTIVE_BOLD});
  }
  :host([emphasis="subtle"]) .left:active,
  :host([emphasis="subtle"]) .right:active,
  :host([emphasis="minimal"]) .left:active,
  :host([emphasis="minimal"]) .right:active {
    background-image: none;
    background-color: ${ACTIVE_SUBTLE};
  }
  /* ── Focus-visible (double ring) ─────────────────────────────────────── */
  .left:focus-visible,
  .right:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px ${SURFACE_PRIMARY}, 0 0 0 2px ${BORDER_FOCUS};
  }
  :host([action="secondary"]) .left:focus-visible,
  :host([action="secondary"]) .right:focus-visible {
    box-shadow: 0 0 0 1px ${SURFACE_PRIMARY}, 0 0 0 2px ${TEXT_PRIMARY};
  }
  :host([action="destructive"]) .left:focus-visible,
  :host([action="destructive"]) .right:focus-visible {
    box-shadow: 0 0 0 1px ${SURFACE_PRIMARY}, 0 0 0 2px ${SURFACE_DESTRUCTIVE};
  }
  :host([action="info"]) .left:focus-visible,
  :host([action="info"]) .right:focus-visible {
    box-shadow: 0 0 0 1px ${SURFACE_PRIMARY}, 0 0 0 2px ${SURFACE_ACTION_CONTRAST};
  }
  :host([action="contrast"]) .left:focus-visible,
  :host([action="contrast"]) .right:focus-visible {
    box-shadow: 0 0 0 1px ${TEXT_PRIMARY}, 0 0 0 2px ${SURFACE_PRIMARY};
  }
  /* ── Disabled ────────────────────────────────────────────────────────── */
  :host([disabled]) .base {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }
  :host([disabled]) .left,
  :host([disabled]) .right {
    cursor: not-allowed;
    pointer-events: none;
  }
  /* ── Divider ─────────────────────────────────────────────────────────── */
  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1px;
    flex-shrink: 0;
  }
  .divider-inner {
    width: 1px;
    height: 100%;
    background-color: var(--ui-dds-divider-color, rgba(255, 255, 255, 0.3));
  }
  /* Divider height per size */
  :host .divider,
  :host([size="m"]) .divider {
    height: 32px;
  }
  :host([size="s"]) .divider {
    height: 24px;
  }
  :host([size="l"]) .divider {
    height: 40px;
  }
  :host([size="xl"]) .divider {
    height: 48px;
  }
  /* Divider color overrides for secondary/contrast bold */
  :host([action="secondary"]) .divider-inner,
  :host([action="secondary"][emphasis="bold"]) .divider-inner {
    background-color: var(--ui-dds-divider-color, rgba(0, 0, 0, 0.15));
  }
  :host([action="contrast"]) .divider-inner,
  :host([action="contrast"][emphasis="bold"]) .divider-inner {
    background-color: var(--ui-dds-divider-color, rgba(0, 0, 0, 0.15));
  }
  /* Divider color for subtle/minimal — action color at 30% */
  :host([emphasis="subtle"]) .divider-inner,
  :host([emphasis="minimal"]) .divider-inner {
    background-color: var(--ui-dds-divider-color, rgba(14, 23, 31, 0.15));
  }
  :host([emphasis="minimal"]) .divider {
    display: none;
  }
  :host([action="contrast"]) .divider {
    display: none;
  }
  /* ── Chevron ─────────────────────────────────────────────────────────── */
  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    transition: transform 0.15s ease;
  }
  :host([open]) .chevron {
    transform: rotate(180deg);
  }
  /* Chevron size per component size */
  :host .chevron,
  :host([size="m"]) .chevron {
    width: 20px;
    height: 20px;
    --ui-icon-size: 20px;
  }
  :host([size="s"]) .chevron {
    width: 16px;
    height: 16px;
    --ui-icon-size: 16px;
  }
  :host([size="l"]) .chevron,
  :host([size="xl"]) .chevron {
    width: 24px;
    height: 24px;
  }
  /* ── Menu panel ─────────────────────────────────────────────────────── */
  .menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    min-width: 240px;
    padding: ${SP_0_5} 0;
    box-shadow: var(--ui-dds-menu-shadow, ${ELEVATION_05});
    border-radius: ${RADIUS_SM};
    overflow: visible;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, visibility 0.15s ease, transform 0.15s ease;
    pointer-events: none;
  }
  :host([open]) .menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    .left,
    .right {
      transition-duration: 0.01ms !important;
    }
    .chevron {
      transition-duration: 0.01ms !important;
    }
    .menu {
      transition-duration: 0.01ms !important;
    }
  }
`;
