import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const ICON_PRIMARY = semanticVar("icon", "primary");
const BORDER_SUBTLE = semanticVar("border", "subtle");

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
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    font-family: "Geist", sans-serif;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    padding-top: 8px;
  }
  .contents {
    display: grid;
    column-gap: 12px;
  }

  .avatar-slot {
    grid-row: 1 / -1;
    align-self: start;
  }

  .labels {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 0;
  }

  .name {
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    font-size: 16px;
    line-height: 24px;
  }

  .title,
  .location {
    font-weight: 400;
    color: ${TEXT_SECONDARY};
    font-size: 14px;
    line-height: 20px;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  .actions ::slotted(*) {
    color: ${ICON_PRIMARY};
  }

  .action-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: ${ICON_PRIMARY};
    cursor: pointer;
    flex-shrink: 0;
  }

  .action-icon .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
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

  .separator {
    width: 100%;
    height: 1px;
    background: ${BORDER_SUBTLE};
    flex-shrink: 0;
  }

  :host([name-only]) .title,
  :host([name-only]) .location,
  :host([name-only]) .actions {
    display: none;
  }

  :host([name-only]) .wrapper {
    gap: 8px;
  }

  :host([name-only]) .contents {
    align-items: center;
  }

  /* ── XS: [avatar] [name] [icons] — single row ───────────────────────────── */

  :host([size="xs"]) .wrapper {
    gap: 8px;
  }

  :host([size="xs"]) .contents {
    grid-template-columns: 24px 1fr auto;
    align-items: center;
  }

  :host([size="xs"]) .avatar-slot {
    width: 24px;
    height: 24px;
  }

  :host([size="xs"]) .labels {
    grid-column: 2;
    grid-row: 1;
  }

  :host([size="xs"]) .actions {
    grid-column: 3;
    grid-row: 1;
  }

  :host([size="xs"]) .title {
    display: none;
  }

  :host([size="xs"]) .location {
    display: none;
  }

  /* ── S: [avatar] [name+title] [icons] — single row ──────────────────────── */

  :host([size="s"]) .wrapper {
    gap: 12px;
  }

  :host([size="s"]) .contents {
    grid-template-columns: 24px 1fr auto;
    align-items: start;
  }

  :host([size="s"]) .avatar-slot {
    width: 24px;
    height: 24px;
  }

  :host([size="s"]) .labels {
    grid-column: 2;
    grid-row: 1;
  }

  :host([size="s"]) .actions {
    grid-column: 3;
    grid-row: 1;
    padding-top: 10px;
  }

  :host([size="s"]) .location {
    display: none;
  }

  /* ── M: [avatar] [name+title+location] / [icons below text] ──────────── */

  :host([size="m"]) .wrapper {
    gap: 16px;
  }

  :host([size="m"]) .contents {
    grid-template-columns: 32px 1fr;
    grid-template-rows: auto auto;
    align-items: start;
  }

  :host([size="m"]) .avatar-slot {
    width: 32px;
    height: 32px;
    grid-column: 1;
    grid-row: 1;
  }

  :host([size="m"]) .labels {
    grid-column: 2;
    grid-row: 1;
  }

  :host([size="m"]) .title {
    display: block;
  }

  :host([size="m"]) .location {
    display: block;
  }

  :host([size="m"]) .actions {
    grid-column: 2;
    grid-row: 2;
    padding-top: 8px;
  }

  /* ── L: [avatar] [name+title+location] / [icons below text] ──────────── */

  :host([size="l"]) .wrapper {
    gap: 16px;
  }

  :host([size="l"]) .contents {
    grid-template-columns: 40px 1fr;
    grid-template-rows: auto auto;
    align-items: start;
  }

  :host([size="l"]) .avatar-slot {
    width: 40px;
    height: 40px;
    grid-column: 1;
    grid-row: 1;
  }

  :host([size="l"]) .labels {
    grid-column: 2;
    grid-row: 1;
  }

  :host([size="l"]) .title {
    display: block;
  }

  :host([size="l"]) .location {
    display: block;
  }

  :host([size="l"]) .actions {
    grid-column: 2;
    grid-row: 2;
    padding-top: 8px;
  }
`;
