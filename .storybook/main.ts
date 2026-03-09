import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: [
    "../packages/foundation/src/**/*.stories.ts",
    "../packages/ui-components/src/**/*.stories.ts",
    "../packages/grid-layout/src/**/*.stories.ts",
  ],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
};

export default config;
