import { registerIconFont, registerGeistFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";
import geistWoff2 from "@maneki/foundation/assets/Geist-Variable.woff2?url";
// Auto-detect and import only the <ui-*> components used in source files
import "virtual:ui-components";

// Tokens injected at build time by inject-tokens plugin — just register fonts
registerIconFont(materialSymbolsWoff2);
registerGeistFont(geistWoff2);
registerIconFont(materialSymbolsWoff2);
registerGeistFont(geistWoff2);

// Register all routes (lazy-loaded)
import { routes } from "./routes.js";
import { registerRoute, registerPatternRoute, initRouter } from "./router.js";

routes.forEach(registerRoute);

// Dynamic routes: post/* and project/* are loaded on-demand
registerPatternRoute({
  prefix: "post/",
  load: (id) => import("./pages/post.js").then((m) => m.findPostRoute(id)),
});
registerPatternRoute({
  prefix: "project/",
  load: (id) => import("./pages/project.js").then((m) => m.findProjectRoute(id)),
});

// ─── Theme Toggle ─────────────────────────────────────────────────────────

function initThemeToggle(): void {
  const btn = document.getElementById("theme-toggle")!;
  const saved = localStorage.getItem("blog-theme");
  if (saved === "dark") {
    document.documentElement.setAttribute("data-theme", "heroui-dark");
    btn.textContent = "☾";
  } else {
    document.documentElement.setAttribute("data-theme", "heroui");
  }
  btn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "heroui-dark";
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "heroui");
      localStorage.setItem("blog-theme", "light");
      btn.textContent = "☀️";
    } else {
      document.documentElement.setAttribute("data-theme", "heroui-dark");
      localStorage.setItem("blog-theme", "dark");
      btn.textContent = "☾";
    }
  });
}

// ─── Reading Progress ─────────────────────────────────────────────────────────

function initReadingProgress(): void {
  const bar = document.getElementById("reading-progress") as HTMLElement;
  window.addEventListener(
    "scroll",
    () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      bar.setAttribute("value", String(progress));
    },
    { passive: true },
  );
}

// ─── Init ──────────────────────────────────────────────────────────────────

initThemeToggle();
initReadingProgress();
initRouter();
