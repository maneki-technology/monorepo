import type { Preview } from "@storybook/web-components";
import { injectAllTokens } from "@maneki/foundation";
import "material-symbols/outlined.css";
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

// Inject foundation design tokens as CSS custom properties on :root
injectAllTokens();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
