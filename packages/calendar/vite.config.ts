import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ManekiCalendar",
      fileName: "index",
      formats: ["es"],
    },
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      external: ["@maneki/foundation"],
    },
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
});
