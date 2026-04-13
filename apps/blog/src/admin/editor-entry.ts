import { registerIconFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";

registerIconFont(materialSymbolsWoff2);

import "../components/theme-toggle.js";
import "../components/loading-bounce.js";
import { loadTheme, saveThemeToBackend } from "./theme.js";

const root = document.getElementById("admin-root")!;

import("../pages/editor/index.js").then(({ editorRoute }) => {
  root.innerHTML = editorRoute.render!();
  requestAnimationFrame(() => {
    if (editorRoute.setup) editorRoute.setup();
  });
});

window.addEventListener("theme-change", () => saveThemeToBackend());
loadTheme();
