import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");

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
    align-items: center;
    justify-content: center;
    padding: 12px;
    font-family: "Geist", sans-serif;
    width: 100%;
  }

  :host(:not([active])) {
    display: none;
  }

  .loading-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }

  .spinner .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: 20px;
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

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    padding: 8px;
  }

  :host([size="s"]) .loading-info {
    gap: 6px;
  }

  :host([size="s"]) .spinner {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .spinner .material-symbols-outlined {
    font-size: 16px;
  }

  :host([size="s"]) .text {
    font-size: 14px;
    line-height: 20px;
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    padding: 12px;
  }

  :host .loading-info,
  :host([size="m"]) .loading-info {
    gap: 8px;
  }

  :host .spinner,
  :host([size="m"]) .spinner {
    width: 20px;
    height: 20px;
  }

  :host .spinner .material-symbols-outlined,
  :host([size="m"]) .spinner .material-symbols-outlined {
    font-size: 20px;
  }

  :host .text,
  :host([size="m"]) .text {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    padding: 16px;
  }

  :host([size="l"]) .loading-info {
    gap: 10px;
  }

  :host([size="l"]) .spinner {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .spinner .material-symbols-outlined {
    font-size: 24px;
  }

  :host([size="l"]) .text {
    font-size: 18px;
    line-height: 28px;
  }

  /* ── Light variant (default) ─────────────────────────────────────────────── */

  :host,
  :host([variant="light"]) {
    background: transparent;
  }

  :host .spinner,
  :host([variant="light"]) .spinner {
    color: ${TEXT_PRIMARY};
  }

  :host .text,
  :host([variant="light"]) .text {
    color: ${TEXT_PRIMARY};
  }

  /* ── Dark variant ────────────────────────────────────────────────────────── */

  :host([variant="dark"]) .spinner {
    color: #ffffff;
  }

  :host([variant="dark"]) .text {
    color: #ffffff;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation-duration: 4s;
    }
  }
`;
