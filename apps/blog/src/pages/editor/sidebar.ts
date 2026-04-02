import { api } from "../../lib/api.js";
import { state, setState, onSidebarRender, hasUnpublishedChanges } from "./state.js";
import type { Post, Project } from "./types.js";

export class SidebarRenderer {
  private postItems = new Map<string, HTMLElement>();
  private projectItems = new Map<string, HTMLElement>();
  private postList: HTMLElement | null = null;
  private projectList: HTMLElement | null = null;

  init(postListEl: HTMLElement, projectListEl: HTMLElement): void {
    this.postList = postListEl;
    this.projectList = projectListEl;
    onSidebarRender(() => this.sync());
  }

  sync(): void {
    this.syncPosts();
    this.syncProjects();
    this.syncBulkBar();
    this.syncToolbarButtons();
  }

  private syncPosts(): void {
    if (!this.postList) return;
    const currentSlugs = new Set(state.allPosts.map((p) => p.slug));

    // Remove items no longer in allPosts
    for (const [slug, el] of this.postItems) {
      if (!currentSlugs.has(slug)) {
        el.remove();
        this.postItems.delete(slug);
      }
    }

    // Add new items or patch existing
    for (let i = 0; i < state.allPosts.length; i++) {
      const post = state.allPosts[i];
      const existing = this.postItems.get(post.slug);
      if (existing) {
        this.patchPostItem(existing, post);
      } else {
        const el = this.createPostItem(post);
        this.postItems.set(post.slug, el);
        const nextSibling = i + 1 < state.allPosts.length
          ? this.postItems.get(state.allPosts[i + 1].slug) ?? null
          : null;
        if (nextSibling) {
          this.postList.insertBefore(el, nextSibling);
        } else {
          this.postList.appendChild(el);
        }
      }
    }
  }

  private syncProjects(): void {
    if (!this.projectList) return;
    const currentSlugs = new Set(state.allProjects.map((p) => p.slug));

    for (const [slug, el] of this.projectItems) {
      if (!currentSlugs.has(slug)) {
        el.remove();
        this.projectItems.delete(slug);
      }
    }

    for (let i = 0; i < state.allProjects.length; i++) {
      const project = state.allProjects[i];
      const existing = this.projectItems.get(project.slug);
      if (existing) {
        this.patchProjectItem(existing, project);
      } else {
        const el = this.createProjectItem(project);
        this.projectItems.set(project.slug, el);
        const nextSibling = i + 1 < state.allProjects.length
          ? this.projectItems.get(state.allProjects[i + 1].slug) ?? null
          : null;
        if (nextSibling) {
          this.projectList.insertBefore(el, nextSibling);
        } else {
          this.projectList.appendChild(el);
        }
      }
    }
  }

  private syncToolbarButtons(): void {
    const isDeploying = state.deployingSlugs.size > 0;
    const saveBtn = document.getElementById("admin-save-btn");
    const publishSplit = document.getElementById("admin-publish-split");
    if (saveBtn) { if (isDeploying) saveBtn.setAttribute("disabled", ""); else saveBtn.removeAttribute("disabled"); }
    if (publishSplit) { if (isDeploying) publishSplit.setAttribute("disabled", ""); else publishSplit.removeAttribute("disabled"); }
  }

  // ─── Post item helpers ──────────────────────────────────────────────────────

