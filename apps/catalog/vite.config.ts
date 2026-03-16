import { defineConfig } from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  root: ".",
  plugins: [
    VitePWA({
      registerType: "prompt",
      workbox: {
        // Precache all built assets (JS chunks, CSS, fonts, HTML)
        globPatterns: ["**/*.{js,css,html,woff2}"],
      },
      manifest: {
        name: "Maneki Design System Catalog",
        short_name: "Maneki Catalog",
        description:
          "Visual catalog for the Maneki design system — foundation tokens, 50 Web Components, and layout primitives.",
        theme_color: "#186ade",
        background_color: "#f8f9fa",
        display: "standalone",
      },
    }),
    ViteMinifyPlugin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
    }),
  ],
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
