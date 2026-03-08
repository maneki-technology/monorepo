import type { Preview } from "@storybook/web-components";
import { injectAllTokens } from "../src/index.js";

// Inject all foundation tokens so stories can reference CSS custom properties
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
