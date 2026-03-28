import { defineConfig, type Plugin } from "vite";
import { ViteMinifyPlugin } from "vite-plugin-minify";
import { VitePWA } from "vite-plugin-pwa";
import { devAliases } from "../../shared/vite-dev-aliases.js";
/** Injects <link rel="preload"> for .woff2 assets into the HTML head. */
function fontPreloadPlugin(): Plugin {
  return {
    name: "font-preload",
    enforce: "post",
    transformIndexHtml(html, ctx) {
      const bundle = ctx.bundle;
      if (!bundle) return html;
      const fonts = Object.keys(bundle).filter((f) => f.endsWith(".woff2"));
      const tags = fonts.map((f) => ({
        tag: "link",
        attrs: { rel: "preload", href: `/${f}`, as: "font", type: "font/woff2", crossorigin: true },
        injectTo: "head" as const,
      }));
      return tags;
    },
  };
}

export default defineConfig(({ command }) => ({
  root: ".",
  resolve: command === "serve" ? { alias: devAliases } : {},
  plugins: [
    fontPreloadPlugin(),
    VitePWA({
      registerType: "prompt",
      workbox: {
        // Only cache static assets — HTML always comes from network
        globPatterns: ["**/*.{js,css,woff2}"],
        navigateFallback: null,
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
}));
