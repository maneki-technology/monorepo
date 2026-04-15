import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { api } from "../../lib/api.js";
import { state, setState, hasUnpublishedChanges } from "./state.js";
import type { Post, Project } from "./types.js";
import { EditorStoreController } from "./editor-store.js";

// Sidebar spinner styles — injected into the editor shadow root via setSidebarRoot()
let _sidebarRoot: ParentNode | null = null;

export function setSidebarRoot(root: ParentNode): void {
  _sidebarRoot = root;
}

function ensureSidebarStyles(): void {
  const root = _sidebarRoot;
  if (!root) return;
  if (root.querySelector("#editor-sidebar-styles")) return;
  const style = document.createElement("style");
  style.id = "editor-sidebar-styles";
  style.textContent = `@keyframes editor-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .deploy-spinner { animation: editor-spin 700ms linear infinite; }`;
  // For ShadowRoot, prepend; for Document, use head
  if (root instanceof ShadowRoot) {
    root.prepend(style);
  } else {
    (root as Document).head.appendChild(style);
  }
}

@customElement("editor-sidebar")
export class EditorSidebar extends LitElement {
  private store = new EditorStoreController(this);

  createRenderRoot(): this {
    this.style.display = "contents";
    return this;
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  protected render(): unknown {
    ensureSidebarStyles();
    const s = this.store.state;
    return html`
      <ui-side-panel-menu-section separator>
        <span style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          Posts
          <ui-button
            id="admin-new-post"
            action="primary"
            emphasis="minimal"
            size="s"
            icon="icon-only"
            aria-label="New Post"
            ><ui-icon name="add" size="s" slot="icon-start"></ui-icon
          ></ui-button>
        </span>
      </ui-side-panel-menu-section>
        ${repeat(
          s.allPosts,
          (p) => p.slug,
          (post) => this.renderPostItem(post),
        )}
      <ui-side-panel-menu-section separator>
        <span style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          Projects
          <ui-button
            id="admin-new-project"
            action="primary"
            emphasis="minimal"
            size="s"
            icon="icon-only"
            aria-label="New Project"
            ><ui-icon name="add" size="s" slot="icon-start"></ui-icon
          ></ui-button>
        </span>
      </ui-side-panel-menu-section>
        ${repeat(
          s.allProjects,
          (p) => p.slug,
          (project) => this.renderProjectItem(project),
        )}
      ${this.renderBulkBar()}
    `;
  }

  // ─── Post item ───────────────────────────────────────────────────────────────

  private renderPostItem(post: Post): unknown {
    const s = this.store.state;
    const isSelected = post.slug === s.currentSlug && s.activeTabType === "post";
    const isChecked = s.selectedSlugs.has(post.slug);
    const deploying = s.deployingSlugs.has(post.slug);
    const title = (post.title || "Untitled") + (hasUnpublishedChanges(post) ? " *" : "");

    let badgeStatus = "warning";
    let badgeLabel: string = post.status;
    if (post.status === "published") badgeStatus = "success";
    if (deploying && s.deployingAction) {
      badgeStatus = "information";
      badgeLabel = s.deployingAction;
    }

    const checkboxStyle =
      (s.selectedSlugs.size > 0 ? "flex-shrink:0;" : "flex-shrink:0;opacity:0;transition:opacity 0.15s;") +
      "align-self:flex-start;margin-top:2px;";

    return html`
      <ui-side-panel-menu-item
        value=${post.slug}
        ?selected=${isSelected}
        leading-icon
        @mouseenter=${this.handleItemMouseEnter}
        @mouseleave=${this.handleItemMouseLeave}
      >
        <ui-checkbox-item
          slot="icon"
          size="s"
          ?checked=${isChecked}
          style=${checkboxStyle}
          @change=${(e: Event) => this.handleCheckboxChange(e, post.slug)}
        ></ui-checkbox-item>
        <span style="display:flex;flex-direction:column;gap:2px;overflow:hidden;">
          <span class="sidebar-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
            >${title}</span
          >
          <span
            class="sidebar-meta"
            style="font-size:11px;color:var(--fd-text-secondary, #52525b);display:flex;align-items:center;gap:6px;"
          >
            ${post.date}
            <ui-badge size="xs" status=${badgeStatus}>${badgeLabel}</ui-badge>
            ${deploying
              ? html`<ui-icon name="progress_activity" size="xs" class="deploy-spinner"></ui-icon>`
              : nothing}
          </span>
        </span>
        <ui-button
          slot="actions"
          action="destructive"
          emphasis="minimal"
          size="s"
          icon="icon-only"
          ?disabled=${deploying}
          style="flex-shrink:0;opacity:0;transition:opacity 0.15s;"
          @click=${(e: Event) => this.handleDelete(e, post.slug)}
        >
          <ui-icon name="delete" size="s" slot="icon-start"></ui-icon>
        </ui-button>
      </ui-side-panel-menu-item>
    `;
  }

  // ─── Project item ────────────────────────────────────────────────────────────

  private renderProjectItem(project: Project): unknown {
    const s = this.store.state;
    const isSelected = project.slug === s.currentSlug && s.activeTabType === "project";
    const isChecked = s.selectedSlugs.has(project.slug);
    const deploying = s.deployingSlugs.has(project.slug);
    const prefix = project.pinned ? "📌 " : "";
    const title = prefix + (project.title || "Untitled") + (hasUnpublishedChanges(project) ? " *" : "");

    let badgeStatus = "warning";
    let badgeLabel: string = project.status;
    if (project.status === "published") badgeStatus = "success";
    if (deploying && s.deployingAction) {
      badgeStatus = "information";
      badgeLabel = s.deployingAction;
    }

    const checkboxStyle =
      (s.selectedSlugs.size > 0 ? "flex-shrink:0;" : "flex-shrink:0;opacity:0;transition:opacity 0.15s;") +
      "align-self:flex-start;";

    return html`
      <ui-side-panel-menu-item
        value=${"project:" + project.slug}
        ?selected=${isSelected}
        leading-icon
        @mouseenter=${this.handleItemMouseEnter}
        @mouseleave=${this.handleItemMouseLeave}
      >
        <ui-checkbox-item
          slot="icon"
          size="s"
          ?checked=${isChecked}
          style=${checkboxStyle}
          @change=${(e: Event) => this.handleCheckboxChange(e, project.slug)}
        ></ui-checkbox-item>
        <span style="display:flex;flex-direction:column;gap:2px;overflow:hidden;">
          <span class="sidebar-title" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"
            >${title}</span
          >
          <span
            class="sidebar-meta"
            style="font-size:11px;color:var(--fd-text-secondary, #52525b);display:flex;align-items:center;gap:6px;"
          >
            <ui-badge size="xs" status=${badgeStatus}>${badgeLabel}</ui-badge>
          </span>
        </span>
        <ui-button
          slot="actions"
          action="destructive"
          emphasis="minimal"
          size="s"
          icon="icon-only"
          ?disabled=${deploying}
          style="flex-shrink:0;opacity:0;transition:opacity 0.15s;"
          @click=${(e: Event) => this.handleDelete(e, "project:" + project.slug)}
        >
          <ui-icon name="delete" size="s" slot="icon-start"></ui-icon>
        </ui-button>
      </ui-side-panel-menu-item>
    `;
  }

  // ─── Bulk actions bar ────────────────────────────────────────────────────────

  private renderBulkBar(): unknown {
    const s = this.store.state;
    if (s.selectedSlugs.size === 0) return nothing;

    // Determine if selected items are posts or projects
    const isProject = s.allProjects.some((p) => s.selectedSlugs.has(p.slug));
    const allItems = isProject ? s.allProjects : s.allPosts;
    const selectAllLabel = s.selectedSlugs.size === allItems.length ? "Deselect All" : "Select All";

    return html`
      <div id="admin-bulk-actions" class="admin-bulk-actions">
        <span class="admin-bulk-count">${s.selectedSlugs.size} selected</span>
        <ui-toolbar aria-label="Bulk actions">
          <ui-button-group action="secondary" emphasis="subtle" size="s">
            <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => this.handleSelectAll(allItems)}
              >${selectAllLabel}</ui-button
            >
          </ui-button-group>
          <ui-toolbar-separator></ui-toolbar-separator>
          <ui-button-group action="secondary" emphasis="subtle" size="s">
            <ui-button
              action="secondary"
              emphasis="subtle"
              size="s"
              icon="icon-only"
              aria-label="Delete selected"
              @click=${() => this.handleBulkDelete(isProject)}
            >
              <ui-icon
                name="delete"
                size="s"
                slot="icon-start"
                style="--ui-icon-color: var(--fd-text-destructive)"
              ></ui-icon>
            </ui-button>
            <ui-button
              action="secondary"
              emphasis="subtle"
              size="s"
              icon="icon-only"
              aria-label="Publish selected"
              @click=${() => this.handleBulkPublish(isProject)}
            >
              <ui-icon
                name="upload"
                size="s"
                slot="icon-start"
                style="--ui-icon-color: var(--fd-icon-action)"
              ></ui-icon>
            </ui-button>
            <ui-button
              action="secondary"
              emphasis="subtle"
              size="s"
              icon="icon-only"
              aria-label="Unpublish selected"
              @click=${() => this.handleBulkUnpublish(isProject)}
            >
              <ui-icon name="download" size="s" slot="icon-start"></ui-icon>
            </ui-button>
          </ui-button-group>
        </ui-toolbar>
      </div>
    `;
  }


  // ─── Event handlers ──────────────────────────────────────────────────────────

  private handleItemMouseEnter(e: Event): void {
    const item = e.currentTarget as HTMLElement;
    const deleteBtn = item.querySelector("[slot='actions']") as HTMLElement | null;
    const checkbox = item.querySelector("ui-checkbox-item") as HTMLElement | null;
    if (deleteBtn) deleteBtn.style.opacity = "1";
    if (checkbox) checkbox.style.opacity = "1";
  }

  private handleItemMouseLeave(e: Event): void {
    const item = e.currentTarget as HTMLElement;
    const deleteBtn = item.querySelector("[slot='actions']") as HTMLElement | null;
    const checkbox = item.querySelector("ui-checkbox-item") as HTMLElement | null;
    if (deleteBtn) deleteBtn.style.opacity = "0";
    if (checkbox && state.selectedSlugs.size === 0 && !checkbox.hasAttribute("checked")) {
      checkbox.style.opacity = "0";
    }
  }

  private handleCheckboxChange(e: Event, slug: string): void {
    e.stopPropagation();
    const newSelected = new Set(state.selectedSlugs);
    if (newSelected.has(slug)) newSelected.delete(slug);
    else newSelected.add(slug);
    setState({ selectedSlugs: newSelected });
  }

  private handleDelete(e: Event, slug: string): void {
    e.stopPropagation();
    setState({ pendingDeleteSlug: slug });
    const root = _sidebarRoot;
    if (!root) return;
    const modal = root.querySelector("#admin-delete-modal") as (HTMLElement & { show(): void }) | null;
    if (modal) modal.show();
  }

  private handleSelectAll(allItems: (Post | Project)[]): void {
    if (state.selectedSlugs.size === allItems.length) {
      setState({ selectedSlugs: new Set() });
    } else {
      setState({ selectedSlugs: new Set(allItems.map((p) => p.slug)) });
    }
  }

  // ─── Bulk operations ─────────────────────────────────────────────────────────

  private async handleBulkDelete(isProject: boolean): Promise<void> {
    const slugs = [...state.selectedSlugs];
    const btn = this.querySelector("#admin-bulk-actions ui-button[aria-label='Delete selected']") as HTMLElement | null;
    if (btn) btn.setAttribute("status", "loading");
    try {
      if (isProject) {
        await api.api.projects.batch.delete.$post({ json: { slugs } });
        setState({
          allProjects: state.allProjects.filter((p) => !state.selectedSlugs.has(p.slug)),
          openProjectTabs: state.openProjectTabs.filter((t) => !state.selectedSlugs.has(t.slug)),
          selectedSlugs: new Set(),
          currentSlug: state.selectedSlugs.has(state.currentSlug ?? "")
            ? (state.openProjectTabs.filter((t) => !state.selectedSlugs.has(t.slug)).pop()?.slug ?? null)
            : state.currentSlug,
        });
      } else {
        await api.api.posts.batch.delete.$post({ json: { slugs } });
        setState({
          allPosts: state.allPosts.filter((p) => !state.selectedSlugs.has(p.slug)),
          openTabs: state.openTabs.filter((t) => !state.selectedSlugs.has(t.slug)),
          selectedSlugs: new Set(),
          currentSlug: state.selectedSlugs.has(state.currentSlug ?? "")
            ? (state.openTabs.filter((t) => !state.selectedSlugs.has(t.slug)).pop()?.slug ?? null)
            : state.currentSlug,
        });
      }
    } catch {
      if (btn) {
        btn.setAttribute("status", "error");
        setTimeout(() => btn.setAttribute("status", "none"), 2000);
      }
    }
  }

  private async handleBulkPublish(isProject: boolean): Promise<void> {
    const slugs = [...state.selectedSlugs];
    const btn = this.querySelector(
      "#admin-bulk-actions ui-button[aria-label='Publish selected']",
    ) as HTMLElement | null;
    if (btn) btn.setAttribute("status", "loading");
    try {
      if (isProject) {
        await api.api.projects.batch.publish.$post({ json: { slugs } });
        for (const p of state.allProjects) {
          if (state.selectedSlugs.has(p.slug)) {
            p.status = "published";
            p.publishedAt = new Date().toISOString();
          }
        }
      } else {
        await api.api.posts.batch.publish.$post({ json: { slugs } });
        for (const p of state.allPosts) {
          if (state.selectedSlugs.has(p.slug)) {
            p.status = "published";
            p.publishedAt = new Date().toISOString();
          }
        }
      }
      setState({ selectedSlugs: new Set(), deployingSlugs: new Set(slugs), deployingAction: "publishing" });
      this.pollDeployStatus();
    } catch {
      if (btn) {
        btn.setAttribute("status", "error");
        setTimeout(() => btn.setAttribute("status", "none"), 2000);
      }
    }
  }

  private async handleBulkUnpublish(isProject: boolean): Promise<void> {
    const slugs = [...state.selectedSlugs];
    const btn = this.querySelector(
      "#admin-bulk-actions ui-button[aria-label='Unpublish selected']",
    ) as HTMLElement | null;
    if (btn) btn.setAttribute("status", "loading");
    try {
      if (isProject) {
        await api.api.projects.batch.unpublish.$post({ json: { slugs } });
        for (const p of state.allProjects) {
          if (state.selectedSlugs.has(p.slug)) p.status = "draft";
        }
      } else {
        await api.api.posts.batch.unpublish.$post({ json: { slugs } });
        for (const p of state.allPosts) {
          if (state.selectedSlugs.has(p.slug)) p.status = "draft";
        }
      }
      setState({ selectedSlugs: new Set(), deployingSlugs: new Set(slugs), deployingAction: "unpublishing" });
      this.pollDeployStatus();
    } catch {
      if (btn) {
        btn.setAttribute("status", "error");
        setTimeout(() => btn.setAttribute("status", "none"), 2000);
      }
    }
  }

  private pollDeployStatus(): void {
    const pollInterval = setInterval(async () => {
      try {
        const res = await api.api.deploy.status.$get();
        if (!res.ok) return;
        const { status: s } = await res.json();
        if (s === "success" || s === "failure") {
          clearInterval(pollInterval);
          setState({ deployingSlugs: new Set(), deployingAction: null });
        }
      } catch {
        clearInterval(pollInterval);
        setState({ deployingSlugs: new Set(), deployingAction: null });
      }
    }, 5000);
  }
}

// ─── Backward compatibility wrapper ──────────────────────────────────────────

export class SidebarRenderer {
  init(sidebar: Element): void {
    // Remove static section headers — the Lit component renders them
    const header = sidebar.querySelector("[slot='header']");
    sidebar.querySelectorAll("ui-side-panel-menu-section").forEach((s) => s.remove());

    // Insert the Lit component (renders sections + items + bulk bar)
    const el = document.createElement("editor-sidebar");
    if (header && header.nextSibling) {
      sidebar.insertBefore(el, header.nextSibling);
    } else {
      sidebar.appendChild(el);
    }
  }
}
