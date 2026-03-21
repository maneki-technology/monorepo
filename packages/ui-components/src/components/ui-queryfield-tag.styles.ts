import { semanticVar, spaceVar, radiusVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TAG_SUBTLE_BG = semanticVar("tag", "subtle");
const TAG_TEXT_SUBTLE = semanticVar("tag", "textSubtle");
const TEXT_SECONDARY = semanticVar("text", "secondary");

const RADIUS_PILL = radiusVar("pill");  // 999px
const SP_025 = spaceVar("0.25");       // 2px
const SP_05 = spaceVar("0.5");         // 4px
const SP_075 = spaceVar("0.75");       // 6px
const SP_1 = spaceVar("1");             // 8px
const SP_15 = spaceVar("1.5");         // 12px
// ─── Styles ──────────────────────────────────────────────────────────────────

export const TAG_STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    align-items: center;
    font-family: "Geist", sans-serif;
  }

  .category {
    display: flex;
    align-items: center;
    background: ${TAG_SUBTLE_BG};
    border: 1px solid ${TAG_SUBTLE_BG};
    border-right: none;
    border-radius: ${RADIUS_PILL} 0 0 ${RADIUS_PILL};
    color: ${TAG_TEXT_SUBTLE};
    text-transform: uppercase;
    white-space: nowrap;
    cursor: pointer;
  }

  .value {
    display: flex;
    align-items: center;
    background: transparent;
    border: 1px solid ${TAG_SUBTLE_BG};
    border-left: none;
    border-radius: 0 ${RADIUS_PILL} ${RADIUS_PILL} 0;
    white-space: nowrap;
    cursor: pointer;
  }

  /* Editing state */
  :host([editing]) .category {
    background: ${TAG_TEXT_SUBTLE};
    border-color: ${TAG_TEXT_SUBTLE};
    color: #ffffff;
  }

  :host([editing]) .value {
    border-color: ${TAG_TEXT_SUBTLE};
  }

  .value-text {
    display: inline;
  }

  .operator {
    display: inline;
    font-weight: 500;
    color: ${TEXT_SECONDARY};
  }

  .filter-value {
    display: inline;
    font-weight: 400;
    color: ${TAG_TEXT_SUBTLE};
  }

  .conjunction {
    display: inline;
    font-weight: 400;
    color: ${TEXT_SECONDARY};
  }

  .dismiss {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    color: ${TEXT_SECONDARY};
    flex-shrink: 0;
  }

  .dismiss .material-symbols-outlined {
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
    font-variation-settings: "FILL" 1;
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .category {
    padding: 0 ${SP_1};
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .value {
    padding: 0 ${SP_075};
    gap: ${SP_025};
  }

  :host([size="s"]) .value-text {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .dismiss {
    width: 12px;
    height: 12px;
  }

  :host([size="s"]) .dismiss .material-symbols-outlined {
    font-size: 12px;
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host .category,
  :host([size="m"]) .category {
    padding: ${SP_025} ${SP_15};
    font-size: 12px;
    line-height: 16px;
  }

  :host .value,
  :host([size="m"]) .value {
    padding: ${SP_025} ${SP_1};
    gap: ${SP_05};
  }

  :host .value-text,
  :host([size="m"]) .value-text {
    font-size: 12px;
    line-height: 16px;
  }

  :host .dismiss,
  :host([size="m"]) .dismiss {
    width: 12px;
    height: 12px;
  }

  :host .dismiss .material-symbols-outlined,
  :host([size="m"]) .dismiss .material-symbols-outlined {
    font-size: 12px;
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .category {
    padding: ${SP_025} ${SP_15};
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .value {
    padding: ${SP_025} ${SP_1};
    gap: ${SP_05};
  }

  :host([size="l"]) .value-text {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .dismiss {
    width: 12px;
    height: 12px;
  }

  :host([size="l"]) .dismiss .material-symbols-outlined {
    font-size: 12px;
  }
`;
