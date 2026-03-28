import {
  BORDER_FOCUS,
  BORDER_MODERATE,
  ELEVATION_03,
  FONT_PRIMARY,
  HOVER_MINIMAL,
  ICON_SECONDARY,
  RADIUS_PILL,
  RADIUS_SM,
  SP_0_5,
  SP_0_75,
  SP_1,
  SP_1_25,
  SP_1_5,
  SP_2,
  SP_3,
  SURFACE_BOLD,
  SURFACE_PRIMARY,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
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

  slot[name="label"] {
    display: block;
  }

  :host {
    display: block;
    position: relative;
    width: 100%;
    font-family: ${FONT_PRIMARY};
  }

  /* ── Input ───────────────────────────────────────────────────────────────── */

  .input-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid ${BORDER_MODERATE};
    background: ${SURFACE_PRIMARY};
    border-radius: ${RADIUS_SM};
    transition: border-color 0.15s ease;
  }

  .input-wrapper:focus-within {
    border-color: ${BORDER_FOCUS};
    outline: 1px solid ${BORDER_FOCUS};
    outline-offset: -1px;
  }

  .search-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: ${ICON_SECONDARY};
  }

  .search-icon .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
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

  .input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    font-family: ${FONT_PRIMARY};
    color: ${TEXT_PRIMARY};
    outline: none;
  }

  .input::placeholder {
    color: ${TEXT_TERTIARY};
  }

  .clear-btn {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: none;
    background: transparent;
    color: ${ICON_SECONDARY};
    cursor: pointer;
    padding: 0;
  }

  .clear-btn .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 1;
  }

  :host([has-value]) .clear-btn {
    display: inline-flex;
  }

  /* ── Dropdown ────────────────────────────────────────────────────────────── */

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    display: none;
    flex-direction: column;
    background: ${SURFACE_PRIMARY};
    border-radius: ${RADIUS_SM};
    box-shadow: ${ELEVATION_03};
    padding: ${SP_0_5} 0;
    max-height: 400px;
    overflow-y: auto;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }

  :host([open]) .dropdown {
    display: flex;
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Category heading ────────────────────────────────────────────────────── */

  .category-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${SURFACE_SECONDARY};
    font-weight: 500;
    color: ${TEXT_SECONDARY};
    text-transform: uppercase;
    white-space: nowrap;
  }

  .category-heading .show-all {
    font-weight: 500;
    color: ${BORDER_FOCUS};
    cursor: pointer;
    border: none;
    background: transparent;
    font-family: ${FONT_PRIMARY};
    text-transform: uppercase;
    padding: 0;
  }

  /* ── Result item ─────────────────────────────────────────────────────────── */

  .result-item {
    display: flex;
    align-items: flex-start;
    background: ${SURFACE_PRIMARY};
    cursor: pointer;
    border: none;
    font-family: ${FONT_PRIMARY};
    text-align: left;
    width: 100%;
    color: ${TEXT_PRIMARY};
  }

  .result-item:hover {
    background: ${HOVER_MINIMAL};
  }

  .result-leading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: ${RADIUS_PILL};
    background: ${SURFACE_BOLD};
    color: #ffffff;
    font-family: ${FONT_PRIMARY};
    font-weight: 500;
    font-size: 10px;
    line-height: 1;
    text-transform: uppercase;
  }

  .result-leading .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    line-height: 1;
    display: inline-block;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: "FILL" 0;
  }

  .result-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .result-head {
    display: flex;
    align-items: flex-start;
    gap: ${SP_1};
    width: 100%;
  }

  .result-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 400;
    color: ${TEXT_PRIMARY};
  }

  .result-title strong {
    font-weight: 700;
  }

  .result-info {
    flex-shrink: 0;
    text-align: right;
    white-space: nowrap;
    font-weight: 400;
    color: ${TEXT_SECONDARY};
  }

  .result-description {
    font-weight: 400;
    color: ${TEXT_SECONDARY};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .input-wrapper {
    height: 24px;
    padding: 0 ${SP_1};
    gap: ${SP_0_5};
  }

  :host([size="s"]) .search-icon {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .search-icon .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .input {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .clear-btn {
    width: 12px;
    height: 12px;
  }

  :host([size="s"]) .clear-btn .material-symbols-outlined {
    font-size: 12px;
  }

  :host([size="s"]) .category-heading {
    height: 24px;
    padding: ${SP_0_5} ${SP_1_5};
    ${TYPE_CAPTION_01}
  }

  :host([size="s"]) .category-heading .show-all {
    ${TYPE_CAPTION_01}
  }

  :host([size="s"]) .result-item {
    padding: ${SP_0_75} ${SP_1_5};
    gap: ${SP_1};
  }

  :host([size="s"]) .result-item.has-leading {
    padding-left: ${SP_1};
  }

  :host([size="s"]) .result-leading {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .result-leading .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .result-title {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .result-info {
    ${TYPE_CAPTION_01}
  }

  :host([size="s"]) .result-description {
    ${TYPE_CAPTION_01}
  }

  :host([size="s"]) .result-content {
    gap: ${SP_0_5};
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    /* M is default */
  }

  :host .input-wrapper,
  :host([size="m"]) .input-wrapper {
    height: 32px;
    padding: 0 ${SP_1};
    gap: ${SP_1};
  }

  :host .search-icon,
  :host([size="m"]) .search-icon {
    width: 20px;
    height: 20px;
  }

  :host .search-icon .material-symbols-outlined,
  :host([size="m"]) .search-icon .material-symbols-outlined {
    font-size: 20px;
  }

  :host .input,
  :host([size="m"]) .input {
    ${TYPE_BODY_02}
  }

  :host .clear-btn,
  :host([size="m"]) .clear-btn {
    width: 14px;
    height: 14px;
  }

  :host .clear-btn .material-symbols-outlined,
  :host([size="m"]) .clear-btn .material-symbols-outlined {
    font-size: 14px;
  }

  :host .category-heading,
  :host([size="m"]) .category-heading {
    height: 24px;
    padding: ${SP_0_5} ${SP_2};
    ${TYPE_BODY_03}
  }

  :host .category-heading .show-all,
  :host([size="m"]) .category-heading .show-all {
    ${TYPE_BODY_03}
  }

  :host .result-item,
  :host([size="m"]) .result-item {
    padding: ${SP_0_75} ${SP_2};
    gap: ${SP_1};
  }

  :host .result-item.has-leading,
  :host([size="m"]) .result-item.has-leading {
    padding-left: ${SP_1};
  }

  :host .result-leading,
  :host([size="m"]) .result-leading {
    width: 20px;
    height: 20px;
  }

  :host .result-leading .material-symbols-outlined,
  :host([size="m"]) .result-leading .material-symbols-outlined {
    font-size: 20px;
  }

  :host .result-title,
  :host([size="m"]) .result-title {
    ${TYPE_BODY_02}
  }

  :host .result-info,
  :host([size="m"]) .result-info {
    ${TYPE_BODY_03}
  }

  :host .result-description,
  :host([size="m"]) .result-description {
    ${TYPE_BODY_03}
  }

  :host .result-content,
  :host([size="m"]) .result-content {
    gap: ${SP_0_5};
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .input-wrapper {
    height: 40px;
    padding: 0 ${SP_1_5};
    gap: ${SP_1};
  }

  :host([size="l"]) .search-icon {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .search-icon .material-symbols-outlined {
    font-size: 24px;
  }

  :host([size="l"]) .input {
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .clear-btn {
    width: 16px;
    height: 16px;
  }

  :host([size="l"]) .clear-btn .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="l"]) .category-heading {
    height: 36px;
    padding: ${SP_1} ${SP_3};
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .category-heading .show-all {
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .result-item {
    padding: ${SP_1_25} ${SP_2};
    gap: ${SP_1_5};
  }

  :host([size="l"]) .result-item.has-leading {
    padding-left: ${SP_3};
  }

  :host([size="l"]) .result-leading {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .result-leading .material-symbols-outlined {
    font-size: 24px;
  }

  :host([size="l"]) .result-title {
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .result-info {
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .result-description {
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .result-content {
    gap: ${SP_0_5};
  }

  @media (prefers-reduced-motion: reduce) {
    .dropdown {
      transition-duration: 0.01ms !important;
    }
  }
`;
