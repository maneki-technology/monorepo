import { registerIconFont, registerGeistFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";
import geistWoff2 from "@maneki/foundation/assets/Geist-Variable.woff2?url";
// Auto-detect and import only the <ui-*> components used in source files
import "virtual:ui-components";

// Tokens injected at build time by inject-tokens plugin — just register fonts
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

import "./components/theme-toggle.js";

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

initReadingProgress();
initRouter();

// ─── Scroll Reveal ──────────────────────────────────────────────────────

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);

function observeReveals(): void {
  document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => revealObserver.observe(el));
}

observeReveals();
window.addEventListener("route-changed", observeReveals);
