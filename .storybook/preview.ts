import type { Preview } from "@storybook/web-components";
import { injectAllTokens } from "@maneki/foundation";

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
