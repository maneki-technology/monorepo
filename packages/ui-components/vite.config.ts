import { defineConfig, type Plugin } from "vitest/config";
import { resolve } from "path";

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

      // Match: /* css */ `...` (the STYLES pattern used across all components)
      const result = code.replace(
        /(\/\* css \*\/\s*`)([\s\S]*?)(`)/g,
        (_match, prefix, css, suffix) => {
          const minified = css
            // Remove CSS comments
            .replace(/\/\*[\s\S]*?\*\//g, "")
            // Collapse whitespace (but preserve content inside quotes)
            .replace(/\s+/g, " ")
            // Remove space around CSS punctuation
            .replace(/\s*([{}:;,>~+])\s*/g, "$1")
            // Remove trailing semicolons before }
            .replace(/;}/g, "}")
            // Remove leading/trailing whitespace
            .trim();
          return prefix + minified + suffix;
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
