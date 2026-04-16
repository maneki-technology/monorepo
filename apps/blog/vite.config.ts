import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { markdownPostsPlugin } from "./plugins/markdown-posts.js";
import { portfolioProjectsPlugin } from "./plugins/portfolio-projects.js";
import { photographyPlugin } from "./plugins/photography.js";
import { autoUiComponentsPlugin } from "./plugins/auto-ui-components.js";
import { sitemapPlugin } from "./plugins/sitemap.js";
import { rssFeedPlugin } from "./plugins/rss-feed.js";
import { injectTokensPlugin } from "./plugins/inject-tokens.js";
import { pagesPlugin } from "./plugins/pages.js";
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
    // Serve admin HTML files before SPA fallback rewrites them to index.html
    {
      name: "admin-html-routes",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const adminRoutes: Record<string, string> = {
            "/admin/editor": "/admin/editor.html",
            "/admin/gallery": "/admin/gallery.html",
            "/admin": "/admin.html",
          };
          const rewrite = adminRoutes[req.url?.split("?")[0] ?? ""];
          if (rewrite) req.url = rewrite;
          next();
        });
      },
    },
    injectTokensPlugin(),
    markdownPostsPlugin(),
    portfolioProjectsPlugin(),
    photographyPlugin(),
    autoUiComponentsPlugin(),
    sitemapPlugin(),
    rssFeedPlugin(),
    pagesPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      workbox: {
        // Only cache static assets — HTML always comes from network
        globPatterns: ["**/*.{js,css,woff2}"],
        navigateFallback: null,
      },
    }),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: "index.html",
        admin: "admin.html",
        "admin-editor": "admin/editor.html",
        "admin-gallery": "admin/gallery.html",
      },
      output: {
        manualChunks(id) {
          if (
            id.includes("packages/foundation/") ||
            id.includes("@maneki/foundation")
          ) {
            return "vendor-foundation";
          }
        },
      },
    },
  },
}));
