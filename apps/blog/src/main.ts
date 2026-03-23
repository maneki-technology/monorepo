// Self-hosted Geist font
const geistFace = new FontFace("Geist", `url(/Geist-Variable.woff2) format('woff2')`, {
  weight: "100 900",
  style: "normal",
  display: "swap",
});
geistFace.load().then((f) => document.fonts.add(f));

import { injectAllTokens, registerIconFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";
// Auto-detect and import only the <ui-*> components used in source files
import "virtual:ui-components";

// Inject foundation tokens + icon font
injectAllTokens();
registerIconFont(materialSymbolsWoff2);

// Register all pages (side-effect imports)
import "./pages/home.js";
import "./pages/blog.js";
import "./pages/post.js";
import "./pages/portfolio.js";
import "./pages/resume.js";
import "./pages/about.js";
import "./pages/blog.js";
import "./pages/post.js";
import "./pages/portfolio.js";
import "./pages/about.js";

import { initRouter } from "./router.js";

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

// ─── Init ──────────────────────────────────────────────────────────────────

initThemeToggle();
initRouter();
