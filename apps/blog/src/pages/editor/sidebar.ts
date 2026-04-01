import { api } from "../../lib/api.js";
import { state, setState, onSidebarRender, hasUnpublishedChanges } from "./state.js";
import type { Draft } from "./types.js";

export class SidebarRenderer {
  private items = new Map<string, HTMLElement>();
  private list: HTMLElement | null = null;

  init(listEl: HTMLElement): void {
    this.list = listEl;
    onSidebarRender(() => this.sync());
  }

  sync(): void {
    if (!this.list) return;
    const currentSlugs = new Set(state.allPosts.map((p) => p.slug));

    // Remove items no longer in allPosts
    for (const [slug, el] of this.items) {
      if (!currentSlugs.has(slug)) {
        el.remove();
        this.items.delete(slug);
      }
    }

    // Add new items or patch existing
    for (let i = 0; i < state.allPosts.length; i++) {
      const post = state.allPosts[i];
      const existing = this.items.get(post.slug);
      if (existing) {
        this.patchItem(existing, post);
      } else {
        const el = this.createItem(post);
        this.items.set(post.slug, el);
        // Insert at correct position
        const nextSibling = i + 1 < state.allPosts.length
          ? this.items.get(state.allPosts[i + 1].slug) ?? null
          : null;
        if (nextSibling) {
          this.list.insertBefore(el, nextSibling);
        } else {
          this.list.appendChild(el);
        }
      }
    }

    // Update bulk action bar
    this.syncBulkBar();

    // Update toolbar button states
    this.syncToolbarButtons();
  }

  private syncToolbarButtons(): void {
    const isDeploying = state.deployingSlugs.size > 0;
    const saveBtn = document.getElementById("admin-save-btn");
    const publishSplit = document.getElementById("admin-publish-split");
    if (saveBtn) { if (isDeploying) saveBtn.setAttribute("disabled", ""); else saveBtn.removeAttribute("disabled"); }
    if (publishSplit) { if (isDeploying) publishSplit.setAttribute("disabled", ""); else publishSplit.removeAttribute("disabled"); }
  }

  private patchItem(wrapper: HTMLElement, post: Draft): void {
    const item = wrapper.querySelector("ui-side-panel-menu-item") as HTMLElement;
    if (!item) return;

    // Selected state
    if (post.slug === state.currentSlug) item.setAttribute("selected", "");
    else item.removeAttribute("selected");

    // Title + dirty indicator
    const titleEl = wrapper.querySelector(".sidebar-title") as HTMLElement;
    const newTitle = (post.title || "Untitled") + (hasUnpublishedChanges(post) ? " *" : "");
    if (titleEl && titleEl.textContent !== newTitle) titleEl.textContent = newTitle;

    // Badge (status)
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

    // Deploying spinner
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
      // Remove spinner and preceding text node
      if (existingSpinner.previousSibling?.nodeType === Node.TEXT_NODE) {
        existingSpinner.previousSibling.remove();
      }
      existingSpinner.remove();
    }

    // Checkbox
    const checkbox = wrapper.querySelector("ui-checkbox-item") as HTMLElement;
    if (checkbox) {
      const isChecked = state.selectedSlugs.has(post.slug);
      if (isChecked && !checkbox.hasAttribute("checked")) checkbox.setAttribute("checked", "");
      else if (!isChecked && checkbox.hasAttribute("checked")) checkbox.removeAttribute("checked");

      // Visibility
      if (state.selectedSlugs.size > 0) {
        checkbox.style.cssText = "flex-shrink:0;align-self:flex-start;margin-top:2px;";
      } else {
        checkbox.style.cssText = "flex-shrink:0;opacity:0;transition:opacity 0.15s;align-self:flex-start;margin-top:2px;";
      }
    }

    // Delete button disabled state
    const deleteBtn = wrapper.querySelector("[slot='actions']") as HTMLElement;
    if (deleteBtn) {
      if (state.deployingSlugs.has(post.slug)) deleteBtn.setAttribute("disabled", "");
      else deleteBtn.removeAttribute("disabled");
    }
  }

  private createItem(post: Draft): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-slug", post.slug);

    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("value", post.slug);
    if (post.slug === state.currentSlug) {
      item.setAttribute("selected", "");
    }

    // Build label with title + meta
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

    // Disable delete during deploy
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
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setState({ pendingDeleteSlug: post.slug });
      const modal = document.getElementById("admin-delete-modal") as any;
      if (modal) modal.show();
    });
    item.appendChild(deleteBtn);
    item.addEventListener("mouseenter", () => { deleteBtn.style.opacity = "1"; if (state.selectedSlugs.size === 0) checkbox.style.opacity = "1"; });
    item.addEventListener("mouseleave", () => { deleteBtn.style.opacity = "0"; if (state.selectedSlugs.size === 0) checkbox.style.opacity = "0"; });

    wrapper.appendChild(item);
    return wrapper;
  }

  private syncBulkBar(): void {
    const existingBar = document.getElementById("admin-bulk-actions");
    if (existingBar) existingBar.remove();

    if (state.selectedSlugs.size === 0) return;

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
    selectAllBtn.textContent = state.selectedSlugs.size === state.allPosts.length ? "Deselect All" : "Select All";
    selectAllBtn.addEventListener("click", () => {
      if (state.selectedSlugs.size === state.allPosts.length) {
        setState({ selectedSlugs: new Set() });
      } else {
        setState({ selectedSlugs: new Set(state.allPosts.map((p) => p.slug)) });
      }
    });

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
    deleteBtn.addEventListener("click", async () => {
      const slugs = [...state.selectedSlugs];
      deleteBtn.setAttribute("status", "loading");
      try {
        await api.api.posts.batch.delete.$post({ json: { slugs } });
        setState({
          allPosts: state.allPosts.filter((p) => !state.selectedSlugs.has(p.slug)),
          openTabs: state.openTabs.filter((t) => !state.selectedSlugs.has(t.slug)),
          selectedSlugs: new Set(),
          currentSlug: state.selectedSlugs.has(state.currentSlug ?? "")
            ? (state.openTabs.filter((t) => !state.selectedSlugs.has(t.slug)).pop()?.slug ?? null)
            : state.currentSlug,
        });
      } catch {
        deleteBtn.setAttribute("status", "error");
        setTimeout(() => deleteBtn.setAttribute("status", "none"), 2000);
      }
    });

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
    publishBtn.addEventListener("click", async () => {
      const slugs = [...state.selectedSlugs];
      publishBtn.setAttribute("status", "loading");
      try {
        await api.api.posts.batch.publish.$post({ json: { slugs } });
        for (const p of state.allPosts) {
          if (state.selectedSlugs.has(p.slug)) {
            p.status = "published";
            p.publishedAt = new Date().toISOString();
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
    });

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
    unpublishBtn.addEventListener("click", async () => {
      const slugs = [...state.selectedSlugs];
      unpublishBtn.setAttribute("status", "loading");
      try {
        await api.api.posts.batch.unpublish.$post({ json: { slugs } });
        for (const p of state.allPosts) {
          if (state.selectedSlugs.has(p.slug)) p.status = "draft";
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
    });

    bar.appendChild(count);
    bar.appendChild(selectAllBtn);
    bar.appendChild(deleteBtn);
    bar.appendChild(publishBtn);
    bar.appendChild(unpublishBtn);

    const sidebar = document.getElementById("admin-sidebar");
    if (sidebar) sidebar.appendChild(bar);
  }
}
