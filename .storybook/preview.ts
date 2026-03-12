import type { Preview } from "@storybook/web-components";
import { injectAllTokens } from "@maneki/foundation";
import { registerIconFont } from "@maneki/foundation";
import "@fontsource-variable/inter";
import interLatinWoff2 from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import interLatinExtWoff2 from "@fontsource-variable/inter/files/inter-latin-ext-wght-normal.woff2?url";

// @fontsource-variable/inter registers as "Inter Variable" — alias to "Inter"
// so components using font-family: 'Inter' pick up the variable font
for (const src of [interLatinWoff2, interLatinExtWoff2]) {
  const face = new FontFace("Inter", `url(${src}) format('woff2')`, {
    weight: "100 900",
    style: "normal",
  });
  face.load().then((f) => document.fonts.add(f));
}

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
    chromatic: {
      delay: 1000, // Wait for icon font to load before capturing screenshots
    },
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
