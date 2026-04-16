import { LitElement, html, css, nothing } from "lit";
import { customElement, state as litState } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import type { Post, Project } from "./types.js";
import { state, setState, hasUnpublishedChanges } from "./state.js";
import { api } from "../../lib/api.js";
import { fetchPosts, fetchProjects, loadUIState, setEditorPage, saveUIState, saveCurrent, saveCurrentProject, loadPostIntoEditor, loadProjectIntoEditor, exportAsMarkdown } from "./api.js";
import { renderPreview, triggerPreview, getMd, wrapCodeBlocks } from "./preview.js";
import { wrapSelection, insertAtCursor } from "./toolbar.js";
import { uploadFile } from "./upload.js";
import "./gallery.js";
import { setupContextMenu } from "./context-menu.js";
import { setupScrollSync } from "./scroll-sync.js";
import { setupUndoStack } from "./undo.js";
import "./project-preview.js";
import { publishCurrent, unpublishCurrent } from "./publish.js";
import "./delete-modal.js";
import { setSidebarRoot } from "./sidebar.js";
import "./tabbar.js";
import { EditorStoreController } from "./editor-store.js";

import "@maneki/ui-components/components/ui-toolbar.js";
import "@maneki/ui-components/components/ui-toolbar-separator.js";
import "@maneki/ui-components/components/ui-button-group.js";
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
import "@maneki/ui-components/components/ui-image.js";
import "@maneki/ui-components/components/ui-link.js";

@customElement("editor-page")
export class EditorPage extends LitElement {
  private store = new EditorStoreController(this);

  // ─── Element refs ──────────────────────────────────────────────────────────
  private _textareaRef: Ref<HTMLTextAreaElement> = createRef();

  private _galleryRef: Ref<HTMLElement & { show(cb?: (url: string, name: string) => void): void; hide(): void; toggle(): void }> = createRef();
  private _deleteModalRef: Ref<HTMLElement & { show(): void }> = createRef();
  private _previewRef: Ref<HTMLElement> = createRef();
  private _previewFullRef: Ref<HTMLElement> = createRef();
  private _previewOverlayRef: Ref<HTMLElement> = createRef();
  private _sidebarRef: Ref<HTMLElement> = createRef();
  private _textareaWrapRef: Ref<HTMLElement> = createRef();
  private _previewWrapRef: Ref<HTMLElement> = createRef();
  private _projectPreviewRef: Ref<HTMLElement & { show(): void; hide(): void }> = createRef();

  // ─── Post form fields (reactive) ─────────────────────────────────────────
  @litState() postTitle = "";
  @litState() postDate = new Date().toISOString().split("T")[0];
  @litState() postTags: string[] = [];
  @litState() postExcerpt = "";
  @litState() postContent = "";

  // ─── Project form fields (reactive) ──────────────────────────────────────
  @litState() projectTitle = "";
  @litState() projectDescription = "";
  @litState() projectTech: string[] = [];
  @litState() projectUrl = "";
  @litState() projectRepo = "";
  @litState() projectImage = "";
  @litState() projectPinned = false;

  // ─── Button status (reactive) ──────────────────────────────────────────
  @litState() private _saveStatus = "none";
  @litState() private _publishStatus = "none";

