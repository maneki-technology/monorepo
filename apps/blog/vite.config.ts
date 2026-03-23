import { defineConfig } from "vite";
import { markdownPostsPlugin } from "./plugins/markdown-posts.js";
import { autoUiComponentsPlugin } from "./plugins/auto-ui-components.js";
import { sitemapPlugin } from "./plugins/sitemap.js";

export default defineConfig({
  root: ".",
  plugins: [markdownPostsPlugin(), autoUiComponentsPlugin(), sitemapPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
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
        },
      },
    },
  },
  server: {
    port: 5175,
  },
});
