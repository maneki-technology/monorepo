import type { Route } from "../../router.js";
import type { Draft } from "./types.js";
import { api } from "../../lib/api.js";
import { state, setState } from "./state.js";
import { fetchDrafts, loadUIState, saveUIState, saveCurrent, clearEditor, loadDraftIntoEditor, getCurrentDraftData, deletePost, exportAsMarkdown } from "./api.js";
import { renderPreview, triggerPreview, getMd, wrapCodeBlocks } from "./preview.js";
import { SidebarRenderer } from "./sidebar.js";
import { TabBarRenderer } from "./tabbar.js";
import { setupToolbar, insertAtCursor } from "./toolbar.js";
import { setupImageUpload } from "./upload.js";
import { initGallery, toggleGallery } from "./gallery.js";
import { setupContextMenu } from "./context-menu.js";

// These components are used in the editor but not detected by auto-import plugin
import "@maneki/ui-components/components/ui-tag.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-tab-group.js";
import "@maneki/ui-components/components/ui-tab-item.js";
import "@maneki/ui-components/components/ui-scrollbar.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-textarea.js";
import "@maneki/ui-components/components/ui-datetime-picker.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-side-panel-menu.js";
import "@maneki/ui-components/components/ui-side-panel-menu-item.js";
import "@maneki/ui-components/components/ui-side-panel-menu-section.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-dropdown-split.js";
import "@maneki/ui-components/components/ui-dropdown-item.js";
import "@maneki/ui-components/components/ui-checkbox-item.js";

