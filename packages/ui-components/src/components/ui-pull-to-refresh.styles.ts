import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_PRIMARY = semanticVar("text", "primary");

const SP_075 = spaceVar("0.75");   // 6px
const SP_1 = spaceVar("1");         // 8px
const SP_15 = spaceVar("1.5");     // 12px
const SP_2 = spaceVar("2");         // 16px
const SP_25 = spaceVar("2.5");     // 20px
const SP_3 = spaceVar("3");         // 24px
const SP_125 = spaceVar("1.25");   // 10px
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
    padding: ${SP_15};
    font-family: "Geist", sans-serif;
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
    width: ${SP_25};
    height: ${SP_25};
    animation: spin 1s linear infinite;
  }

  .spinner .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: ${SP_25};
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
    gap: ${SP_075};
  }

  :host([size="s"]) .spinner {
    width: ${SP_2};
    height: ${SP_2};
  }

  :host([size="s"]) .spinner .material-symbols-outlined {
    font-size: ${SP_2};
  }

  :host([size="s"]) .text {
    font-size: 14px;
    line-height: 20px;
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    padding: ${SP_15};
  }

  :host .loading-info,
  :host([size="m"]) .loading-info {
    gap: ${SP_1};
  }

  :host .spinner,
  :host([size="m"]) .spinner {
    width: ${SP_25};
    height: ${SP_25};
  }

  :host .spinner .material-symbols-outlined,
  :host([size="m"]) .spinner .material-symbols-outlined {
    font-size: ${SP_25};
  }

  :host .text,
  :host([size="m"]) .text {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    padding: ${SP_2};
  }

  :host([size="l"]) .loading-info {
    gap: ${SP_125};
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
