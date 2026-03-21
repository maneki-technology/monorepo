import {
  FONT_PRIMARY,
  SP_0_75,
  SP_1,
  SP_1_25,
  SP_1_5,
  SP_2,
  SP_2_5,
  SP_3,
  TEXT_PRIMARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
} from "@maneki/foundation";

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
    padding: ${SP_1_5};
    font-family: ${FONT_PRIMARY};
    width: 100%;
  }

  :host(:not([active])) {
    display: none;
  }

  .loading-info {
    display: flex;
    align-items: center;
    gap: ${SP_1};
  }

  .spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${SP_2_5};
    height: ${SP_2_5};
    animation: spin 1s linear infinite;
  }

  .spinner .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: ${SP_2_5};
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
    padding: ${SP_1};
  }

  :host([size="s"]) .loading-info {
    gap: ${SP_0_75};
  }

  :host([size="s"]) .spinner {
    width: ${SP_2};
    height: ${SP_2};
  }

  :host([size="s"]) .spinner .material-symbols-outlined {
    font-size: ${SP_2};
  }

  :host([size="s"]) .text {
    ${TYPE_BODY_02}
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    padding: ${SP_1_5};
  }

  :host .loading-info,
  :host([size="m"]) .loading-info {
    gap: ${SP_1};
  }

  :host .spinner,
  :host([size="m"]) .spinner {
    width: ${SP_2_5};
    height: ${SP_2_5};
  }

  :host .spinner .material-symbols-outlined,
  :host([size="m"]) .spinner .material-symbols-outlined {
    font-size: ${SP_2_5};
  }

  :host .text,
  :host([size="m"]) .text {
    font-weight: 500;
    ${TYPE_BODY_01}
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    padding: ${SP_2};
  }

  :host([size="l"]) .loading-info {
    gap: ${SP_1_25};
  }

  :host([size="l"]) .spinner {
    width: ${SP_3};
    height: ${SP_3};
  }

  :host([size="l"]) .spinner .material-symbols-outlined {
    font-size: ${SP_3};
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
