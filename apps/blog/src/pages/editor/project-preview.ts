/**
 * Fullscreen portfolio layout preview with drag-to-reorder + pin toggle.
 * Opened via a separate "Portfolio" button in the toolbar.
 */

import { state, setState } from "./state.js";
import { api } from "../../lib/api.js";
import type { Project } from "./types.js";
import "@maneki/ui-components/components/ui-card.js";

let overlay: HTMLElement | null = null;
let _projectPreviewRoot: ParentNode | null = null;

export function setProjectPreviewRoot(root: ParentNode): void {
  _projectPreviewRoot = root;
}

function createOverlay(): HTMLElement {
  const el = document.createElement("div");
  el.id = "admin-project-preview-overlay";
  el.className = "admin-preview-overlay";
  el.style.display = "none";

  el.innerHTML = `
    <div class="admin-preview-overlay-header">
      <span class="heading-05">Portfolio Layout</span>
      <ui-button id="project-preview-close" action="secondary" emphasis="subtle" size="s">Close</ui-button>
    </div>
    <ui-scrollbar emphasis="minimal">
      <div class="admin-preview-overlay-content">
        <div id="project-preview-grid" style="max-width:900px;margin:0 auto;padding:48px 24px;"></div>
      </div>
    </ui-scrollbar>
  `;

  const closeBtn = el.querySelector("#project-preview-close");
  if (closeBtn)
    (closeBtn as HTMLElement).onclick = () => {
      el.style.display = "none";
    };

  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape") el.style.display = "none";
  });

  return el;
}

function renderProjectCards(): void {
  if (!overlay) return;
  const container = overlay.querySelector("#project-preview-grid") as HTMLElement | null;
  if (!container) return;

  const published = state.allProjects.filter((p) => p.status !== "deleted");
  container.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "project-preview-sortable";

  for (const project of published) {
    const card = document.createElement("ui-card") as HTMLElement;
    card.setAttribute("bordered", "");
    card.setAttribute("data-slug", project.slug);
    card.setAttribute("draggable", "true");
    card.style.cursor = "grab";

    card.innerHTML = `
      <div class="project-preview-card-header">
        <span class="heading-05">${project.title || "Untitled"}</span>
        <span class="pin-toggle" role="button" tabindex="0" aria-label="Pin to homepage" style="cursor:pointer;font-size:16px;opacity:${project.pinned ? "1" : "0.3"};transition:opacity 0.15s;">\uD83D\uDCCC</span>
      </div>
      ${project.image ? `<ui-image slot="image" src="${project.image}" alt="${project.title}" style="width:100%;height:100px;--ui-image-fit:cover;--ui-image-bg:var(--fd-surface-secondary);"></ui-image>` : ""}
      <p class="body-02 text-secondary">${project.description}</p>
      <div class="tags mt-1">
        ${project.tech
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
          .map((t: string) => `<ui-badge size="xs" emphasis="subtle">${t}</ui-badge>`)
          .join("")}
      </div>
      <div class="project-preview-card-status">
        <ui-badge size="xs" status="${project.status === "published" ? "success" : "warning"}">${project.status}</ui-badge>
      </div>
    `;

    // Pin toggle
    const pinBtn = card.querySelector(".pin-toggle") as HTMLElement;
    if (pinBtn) {
      pinBtn.onclick = async (e) => {
        e.stopPropagation();
        const newPinned = !project.pinned;
        project.pinned = newPinned;
        pinBtn.style.opacity = newPinned ? "1" : "0.3";
        try {
          await api.api.projects[":slug"].$put({
            param: { slug: project.slug },
            json: { pinned: newPinned },
          });
        } catch {
          /* ignore */
        }
        setState({});
      };
    }

    // Drag events
    card.addEventListener("dragstart", (e) => {
      card.classList.add("dragging");
      e.dataTransfer!.effectAllowed = "move";
      e.dataTransfer!.setData("text/plain", project.slug);
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = "move";
      const dragging = grid.querySelector(".dragging");
      if (dragging && dragging !== card) {
        const rect = card.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          grid.insertBefore(dragging, card);
        } else {
          grid.insertBefore(dragging, card.nextSibling);
        }
      }
    });

    grid.appendChild(card);
  }

  // Save order on drop
  grid.addEventListener("drop", async (e) => {
    e.preventDefault();
    const cards = grid.querySelectorAll("ui-card[data-slug]");
    const slugs: string[] = [];
    cards.forEach((c) => slugs.push(c.getAttribute("data-slug")!));

    const reordered: Project[] = [];
    for (const slug of slugs) {
      const p = state.allProjects.find((proj) => proj.slug === slug);
      if (p) {
        p.sortOrder = reordered.length;
        reordered.push(p);
      }
    }
    for (const p of state.allProjects) {
      if (!reordered.includes(p)) reordered.push(p);
    }
    setState({ allProjects: reordered });

    try {
      await api.api.projects.reorder.$put({ json: { slugs } });
    } catch {
      /* ignore */
    }
  });

  container.appendChild(grid);
}

export function openPortfolioLayout(): void {
  const root = _projectPreviewRoot;
  if (!overlay) {
    overlay = createOverlay();
    root?.querySelector(".admin-main")?.appendChild(overlay);
  }
  overlay.style.display = "flex";
  renderProjectCards();
}