export const editorRoute: Route = {
  id: "editor",
  meta: { title: "Editor", description: "Blog post editor" },
  render: () => `
    <div class="admin-layout">
      <ui-side-panel-menu id="admin-sidebar" style="display:none">
        <span slot="header">Editor</span>
        <ui-side-panel-menu-item id="admin-new-post" leading-icon action-item value="__new_post__">
          <ui-icon name="add" size="m" slot="icon"></ui-icon>
          New Post
        </ui-side-panel-menu-item>
        <ui-side-panel-menu-section separator>Posts</ui-side-panel-menu-section>
        <div id="admin-post-list"></div>
      </ui-side-panel-menu>
      <div class="admin-main">
        <div id="admin-tab-bar" class="admin-tab-bar" style="display:none"></div>

        <div id="admin-loading" class="admin-loading">
          <img src="/favicon.png" alt="Loading" class="admin-loading-icon" />
        </div>

        <div id="admin-editor-main" class="admin-editor" style="display:none">
          <div class="admin-form">
            <div class="admin-form-row">
              <ui-input id="admin-title" placeholder="Post title" size="m"><ui-label slot="label" size="m">Title</ui-label></ui-input>
            </div>
            <div class="admin-form-row-group">
              <div class="admin-form-row">
                <ui-datetime-picker id="admin-date" type="single-date" size="m"><ui-label slot="label" size="m">Date</ui-label></ui-datetime-picker>
              </div>
              <div class="admin-form-row">
                <ui-input id="admin-tag-input" placeholder="Add tag + Enter" size="m">
                  <ui-label slot="label" size="m">Tags</ui-label>
                  <span id="admin-tag-list" slot="leading"></span>
                </ui-input>
                <input id="admin-tags" type="hidden" />
              </div>
            </div>
            <div class="admin-form-row">
              <ui-textarea id="admin-excerpt" placeholder="Short description for listing pages" size="m" rows="2"><ui-label slot="label" size="m">Excerpt</ui-label></ui-textarea>
            </div>
          </div>

          <div class="admin-toolbar">
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="bold">B</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="italic">I</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="h2">H2</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="h3">H3</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="link">🔗</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="code">&lt;/&gt;</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="codeblock">▤</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="image">🖼</ui-button>
            <ui-button id="admin-gallery-btn" action="secondary" emphasis="minimal" size="s" icon="icon-only" aria-label="Image gallery"><ui-icon name="grid_view" size="s" slot="icon-start"></ui-icon></ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="ul">•</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="ol">1.</ui-button>
            <ui-button action="secondary" emphasis="minimal" size="s" data-action="quote">"</ui-button>
            <span class="admin-toolbar-spacer"></span>
            <ui-button id="admin-preview-btn" action="secondary" emphasis="subtle" size="s">Preview</ui-button>
            <ui-button id="admin-save-btn" action="primary" size="s">Save</ui-button>
            <ui-dropdown-split id="admin-publish-split" action="primary" size="s" label="Publish">
              <ui-dropdown-item id="admin-unpublish-btn" value="unpublish">Unpublish</ui-dropdown-item>
              <ui-dropdown-item id="admin-export-btn" value="export">Export .md</ui-dropdown-item>
            </ui-dropdown-split>
          </div>

          <div class="admin-split">
            <ui-scrollbar emphasis="minimal" class="admin-textarea-wrap">
              <textarea id="admin-content" placeholder="Write your post in Markdown..." spellcheck="false"></textarea>
              <div class="admin-textarea-spacer"></div>
            </ui-scrollbar>
            <ui-scrollbar emphasis="minimal"><div id="admin-preview" class="admin-preview"></div></ui-scrollbar>
          </div>

        <!-- Fullscreen preview overlay -->
        <div id="admin-preview-overlay" class="admin-preview-overlay" style="display:none;">
          <div class="admin-preview-overlay-header">
            <span class="heading-05">Preview</span>
            <ui-button id="admin-preview-close" action="secondary" emphasis="subtle" size="s">Close</ui-button>
          </div>
          <ui-scrollbar emphasis="minimal">
            <div class="admin-preview-overlay-content">
              <div id="admin-preview-full" style="max-width:720px;margin:0 auto;padding:48px 24px;"></div>
            </div>
          </ui-scrollbar>
        </div>
      </div>
    </div>
  `,
  setup: () => {
    const sidebarRenderer = new SidebarRenderer();
    const tabBarRenderer = new TabBarRenderer();

    // Load posts from API + UI state in parallel
    Promise.all([fetchDrafts(), loadUIState()]).then(async ([loaded, uiState]) => {
      setState({ allPosts: loaded });

      // Init renderers after DOM is ready and state is populated
      const listEl = document.getElementById("admin-post-list");
      const barEl = document.getElementById("admin-tab-bar");
      if (listEl) sidebarRenderer.init(listEl);
      if (barEl) tabBarRenderer.init(barEl);

      // Restore UI state
      if (uiState) {
        // Restore theme
        if (uiState.theme === "dark") {
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          document.documentElement.removeAttribute("data-theme");
        }

        // Restore sidebar collapsed state
        const sidebar = document.getElementById("admin-sidebar");
        if (uiState.sidebarCollapsed && sidebar) {
          sidebar.setAttribute("state", "collapsed");
        }

        // Restore open tabs
        const savedTabs = Array.isArray(uiState.openTabs) ? uiState.openTabs : [];
        const restoredTabs: Draft[] = [];
        for (const slug of savedTabs) {
          const post = state.allPosts.find((p) => p.slug === slug);
          if (post && !restoredTabs.find((t) => t.slug === slug)) {
            restoredTabs.push(post);
          }
        }

        // Restore active tab
        const activePost = uiState.activeTab ? state.allPosts.find((p) => p.slug === uiState.activeTab) : null;
        if (activePost) {
          if (!restoredTabs.find((t) => t.slug === activePost.slug)) {
            restoredTabs.push(activePost);
          }
          setState({ openTabs: restoredTabs });
          loadDraftIntoEditor(activePost);
        } else if (restoredTabs.length > 0) {
          setState({ openTabs: restoredTabs });
          loadDraftIntoEditor(restoredTabs[0]);
        } else {
          setState({ openTabs: restoredTabs });
        }
      } else if (state.allPosts.length > 0) {
        // No saved state — open first post
        setState({ openTabs: [state.allPosts[0]] });
        loadDraftIntoEditor(state.allPosts[0]);
      }

      document.getElementById("admin-loading")!.style.display = "none";
      document.getElementById("admin-editor-main")!.style.display = "";
      document.getElementById("admin-tab-bar")!.style.display = "";
      document.getElementById("admin-sidebar")!.style.display = "";

      // Resume polling if there's an active deployment
      (async () => {
        try {
          const statusRes = await api.api.deploy.status.$get();
          if (!statusRes.ok) return;
          const { status: deployStatus } = await statusRes.json();
          if (deployStatus === "building" || deployStatus === "deploying") {
            setState({ deployingSlugs: new Set([state.currentSlug!]), deployingAction: "publishing" });
            const pollInterval = setInterval(async () => {
              try {
                const r = await api.api.deploy.status.$get();
                if (!r.ok) return;
                const { status: s } = await r.json();
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
        } catch { /* ignore */ }
      })();
    });

    const textarea = document.getElementById("admin-content") as HTMLTextAreaElement;
    const titleInput = document.getElementById("admin-title") as HTMLElement;
    const dateInput = document.getElementById("admin-date") as HTMLElement;
    const tagsInput = document.getElementById("admin-tags") as HTMLInputElement;
    const tagInput = document.getElementById("admin-tag-input") as HTMLInputElement;
    const tagList = document.getElementById("admin-tag-list")!;
    const excerptInput = document.getElementById("admin-excerpt") as HTMLElement;

    // Tag management
    function syncTags(): void {
      const tags = Array.from(tagList.querySelectorAll("ui-tag")).map((t) => t.textContent?.trim() ?? "");
      tagsInput.value = tags.join(", ");
      triggerPreview();
    }

    function addTag(name: string): void {
      const trimmed = name.trim();
      if (!trimmed) return;
      const existing = Array.from(tagList.querySelectorAll("ui-tag")).map((t) => t.textContent?.trim().toLowerCase());
      if (existing.includes(trimmed.toLowerCase())) return;
      const tag = document.createElement("ui-tag");
      tag.setAttribute("size", "s");
      tag.setAttribute("emphasis", "subtle");
      tag.setAttribute("dismissible", "");
      tag.textContent = trimmed;
      tag.addEventListener("dismiss", () => { tag.remove(); syncTags(); });
      tagList.appendChild(tag);
      syncTags();
    }

    tagInput.addEventListener("keydown", (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === "Enter") {
        ke.preventDefault();
        addTag((tagInput as any).value);
        (tagInput as any).value = "";
        tagInput.focus();
      }
    });

    textarea.addEventListener("input", triggerPreview);
    titleInput.addEventListener("input", triggerPreview);
    dateInput.addEventListener("change", triggerPreview);

    // Auto-save on input (debounced)
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    const autoSave = () => {
      setState({});
      // trigger render for live preview of unsaved changes
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        if (state.currentSlug || textarea.value.trim()) saveCurrent();
      }, 2000);
    };
    textarea.addEventListener("input", autoSave);
    titleInput.addEventListener("input", autoSave);
    dateInput.addEventListener("change", autoSave);
    tagsInput.addEventListener("input", autoSave);
    excerptInput.addEventListener("input", autoSave);

    // Toolbar
    setupToolbar(textarea);
    setupImageUpload(textarea);
    initGallery(textarea);
    setupContextMenu(textarea);

    const saveBtn = document.getElementById("admin-save-btn");
    if (saveBtn) {
      saveBtn.onclick = async () => {
        if (state.saving) {
          await new Promise<void>((resolve) => {
            const check = setInterval(() => { if (!state.saving) { clearInterval(check); resolve(); } }, 100);
          });
        }
        saveCurrent(true, saveBtn);
      };
    }

    // Publish (split button left action) — save, publish (triggers deploy), poll
    const publishSplit = document.getElementById("admin-publish-split");
    publishSplit?.addEventListener("action", async () => {
      if (publishSplit) publishSplit.setAttribute("status", "loading");
      try {
        if (!state.currentSlug) {
          if (publishSplit) publishSplit.setAttribute("status", "error");
          setTimeout(() => { if (publishSplit) publishSplit.setAttribute("status", "none"); }, 2000);
          return;
        }

        // Publish with latest content + trigger deploy
        const data = getCurrentDraftData();
        const tags = data.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
        await api.api.posts[":slug"].publish.$put({
          param: { slug: state.currentSlug! },
          json: {
            title: data.title,
            body_md: data.content,
            excerpt: data.excerpt,
            tags,
            date: data.date,
          },
        });
        const post = state.allPosts.find((p) => p.slug === state.currentSlug);
        if (post) post.status = "published";
        const tab = state.openTabs.find((t) => t.slug === state.currentSlug);
        if (tab) tab.status = "published";
        setState({ deployingSlugs: new Set([state.currentSlug!]), deployingAction: "publishing" });

        // Poll deploy status
        const pollDeploy = async (): Promise<boolean> => {
          try {
            const statusRes = await api.api.deploy.status.$get();
            if (!statusRes.ok) return false;
            const { status: deployStatus } = await statusRes.json();

            if (deployStatus === "success") {
              setState({ deployingSlugs: new Set(), deployingAction: null });
              if (state.currentSlug) {
                const p = state.allPosts.find((x) => x.slug === state.currentSlug);
                if (p) p.publishedAt = new Date().toISOString();
                const t = state.openTabs.find((x) => x.slug === state.currentSlug);
                if (t) t.publishedAt = new Date().toISOString();
              }
              setState({});  // trigger render
              if (publishSplit) {
                publishSplit.setAttribute("status", "success");
                setTimeout(() => publishSplit.setAttribute("status", "none"), 1500);
              }
              return true;
            } else if (deployStatus === "failure") {
              setState({ deployingSlugs: new Set(), deployingAction: null });
              if (publishSplit) {
                publishSplit.setAttribute("status", "error");
                setTimeout(() => publishSplit.setAttribute("status", "none"), 2000);
              }
              return true;
            }
            return false;
          } catch {
            setState({ deployingSlugs: new Set(), deployingAction: null });
            return true;
          }
        };

        // First poll immediately, then every 5s
        const done = await pollDeploy();
        if (!done) {
          const pollInterval = setInterval(async () => {
            if (await pollDeploy()) clearInterval(pollInterval);
          }, 5000);
        }
      } catch {
        if (publishSplit) publishSplit.setAttribute("status", "error");
        setTimeout(() => { if (publishSplit) publishSplit.setAttribute("status", "none"); }, 2000);
      }
    });

    // Unpublish (dropdown item) — unpublish + poll deploy status
    document.getElementById("admin-unpublish-btn")?.addEventListener("select", async () => {
      if (!state.currentSlug) return;
      if (publishSplit) publishSplit.setAttribute("status", "loading");
      try {
        await api.api.posts[":slug"].unpublish.$put({ param: { slug: state.currentSlug } });
        const post = state.allPosts.find((p) => p.slug === state.currentSlug);
        if (post) post.status = "draft";
        const tab = state.openTabs.find((t) => t.slug === state.currentSlug);
        if (tab) tab.status = "draft";
        setState({ deployingSlugs: new Set([state.currentSlug!]), deployingAction: "unpublishing" });

        // Poll deploy status
        const pollUnpublish = async (): Promise<boolean> => {
          try {
            const statusRes = await api.api.deploy.status.$get();
            if (!statusRes.ok) return false;
            const { status: deployStatus } = await statusRes.json();
            if (deployStatus === "success") {
              setState({ deployingSlugs: new Set(), deployingAction: null });
              if (publishSplit) {
                publishSplit.setAttribute("status", "success");
                setTimeout(() => publishSplit.setAttribute("status", "none"), 1500);
              }
              return true;
            } else if (deployStatus === "failure") {
              setState({ deployingSlugs: new Set(), deployingAction: null });
              if (publishSplit) {
                publishSplit.setAttribute("status", "error");
                setTimeout(() => publishSplit.setAttribute("status", "none"), 2000);
              }
              return true;
            }
            return false;
          } catch {
            setState({ deployingSlugs: new Set(), deployingAction: null });
            return true;
          }
        };
        const done = await pollUnpublish();
        if (!done) {
          const pollInterval = setInterval(async () => {
            if (await pollUnpublish()) clearInterval(pollInterval);
          }, 5000);
        }
      } catch {
        if (publishSplit) publishSplit.setAttribute("status", "error");
        setTimeout(() => { if (publishSplit) publishSplit.setAttribute("status", "none"); }, 2000);
      }
    });

    // Export (split button dropdown item)
    document.getElementById("admin-export-btn")?.addEventListener("select", exportAsMarkdown);

    // Fullscreen preview
    const overlay = document.getElementById("admin-preview-overlay")!;
    // Gallery toggle
    const galleryBtn = document.getElementById("admin-gallery-btn");
    if (galleryBtn) galleryBtn.onclick = toggleGallery;

    const previewFull = document.getElementById("admin-preview-full")!;

    const previewBtn = document.getElementById("admin-preview-btn");
    if (previewBtn) {
      previewBtn.onclick = () => {
        const title = (titleInput as any).value;
        const date = (dateInput as any).value;
        const tags = tagsInput.value;
        const content = textarea.value;
        // Use Shiki for fullscreen preview
        getMd().then((mdShiki) => {
          const highlighted = mdShiki.render(content);
          const tagBadges = tags.split(",").map((t) => t.trim()).filter(Boolean)
            .map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("");
          const formattedDate = date
            ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : "";
          previewFull.innerHTML = `
            <article>
              <a href="/blog" class="body-02 text-link" style="text-decoration:none;">← Back to blog</a>
              <h1 class="heading-02 mt-3">${title || "Untitled"}</h1>
              ${formattedDate ? `<div class="post-meta mt-1">${formattedDate}</div>` : ""}
              ${tagBadges ? `<div class="tags mt-2">${tagBadges}</div>` : ""}
              <div class="post-content mt-4">${highlighted}</div>
            </article>
          `;
          wrapCodeBlocks(previewFull);
          overlay.style.display = "flex";
        });
      };
    }

    const previewCloseBtn = document.getElementById("admin-preview-close");
    if (previewCloseBtn) {
      previewCloseBtn.onclick = () => {
        overlay.style.display = "none";
      };
    }

    // Close preview on Escape
    overlay.addEventListener("keydown", (e) => {
      if (e.key === "Escape") overlay.style.display = "none";
    });

    // Tab key in textarea (insert 2 spaces instead of changing focus)
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        insertAtCursor(textarea, "  ");
      }
    });

    // Ctrl+S to save
    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveCurrent(true, document.getElementById("admin-save-btn"));
      }
    });

    // Set default date + render initial state
    if (!(dateInput as any).value) (dateInput as any).value = new Date().toISOString().split("T")[0];
    renderPreview();

    // Delete confirmation modal — append to body to avoid stacking context issues
    const deleteModal = document.createElement("ui-modal");
    deleteModal.id = "admin-delete-modal";
    deleteModal.setAttribute("size", "s");
    deleteModal.setAttribute("dismissible", "");
    deleteModal.textContent = "Delete Post";
    const modalBody = document.createElement("div");
    modalBody.setAttribute("slot", "body");
    modalBody.textContent = "Are you sure you want to delete this post? This action cannot be undone.";
    const modalFooter = document.createElement("div");
    modalFooter.setAttribute("slot", "footer-end");
    modalFooter.style.cssText = "display:flex;gap:8px;";
    const cancelBtn = document.createElement("ui-button");
    cancelBtn.setAttribute("action", "secondary");
    cancelBtn.setAttribute("size", "s");
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = () => {
      setState({ pendingDeleteSlug: null });
      (deleteModal as any).close();
    };
    const confirmBtn = document.createElement("ui-button");
    confirmBtn.setAttribute("action", "destructive");
    confirmBtn.setAttribute("size", "s");
    confirmBtn.textContent = "Delete";
    confirmBtn.onclick = async () => {
      if (!state.pendingDeleteSlug) return;
      confirmBtn.setAttribute("status", "loading");
      try {
        const post = state.allPosts.find((p) => p.slug === state.pendingDeleteSlug);
        if (post?.persisted) {
          await deletePost(state.pendingDeleteSlug);
        }
        const newAllPosts = state.allPosts.filter((p) => p.slug !== state.pendingDeleteSlug);
        const newOpenTabs = state.openTabs.filter((t) => t.slug !== state.pendingDeleteSlug);
        if (state.currentSlug === state.pendingDeleteSlug) {
          if (newOpenTabs.length > 0) {
            setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
            loadDraftIntoEditor(newOpenTabs[newOpenTabs.length - 1]);
          } else {
            setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
            clearEditor();
          }
        } else {
          setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
        }
        (deleteModal as any).close();
      } finally {
        confirmBtn.setAttribute("status", "none");
      }
    };
    modalFooter.appendChild(cancelBtn);
    modalFooter.appendChild(confirmBtn);
    deleteModal.appendChild(modalBody);
    deleteModal.appendChild(modalFooter);
    document.body.appendChild(deleteModal);

    // New Post button in sidebar header
    document.getElementById("admin-new-post")?.addEventListener("action", () => {
      const draft: Draft = {
        slug: `draft-${Date.now().toString(36)}`,
        title: "",
        date: new Date().toISOString().split("T")[0],
        tags: "",
        excerpt: "",
        content: "",
        status: "draft",
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        persisted: false,
      };
      setState({ allPosts: [draft, ...state.allPosts], openTabs: [...state.openTabs, draft] });
      loadDraftIntoEditor(draft);
    });

    // Sidebar select event (open existing post in tab)
    const sidebar = document.getElementById("admin-sidebar")!;
    sidebar.addEventListener("select", ((e: CustomEvent) => {
      const value = e.detail?.value as string;
      if (!value) return;
      const post = state.allPosts.find((p) => p.slug === value);
      if (!post) return;
      if (!state.openTabs.find((t) => t.slug === post.slug)) {
        setState({ openTabs: [...state.openTabs, post] });
      }
      loadDraftIntoEditor(post);
      saveUIState();
    }) as EventListener);

    // Sidebar collapse/expand
    sidebar.addEventListener("toggle", () => {
      saveUIState();
    });
  },
};
