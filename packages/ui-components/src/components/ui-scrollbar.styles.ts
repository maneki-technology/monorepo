import {
  BORDER_MINIMAL,
  BW_MD,
  SP_1,
  SP_1_5,
  SURFACE_BOLD,
  SURFACE_SECONDARY,
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
    overflow: hidden;
    position: relative;
  }

  .container {
    width: 100%;
    height: 100%;
  }

  /* ── Bold emphasis (default) ─────────────────────────────────────────────── */

  :host,
  :host([emphasis="bold"]) {
    --_track-bg: ${SURFACE_SECONDARY};
    --_thumb-bg: ${SURFACE_BOLD};
    --_thumb-radius: ${SP_1_5};
    --_thumb-size: 5px;
    --_track-size: ${SP_1_5};
    --_border-color: ${BORDER_MINIMAL};
  }

  /* ── Minimal emphasis ────────────────────────────────────────────────────── */

  :host([emphasis="minimal"]) {
    --_track-bg: transparent;
    --_thumb-bg: ${SURFACE_BOLD};
    --_thumb-radius: ${SP_1_5};
    --_thumb-size: 5px;
    --_track-size: ${SP_1};
    --_border-color: transparent;
  }

  /* ── Vertical (default) ──────────────────────────────────────────────────── */

  :host,
  :host([orientation="vertical"]) {
    overflow-y: auto;
    overflow-x: hidden;
  }

  :host([orientation="vertical"]) .container {
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ── Horizontal ──────────────────────────────────────────────────────────── */

  :host([orientation="horizontal"]) {
    overflow-x: auto;
    overflow-y: hidden;
  }

  :host([orientation="horizontal"]) .container {
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* ── Webkit scrollbar styling ────────────────────────────────────────────── */

  .container::-webkit-scrollbar {
    width: var(--_track-size);
    height: var(--_track-size);
  }

  .container::-webkit-scrollbar-track {
    background: var(--_track-bg);
  }

  .container::-webkit-scrollbar-thumb {
    background: var(--_thumb-bg);
    border-radius: var(--_thumb-radius);
    border: 3px solid transparent;
    background-clip: content-box;
  }

  /* Bold: vertical border on left side of track */
  :host([emphasis="bold"][orientation="vertical"]) .container::-webkit-scrollbar-track,
  :host([emphasis="bold"]:not([orientation])) .container::-webkit-scrollbar-track {
    border-left: 1px solid var(--_border-color);
  }

  /* Bold: horizontal border on top of track */
  :host([emphasis="bold"][orientation="horizontal"]) .container::-webkit-scrollbar-track {
    border-top: 1px solid var(--_border-color);
  }

  /* Minimal: thinner thumb, no border */
  :host([emphasis="minimal"]) .container::-webkit-scrollbar-thumb {
    border: ${BW_MD} solid transparent;
    background-clip: content-box;
  }

  /* ── Firefox scrollbar styling ─────────────────────────────────────────── */

  :host([emphasis="bold"]) .container,
  :host(:not([emphasis])) .container {
    scrollbar-width: auto;
    scrollbar-color: var(--_thumb-bg) var(--_track-bg);
  }

  :host([emphasis="minimal"]) .container {
    scrollbar-width: thin;
    scrollbar-color: var(--_thumb-bg) transparent;
  }
`;
