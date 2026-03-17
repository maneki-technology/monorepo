// Self-hosted Geist font (MIT license, variable weight)
// Copied to public/ because geist package lacks proper exports for bundlers

const geistFace = new FontFace("Geist", `url(/Geist-Variable.woff2) format('woff2')`, {
  weight: "100 900",
  style: "normal",
});
geistFace.load().then((f) => document.fonts.add(f));

import { injectAllTokens, registerIconFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";
import "@maneki/ui-components";

// Inject foundation tokens + icon font
injectAllTokens();
registerIconFont(materialSymbolsWoff2);

import { pages } from "./registry.js";
import { manifest, sectionOrder } from "./manifest.js";

// ─── Lazy page loaders ──────────────────────────────────────────────────────
// Maps page ID → dynamic import function. Vite code-splits each into its own chunk.

const pageLoaders: Record<string, () => Promise<unknown>> = {
  "colors": () => import("./pages/colors.js"),
  "spacing": () => import("./pages/spacing.js"),
  "typography": () => import("./pages/typography.js"),
  "elevation": () => import("./pages/elevation.js"),
  "semantic-tokens": () => import("./pages/semantic-tokens.js"),
  "badge": () => import("./pages/badge.js"),
  "button": () => import("./pages/button.js"),
  "avatar": () => import("./pages/avatar.js"),
  "alert": () => import("./pages/alert.js"),
  "icon": () => import("./pages/icon.js"),
  "image": () => import("./pages/image.js"),
  "label": () => import("./pages/label.js"),
  "link": () => import("./pages/link.js"),
  "tag": () => import("./pages/tag.js"),
  "checkbox": () => import("./pages/checkbox.js"),
  "radio": () => import("./pages/radio.js"),
  "input": () => import("./pages/input.js"),
  "textarea": () => import("./pages/textarea.js"),
  "file-upload": () => import("./pages/file-upload.js"),
  "select": () => import("./pages/select.js"),
  "queryfield": () => import("./pages/queryfield.js"),
  "card": () => import("./pages/card.js"),
  "breadcrumb": () => import("./pages/breadcrumb.js"),
  "accordion": () => import("./pages/accordion.js"),
  "dropdown": () => import("./pages/dropdown.js"),
  "menu": () => import("./pages/menu.js"),
  "modal": () => import("./pages/modal.js"),
  "side-panel-menu": () => import("./pages/side-panel-menu.js"),
  "pagination": () => import("./pages/pagination.js"),
  "tabs": () => import("./pages/tabs.js"),
  "table": () => import("./pages/table.js"),
  "metric": () => import("./pages/metric.js"),
  "person": () => import("./pages/person.js"),
  "progress": () => import("./pages/progress.js"),
  "pull-to-refresh": () => import("./pages/pull-to-refresh.js"),
  "popover": () => import("./pages/popover.js"),
  "carousel": () => import("./pages/carousel.js"),
  "calendar": () => import("./pages/calendar.js"),
  "datetime-picker": () => import("./pages/datetime-picker.js"),
  "clock": () => import("./pages/clock.js"),
  "list": () => import("./pages/list.js"),
  "grid-layout": () => import("./pages/grid-layout.js"),
  "flex-layout": () => import("./pages/flex-layout.js"),
};

// Track which pages have been loaded
const loadedPages = new Set<string>();

async function ensurePageLoaded(pageId: string): Promise<boolean> {
  if (loadedPages.has(pageId)) return true;
  const loader = pageLoaders[pageId];
  if (!loader) return false;
  await loader(); // Side-effect: calls registerPage() which populates `pages`
  loadedPages.add(pageId);
  return true;
}

// ─── Router ──────────────────────────────────────────────────────────────────

function buildSidebar(): void {
  const sidebar = document.getElementById("sidebar")!;
  const sections: Record<string, { id: string; title: string }[]> = {};

  for (const entry of manifest) {
    if (!sections[entry.section]) sections[entry.section] = [];
    sections[entry.section].push({ id: entry.id, title: entry.title });
  }

  let html = `<h1>Maneki</h1>`;
  for (const section of sectionOrder) {
    const items = sections[section];
    if (!items) continue;
    html += `<div class="section-title">${section}</div>`;
    for (const item of items) {
      html += `<a href="#${item.id}" data-page="${item.id}">${item.title}</a>`;
    }
  }
  sidebar.innerHTML = html;

  sidebar.addEventListener("click", (e) => {
    const link = (e.target as HTMLElement).closest("a");
    if (!link) return;
    e.preventDefault();
    const pageId = link.dataset.page;
    if (pageId) navigate(pageId);
  });
}

function navigate(pageId: string): void {
  window.location.hash = pageId;
  renderPage(pageId);
}

async function renderPage(pageId: string): Promise<void> {
  const content = document.getElementById("content")!;

  if (!pageId) {
    content.innerHTML = `<h2>Welcome</h2><p>Select a page from the sidebar.</p>`;
    return;
  }

  // Update active link immediately (no waiting for lazy load)
  document.querySelectorAll("#sidebar a").forEach((a) => {
    a.classList.toggle("active", (a as HTMLElement).dataset.page === pageId);
  });

  // Show subtle loading state if not already cached
  const meta = manifest.find((m) => m.id === pageId);
  if (!loadedPages.has(pageId)) {
    content.innerHTML = `<h2>${meta?.title ?? ""}</h2>`;
    content.classList.add("loading");
  }

  // Lazy-load the page module
  const loaded = await ensurePageLoaded(pageId);
  const page = pages[pageId];

  content.classList.remove("loading");

  if (!loaded || !page) {
    content.innerHTML = `<h2>Welcome</h2><p>Select a page from the sidebar.</p>`;
    return;
  }

  content.innerHTML = `<h2>${page.title}</h2>${page.render()}`;

  // Run page setup (imperative DOM manipulation)
  if (page.setup) {
    requestAnimationFrame(() => page.setup!());
  }
}

function onHashChange(): void {
  const hash = window.location.hash.slice(1);
  renderPage(hash || manifest[0].id);
}

// ─── Init ────────────────────────────────────────────────────────────────────

buildSidebar();
window.addEventListener("hashchange", onHashChange);
onHashChange();

// ─── PWA ─────────────────────────────────────────────────────────────────────

import { initPWA } from "./pwa.js";
initPWA();
