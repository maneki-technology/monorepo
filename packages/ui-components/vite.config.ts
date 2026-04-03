import { defineConfig, type Plugin } from "vitest/config";
import { resolve } from "path";
import { readdirSync } from "node:fs";

import { minifyCss } from "./src/css-minify.js";
/**
 * Vite plugin that minifies CSS inside template literals tagged with a css comment marker.
 * Strips comments, collapses whitespace, removes trailing semicolons before closing brace.
 * Only runs during build (not dev/test) to keep DX intact.
 */
function minifyCssLiterals(): Plugin {
  return {
    name: "minify-css-literals",
    apply: "build",
    transform(code, id) {
      if (!id.endsWith(".ts") && !id.endsWith(".js")) return null;
      if (!code.includes("/* css */")) return null;

      const result = code.replace(
        /(\/\* css \*\/\s*`)[\s\S]*?(`)/g,
        (_match, prefix, suffix) => {
          const cssStart = _match.indexOf("`") + 1;
          const cssEnd = _match.lastIndexOf("`");
          const css = _match.slice(cssStart, cssEnd);
          return prefix + minifyCss(css) + suffix;
        },
      );

      if (result === code) return null;
      return { code: result, map: null };
    },
  };
}

export default defineConfig({
  plugins: [minifyCssLiterals()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        ...Object.fromEntries(
          readdirSync(resolve(__dirname, "src/components"))
            .filter((f) => f.startsWith("ui-") && f.endsWith(".ts") && !f.includes(".test.") && !f.includes(".styles."))
            .map((f) => [`components/${f.replace(".ts", "")}`, resolve(__dirname, `src/components/${f}`)])
        ),
      },
      formats: ["es"],
    },
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        preserveModules: false,
        entryFileNames: "[name].js",
        chunkFileNames: "shared/[name]-[hash].js",
      },
    },
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
  server: {
    open: "/demo.html",
  },
});
