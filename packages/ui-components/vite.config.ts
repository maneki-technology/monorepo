import { defineConfig, type Plugin } from "vitest/config";
import { resolve } from "path";

import { minifyCss } from "./src/css-minify.js";
/**
 * Vite plugin that minifies CSS inside template literals tagged with `/* css *​/`.
 * Strips comments, collapses whitespace, removes trailing semicolons before `}`.
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
      entry: resolve(__dirname, "src/index.ts"),
      name: "ManekiUiComponents",
      fileName: "index",
      formats: ["es"],
    },
    outDir: "dist",
    sourcemap: true,
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.ts"],
  },
  server: {
    open: "/demo.html",
  },
});
