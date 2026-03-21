import {
  RADIUS_NONE,
  RADIUS_SM,
  SELECTED_BOLD,
  SP_0_5,
  SP_1,
  SP_1_25,
  SP_1_5,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
} from "@maneki/foundation";

// ─── Styles ──────────────────────────────────────────────────────────────────

export const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    background: ${SURFACE_SECONDARY};
    font-family: Inter, sans-serif;
  }

  /* ─── Vertical (side) layout ─── */

  :host([orientation="side"]) {
    border-radius: ${RADIUS_SM} ${RADIUS_NONE} ${RADIUS_NONE} ${RADIUS_SM};
  }

  :host([orientation="bottom"]) {
    position: relative;
    border-radius: ${RADIUS_NONE} ${RADIUS_NONE} ${RADIUS_SM} ${RADIUS_SM};
    overflow: hidden;
    min-width: 0;
  }

  .menu {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  :host([orientation="bottom"]) .menu {
    position: relative;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  :host([orientation="bottom"]) .menu::-webkit-scrollbar {
    display: none;
  }

  /* ─── Scroll fade indicators ─── */

  .fade {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 32px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    z-index: 1;
  }

  .fade[data-visible] {
    opacity: 1;
  }

  .fade-left {
    left: 0;
    background: linear-gradient(to left, transparent, ${SURFACE_SECONDARY});
    border-radius: ${RADIUS_NONE} ${RADIUS_NONE} ${RADIUS_NONE} ${RADIUS_SM};
  }

  .fade-right {
    right: 0;
    background: linear-gradient(to right, transparent, ${SURFACE_SECONDARY});
    border-radius: ${RADIUS_NONE} ${RADIUS_NONE} ${RADIUS_SM} ${RADIUS_NONE};
  }

  :host(:not([orientation="bottom"])) .fade {
    display: none;
  }

  /* ─── Link items ─── */

  .link {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
    user-select: none;
  }

  :host([orientation="bottom"]) .link {
    flex-shrink: 0;
  }

  .link:hover {
    opacity: 0.8;
  }

  .link[data-selected] {
    color: ${SELECTED_BOLD};
  }

  /* ─── Section headings ─── */

  .section {
    display: flex;
    align-items: center;
    color: ${TEXT_SECONDARY};
    font-weight: 500;
    text-transform: uppercase;
    overflow: hidden;
    white-space: nowrap;
  }

  /* Hide sections in horizontal mode */
  :host([orientation="bottom"]) .section {
    display: none;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: S                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="s"]) {
    width: 96px;
  }

  :host([size="s"][orientation="bottom"]) {
    width: 0;
    min-width: 100%;
  }

  :host([size="s"]) .menu {
    padding-top: ${SP_0_5};
  }

  :host([size="s"][orientation="bottom"]) .menu {
    padding: 8px 8px;
    gap: 12px;
  }

  :host([size="s"]) .link {
    height: 24px;
    padding: 0 8px;
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .section {
    height: 20px;
    padding: 0 8px;
    font-size: 10px;
    line-height: 16px;
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: M (default)                                                          */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="m"]),
  :host(:not([size])) {
    width: 120px;
  }

  :host([size="m"][orientation="bottom"]),
  :host(:not([size])[orientation="bottom"]) {
    width: 0;
    min-width: 100%;
  }

  :host([size="m"]) .menu,
  :host(:not([size])) .menu {
    padding-top: ${SP_1};
  }

  :host([size="m"][orientation="bottom"]) .menu,
  :host(:not([size])[orientation="bottom"]) .menu {
    padding: ${SP_1_25} ${SP_1_5};
    gap: 16px;
  }

  :host([size="m"]) .link,
  :host(:not([size])) .link {
    height: 32px;
    padding: 0 12px;
    ${TYPE_BODY_02}
  }

  :host([size="m"]) .section,
  :host(:not([size])) .section {
    height: 24px;
    padding: 0 12px;
    ${TYPE_CAPTION_01}
  }

  /* ═══════════════════════════════════════════════════════════════════════════ */
  /* Size: L                                                                    */
  /* ═══════════════════════════════════════════════════════════════════════════ */

  :host([size="l"]) {
    width: 144px;
  }

  :host([size="l"][orientation="bottom"]) {
    width: 0;
    min-width: 100%;
  }

  :host([size="l"]) .menu {
    padding-top: 12px;
  }

  :host([size="l"][orientation="bottom"]) .menu {
    padding: 12px 16px;
    gap: 20px;
  }

  :host([size="l"]) .link {
    height: 40px;
    padding: 0 16px;
    ${TYPE_BODY_01}
  }

  :host([size="l"]) .section {
    height: 28px;
    padding: 0 16px;
    ${TYPE_BODY_03}
  }
`;
