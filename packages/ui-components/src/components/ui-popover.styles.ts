import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_CONTRAST = semanticVar("surface", "contrast");
const ICON_REVERSED = semanticVar("icon", "reversed");

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
    display: inline-flex;
    position: relative;
    width: fit-content;
    font-family: "Geist", sans-serif;
  }

  /* ── Popover panel ───────────────────────────────────────────────────────── */

  .panel {
    position: absolute;
    z-index: 1000;
    display: none;
    flex-direction: column;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  :host([open]) .panel {
    display: flex;
    opacity: 1;
  }

  .base {
    display: flex;
    align-items: flex-start;
    background: ${SURFACE_CONTRAST};
    border-radius: 2px;
    color: #ffffff;
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .title-text {
    font-weight: 500;
    color: #ffffff;
  }

  .description-text {
    font-weight: 400;
    color: #ffffff;
  }

  /* ── Close button ────────────────────────────────────────────────────────── */

  .close {
    display: none;
    align-items: flex-start;
    flex-shrink: 0;
    border: none;
    background: transparent;
    color: ${ICON_REVERSED};
    cursor: pointer;
    padding: 0;
  }

  :host([dismissable]) .close {
    display: flex;
  }

  .close .material-symbols-outlined {
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

  /* ── Arrow ───────────────────────────────────────────────────────────────── */

  .arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${SURFACE_CONTRAST};
    transform: rotate(45deg);
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    --_popover-width: 320px;
  }

  :host .base,
  :host([size="m"]) .base {
    padding: 20px 16px;
    gap: 8px;
  }

  :host .content,
  :host([size="m"]) .content {
    gap: 12px;
  }

  :host .title-text,
  :host([size="m"]) .title-text {
    font-size: 20px;
    line-height: 28px;
  }

  :host .description-text,
  :host([size="m"]) .description-text {
    font-size: 14px;
    line-height: 20px;
  }

  :host .close .material-symbols-outlined,
  :host([size="m"]) .close .material-symbols-outlined {
    font-size: 20px;
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_popover-width: 320px;
  }

  :host([size="s"]) .base {
    padding: 16px;
    gap: 8px;
  }

  :host([size="s"]) .content {
    gap: 8px;
  }

  :host([size="s"]) .title-text {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="s"]) .description-text {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .close .material-symbols-outlined {
    font-size: 16px;
  }

  /* ── Placement: positioning ──────────────────────────────────────────────── */

  /* Top placements: popover above trigger */
  :host([placement="top-left"]) .panel,
  :host([placement="top-center"]) .panel,
  :host([placement="top-right"]) .panel {
    bottom: 100%;
    margin-bottom: 8px;
  }

  :host([placement="top-left"]) .panel {
    left: 0;
  }

  :host([placement="top-center"]) .panel {
    left: 50%;
    transform: translateX(-50%);
  }

  :host([placement="top-right"]) .panel {
    right: 0;
  }

  /* Bottom placements: popover below trigger */
  :host([placement="bottom-left"]) .panel,
  :host([placement="bottom-center"]) .panel,
  :host([placement="bottom-right"]) .panel {
    top: 100%;
    margin-top: 8px;
  }

  :host([placement="bottom-left"]) .panel {
    left: 0;
  }

  :host([placement="bottom-center"]) .panel {
    left: 50%;
    transform: translateX(-50%);
  }

  :host([placement="bottom-right"]) .panel {
    right: 0;
  }

  /* Left placements: popover to the left of trigger */
  :host([placement="left-top"]) .panel,
  :host([placement="left-center"]) .panel,
  :host([placement="left-bottom"]) .panel {
    right: 100%;
    margin-right: 8px;
  }

  :host([placement="left-top"]) .panel {
    top: 0;
  }

  :host([placement="left-center"]) .panel {
    top: 50%;
    transform: translateY(-50%);
  }

  :host([placement="left-bottom"]) .panel {
    bottom: 0;
  }

  /* Right placements: popover to the right of trigger */
  :host([placement="right-top"]) .panel,
  :host([placement="right-center"]) .panel,
  :host([placement="right-bottom"]) .panel {
    left: 100%;
    margin-left: 8px;
  }

  :host([placement="right-top"]) .panel {
    top: 0;
  }

  :host([placement="right-center"]) .panel {
    top: 50%;
    transform: translateY(-50%);
  }

  :host([placement="right-bottom"]) .panel {
    bottom: 0;
  }

  /* ── Arrow positioning ───────────────────────────────────────────────────── */

  /* Top placements: arrow at bottom of panel */
  :host([placement="top-left"]) .arrow,
  :host([placement="top-center"]) .arrow,
  :host([placement="top-right"]) .arrow {
    bottom: -5px;
  }

  :host([placement="top-left"]) .arrow {
    left: 20px;
  }

  :host([placement="top-center"]) .arrow {
    left: 50%;
    margin-left: -5px;
  }

  :host([placement="top-right"]) .arrow {
    right: 20px;
  }

  /* Bottom placements: arrow at top of panel */
  :host([placement="bottom-left"]) .arrow,
  :host([placement="bottom-center"]) .arrow,
  :host([placement="bottom-right"]) .arrow {
    top: -5px;
  }

  :host([placement="bottom-left"]) .arrow {
    left: 20px;
  }

  :host([placement="bottom-center"]) .arrow {
    left: 50%;
    margin-left: -5px;
  }

  :host([placement="bottom-right"]) .arrow {
    right: 20px;
  }

  /* Left placements: arrow at right of panel */
  :host([placement="left-top"]) .arrow,
  :host([placement="left-center"]) .arrow,
  :host([placement="left-bottom"]) .arrow {
    right: -5px;
  }

  :host([placement="left-top"]) .arrow {
    top: 16px;
  }

  :host([placement="left-center"]) .arrow {
    top: 50%;
    margin-top: -5px;
  }

  :host([placement="left-bottom"]) .arrow {
    bottom: 16px;
  }

  /* Right placements: arrow at left of panel */
  :host([placement="right-top"]) .arrow,
  :host([placement="right-center"]) .arrow,
  :host([placement="right-bottom"]) .arrow {
    left: -5px;
  }

  :host([placement="right-top"]) .arrow {
    top: 16px;
  }

  :host([placement="right-center"]) .arrow {
    top: 50%;
    margin-top: -5px;
  }

  :host([placement="right-bottom"]) .arrow {
    bottom: 16px;
  }

  /* ── Panel width ─────────────────────────────────────────────────────────── */

  .panel {
    width: var(--_popover-width, 320px);
  }

  @media (prefers-reduced-motion: reduce) {
    .panel {
      transition-duration: 0.01ms !important;
    }
  }
`;
