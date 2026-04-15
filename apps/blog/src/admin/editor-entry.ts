import { registerIconFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";

registerIconFont(materialSymbolsWoff2);

import "../components/theme-toggle.js";
import "../components/loading-bounce.js";
import "./deploy-fab.js";
import { loadTheme, saveThemeToBackend } from "./theme.js";

const root = document.getElementById("admin-root")!;

import("../pages/editor/editor-page.js").then(() => {
  const el = document.createElement("editor-page");
  root.appendChild(el);
});

window.addEventListener("theme-change", () => saveThemeToBackend());
loadTheme();
