import type { Route } from "../../router.js";
import type { Post, Project } from "./types.js";
import { state, setState, hasUnpublishedChanges, onFormRender } from "./state.js";
import { saveUIState, saveCurrent, saveCurrentProject, loadPostIntoEditor, loadProjectIntoEditor } from "./api.js";
import { renderPreview, triggerPreview } from "./preview.js";
import { setupToolbar, insertAtCursor } from "./toolbar.js";
import { setupImageUpload } from "./upload.js";
import { initGallery, toggleGallery, openGalleryForPick } from "./gallery.js";
import { setupContextMenu } from "./context-menu.js";
import { setupScrollSync } from "./scroll-sync.js";
import { setupUndoStack } from "./undo.js";
import { openPortfolioLayout } from "./project-preview.js";
import { setupComponentToolbar } from "./component-toolbar.js";
import { setupPublish } from "./publish.js";
import { setupDeleteModal } from "./delete-modal.js";
import { setupKeyboard } from "./keyboard.js";
import { setupFullscreenPreview } from "./fullscreen-preview.js";
import { setupTags } from "./tags.js";
import { setupInit } from "./init.js";

function renderForm(): void {
  const loading = document.getElementById("admin-loading");
  const editorMain = document.getElementById("admin-editor-main");
  const sidebar = document.getElementById("admin-sidebar");
  const tabBar = document.getElementById("admin-tab-bar");
  const postForm = document.getElementById("admin-post-form");
  const projectForm = document.getElementById("admin-project-form");
  const portfolioBtn = document.getElementById("admin-portfolio-btn");

  if (loading) loading.style.display = state.loaded ? "none" : "";
  if (editorMain) editorMain.style.display = state.loaded ? "" : "none";
  if (sidebar) sidebar.style.display = state.loaded ? "" : "none";
  if (tabBar) tabBar.style.display = state.loaded ? "" : "none";

  if (postForm) postForm.style.display = state.activeTabType === "project" ? "none" : "";
  if (projectForm) projectForm.style.display = state.activeTabType === "project" ? "" : "none";
  if (portfolioBtn) portfolioBtn.style.display = state.activeTabType === "project" ? "" : "none";
}

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
        <ui-side-panel-menu-section separator>
          <span style="display:flex;align-items:center;justify-content:space-between;width:100%;">
            Posts
            <ui-button id="admin-new-post" action="primary" emphasis="minimal" size="s" icon="icon-only" aria-label="New Post"><ui-icon name="add" size="s" slot="icon-start"></ui-icon></ui-button>
          </span>
        </ui-side-panel-menu-section>
        <div id="admin-post-list"></div>
        <ui-side-panel-menu-section separator>
          <span style="display:flex;align-items:center;justify-content:space-between;width:100%;">
            Projects
            <ui-button id="admin-new-project" action="primary" emphasis="minimal" size="s" icon="icon-only" aria-label="New Project"><ui-icon name="add" size="s" slot="icon-start"></ui-icon></ui-button>
          </span>
        </ui-side-panel-menu-section>
        <div id="admin-project-list"></div>
      </ui-side-panel-menu>
      <div class="admin-main">
        <div id="admin-tab-bar" class="admin-tab-bar" style="display:none"></div>

        <div id="admin-loading" class="admin-loading">
          <img src="/favicon.png" alt="Loading" class="admin-loading-icon" />
        </div>

        <div id="admin-editor-main" class="admin-editor" style="display:none">
          <div id="admin-post-form" class="admin-form">
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

          <div id="admin-project-form" class="admin-form" style="display:none">
            <div class="admin-form-row">
              <ui-input id="admin-project-title" placeholder="Project title" size="m"><ui-label slot="label" size="m">Title</ui-label></ui-input>
            </div>
            <div class="admin-form-row">
              <ui-textarea id="admin-project-description" placeholder="Short project description" size="m" rows="2"><ui-label slot="label" size="m">Description</ui-label></ui-textarea>
            </div>
            <div class="admin-form-row-group">
              <div class="admin-form-row">
                <ui-input id="admin-project-tech-input" placeholder="Add tech + Enter" size="m">
                  <ui-label slot="label" size="m">Tech Stack</ui-label>
                  <span id="admin-project-tech-list" slot="leading"></span>
                </ui-input>
                <input id="admin-project-tech" type="hidden" />
              </div>
              <div class="admin-form-row" style="justify-content:flex-start;">
                <ui-label size="m">📌 Pin to homepage</ui-label>
                <ui-checkbox-item id="admin-project-pinned" size="l"></ui-checkbox-item>
              </div>
            </div>
            <div class="admin-form-row-group">
              <div class="admin-form-row">
                <ui-input id="admin-project-url" placeholder="https://..." size="m"><ui-label slot="label" size="m">URL</ui-label></ui-input>
              </div>
              <div class="admin-form-row">
                <ui-input id="admin-project-repo" placeholder="https://github.com/..." size="m"><ui-label slot="label" size="m">Repo</ui-label></ui-input>
              </div>
            </div>
              <div class="admin-form-row">
                <ui-label size="m">Image</ui-label>
                <div id="admin-project-image-wrapper" class="project-image-wrapper">
                  <div id="admin-project-image-empty" style="display:flex;gap:8px;">
                    <ui-button id="admin-project-image-upload" action="secondary" emphasis="subtle" size="s">Upload</ui-button>
                    <ui-button id="admin-project-image-gallery" action="secondary" emphasis="subtle" size="s">Gallery</ui-button>
                  </div>
                  <div id="admin-project-image-filled" class="project-image-thumb" style="display:none;">
                    <ui-image id="admin-project-image-preview" style="width:200px;--ui-image-height:120px;--ui-image-bg:var(--fd-surface-secondary);--ui-image-fit:cover;border-radius:var(--fd-radius-sm);">
                      <span id="admin-project-image-caption" slot="caption"></span>
                    </ui-image>
                    <div class="project-image-overlay">
                      <ui-button id="admin-project-image-upload2" action="secondary" emphasis="subtle" size="m" icon="icon-only" aria-label="Upload"><ui-icon name="upload" size="m" slot="icon-start"></ui-icon></ui-button>
                      <ui-button id="admin-project-image-gallery2" action="secondary" emphasis="subtle" size="m" icon="icon-only" aria-label="Gallery"><ui-icon name="grid_view" size="m" slot="icon-start"></ui-icon></ui-button>
                      <ui-button id="admin-project-image-remove" action="destructive" emphasis="subtle" size="m" icon="icon-only" aria-label="Remove"><ui-icon name="delete" size="m" slot="icon-start"></ui-icon></ui-button>
                    </div>
                  </div>
                <input id="admin-project-image" type="hidden" />
              </div>
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
            <ui-button id="admin-portfolio-btn" action="secondary" emphasis="subtle" size="s" style="display:none">Portfolio</ui-button>
            <ui-button id="admin-save-btn" action="primary" size="s">Save</ui-button>
            <ui-dropdown-split id="admin-publish-split" action="primary" size="s" label="Publish">
              <ui-dropdown-item id="admin-unpublish-btn" value="unpublish">Unpublish</ui-dropdown-item>
              <ui-dropdown-item id="admin-export-btn" value="export">Export .md</ui-dropdown-item>
            </ui-dropdown-split>
          </div>
          <div id="admin-component-toolbar" class="admin-toolbar admin-component-toolbar"></div>

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
    const textarea = document.getElementById("admin-content") as HTMLTextAreaElement;
    const titleInput = document.getElementById("admin-title") as HTMLElement;
    const dateInput = document.getElementById("admin-date") as HTMLElement;
    const tagsInput = document.getElementById("admin-tags") as HTMLInputElement;
    const tagInput = document.getElementById("admin-tag-input") as HTMLInputElement;
    const tagList = document.getElementById("admin-tag-list")!;
    const excerptInput = document.getElementById("admin-excerpt") as HTMLElement;
    const publishSplit = document.getElementById("admin-publish-split");

    // Preview triggers
    textarea.addEventListener("input", triggerPreview);
    titleInput.addEventListener("input", triggerPreview);
    dateInput.addEventListener("change", triggerPreview);

    // Auto-save on input (debounced) — routes by activeTabType
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    const autoSave = () => {
      setState({});
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        const saveBtn = document.getElementById("admin-save-btn");
        if (state.activeTabType === "project") {
          if (state.currentSlug) saveCurrentProject(false, saveBtn);
        } else {
          if (state.currentSlug || textarea.value.trim()) saveCurrent(false, saveBtn);
        }
      }, 2000);
    };
    textarea.addEventListener("input", autoSave);
    titleInput.addEventListener("input", autoSave);
    dateInput.addEventListener("change", autoSave);
    tagsInput.addEventListener("input", autoSave);
    excerptInput.addEventListener("input", autoSave);

    // Project form auto-save
    const projectFields = ["admin-project-title", "admin-project-description", "admin-project-url", "admin-project-repo", "admin-project-image"];
    for (const id of projectFields) {
      document.getElementById(id)?.addEventListener("input", autoSave);
    }
    document.getElementById("admin-project-pinned")?.addEventListener("change", autoSave);
    // Project content uses the same textarea (admin-content), already wired above

    // Toolbar + plugins
    setupToolbar(textarea);
    setupImageUpload(textarea);
    initGallery((url, name) => insertAtCursor(textarea, `![${name}](${url})`));
    setupContextMenu(textarea);
    setupUndoStack(textarea);
    setupComponentToolbar(textarea);

    // Scroll sync between textarea and preview
    const textareaWrap = document.querySelector(".admin-textarea-wrap") as HTMLElement;
    const previewWrap = document.querySelector(".admin-split ui-scrollbar:last-child") as HTMLElement;
    if (textareaWrap && previewWrap) setupScrollSync(textareaWrap, previewWrap);


    // Save button — routes by activeTabType
    const saveBtn = document.getElementById("admin-save-btn");
    if (saveBtn) {
      saveBtn.onclick = async () => {
        if (state.saving) {
          await new Promise<void>((resolve) => {
            const check = setInterval(() => { if (!state.saving) { clearInterval(check); resolve(); } }, 100);
          });
        }
        if (state.activeTabType === "project") {
          saveCurrentProject(true, saveBtn);
        } else {
          saveCurrent(true, saveBtn);
        }
      };
    }

    // Gallery toggle
    const galleryBtn = document.getElementById("admin-gallery-btn");
    if (galleryBtn) galleryBtn.onclick = toggleGallery;

    // Portfolio layout button
    const portfolioBtn = document.getElementById("admin-portfolio-btn");
    if (portfolioBtn) portfolioBtn.onclick = openPortfolioLayout;

    // Project image upload + gallery picker
    const imageHidden = document.getElementById("admin-project-image") as HTMLInputElement;
    const imagePreview = document.getElementById("admin-project-image-preview") as HTMLElement;
    const imageEmpty = document.getElementById("admin-project-image-empty")!;
    const imageFilled = document.getElementById("admin-project-image-filled")!;

    const imageRemoveBtn = document.getElementById("admin-project-image-remove")!;
    const imageCaption = document.getElementById("admin-project-image-caption")!;

    function setProjectImage(url: string): void {
      imageHidden.value = url;
      imageHidden.dispatchEvent(new Event("input", { bubbles: true }));
      const filename = url ? url.split("/").pop() ?? url : "";
      imageCaption.textContent = filename;
      imagePreview.setAttribute("src", url);
      imageEmpty.style.display = url ? "none" : "flex";
      imageFilled.style.display = url ? "" : "none";
    }

    function openImageUpload(): void {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        if (!input.files?.length) return;
        const formData = new FormData();
        formData.append("file", input.files[0]);
        try {
          const res = await fetch("/api/images", { method: "POST", body: formData });
          if (!res.ok) return;
          const data = (await res.json()) as { url: string };
          setProjectImage(data.url);
        } catch { /* ignore */ }
      };
      input.click();
    }

    function openImageGallery(): void {
      openGalleryForPick((url) => setProjectImage(url));
    }

    // Wire all upload/gallery/remove buttons (empty state + overlay)
    const uploadBtn1 = document.getElementById("admin-project-image-upload");
    const uploadBtn2 = document.getElementById("admin-project-image-upload2");
    const galleryBtn1 = document.getElementById("admin-project-image-gallery");
    const galleryBtn2 = document.getElementById("admin-project-image-gallery2");
    if (uploadBtn1) uploadBtn1.onclick = openImageUpload;
    if (uploadBtn2) uploadBtn2.onclick = openImageUpload;
    if (galleryBtn1) galleryBtn1.onclick = openImageGallery;
    if (galleryBtn2) galleryBtn2.onclick = openImageGallery;
    imageRemoveBtn.onclick = () => setProjectImage("");

    // Module setups
    setupTags(tagInput, tagList, tagsInput);

    // Project tech tags
    const projectTechInput = document.getElementById("admin-project-tech-input") as HTMLInputElement;
    const projectTechList = document.getElementById("admin-project-tech-list")!;
    const projectTechHidden = document.getElementById("admin-project-tech") as HTMLInputElement;
    if (projectTechInput && projectTechList && projectTechHidden) {
      setupTags(projectTechInput, projectTechList, projectTechHidden);
    }

    setupPublish(publishSplit, textarea);
    setupDeleteModal();
    setupKeyboard(textarea);
    setupFullscreenPreview(textarea, titleInput, dateInput, tagsInput);

    // Set default date + render initial state
    if (!(dateInput as any).value) (dateInput as any).value = new Date().toISOString().split("T")[0];
    renderPreview();

    // New Post button
    const newPostBtn = document.getElementById("admin-new-post");
    if (newPostBtn) newPostBtn.onclick = () => {
      const post: Post = {
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
        publishedContent: null,
      };
      setState({ allPosts: [post, ...state.allPosts], openTabs: [...state.openTabs, post] });
      loadPostIntoEditor(post);
    };

    // New Project button
    const newProjectBtn = document.getElementById("admin-new-project");
    if (newProjectBtn) newProjectBtn.onclick = () => {
      const project: Project = {
        slug: `project-${Date.now().toString(36)}`,
        title: "",
        description: "",
        content: "",
        tech: "",
        url: "",
        repo: "",
        image: "",
        pinned: false,
        sortOrder: 0,
        status: "draft",
        updatedAt: new Date().toISOString(),
        publishedAt: null,
        persisted: false,
        publishedContent: null,
      };
      setState({ allProjects: [project, ...state.allProjects], openProjectTabs: [...state.openProjectTabs, project] });
      loadProjectIntoEditor(project);
    };

    // Sidebar select event (open existing post or project in tab)
    const sidebar = document.getElementById("admin-sidebar")!;
    sidebar.addEventListener("select", ((e: CustomEvent) => {
      const value = e.detail?.value as string;
      if (!value) return;

      // Project items have value prefixed with "project:"
      if (value.startsWith("project:")) {
        const slug = value.slice(8);
        const project = state.allProjects.find((p) => p.slug === slug);
        if (!project) return;
        if (!state.openProjectTabs.find((t) => t.slug === project.slug)) {
          setState({ openProjectTabs: [...state.openProjectTabs, project] });
        }
        loadProjectIntoEditor(project);
        saveUIState();
        return;
      }

      const post = state.allPosts.find((p) => p.slug === value);
      if (!post) return;
      if (!state.openTabs.find((t) => t.slug === post.slug)) {
        setState({ openTabs: [...state.openTabs, post] });
      }
      loadPostIntoEditor(post);
      saveUIState();
    }) as EventListener);

    // Sidebar collapse/expand
    sidebar.addEventListener("toggle", () => {
      saveUIState();
    });

    // Warn before accidental refresh if there are unsaved changes
    window.addEventListener("beforeunload", (e) => {
      if (state.saving || state.allPosts.some((p) => hasUnpublishedChanges(p)) || state.allProjects.some((p) => hasUnpublishedChanges(p))) {
        e.preventDefault();
      }
    });

    // Register form visibility callback + load posts, restore UI state, resume deploy polling
    onFormRender(renderForm);
    setupInit();
  },
};
