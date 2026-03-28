import type { Preview } from "@storybook/web-components";
import { injectAllTokens, registerIconFont, registerGeistFont } from "@maneki/foundation";

// Register fonts from foundation assets
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";
import geistWoff2 from "@maneki/foundation/assets/Geist-Variable.woff2?url";
registerIconFont(materialSymbolsWoff2);
registerGeistFont(geistWoff2);

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