  private patchPostItem(wrapper: HTMLElement, post: Post): void {
    const item = wrapper.querySelector("ui-side-panel-menu-item") as HTMLElement;
    if (!item) return;

    if (post.slug === state.currentSlug && state.activeTabType === "post") item.setAttribute("selected", "");
    else item.removeAttribute("selected");

    const titleEl = wrapper.querySelector(".sidebar-title") as HTMLElement;
    const newTitle = (post.title || "Untitled") + (hasUnpublishedChanges(post) ? " *" : "");
    if (titleEl && titleEl.textContent !== newTitle) titleEl.textContent = newTitle;

    const badge = wrapper.querySelector("ui-badge") as HTMLElement;
    if (badge) {
      let badgeStatus = "warning";
      let badgeLabel: string = post.status;
      if (post.status === "published") badgeStatus = "success";
      if (state.deployingSlugs.has(post.slug) && state.deployingAction) {
        badgeStatus = "information";
        badgeLabel = state.deployingAction;
      }
      if (badge.getAttribute("status") !== badgeStatus) badge.setAttribute("status", badgeStatus);
      if (badge.textContent !== badgeLabel) badge.textContent = badgeLabel;
    }

    const metaSpan = wrapper.querySelector(".sidebar-meta") as HTMLElement;
    const existingSpinner = wrapper.querySelector(".deploy-spinner");
    const shouldSpin = state.deployingSlugs.has(post.slug);
    if (shouldSpin && !existingSpinner && metaSpan) {
      const spinner = document.createElement("ui-icon");
      spinner.setAttribute("name", "progress_activity");
      spinner.setAttribute("size", "xs");
      spinner.className = "deploy-spinner";
      spinner.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
        duration: 700,
        iterations: Infinity,
      });
      metaSpan.appendChild(document.createTextNode(" "));
      metaSpan.appendChild(spinner);
    } else if (!shouldSpin && existingSpinner) {
      if (existingSpinner.previousSibling?.nodeType === Node.TEXT_NODE) {
        existingSpinner.previousSibling.remove();
      }
      existingSpinner.remove();
    }

    const checkbox = wrapper.querySelector("ui-checkbox-item") as HTMLElement;
    if (checkbox) {
      const isChecked = state.selectedSlugs.has(post.slug);
      if (isChecked && !checkbox.hasAttribute("checked")) checkbox.setAttribute("checked", "");
      else if (!isChecked && checkbox.hasAttribute("checked")) checkbox.removeAttribute("checked");

      if (state.selectedSlugs.size > 0) {
        checkbox.style.cssText = "flex-shrink:0;align-self:flex-start;margin-top:2px;";
      } else {
        checkbox.style.cssText = "flex-shrink:0;opacity:0;transition:opacity 0.15s;align-self:flex-start;margin-top:2px;";
      }
    }

    const deleteBtn = wrapper.querySelector("[slot='actions']") as HTMLElement;
    if (deleteBtn) {
      if (state.deployingSlugs.has(post.slug)) deleteBtn.setAttribute("disabled", "");
      else deleteBtn.removeAttribute("disabled");
    }
  }

  private createPostItem(post: Post): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-slug", post.slug);
    wrapper.setAttribute("data-type", "post");

    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("value", post.slug);
    if (post.slug === state.currentSlug && state.activeTabType === "post") {
      item.setAttribute("selected", "");
    }

    const label = document.createElement("span");
    label.style.cssText = "display:flex;flex-direction:column;gap:2px;overflow:hidden;";

    const titleSpan = document.createElement("span");
    titleSpan.className = "sidebar-title";
    titleSpan.style.cssText = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    titleSpan.textContent = (post.title || "Untitled") + (hasUnpublishedChanges(post) ? " *" : "");

    const metaSpan = document.createElement("span");
    metaSpan.className = "sidebar-meta";
    metaSpan.style.cssText = "font-size:11px;color:var(--fd-text-secondary, #52525b);display:flex;align-items:center;gap:6px;";

    let badgeStatus = "warning";
    let badgeLabel: string = post.status;
    if (post.status === "published") badgeStatus = "success";
    if (state.deployingSlugs.has(post.slug) && state.deployingAction) {
      badgeStatus = "information";
      badgeLabel = state.deployingAction;
    }

    metaSpan.innerHTML = `${post.date} <ui-badge size="xs" status="${badgeStatus}">${badgeLabel}</ui-badge>`;

    if (state.deployingSlugs.has(post.slug)) {
      const spinner = document.createElement("ui-icon");
      spinner.setAttribute("name", "progress_activity");
      spinner.setAttribute("size", "xs");
      spinner.className = "deploy-spinner";
      spinner.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
        duration: 700,
        iterations: Infinity,
      });
      metaSpan.appendChild(document.createTextNode(" "));
      metaSpan.appendChild(spinner);
    }

    // Checkbox for multi-select
    const checkbox = document.createElement("ui-checkbox-item");
    checkbox.setAttribute("size", "s");
    if (state.selectedSlugs.has(post.slug)) {
      checkbox.setAttribute("checked", "");
    }
    checkbox.style.cssText = (state.selectedSlugs.size > 0
      ? "flex-shrink:0;"
      : "flex-shrink:0;opacity:0;transition:opacity 0.15s;") + "align-self:flex-start;margin-top:2px;";
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation();
      const newSelected = new Set(state.selectedSlugs);
      if (newSelected.has(post.slug)) {
        newSelected.delete(post.slug);
      } else {
        newSelected.add(post.slug);
      }
      setState({ selectedSlugs: newSelected });
    });

    label.appendChild(titleSpan);
    label.appendChild(metaSpan);
    item.appendChild(label);
    checkbox.setAttribute("slot", "icon");
    item.setAttribute("leading-icon", "");
    item.appendChild(checkbox);

    const deleteBtn = document.createElement("ui-button");
    if (state.deployingSlugs.has(post.slug)) deleteBtn.setAttribute("disabled", "");
    deleteBtn.setAttribute("action", "destructive");
    deleteBtn.setAttribute("emphasis", "minimal");
    deleteBtn.setAttribute("size", "s");
    deleteBtn.setAttribute("icon", "icon-only");
    deleteBtn.setAttribute("slot", "actions");
    deleteBtn.style.cssText = "flex-shrink:0;opacity:0;transition:opacity 0.15s;";
    const trashIcon = document.createElement("ui-icon");
    trashIcon.setAttribute("name", "delete");
    trashIcon.setAttribute("size", "s");
    trashIcon.setAttribute("slot", "icon-start");
    deleteBtn.appendChild(trashIcon);
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      setState({ pendingDeleteSlug: post.slug });
      const modal = document.getElementById("admin-delete-modal") as any;
      if (modal) modal.show();
    };
    item.appendChild(deleteBtn);
    item.onmouseenter = () => { deleteBtn.style.opacity = "1"; if (state.selectedSlugs.size === 0) checkbox.style.opacity = "1"; };
    item.onmouseleave = () => { deleteBtn.style.opacity = "0"; if (state.selectedSlugs.size === 0) checkbox.style.opacity = "0"; };

    wrapper.appendChild(item);
    return wrapper;
  }

  // ─── Project item helpers ───────────────────────────────────────────────────

  private patchProjectItem(wrapper: HTMLElement, project: Project): void {
    const item = wrapper.querySelector("ui-side-panel-menu-item") as HTMLElement;
    if (!item) return;

    if (project.slug === state.currentSlug && state.activeTabType === "project") item.setAttribute("selected", "");
    else item.removeAttribute("selected");

    const titleEl = wrapper.querySelector(".sidebar-title") as HTMLElement;
    const prefix = project.pinned ? "📌 " : "";
    const newTitle = prefix + (project.title || "Untitled") + (hasUnpublishedChanges(project) ? " *" : "");
    if (titleEl && titleEl.textContent !== newTitle) titleEl.textContent = newTitle;

    const badge = wrapper.querySelector("ui-badge") as HTMLElement;
    if (badge) {
      let badgeStatus = "warning";
      let badgeLabel: string = project.status;
      if (project.status === "published") badgeStatus = "success";
      if (state.deployingSlugs.has(project.slug) && state.deployingAction) {
        badgeStatus = "information";
        badgeLabel = state.deployingAction;
      }
      if (badge.getAttribute("status") !== badgeStatus) badge.setAttribute("status", badgeStatus);
      if (badge.textContent !== badgeLabel) badge.textContent = badgeLabel;
    }

    const deleteBtn = wrapper.querySelector("[slot='actions']") as HTMLElement;
    if (deleteBtn) {
      if (state.deployingSlugs.has(project.slug)) deleteBtn.setAttribute("disabled", "");
      else deleteBtn.removeAttribute("disabled");
    }

    const checkbox = wrapper.querySelector("ui-checkbox-item") as HTMLElement;
    if (checkbox) {
      const isChecked = state.selectedSlugs.has(project.slug);
      if (isChecked && !checkbox.hasAttribute("checked")) checkbox.setAttribute("checked", "");
      else if (!isChecked && checkbox.hasAttribute("checked")) checkbox.removeAttribute("checked");

      if (state.selectedSlugs.size > 0) {
        checkbox.style.cssText = "flex-shrink:0;align-self:flex-start;";
      } else {
        checkbox.style.cssText = "flex-shrink:0;opacity:0;transition:opacity 0.15s;align-self:flex-start;";
      }
    }
  }

  private createProjectItem(project: Project): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-slug", project.slug);
    wrapper.setAttribute("data-type", "project");

    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("value", `project:${project.slug}`);
    if (project.slug === state.currentSlug && state.activeTabType === "project") {
      item.setAttribute("selected", "");
    }

    const label = document.createElement("span");
    label.style.cssText = "display:flex;flex-direction:column;gap:2px;overflow:hidden;";

    const titleSpan = document.createElement("span");
    titleSpan.className = "sidebar-title";
    titleSpan.style.cssText = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    const prefix = project.pinned ? "📌 " : "";
    titleSpan.textContent = prefix + (project.title || "Untitled") + (hasUnpublishedChanges(project) ? " *" : "");

    const metaSpan = document.createElement("span");
    metaSpan.className = "sidebar-meta";
    metaSpan.style.cssText = "font-size:11px;color:var(--fd-text-secondary, #52525b);display:flex;align-items:center;gap:6px;";

    let badgeStatus = "warning";
    let badgeLabel: string = project.status;
    if (project.status === "published") badgeStatus = "success";
    if (state.deployingSlugs.has(project.slug) && state.deployingAction) {
      badgeStatus = "information";
      badgeLabel = state.deployingAction;
    }

    metaSpan.innerHTML = `<ui-badge size="xs" status="${badgeStatus}">${badgeLabel}</ui-badge>`;

    // Checkbox for multi-select
    const checkbox = document.createElement("ui-checkbox-item");
    checkbox.setAttribute("size", "s");
    if (state.selectedSlugs.has(project.slug)) {
      checkbox.setAttribute("checked", "");
    }
    checkbox.style.cssText = (state.selectedSlugs.size > 0
      ? "flex-shrink:0;"
      : "flex-shrink:0;opacity:0;transition:opacity 0.15s;") + "align-self:flex-start;";
    checkbox.addEventListener("change", (e) => {
      e.stopPropagation();
      const newSelected = new Set(state.selectedSlugs);
      if (newSelected.has(project.slug)) {
        newSelected.delete(project.slug);
      } else {
        newSelected.add(project.slug);
      }
      setState({ selectedSlugs: newSelected });
    });
    checkbox.setAttribute("slot", "icon");
    item.setAttribute("leading-icon", "");
    item.appendChild(checkbox);

    label.appendChild(titleSpan);
    label.appendChild(metaSpan);
    item.appendChild(label);

    const deleteBtn = document.createElement("ui-button");
    if (state.deployingSlugs.has(project.slug)) deleteBtn.setAttribute("disabled", "");
    deleteBtn.setAttribute("action", "destructive");
    deleteBtn.setAttribute("emphasis", "minimal");
    deleteBtn.setAttribute("size", "s");
    deleteBtn.setAttribute("icon", "icon-only");
    deleteBtn.setAttribute("slot", "actions");
    deleteBtn.style.cssText = "flex-shrink:0;opacity:0;transition:opacity 0.15s;";
    const trashIcon = document.createElement("ui-icon");
    trashIcon.setAttribute("name", "delete");
    trashIcon.setAttribute("size", "s");
    trashIcon.setAttribute("slot", "icon-start");
    deleteBtn.appendChild(trashIcon);
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      setState({ pendingDeleteSlug: `project:${project.slug}` });
      const modal = document.getElementById("admin-delete-modal") as any;
      if (modal) modal.show();
    };
    item.appendChild(deleteBtn);
    item.onmouseenter = () => { deleteBtn.style.opacity = "1"; if (state.selectedSlugs.size === 0) checkbox.style.opacity = "1"; };
    item.onmouseleave = () => { deleteBtn.style.opacity = "0"; if (state.selectedSlugs.size === 0) checkbox.style.opacity = "0"; };

    wrapper.appendChild(item);
    return wrapper;
  }

  // ─── Bulk actions (posts and projects) ──────────────────────────────────────────────

  private syncBulkBar(): void {
    const existingBar = document.getElementById("admin-bulk-actions");
    if (existingBar) existingBar.remove();

    if (state.selectedSlugs.size === 0) return;

    // Determine if selected items are posts or projects
    let isProject = false;
    for (const slug of state.selectedSlugs) {
      const wrapper = document.querySelector(`[data-slug="${slug}"]`);
      if (wrapper?.getAttribute("data-type") === "project") {
        isProject = true;
        break;
      }
    }

    const bar = document.createElement("div");
    bar.id = "admin-bulk-actions";
    bar.className = "admin-bulk-actions";

    const count = document.createElement("span");
    count.className = "admin-bulk-count";
    count.textContent = `${state.selectedSlugs.size} selected`;

    const selectAllBtn = document.createElement("ui-button");
    selectAllBtn.setAttribute("action", "secondary");
    selectAllBtn.setAttribute("emphasis", "minimal");
    selectAllBtn.setAttribute("size", "s");
    const allItems = isProject ? state.allProjects : state.allPosts;
    selectAllBtn.textContent = state.selectedSlugs.size === allItems.length ? "Deselect All" : "Select All";
    selectAllBtn.onclick = () => {
      if (state.selectedSlugs.size === allItems.length) {
        setState({ selectedSlugs: new Set() });
      } else {
        setState({ selectedSlugs: new Set(allItems.map((p) => p.slug)) });
      }
    };

    const deleteBtn = document.createElement("ui-button");
    deleteBtn.setAttribute("action", "destructive");
    deleteBtn.setAttribute("emphasis", "minimal");
    deleteBtn.setAttribute("size", "s");
    deleteBtn.setAttribute("icon", "icon-only");
    deleteBtn.setAttribute("aria-label", "Delete selected");
    const delIcon = document.createElement("ui-icon");
    delIcon.setAttribute("name", "delete");
    delIcon.setAttribute("size", "s");
    delIcon.setAttribute("slot", "icon-start");
    deleteBtn.appendChild(delIcon);
    deleteBtn.onclick = async () => {
      const slugs = [...state.selectedSlugs];
      deleteBtn.setAttribute("status", "loading");
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
        deleteBtn.setAttribute("status", "error");
        setTimeout(() => deleteBtn.setAttribute("status", "none"), 2000);
      }
    };

    const publishBtn = document.createElement("ui-button");
    publishBtn.setAttribute("action", "primary");
    publishBtn.setAttribute("emphasis", "minimal");
    publishBtn.setAttribute("size", "s");
    publishBtn.setAttribute("icon", "icon-only");
    publishBtn.setAttribute("aria-label", "Publish selected");
    const pubIcon = document.createElement("ui-icon");
    pubIcon.setAttribute("name", "upload");
    pubIcon.setAttribute("size", "s");
    pubIcon.setAttribute("slot", "icon-start");
    publishBtn.appendChild(pubIcon);
    publishBtn.onclick = async () => {
      const slugs = [...state.selectedSlugs];
      publishBtn.setAttribute("status", "loading");
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
      } catch {
        publishBtn.setAttribute("status", "error");
        setTimeout(() => publishBtn.setAttribute("status", "none"), 2000);
      }
    };

    const unpublishBtn = document.createElement("ui-button");
    unpublishBtn.setAttribute("action", "secondary");
    unpublishBtn.setAttribute("emphasis", "minimal");
    unpublishBtn.setAttribute("size", "s");
    unpublishBtn.setAttribute("icon", "icon-only");
    unpublishBtn.setAttribute("aria-label", "Unpublish selected");
    const unpubIcon = document.createElement("ui-icon");
    unpubIcon.setAttribute("name", "download");
    unpubIcon.setAttribute("size", "s");
    unpubIcon.setAttribute("slot", "icon-start");
    unpublishBtn.appendChild(unpubIcon);
    unpublishBtn.onclick = async () => {
      const slugs = [...state.selectedSlugs];
      unpublishBtn.setAttribute("status", "loading");
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
      } catch {
        unpublishBtn.setAttribute("status", "error");
        setTimeout(() => unpublishBtn.setAttribute("status", "none"), 2000);
      }
    };

    bar.appendChild(count);
    bar.appendChild(selectAllBtn);
    bar.appendChild(deleteBtn);
    bar.appendChild(publishBtn);
    bar.appendChild(unpublishBtn);

    const sidebar = document.getElementById("admin-sidebar");
    if (sidebar) sidebar.appendChild(bar);
}

}
