import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk: all @maneki packages
          if (
            id.includes("packages/foundation/") ||
            id.includes("@maneki/foundation")
          ) {
            return "vendor-foundation";
          }
          if (
            id.includes("packages/ui-components/") ||
            id.includes("@maneki/ui-components")
          ) {
            return "vendor-ui";
          }
          if (
            id.includes("packages/grid-layout/") ||
            id.includes("@maneki/grid-layout") ||
            id.includes("packages/flex-layout/") ||
            id.includes("@maneki/flex-layout")
          ) {
            return "vendor-layout";
          }
        },
      },
    },
  },
  server: {
    port: 5174,
  },
});
