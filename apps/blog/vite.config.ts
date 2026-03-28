import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { markdownPostsPlugin } from "./plugins/markdown-posts.js";
import { autoUiComponentsPlugin } from "./plugins/auto-ui-components.js";
import { sitemapPlugin } from "./plugins/sitemap.js";
import { devAliases } from "../../shared/vite-dev-aliases.js";

export default defineConfig(({ command }) => ({
  root: ".",
  server: {
    port: 5175,
  },
  resolve: command === "serve" ? { alias: devAliases } : {},
  appType: "spa",
  plugins: [
    markdownPostsPlugin(),
    autoUiComponentsPlugin(),
    sitemapPlugin(),
    VitePWA({
      registerType: "prompt",
      manifest: false,
      workbox: {
        // Only cache static assets — HTML always comes from network
        globPatterns: ["**/*.{js,css,woff2}"],
        navigateFallback: null,
      },
    }),
    {
      name: "editor-rewrite",
      configureServer(server) {
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
}));
