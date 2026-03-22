/**
 * Vite plugin that auto-detects <ui-*> Web Component tags in source files
 * and generates imports for the matching @maneki/ui-components modules.
 *
 * Usage: import "virtual:ui-components";
 *
 * The plugin scans .ts, .html, and .md files for <ui-* patterns,
 * then generates a module that imports only the components actually used.
 */

import { type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";

const VIRTUAL_MODULE_ID = "virtual:ui-components";
const RESOLVED_ID = "\0" + VIRTUAL_MODULE_ID;

const SCAN_DIRS = ["src", "content", "."];
const SCAN_EXTENSIONS = [".ts", ".html", ".md"];
const SCAN_ROOT_FILES = ["index.html"];

/** Extract all unique <ui-*> tag names from a string. */
function extractTags(source: string): Set<string> {
  const tags = new Set<string>();
  const regex = /<(ui-[a-z][-a-z]*)/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    tags.add(match[1]);
  }
  return tags;
}

/** Recursively scan a directory for files matching extensions. */
function scanDir(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "dist") {
      results.push(...scanDir(full, extensions));
    } else if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

export function autoUiComponentsPlugin(): Plugin {
  const root = process.cwd();

  function collectTags(): Set<string> {
    const allTags = new Set<string>();

    // Scan directories
    for (const dir of SCAN_DIRS) {
      const absDir = path.resolve(root, dir);
      const files = dir === "."
        ? SCAN_ROOT_FILES.map((f) => path.resolve(root, f)).filter((f) => fs.existsSync(f))
        : scanDir(absDir, SCAN_EXTENSIONS);

      for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        for (const tag of extractTags(content)) {
          allTags.add(tag);
        }
      }
    }

    return allTags;
  }

  function generateImports(): string {
    const tags = collectTags();
    if (tags.size === 0) return "// No <ui-*> components detected";

    const sorted = Array.from(tags).sort();
    const lines = sorted.map((tag) => `import "@maneki/ui-components/components/${tag}.js";`);

    return [
      `// Auto-detected ${sorted.length} <ui-*> components:`,
      `// ${sorted.join(", ")}`,
      "",
      ...lines,
      "",
    ].join("\n");
  }

  return {
    name: "auto-ui-components",
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID;
    },
    load(id) {
      if (id === RESOLVED_ID) return generateImports();
    },
    handleHotUpdate({ file, server }) {
      if (SCAN_EXTENSIONS.some((ext) => file.endsWith(ext))) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          return [mod];
        }
      }
    },
  };
}
