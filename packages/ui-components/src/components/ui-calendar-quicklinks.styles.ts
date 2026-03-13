import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

export const SURFACE_SECONDARY = semanticVar("surface", "secondary");
export const TEXT_PRIMARY = semanticVar("text", "primary");
export const TEXT_SECONDARY = semanticVar("text", "secondary");
export const SELECTED_BOLD = semanticVar("stateSelected", "surfaceBold");
export const SP_1 = spaceVar("1");
export const SP_0_5 = spaceVar("0.5");

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
    border-radius: 2px 0 0 2px;
  }

  :host([orientation="bottom"]) {
    position: relative;
    border-radius: 0 0 2px 2px;
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
    border-radius: 0 0 0 2px;
  }

  .fade-right {
    right: 0;
    background: linear-gradient(to right, transparent, ${SURFACE_SECONDARY});
    border-radius: 0 0 2px 0;
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
    font-size: 12px;
    line-height: 16px;
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
    padding: 10px 12px;
    gap: 16px;
  }

  :host([size="m"]) .link,
  :host(:not([size])) .link {
    height: 32px;
    padding: 0 12px;
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="m"]) .section,
  :host(:not([size])) .section {
    height: 24px;
    padding: 0 12px;
    font-size: 11px;
    line-height: 16px;
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
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .section {
    height: 28px;
    padding: 0 16px;
    font-size: 12px;
    line-height: 16px;
  }
`;
