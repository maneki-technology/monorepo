import { injectAllTokens, registerIconFont, registerGeistFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";
import geistWoff2 from "@maneki/foundation/assets/Geist-Variable.woff2?url";
// Auto-detect and import only the <ui-*> components used in source files
import "virtual:ui-components";

// Inject foundation tokens + fonts
injectAllTokens();
registerIconFont(materialSymbolsWoff2);
registerGeistFont(geistWoff2);

// Register all routes
import { routes } from "./routes.js";
import { registerRoute, initRouter } from "./router.js";

routes.forEach(registerRoute);
// ─── Theme Toggle ─────────────────────────────────────────────────────────

function initThemeToggle(): void {
  const btn = document.getElementById("theme-toggle")!;
  const saved = localStorage.getItem("blog-theme");
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    btn.textContent = "\u263E";
  }
  btn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("blog-theme", "light");
      btn.textContent = "\u2600\uFE0F";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("blog-theme", "dark");
      btn.textContent = "\u263E";
    }
  });
}

// ─── Reading Progress ─────────────────────────────────────────────────────────

function initReadingProgress(): void {
  const bar = document.getElementById("reading-progress") as HTMLElement;
  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    bar.setAttribute("value", String(progress));
  }, { passive: true });
}

// ─── Init ──────────────────────────────────────────────────────────────────

initThemeToggle();
initReadingProgress();
initRouter();
