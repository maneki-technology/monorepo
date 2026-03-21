import type { Preview } from "@storybook/web-components";
import { injectAllTokens } from "@maneki/foundation";
import { registerIconFont } from "@maneki/foundation";

// Register Geist variable font (served from .storybook/public/)
const geistFace = new FontFace("Geist", `url(/Geist-Variable.woff2) format('woff2')`, {
  weight: "100 900",
  style: "normal",
});
geistFace.load().then((f) => document.fonts.add(f));

// Register subset Material Symbols Outlined font (~24 KB vs 3.7 MB full)
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";
registerIconFont(materialSymbolsWoff2);

// Global .material-symbols-outlined class for slotted icon spans (light DOM)
const globalIconStyles = document.createElement("style");
globalIconStyles.textContent = `
  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: inherit;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
`;
document.head.appendChild(globalIconStyles);

// Inject foundation design tokens as CSS custom properties on :root
injectAllTokens();

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
