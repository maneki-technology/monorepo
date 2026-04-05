import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { markdownPostsPlugin } from "./plugins/markdown-posts.js";
import { portfolioProjectsPlugin } from "./plugins/portfolio-projects.js";
import { autoUiComponentsPlugin } from "./plugins/auto-ui-components.js";
import { sitemapPlugin } from "./plugins/sitemap.js";
import { rssFeedPlugin } from "./plugins/rss-feed.js";
import { devAliases } from "../../shared/vite-dev-aliases.js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Load .dev.vars into process.env for Turso-backed plugins in dev mode
const devVarsPath = resolve(import.meta.dirname, ".dev.vars");
if (existsSync(devVarsPath)) {
  for (const line of readFileSync(devVarsPath, "utf-8").split("\n")) {
    const match = line.match(/^([\w]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}
export default defineConfig(({ command }) => ({
  root: ".",
  server: {
    port: 5175,
  },
  resolve: command === "serve" ? { alias: devAliases } : {},
  appType: "spa",
  plugins: [
    markdownPostsPlugin(),
    portfolioProjectsPlugin(),
    autoUiComponentsPlugin(),
    sitemapPlugin(),
    rssFeedPlugin(),
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
    rolldownOptions: {
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
