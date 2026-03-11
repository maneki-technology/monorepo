import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: [
    "../packages/foundation/src/**/*.stories.ts",
    "../packages/ui-components/src/**/*.stories.ts",
    "../packages/grid-layout/src/**/*.stories.ts",
    "../packages/flex-layout/src/**/*.stories.ts",
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
};

export default config;
