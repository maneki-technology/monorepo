import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const TEXT_TERTIARY = semanticVar("text", "tertiary");
const ICON_SECONDARY = semanticVar("icon", "secondary");
const BORDER_MODERATE = semanticVar("border", "moderate");
const BORDER_FOCUS = semanticVar("border", "focus");
const SURFACE_PRIMARY = semanticVar("surface", "primary");
const SURFACE_SECONDARY = semanticVar("surface", "secondary");

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
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
    display: block;
    position: relative;
    width: 100%;
    font-family: "Geist", sans-serif;
  }

  /* ── Input ───────────────────────────────────────────────────────────────── */

  .input-wrapper {
    display: flex;
    align-items: center;
    border: 1px solid ${BORDER_MODERATE};
    background: ${SURFACE_PRIMARY};
    border-radius: 2px;
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
    font-family: "Geist", sans-serif;
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
    border-radius: 2px;
    box-shadow: 0px 8px 10px 0px rgba(0,0,0,0.14), 0px 3px 14px 0px rgba(0,0,0,0.12), 0px 5px 5px 0px rgba(0,0,0,0.2);
    padding: 4px 0;
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
    font-family: "Geist", sans-serif;
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
    font-family: "Geist", sans-serif;
    text-align: left;
    width: 100%;
    color: ${TEXT_PRIMARY};
  }

  .result-item:hover {
    background: rgba(159, 177, 189, 0.1);
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
    border-radius: 999px;
    background: #5B7282;
    color: #ffffff;
    font-family: "Geist", sans-serif;
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
    gap: 8px;
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
    padding: 0 8px;
    gap: 4px;
  }

  :host([size="s"]) .search-icon {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .search-icon .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .input {
    font-size: 12px;
    line-height: 16px;
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
    padding: 4px 12px;
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .category-heading .show-all {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .result-item {
    padding: 6px 12px;
    gap: 8px;
  }

  :host([size="s"]) .result-item.has-leading {
    padding-left: 8px;
  }

  :host([size="s"]) .result-leading {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .result-leading .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .result-title {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .result-info {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .result-description {
    font-size: 11px;
    line-height: 16px;
  }

  :host([size="s"]) .result-content {
    gap: 4px;
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    /* M is default */
  }

  :host .input-wrapper,
  :host([size="m"]) .input-wrapper {
    height: 32px;
    padding: 0 8px;
    gap: 8px;
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
    font-size: 14px;
    line-height: 20px;
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
    padding: 4px 16px;
    font-size: 12px;
    line-height: 16px;
  }

  :host .category-heading .show-all,
  :host([size="m"]) .category-heading .show-all {
    font-size: 12px;
    line-height: 16px;
  }

  :host .result-item,
  :host([size="m"]) .result-item {
    padding: 6px 16px;
    gap: 8px;
  }

  :host .result-item.has-leading,
  :host([size="m"]) .result-item.has-leading {
    padding-left: 8px;
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
    font-size: 14px;
    line-height: 20px;
  }

  :host .result-info,
  :host([size="m"]) .result-info {
    font-size: 12px;
    line-height: 16px;
  }

  :host .result-description,
  :host([size="m"]) .result-description {
    font-size: 12px;
    line-height: 16px;
  }

  :host .result-content,
  :host([size="m"]) .result-content {
    gap: 4px;
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .input-wrapper {
    height: 40px;
    padding: 0 12px;
    gap: 8px;
  }

  :host([size="l"]) .search-icon {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .search-icon .material-symbols-outlined {
    font-size: 24px;
  }

  :host([size="l"]) .input {
    font-size: 16px;
    line-height: 24px;
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
    padding: 8px 24px;
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .category-heading .show-all {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .result-item {
    padding: 10px 16px;
    gap: 12px;
  }

  :host([size="l"]) .result-item.has-leading {
    padding-left: 24px;
  }

  :host([size="l"]) .result-leading {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .result-leading .material-symbols-outlined {
    font-size: 24px;
  }

  :host([size="l"]) .result-title {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .result-info {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .result-description {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .result-content {
    gap: 4px;
  }

  @media (prefers-reduced-motion: reduce) {
    .dropdown {
      transition-duration: 0.01ms !important;
    }
  }
`;
