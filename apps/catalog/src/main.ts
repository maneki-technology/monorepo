import { injectAllTokens, registerIconFont } from "@maneki/foundation";
import materialSymbolsWoff2 from "@maneki/foundation/assets/material-symbols-outlined-subset.woff2?url";
import "@maneki/ui-components";

// Inject foundation tokens + icon font
injectAllTokens();
registerIconFont(materialSymbolsWoff2);

import { pages } from "./registry.js";

// ─── Import all pages ────────────────────────────────────────────────────────

import "./pages/colors.js";
import "./pages/spacing.js";
import "./pages/typography.js";
import "./pages/elevation.js";
import "./pages/semantic-tokens.js";
import "./pages/badge.js";
import "./pages/button.js";
import "./pages/avatar.js";
import "./pages/alert.js";
import "./pages/icon.js";
import "./pages/image.js";
import "./pages/label.js";
import "./pages/link.js";
import "./pages/tag.js";
import "./pages/checkbox.js";
import "./pages/radio.js";
import "./pages/input.js";
import "./pages/textarea.js";
import "./pages/file-upload.js";
import "./pages/select.js";
import "./pages/card.js";
import "./pages/breadcrumb.js";
import "./pages/accordion.js";
import "./pages/dropdown.js";
import "./pages/menu.js";
import "./pages/modal.js";
import "./pages/side-panel-menu.js";
import "./pages/tabs.js";
import "./pages/table.js";
import "./pages/carousel.js";
import "./pages/calendar.js";
import "./pages/datetime-picker.js";
import "./pages/clock.js";
import "./pages/list.js";
import "./pages/grid-layout.js";
import "./pages/flex-layout.js";

// ─── Router ──────────────────────────────────────────────────────────────────

function buildSidebar(): void {
  const sidebar = document.getElementById("sidebar")!;
  const sections: Record<string, { id: string; title: string }[]> = {};

  const sectionOrder = ["Foundation", "Primitives", "Form Controls", "Containers", "Navigation", "Disclosure", "Menus & Dropdowns", "Overlays", "Tabs", "Data Display", "Calendar & Date", "List", "Layouts"];

  for (const [id, page] of Object.entries(pages)) {
    if (!sections[page.section]) sections[page.section] = [];
    sections[page.section].push({ id, title: page.title });
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

function renderPage(pageId: string): void {
  const page = pages[pageId];
  const content = document.getElementById("content")!;

  if (!page) {
    content.innerHTML = `<h2>Welcome</h2><p>Select a page from the sidebar.</p>`;
    return;
  }

  content.innerHTML = `<h2>${page.title}</h2>${page.render()}`;

  // Update active link
  document.querySelectorAll("#sidebar a").forEach((a) => {
    a.classList.toggle("active", (a as HTMLElement).dataset.page === pageId);
  });

  // Run page setup (imperative DOM manipulation)
  if (page.setup) {
    requestAnimationFrame(() => page.setup!());
  }
}

function onHashChange(): void {
  const hash = window.location.hash.slice(1);
  renderPage(hash || Object.keys(pages)[0]);
}

// ─── Init ────────────────────────────────────────────────────────────────────

buildSidebar();
window.addEventListener("hashchange", onHashChange);
onHashChange();
