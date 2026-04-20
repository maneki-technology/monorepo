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

// Shift deploy FAB when review panel opens/closes
const fab = document.querySelector("deploy-fab") as HTMLElement | null;
const themeToggle = document.querySelector("theme-toggle[fab]") as HTMLElement | null;
function shiftFabs(open: boolean, fullscreen?: boolean) {
  if (!open) {
    if (fab) { fab.style.right = "24px"; fab.style.display = ""; }
    if (themeToggle) { themeToggle.style.right = "8px"; themeToggle.style.display = ""; }
  } else if (fullscreen) {
    if (fab) fab.style.display = "none";
    if (themeToggle) themeToggle.style.display = "none";
  } else {
    if (fab) { fab.style.right = "444px"; fab.style.display = ""; }
    if (themeToggle) { themeToggle.style.right = "444px"; themeToggle.style.display = ""; }
  }
}
document.addEventListener("review-panel-toggle", ((e: CustomEvent) => shiftFabs(e.detail.open, e.detail.fullscreen)) as EventListener);
document.addEventListener("brainstorm-panel-toggle", ((e: CustomEvent) => shiftFabs(e.detail.open, e.detail.fullscreen)) as EventListener);

window.addEventListener("theme-change", () => saveThemeToBackend());
loadTheme();
