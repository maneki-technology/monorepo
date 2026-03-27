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
    height: 100%;
  }

  .container {
    width: 100%;
    height: 100%;
  }

  /* ── Bold emphasis (default) ─────────────────────────────────────────── */

  :host,
  :host([emphasis="bold"]) {
    --_thumb-bg: ${SURFACE_BOLD};
    --_thumb-radius: 5px;
    --_track-size: 10px;
  }

  /* ── Minimal emphasis ────────────────────────────────────────────── */

  :host([emphasis="minimal"]) {
    --_thumb-bg: ${SURFACE_BOLD};
    --_thumb-radius: 3px;
    --_track-size: 6px;
  }

  /* ── Vertical (default) ──────────────────────────────────────────── */

  :host,
  :host([orientation="vertical"]) {
    overflow: hidden;
  }

  :host([orientation="vertical"]) .container,
  :host(:not([orientation])) .container {
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ── Horizontal ─────────────────────────────────────────────────── */

  :host([orientation="horizontal"]) {
    overflow: hidden;
  }

  :host([orientation="horizontal"]) .container {
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* ── Webkit scrollbar styling ──────────────────────────────────────── */

  .container::-webkit-scrollbar {
    width: var(--_track-size);
    height: var(--_track-size);
  }

  .container::-webkit-scrollbar-track {
    background: transparent;
  }

  .container::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: var(--_thumb-radius);
    transition: background 0.2s ease;
  }

  :host(:hover) .container::-webkit-scrollbar-thumb {
    background: var(--_thumb-bg);
  }

  /* ── Firefox scrollbar styling ─────────────────────────────────────── */

  @supports not selector(::-webkit-scrollbar) {
    .container {
      scrollbar-width: thin;
      scrollbar-color: transparent transparent;
    }
    :host(:hover) .container {
      scrollbar-color: var(--_thumb-bg) transparent;
    }
  }
`;
