import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "WcGridLayout",
      fileName: "index",
      formats: ["es"],
    },
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
  server: {
    open: "/demo.html",
  },
});