  static styles = css`
    .admin-layout { display: flex; height: 100vh; overflow: hidden; }
    .admin-main { flex: 1; display: flex; flex-direction: column; min-width: 0; position: relative; overflow: hidden; }
    .admin-tab-bar { display: flex; align-items: center; border-bottom: none; flex-shrink: 0; padding: 4px 8px 0; overflow-x: auto; overflow-y: hidden; }
    .admin-tab-bar ui-tab-item { max-width: 180px; }
    .admin-tab-bar ui-tab-group { flex: 1; min-width: 0; }
    ui-tab-item { max-width: 180px; }
    .admin-tab-bar-actions { display: flex; align-items: center; gap: 4px; padding: 0 8px; flex-shrink: 0; }
    .admin-editor { flex: 1; display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
    .admin-form { padding: 12px; border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7); display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
    .admin-form-row { display: flex; flex-direction: column; gap: 4px; }
    .admin-form-row-group { display: flex; gap: var(--fd-space-2); }
    .admin-form-row-group .admin-form-row { flex: 1; min-width: 0; }
    .admin-form-row-group .admin-form-row:has(ui-datetime-picker) { flex: 0 0 auto; width: 200px; }
    .admin-form-row-group .admin-form-row:first-child { flex: 0 0 auto; }
    #admin-tag-list { display: flex; flex-wrap: wrap; gap: 4px; }
    #admin-project-tech-list { display: flex; flex-wrap: wrap; gap: 4px; }
    .admin-toolbar { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7); flex-wrap: wrap; }
    .admin-toolbar button[data-action] { background: none; border: 1px solid var(--fd-border-minimal, #e4e4e7); border-radius: 4px; padding: 4px 8px; font-size: 12px; font-weight: 500; cursor: pointer; color: var(--fd-text-secondary, #52525b); line-height: 1; }
    .admin-toolbar button[data-action]:hover { background: var(--fd-surface-secondary, #f4f4f5); color: var(--fd-text-primary, #27272a); }
    .admin-toolbar-spacer { flex: 1; }
    .admin-btn { font-family: inherit; font-size: 12px; font-weight: 500; padding: 4px 10px; border: 1px solid var(--fd-border-minimal, #e4e4e7); border-radius: 4px; background: var(--fd-surface-primary, #fff); color: var(--fd-text-primary, #27272a); cursor: pointer; }
    .admin-btn:hover { background: var(--fd-surface-secondary, #f4f4f5); }
    .admin-btn-primary { background: var(--fd-text-link, #2680eb); color: #fff; border-color: var(--fd-text-link, #2680eb); }
    .admin-btn-primary:hover { opacity: 0.9; }
    .admin-btn-danger { color: var(--fd-status-text-error, #d91f11); border-color: var(--fd-status-text-error, #d91f11); }
    .admin-btn-danger:hover { background: var(--fd-status-text-error, #d91f11); color: #fff; }
    .admin-split { flex: 1; display: flex; min-height: 0; }
    .admin-textarea-wrap { border-right: 1px solid var(--fd-border-minimal, #e4e4e7); background: var(--fd-surface-primary, #fff); }
    .admin-textarea-wrap ui-textarea { --ui-textarea-border: transparent; --ui-textarea-bg: var(--fd-surface-primary, #fff); --ui-textarea-radius: 0; --ui-textarea-shadow: none; --ui-textarea-hover-border: transparent; --ui-textarea-focus-border: transparent; }
    .admin-split #admin-content { width: 100%; min-height: 100%; resize: none; border: none; padding: 16px; font-family: "Roboto Mono", monospace; font-size: 13px; line-height: 1.6; background: var(--fd-surface-primary, #fff); color: var(--fd-text-primary, #27272a); outline: none; tab-size: 2; overflow: hidden; box-sizing: border-box; field-sizing: content; transition: background 0.15s ease; }
    .admin-split #admin-content.drag-over { background: var(--fd-surface-secondary, #f4f4f5); }
    .admin-textarea-spacer { height: 25vh; background: var(--fd-surface-primary, #fff); }
    .admin-preview { padding: 16px 24px; background: var(--fd-surface-primary, #fff); }
    .admin-split ui-scrollbar { flex: 1; }
    .admin-preview-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 200; flex-direction: column; background: var(--fd-surface-primary, #fff); }
    .admin-preview-overlay-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7); }
    .admin-preview-overlay-content { flex: 1; overflow-y: auto; }
    .heading-02 { font-size: 32px; line-height: 40px; font-weight: 500; }
    .heading-05 { font-size: 16px; line-height: 24px; font-weight: 500; }
    .body-02 { font-size: 14px; line-height: 20px; font-weight: 400; }
    .text-secondary { color: var(--fd-text-secondary, #52525b); }
    .text-link { color: var(--fd-text-link, #2680eb); }
    .post-meta { font-size: 12px; line-height: 16px; color: var(--fd-text-secondary, #52525b); }
    .tags { display: flex; flex-wrap: wrap; gap: var(--fd-space-0-75, 6px); margin-top: var(--fd-space-1-5, 12px); }
    .mt-1 { margin-top: var(--fd-space-1, 8px); }
    .mt-2 { margin-top: var(--fd-space-2, 16px); }
    .mt-3 { margin-top: var(--fd-space-3, 24px); }
    .mt-4 { margin-top: var(--fd-space-4, 32px); }
    .post-content h2 { font-size: 24px; line-height: 32px; font-weight: 500; margin: 48px 0 16px; }
    .post-content h3 { font-size: 20px; line-height: 28px; font-weight: 500; margin: 32px 0 12px; }
    .post-content h4 { font-size: 16px; line-height: 24px; font-weight: 500; margin: 24px 0 8px; }
    .post-content p { font-size: 16px; line-height: 24px; margin: 0 0 16px; }
    .post-content ul, .post-content ol { font-size: 16px; line-height: 24px; margin: 0 0 16px; padding-left: 24px; }
    .post-content li { margin-bottom: 4px; }
    .post-content pre { border: 1px solid var(--fd-border-minimal, #e4e4e7); border-radius: 8px; padding: 16px; overflow-x: auto; margin: 0 0 16px; font-family: "Roboto Mono", monospace; font-size: 14px; line-height: 20px; background: var(--fd-surface-secondary, #f4f4f5); }
    .post-content code { font-family: "Roboto Mono", monospace; font-size: 13px; background: var(--fd-surface-secondary, #f4f4f5); padding: 2px 6px; border-radius: 4px; }
    .post-content pre code { background: none; padding: 0; border-radius: 0; }
    .post-content ui-image { --ui-image-bg: transparent; --ui-image-fit: contain; display: block; max-width: 100%; margin: var(--fd-space-2) 0; }
    .post-content pre.shiki, .post-content pre.shiki span { color: var(--shiki-light); background-color: var(--shiki-light-bg); }
    :host-context([data-theme="heroui-dark"]) .post-content pre.shiki,
    :host-context([data-theme="heroui-dark"]) .post-content pre.shiki span { color: var(--shiki-dark); background-color: var(--shiki-dark-bg); }
    .post-content blockquote { border-left: 3px solid var(--fd-border-moderate, #a1a1aa); padding-left: 16px; margin: 0 0 16px; color: var(--fd-text-secondary, #52525b); font-style: italic; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .admin-bulk-actions { display: flex; flex-direction: row; align-items: center; gap: var(--fd-space-0-75); padding: var(--fd-space-0-75) var(--fd-space-1); background: var(--fd-surface-secondary); flex-shrink: 0; overflow: hidden; }
    .admin-bulk-count { font-family: var(--fd-type-body-03-font-family); font-size: var(--fd-type-body-03-font-size); line-height: var(--fd-type-body-03-line-height); color: var(--fd-text-secondary); margin-right: auto; }
    #admin-gallery { position: absolute; top: 0; right: 0; height: 100%; z-index: 10; --ui-sp-width: 320px; --ui-sp-bg: var(--fd-surface-primary); }
    .admin-gallery-header { display: flex; align-items: center; justify-content: space-between; padding: var(--fd-space-1) var(--fd-space-1-5); border-bottom: var(--fd-border-width-sm) solid var(--fd-border-minimal); flex-shrink: 0; }
    .admin-gallery-grid { flex: 1; overflow-y: auto; padding: var(--fd-space-1); display: grid; grid-template-columns: 1fr 1fr; gap: var(--fd-space-1); align-content: start; }
    .gallery-item { display: flex; flex-direction: column; border: var(--fd-border-width-sm) solid var(--fd-border-minimal); border-radius: var(--fd-radius-sm); overflow: hidden; cursor: pointer; transition: border-color 0.15s ease; }
    .gallery-item:hover { border-color: var(--fd-border-moderate); }
    .gallery-item img { width: 100%; height: 100px; object-fit: cover; background: var(--fd-surface-secondary); }
    .gallery-item-info { padding: var(--fd-space-0-5); display: flex; flex-direction: column; gap: 2px; }
    .gallery-item-name { font-family: var(--fd-type-body-03-font-family); font-size: var(--fd-type-body-03-font-size); color: var(--fd-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gallery-item-size { font-family: var(--fd-type-body-03-font-family); font-size: 10px; color: var(--fd-text-secondary); }
    .gallery-item-actions { display: flex; gap: var(--fd-space-0-5); padding: var(--fd-space-0-5); border-top: var(--fd-border-width-sm) solid var(--fd-border-minimal); }
    .gallery-loading, .gallery-empty { grid-column: 1 / -1; text-align: center; padding: var(--fd-space-3); font-family: var(--fd-type-body-02-font-family); font-size: var(--fd-type-body-02-font-size); color: var(--fd-text-secondary); }
    .context-ring { position: fixed; z-index: 100; width: 0; height: 0; pointer-events: none; opacity: 0; transform: scale(0.3); transition: opacity 0.15s ease, transform 0.15s ease; }
    .context-ring.open { pointer-events: auto; opacity: 1; transform: scale(1); }
    .context-ring-btn { position: absolute; width: 28px; height: 28px; border-radius: 50%; border: var(--fd-border-width-sm) solid var(--fd-border-minimal); background: var(--fd-surface-primary); color: var(--fd-text-primary); font-size: 11px; font-weight: 600; font-family: var(--fd-type-body-03-font-family); cursor: pointer; display: flex; align-items: center; justify-content: center; margin-left: -14px; margin-top: -14px; transition: background 0.1s ease, border-color 0.1s ease, box-shadow 0.1s ease; box-shadow: var(--fd-elevation-01); }
    .context-ring-btn:hover { background: var(--fd-surface-secondary); border-color: var(--fd-border-moderate); box-shadow: var(--fd-elevation-02); }
    .context-ring-btn:active { transform: translate(var(--tw-translate-x, 0), var(--tw-translate-y, 0)) scale(0.9); }
    .project-preview-sortable { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--fd-space-2); }
    .project-preview-card { border: var(--ui-project-card-border, var(--fd-border-width-sm) solid var(--fd-border-minimal)); border-radius: var(--fd-radius-sm); padding: var(--fd-space-2); background: var(--fd-surface-primary); box-shadow: var(--fd-shadow-surface, none); cursor: grab; transition: box-shadow 0.15s ease, opacity 0.15s ease; }
    .project-preview-card:hover { box-shadow: var(--fd-elevation-02); }
    .project-preview-card.dragging { opacity: 0.4; }
    .project-preview-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--fd-space-0-5); }
    .project-preview-card-status { margin-top: var(--fd-space-1); }
    .project-image-thumb { position: relative; display: inline-flex; flex-direction: column; width: 200px; }
    .project-image-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: var(--fd-space-1-5); padding: var(--fd-space-0-5); background: rgba(0, 0, 0, 0.5); border-radius: 0; opacity: 0; transition: opacity 0.15s ease; z-index: 1; box-sizing: border-box; }
    .project-image-thumb:hover .project-image-overlay { opacity: 1; }
  `;

