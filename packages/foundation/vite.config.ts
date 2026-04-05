import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "heroui-theme": resolve(__dirname, "src/heroui-theme.ts"),
      },
      name: "ManekiFoundation",
      formats: ["es"],
    },
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
});
