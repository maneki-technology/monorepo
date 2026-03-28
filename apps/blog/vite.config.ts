import { defineConfig } from "vite";
import { markdownPostsPlugin } from "./plugins/markdown-posts.js";
import { autoUiComponentsPlugin } from "./plugins/auto-ui-components.js";
import { sitemapPlugin } from "./plugins/sitemap.js";

export default defineConfig({
  root: ".",
  server: {
    port: 5175,
  },
  appType: "spa",
  plugins: [
    markdownPostsPlugin(),
    autoUiComponentsPlugin(),
    sitemapPlugin(),
    {
      name: "editor-rewrite",
      configureServer(server) {
        // Run before Vite's SPA fallback — rewrite /editor to editor.html
        return () => {
          server.middlewares.use((req, _res, next) => {
            if (req.url?.startsWith("/editor")) {
              req.url = "/editor.html";
            }
            next();
          });
        };
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "index.html",
        editor: "editor.html",
      },
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
});