  // ─── Render ──────────────────────────────────────────────────────────────────

  protected render(): unknown {
    const s = this.store.state;
    return html`
      <div class="admin-layout">
        <ui-side-panel-menu id="admin-sidebar" style="display:${s.loaded ? "" : "none"}" @select=${this._onSidebarSelect} @toggle=${() => saveUIState()} @click=${this._onSidebarClick}>
          <span slot="header" style="display:flex;align-items:center;gap:8px;">
            <ui-button action="secondary" emphasis="minimal" size="s" @click=${() => { window.location.href = "/admin"; }}>
              <ui-icon name="chevron_left" size="s" slot="icon-start"></ui-icon>
              Admin
            </ui-button>
            <span style="font-size:13px;font-weight:600;">Editor</span>
          </span>
          <editor-sidebar ${ref(this._sidebarRef)}></editor-sidebar>
        </ui-side-panel-menu>
        <div class="admin-main">
          <editor-tabbar class="admin-tab-bar" style="display:${s.loaded ? "" : "none"}"></editor-tabbar>
          <loading-bounce id="admin-loading" style="display:${s.loaded ? "none" : ""}"></loading-bounce>
          <div id="admin-editor-main" class="admin-editor" style="display:${s.loaded ? "" : "none"}">
            <div id="admin-post-form" class="admin-form" style="display:${s.activeTabType === "project" ? "none" : ""}">
              <div class="admin-form-row">
                <ui-input id="admin-title" placeholder="Post title" size="m" .value=${this.postTitle} @input=${this._onPostTitleInput}><ui-label slot="label" size="m">Title</ui-label></ui-input>
              </div>
              <div class="admin-form-row-group">
                <div class="admin-form-row">
                  <ui-datetime-picker id="admin-date" type="single-date" size="m" .value=${this.postDate} @change=${this._onPostDateChange}><ui-label slot="label" size="m">Date</ui-label></ui-datetime-picker>
                </div>
                <div class="admin-form-row">
                  <ui-input id="admin-tag-input" placeholder="Add tag + Enter" size="m" @keydown=${this._onTagKeydown}>
                    <ui-label slot="label" size="m">Tags</ui-label>
                    <span slot="leading" style="display:flex;flex-wrap:wrap;gap:4px">${this.postTags.map(tag => html`
                      <ui-tag size="s" emphasis="subtle" dismissible @dismiss=${() => this._removeTag(tag)}>${tag}</ui-tag>
                    `)}</span>
                  </ui-input>
                </div>
              </div>
              <div class="admin-form-row">
                <ui-textarea id="admin-excerpt" placeholder="Short description for listing pages" size="m" rows="2" .value=${this.postExcerpt} @input=${this._onPostExcerptInput}><ui-label slot="label" size="m">Excerpt</ui-label></ui-textarea>
              </div>
            </div>
            <div id="admin-project-form" class="admin-form" style="display:${s.activeTabType === "project" ? "" : "none"}">
              <div class="admin-form-row">
                <ui-input id="admin-project-title" placeholder="Project title" size="m" .value=${this.projectTitle} @input=${this._onProjectTitleInput}><ui-label slot="label" size="m">Title</ui-label></ui-input>
              </div>
              <div class="admin-form-row">
                <ui-textarea id="admin-project-description" placeholder="Short project description" size="m" rows="2" .value=${this.projectDescription} @input=${this._onProjectDescriptionInput}><ui-label slot="label" size="m">Description</ui-label></ui-textarea>
              </div>
              <div class="admin-form-row-group">
                <div class="admin-form-row">
                  <ui-input id="admin-project-tech-input" placeholder="Add tech + Enter" size="m" @keydown=${this._onProjectTechKeydown}>
                    <ui-label slot="label" size="m">Tech Stack</ui-label>
                    <span slot="leading" style="display:flex;flex-wrap:wrap;gap:4px">${this.projectTech.map(tag => html`
                      <ui-tag size="s" emphasis="subtle" dismissible @dismiss=${() => this._removeProjectTech(tag)}>${tag}</ui-tag>
                    `)}</span>
                  </ui-input>
                </div>
                <div class="admin-form-row" style="justify-content:flex-start;">
                  <ui-label size="m">📌 Pin to homepage</ui-label>
                  <ui-checkbox-item id="admin-project-pinned" size="l" ?checked=${this.projectPinned} @change=${this._onProjectPinnedChange}></ui-checkbox-item>
                </div>
              </div>
              <div class="admin-form-row-group">
                <div class="admin-form-row">
                  <ui-input id="admin-project-url" placeholder="https://..." size="m" .value=${this.projectUrl} @input=${this._onProjectUrlInput}><ui-label slot="label" size="m">URL</ui-label></ui-input>
                </div>
                <div class="admin-form-row">
                  <ui-input id="admin-project-repo" placeholder="https://github.com/..." size="m" .value=${this.projectRepo} @input=${this._onProjectRepoInput}><ui-label slot="label" size="m">Repo</ui-label></ui-input>
                </div>
              </div>
              <div class="admin-form-row">
                <ui-label size="m">Image</ui-label>
                <div class="project-image-wrapper">
                  ${this.projectImage ? html`
                    <div class="project-image-thumb">
                      <ui-image src=${this.projectImage} style="width:200px;--ui-image-height:120px;--ui-image-bg:var(--fd-surface-secondary);--ui-image-fit:cover;border-radius:var(--fd-radius-sm);">
                        <span slot="caption">${this.projectImage.split("/").pop() ?? this.projectImage}</span>
                      </ui-image>
                      <div class="project-image-overlay">
                        <ui-button action="contrast" emphasis="minimal" size="m" icon="icon-only" aria-label="Upload" @click=${() => this._openImageUpload()}><ui-icon name="upload" size="m" slot="icon-start"></ui-icon></ui-button>
                        <ui-button action="contrast" emphasis="minimal" size="m" icon="icon-only" aria-label="Gallery" @click=${() => this._openImageGallery()}><ui-icon name="grid_view" size="m" slot="icon-start"></ui-icon></ui-button>
                        <ui-button action="destructive" emphasis="minimal" size="m" icon="icon-only" aria-label="Remove" @click=${() => { this.projectImage = ""; this._scheduleAutoSave(); }}><ui-icon name="delete" size="m" slot="icon-start"></ui-icon></ui-button>
                      </div>
                    </div>
                  ` : html`
                    <div style="display:flex;gap:8px;">
                      <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => this._openImageUpload()}>Upload</ui-button>
                      <ui-button action="secondary" emphasis="subtle" size="s" @click=${() => this._openImageGallery()}>Gallery</ui-button>
                    </div>
                  `}
                </div>
              </div>
            </div>
            <ui-toolbar class="admin-toolbar" aria-label="Editor toolbar" @click=${this._onToolbarAction}>
              <ui-button-group action="secondary">
                <ui-button icon="icon-only" data-action="bold" aria-label="Bold"><ui-icon name="format_bold" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="italic" aria-label="Italic"><ui-icon name="format_italic" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="h2" aria-label="Heading 2"><ui-icon name="format_h2" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="h3" aria-label="Heading 3"><ui-icon name="format_h3" size="s" slot="icon-start"></ui-icon></ui-button>
              </ui-button-group>
              <ui-toolbar-separator></ui-toolbar-separator>
              <ui-button-group action="secondary">
                <ui-button icon="icon-only" data-action="link" aria-label="Link"><ui-icon name="link" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="code" aria-label="Inline code"><ui-icon name="code" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="codeblock" aria-label="Code block"><ui-icon name="code_blocks" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="image" aria-label="Image"><ui-icon name="image" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" id="admin-gallery-btn" aria-label="Image gallery" @click=${() => this._galleryRef.value?.toggle()}><ui-icon name="grid_view" size="s" slot="icon-start"></ui-icon></ui-button>
              </ui-button-group>
              <ui-toolbar-separator></ui-toolbar-separator>
              <ui-button-group action="secondary">
                <ui-button icon="icon-only" data-action="ul" aria-label="Bullet list"><ui-icon name="format_list_bulleted" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="ol" aria-label="Numbered list"><ui-icon name="format_list_numbered" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="quote" aria-label="Quote"><ui-icon name="format_quote" size="s" slot="icon-start"></ui-icon></ui-button>
              </ui-button-group>
              <span style="flex:1"></span>
              <ui-button id="admin-preview-btn" action="secondary" emphasis="subtle" size="s" @click=${this._openFullscreenPreview}>Preview</ui-button>
              <ui-button id="admin-portfolio-btn" action="secondary" emphasis="subtle" size="s" style="display:${s.activeTabType === "project" ? "" : "none"}" @click=${() => this._projectPreviewRef.value?.show()}>Portfolio</ui-button>
              <ui-button id="admin-save-btn" action="primary" size="s" status=${this._saveStatus} ?disabled=${s.deployingSlugs.size > 0} @click=${() => this._onSave()}>Save</ui-button>
              <ui-dropdown-split id="admin-publish-split" action="primary" size="s" label="Publish" status=${this._publishStatus} ?disabled=${s.deployingSlugs.size > 0} @action=${this._onPublishAction}>
                <ui-dropdown-item id="admin-unpublish-btn" value="unpublish" @select=${this._onUnpublish}>Unpublish</ui-dropdown-item>
                <ui-dropdown-item id="admin-export-btn" value="export" @select=${this._onExport}>Export .md</ui-dropdown-item>
              </ui-dropdown-split>
            </ui-toolbar>
            <div class="admin-split">
              <ui-scrollbar ${ref(this._textareaWrapRef)} emphasis="minimal" class="admin-textarea-wrap">
                <textarea id="admin-content" ${ref(this._textareaRef)} placeholder="Write your post in Markdown..." spellcheck="false" .value=${this.postContent} @input=${this._onContentInput} @keydown=${this._onTextareaKeydown} @dragover=${this._onTextareaDragover} @dragleave=${this._onTextareaDragleave} @drop=${this._onTextareaDrop} @paste=${this._onTextareaPaste}></textarea>
                <div class="admin-textarea-spacer"></div>
              </ui-scrollbar>
              <ui-scrollbar ${ref(this._previewWrapRef)} emphasis="minimal"><div id="admin-preview" ${ref(this._previewRef)} class="admin-preview"></div></ui-scrollbar>
            </div>
            <div id="admin-preview-overlay" ${ref(this._previewOverlayRef)} class="admin-preview-overlay" style="display:none;" @keydown=${this._onOverlayKeydown}>
              <div class="admin-preview-overlay-header">
                <span class="heading-05">Preview</span>
                <ui-button id="admin-preview-close" action="secondary" emphasis="subtle" size="s" @click=${this._closeFullscreenPreview}>Close</ui-button>
              </div>
              <ui-scrollbar emphasis="minimal">
                <div class="admin-preview-overlay-content">
                  <div id="admin-preview-full" ${ref(this._previewFullRef)} style="max-width:720px;margin:0 auto;padding:48px 24px;"></div>
                </div>
              </ui-scrollbar>
            </div>
          <editor-gallery ${ref(this._galleryRef)} .onSelect=${(url: string, name: string) => { const ta = this._textareaRef.value; if (ta) insertAtCursor(ta, `![${name}](${url})`); }}></editor-gallery>
          <editor-delete-modal ${ref(this._deleteModalRef)}></editor-delete-modal>
          <editor-project-preview ${ref(this._projectPreviewRef)}></editor-project-preview>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  protected firstUpdated(): void {
    const root = this.shadowRoot!;

    // Set root references for modules that need them
    setEditorPage(this);
    setSidebarRoot(root);


    const textarea = this._textareaRef.value!;

    // Plugins
    setupContextMenu(textarea);
    setupUndoStack(textarea);

    // Scroll sync between textarea and preview
    const textareaWrap = this._textareaWrapRef.value;
    const previewWrap = this._previewWrapRef.value;
    if (textareaWrap && previewWrap) setupScrollSync(textareaWrap, previewWrap);

    // Default date is set via reactive property, render initial preview
    renderPreview(root, this._previewRef.value);
    // Warn before accidental refresh
    window.addEventListener("beforeunload", (e) => {
      if (
        state.saving ||
        state.allPosts.some((p) => hasUnpublishedChanges(p)) ||
        state.allProjects.some((p) => hasUnpublishedChanges(p))
      ) {
        e.preventDefault();
      }
    });

    // Load posts, restore UI state, resume deploy polling
    this._initEditor(root);
  }

  // ─── Init (absorbed from init.ts) ────────────────────────────────────────

  private _initEditor(root: ShadowRoot): void {
    Promise.all([fetchPosts(), fetchProjects(), loadUIState()]).then(async ([posts, projects, uiState]) => {
      setState({ allPosts: posts, allProjects: projects });

      // Restore UI state
      if (uiState) {
        const sidebarEl = root.querySelector("#admin-sidebar") as HTMLElement | null;
        if (uiState.sidebarCollapsed && sidebarEl) {
          sidebarEl.setAttribute("state", "collapsed");
        }

        // Restore open post tabs
        const savedTabs = Array.isArray(uiState.openTabs) ? uiState.openTabs : [];
        const restoredTabs: Post[] = [];
        for (const slug of savedTabs) {
          const post = state.allPosts.find((p) => p.slug === slug);
          if (post && !restoredTabs.find((t) => t.slug === slug)) restoredTabs.push(post);
        }

        // Restore open project tabs
        const savedProjectTabs = Array.isArray(uiState.openProjectTabs) ? uiState.openProjectTabs : [];
        const restoredProjectTabs: Project[] = [];
        for (const slug of savedProjectTabs) {
          const project = state.allProjects.find((p) => p.slug === slug);
          if (project && !restoredProjectTabs.find((t) => t.slug === slug)) restoredProjectTabs.push(project);
        }

        setState({ openTabs: restoredTabs, openProjectTabs: restoredProjectTabs });

        // Restore active tab
        const savedType = uiState.activeTabType ?? "post";
        if (savedType === "project" && uiState.activeTab) {
          const activeProject = state.allProjects.find((p) => p.slug === uiState.activeTab);
          if (activeProject) {
            if (!restoredProjectTabs.find((t) => t.slug === activeProject.slug)) {
              setState({ openProjectTabs: [...state.openProjectTabs, activeProject] });
            }
            loadProjectIntoEditor(activeProject);
          } else if (restoredTabs.length > 0) {
            loadPostIntoEditor(restoredTabs[0]);
          }
        } else if (uiState.activeTab) {
          const activePost = state.allPosts.find((p) => p.slug === uiState.activeTab);
          if (activePost) {
            if (!restoredTabs.find((t) => t.slug === activePost.slug)) {
              setState({ openTabs: [...state.openTabs, activePost] });
            }
            loadPostIntoEditor(activePost);
          } else if (restoredTabs.length > 0) {
            loadPostIntoEditor(restoredTabs[0]);
          }
        } else if (restoredTabs.length > 0) {
          loadPostIntoEditor(restoredTabs[0]);
        }
      } else if (state.allPosts.length > 0) {
        setState({ openTabs: [state.allPosts[0]] });
        loadPostIntoEditor(state.allPosts[0]);
      }

      setState({ loaded: true });

      // Resume polling if there's an active deployment
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
    });
  }

  // ─── Post form event handlers ───────────────────────────────────────────

  private _onPostTitleInput(e: Event): void {
    this.postTitle = (e.target as any).value ?? "";
    this._scheduleAutoSave();
  }

  private _onPostDateChange(e: Event): void {
    this.postDate = (e.target as any).value ?? "";
    this._scheduleAutoSave();
  }

  private _onPostExcerptInput(e: Event): void {
    this.postExcerpt = (e.target as any).value ?? "";
    this._scheduleAutoSave();
  }

  private _onContentInput(e: Event): void {
    this.postContent = (e.target as HTMLTextAreaElement).value;
    this._scheduleAutoSave();
    triggerPreview();
  }
  // ─── Toolbar action handler (replaces setupToolbar) ─────────────────────────
  private _onToolbarAction(e: Event): void {
    const btn = (e.target as Element).closest?.("[data-action]") as HTMLElement | null;
    if (!btn) return;
    const ta = this._textareaRef.value;
    if (!ta) return;
    switch (btn.dataset.action) {
      case "bold": wrapSelection(ta, "**", "**"); break;
      case "italic": wrapSelection(ta, "*", "*"); break;
      case "h2": wrapSelection(ta, "\n## ", "\n"); break;
      case "h3": wrapSelection(ta, "\n### ", "\n"); break;
      case "link": wrapSelection(ta, "[", "](url)"); break;
      case "code": wrapSelection(ta, "`", "`"); break;
      case "codeblock": wrapSelection(ta, "\n```ts\n", "\n```\n"); break;
      case "image": this._openImageFilePicker(); break;
      case "ul": wrapSelection(ta, "\n- ", "\n"); break;
      case "ol": wrapSelection(ta, "\n1. ", "\n"); break;
      case "quote": wrapSelection(ta, "\n> ", "\n"); break;
    }
  }

  // ─── Textarea keydown (Tab key + Escape for context menu) ──────────────────
  private _onTextareaKeydown(e: Event): void {
    const ke = e as KeyboardEvent;
    if (ke.key === "Tab") {
      ke.preventDefault();
      const ta = this._textareaRef.value;
      if (ta) insertAtCursor(ta, "  ");
    }
  }
  // ─── Fullscreen preview (absorbed from fullscreen-preview.ts) ──────────────
  private _openFullscreenPreview(): void {
    const overlay = this._previewOverlayRef.value;
    const previewFull = this._previewFullRef.value;
    if (!overlay || !previewFull) return;

    if (state.activeTabType === "project") {
      const title = this.projectTitle;
      const description = this.projectDescription;
      const tech = this.projectTech.join(", ");
      const content = this.postContent;
      const project = state.allProjects.find((p) => p.slug === state.currentSlug);

      getMd().then((mdShiki) => {
        const highlighted = content ? mdShiki.render(content) : "";
        const techBadges = tech.split(",").map((t) => t.trim()).filter(Boolean)
          .map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("");
        previewFull.innerHTML = `
          <article>
            <a href="/portfolio" class="body-02 text-link" style="text-decoration:none;">← Back to portfolio</a>
            <h1 class="heading-02 mt-3">${title || "Untitled"}</h1>
            <p class="body-01 text-secondary mt-1">${description}</p>
            ${techBadges ? `<div class="tags mt-2">${techBadges}</div>` : ""}
            <div class="row gap-2 mt-2">
              ${project?.url ? `<ui-link size="s" href="${project.url}" external>Live</ui-link>` : ""}
              ${project?.repo ? `<ui-link size="s" href="${project.repo}" external>Source</ui-link>` : ""}
            </div>
            ${project?.image ? `<ui-image src="${project.image}" alt="${title}" style="width:100%;max-height:400px;--ui-image-fit:cover;--ui-image-bg:var(--fd-surface-secondary);border-radius:var(--fd-radius-md);margin-top:var(--fd-space-3);"></ui-image>` : ""}
            ${highlighted ? `<div class="post-content mt-4">${highlighted}</div>` : ""}
          </article>
        `;
        wrapCodeBlocks(previewFull);
        overlay.style.display = "flex";
      });
    } else {
      const title = this.postTitle;
      const date = this.postDate;
      const tags = this.postTags.join(", ");
      const content = this.postContent;
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
    }
  }

  private _closeFullscreenPreview(): void {
    const overlay = this._previewOverlayRef.value;
    if (overlay) overlay.style.display = "none";
  }

  private _onOverlayKeydown(e: Event): void {
    if ((e as KeyboardEvent).key === "Escape") this._closeFullscreenPreview();
  }



  // ─── Sidebar event handlers (replaces imperative addEventListener) ────────
  private _onSidebarSelect(e: Event): void {
    const value = (e as CustomEvent).detail?.value as string;
    if (!value) return;

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
  }

  private _onSidebarClick(e: Event): void {
    const target = (e.target as Element).closest?.("ui-button[id]");
    if (!target) return;
    if ((target as HTMLElement).id === "admin-new-post") this._onNewPost();
    if ((target as HTMLElement).id === "admin-new-project") this._onNewProject();
  }

  // ─── Ctrl+S keyboard shortcut (replaces keyboard.ts Ctrl+S handler) ────────
  private _onDocumentKeydown = (e: KeyboardEvent): void => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      this._onSave();
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this._onDocumentKeydown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._onDocumentKeydown);
  }
  // ─── Image upload via file picker (replaces upload.ts toolbar button handler) ─
  private _openImageFilePicker(): void {
    const ta = this._textareaRef.value;
    if (!ta) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.addEventListener("change", () => {
      if (!input.files) return;
      for (const file of input.files) {
        uploadFile(file, ta);
      }
    });
    input.click();
  }

  // ─── Textarea drag/drop/paste for image upload (replaces setupImageUpload) ──
  private _onTextareaDragover(e: Event): void {
    e.preventDefault();
    (e.target as HTMLTextAreaElement).classList.add("drag-over");
  }

  private _onTextareaDragleave(e: Event): void {
    (e.target as HTMLTextAreaElement).classList.remove("drag-over");
  }

  private _onTextareaDrop(e: Event): void {
    const de = e as DragEvent;
    de.preventDefault();
    (de.target as HTMLTextAreaElement).classList.remove("drag-over");
    const ta = this._textareaRef.value;
    if (!ta) return;
    const files = de.dataTransfer?.files;
    if (!files) return;
    for (const file of files) {
      if (file.type.startsWith("image/")) uploadFile(file, ta);
    }
  }

  private _onTextareaPaste(e: Event): void {
    const ce = e as ClipboardEvent;
    const items = ce.clipboardData?.items;
    if (!items) return;
    const ta = this._textareaRef.value;
    if (!ta) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        ce.preventDefault();
        const file = item.getAsFile();
        if (file) uploadFile(file, ta);
        return;
      }
    }
  }

  // ─── Publish/unpublish/export (replaces setupPublish) ─────────────────────
  private async _onPublishAction(): Promise<void> {
    this._publishStatus = "loading";
    const result = await publishCurrent();
    this._publishStatus = result;
    setTimeout(() => { this._publishStatus = "none"; }, result === "success" ? 1500 : 2000);
  }

  private async _onUnpublish(): Promise<void> {
    this._publishStatus = "loading";
    const result = await unpublishCurrent();
    this._publishStatus = result;
    setTimeout(() => { this._publishStatus = "none"; }, result === "success" ? 1500 : 2000);
  }
  private _onExport(): void {
    exportAsMarkdown();
  }

  private _onTagKeydown(e: Event): void {
    const ke = e as KeyboardEvent;
    if (ke.key !== "Enter") return;
    ke.preventDefault();
    const input = e.target as any;
    const name = (input.value ?? "").trim();
    if (!name) return;
    if (this.postTags.some(t => t.toLowerCase() === name.toLowerCase())) return;
    this.postTags = [...this.postTags, name];
    input.value = "";
    this._scheduleAutoSave();
    triggerPreview();
  }

  private _removeTag(name: string): void {
    this.postTags = this.postTags.filter(t => t !== name);
    this._scheduleAutoSave();
    triggerPreview();
  }

  // ─── Project form event handlers ────────────────────────────────────────

  private _onProjectTitleInput(e: Event): void {
    this.projectTitle = (e.target as any).value ?? "";
    this._scheduleAutoSave();
  }

  private _onProjectDescriptionInput(e: Event): void {
    this.projectDescription = (e.target as any).value ?? "";
    this._scheduleAutoSave();
  }

  private _onProjectUrlInput(e: Event): void {
    this.projectUrl = (e.target as any).value ?? "";
    this._scheduleAutoSave();
  }

  private _onProjectRepoInput(e: Event): void {
    this.projectRepo = (e.target as any).value ?? "";
    this._scheduleAutoSave();
  }

  private _onProjectPinnedChange(e: Event): void {
    this.projectPinned = (e.target as HTMLElement).hasAttribute("checked");
    this._scheduleAutoSave();
  }

  private _onProjectTechKeydown(e: Event): void {
    const ke = e as KeyboardEvent;
    if (ke.key !== "Enter") return;
    ke.preventDefault();
    const input = e.target as any;
    const name = (input.value ?? "").trim();
    if (!name) return;
    if (this.projectTech.some(t => t.toLowerCase() === name.toLowerCase())) return;
    this.projectTech = [...this.projectTech, name];
    input.value = "";
    this._scheduleAutoSave();
  }

  private _removeProjectTech(name: string): void {
    this.projectTech = this.projectTech.filter(t => t !== name);
    this._scheduleAutoSave();
  }

  // ─── Auto-save ─────────────────────────────────────────────────────────

  private _autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  private _scheduleAutoSave(): void {
    setState({});
    if (this._autoSaveTimer) clearTimeout(this._autoSaveTimer);
    this._autoSaveTimer = setTimeout(() => {
      if (state.activeTabType === "project") {
        if (state.currentSlug) this._doSave(false);
      } else {
        if (state.currentSlug || this.postContent.trim()) this._doSave(false);
      }
    }, 2000);
  }

  // ─── Public API (called by api.ts) ───────────────────────────────────────

  loadPost(post: Post): void {
    this.postTitle = post.title;
    this.postDate = post.date;
    this.postTags = post.tags.split(",").map(t => t.trim()).filter(Boolean);
    this.postExcerpt = post.excerpt;
    this.postContent = post.content;
    renderPreview(this.shadowRoot!, this._previewRef.value);
  }

  getPostData(): Omit<Post, "slug" | "updatedAt" | "publishedAt" | "persisted" | "publishedContent"> {
    return {
      title: this.postTitle,
      date: this.postDate,
      tags: this.postTags.join(", "),
      excerpt: this.postExcerpt,
      content: this.postContent,
      status: state.allPosts.find(p => p.slug === state.currentSlug)?.status ?? "draft",
    };
  }

  clearPost(): void {
    this.postTitle = "";
    this.postDate = new Date().toISOString().split("T")[0];
    this.postTags = [];
    this.postExcerpt = "";
    this.postContent = "";
    renderPreview(this.shadowRoot!, this._previewRef.value);
  }

  loadProject(project: Project): void {
    this.projectTitle = project.title;
    this.projectDescription = project.description;
    this.projectTech = project.tech.split(",").map(t => t.trim()).filter(Boolean);
    this.projectUrl = project.url;
    this.projectRepo = project.repo;
    this.projectImage = project.image;
    this.projectPinned = project.pinned;
    this.postContent = project.content;
    renderPreview(this.shadowRoot!, this._previewRef.value);
  }

  getProjectData(): Omit<Project, "slug" | "updatedAt" | "publishedAt" | "persisted" | "publishedContent"> {
    return {
      title: this.projectTitle,
      description: this.projectDescription,
      content: this.postContent,
      tech: this.projectTech.join(", "),
      url: this.projectUrl,
      repo: this.projectRepo,
      image: this.projectImage,
      pinned: this.projectPinned,
      sortOrder: 0,
      status: state.allProjects.find(p => p.slug === state.currentSlug)?.status ?? "draft",
    };
  }

  clearProject(): void {
    this.projectTitle = "";
    this.projectDescription = "";
    this.projectTech = [];
    this.projectUrl = "";
    this.projectRepo = "";
    this.projectImage = "";
    this.projectPinned = false;
    this.postContent = "";
  }

  // ─── Event handlers ──────────────────────────────────────────────────────────

  private _onNewPost(): void {
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
    this._scheduleAutoSave();
  }

  private _onNewProject(): void {
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
    this._scheduleAutoSave();
  }

  private async _onSave(): Promise<void> {
    if (state.saving) {
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (!state.saving) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
    }
    this._doSave(true);
  }

  private async _doSave(forceApi: boolean): Promise<void> {
    this._saveStatus = "loading";
    const result = state.activeTabType === "project"
      ? await saveCurrentProject(forceApi)
      : await saveCurrent(forceApi);
    this._saveStatus = result;
    setTimeout(() => { this._saveStatus = "none"; }, result === "success" ? 1500 : 2000);
  }

  // ─── Project image helpers ───────────────────────────────────────────────────

  private _openImageUpload(): void {
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
        this.projectImage = data.url;
        this._scheduleAutoSave();
      } catch { /* ignore */ }
    };
    input.click();
  }

  private _openImageGallery(): void {
    this._galleryRef.value?.show((url) => {
      this.projectImage = url;
      this._scheduleAutoSave();
    });
  }
}
