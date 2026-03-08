import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: [
    "../packages/foundation/src/**/*.stories.ts",
    "../packages/ui-components/src/**/*.stories.ts",
  ],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
};

export default config;
