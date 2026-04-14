import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import type { Post, Project } from "./types.js";
import { state, setState, hasUnpublishedChanges } from "./state.js";
import { setUIStateRoot, setDomRoot, saveUIState, saveCurrent, saveCurrentProject, loadPostIntoEditor, loadProjectIntoEditor } from "./api.js";
import { renderPreview, triggerPreview } from "./preview.js";
import { setupToolbar, insertAtCursor } from "./toolbar.js";
import { setupImageUpload } from "./upload.js";
import { initGallery, toggleGallery, openGalleryForPick } from "./gallery.js";
import { setupContextMenu } from "./context-menu.js";
import { setupScrollSync } from "./scroll-sync.js";
import { setupUndoStack } from "./undo.js";
import { openPortfolioLayout, setProjectPreviewRoot } from "./project-preview.js";
import { setupPublish } from "./publish.js";
import { setupDeleteModal } from "./delete-modal.js";
import { setupKeyboard } from "./keyboard.js";
import { setupFullscreenPreview } from "./fullscreen-preview.js";
import { setupTags } from "./tags.js";
import { setupInit } from "./init.js";
import { EditorStoreController } from "./editor-store.js";
import { setSidebarRoot } from "./sidebar.js";

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
        <ui-side-panel-menu id="admin-sidebar" style="display:${s.loaded ? "" : "none"}">
          <span slot="header" style="display:flex;align-items:center;gap:8px;">
            <ui-button action="secondary" emphasis="minimal" size="s" @click=${() => { window.location.href = "/admin"; }}>
              <ui-icon name="chevron_left" size="s" slot="icon-start"></ui-icon>
              Admin
            </ui-button>
            <span style="font-size:13px;font-weight:600;">Editor</span>
          </span>
          <ui-side-panel-menu-section separator>
            <span style="display:flex;align-items:center;justify-content:space-between;width:100%;">
              Posts
              <ui-button id="admin-new-post" action="primary" emphasis="minimal" size="s" icon="icon-only" aria-label="New Post" @click=${() => this._onNewPost()}>
                <ui-icon name="add" size="s" slot="icon-start"></ui-icon>
              </ui-button>
            </span>
          </ui-side-panel-menu-section>
          <div id="admin-post-list"></div>
          <ui-side-panel-menu-section separator>
            <span style="display:flex;align-items:center;justify-content:space-between;width:100%;">
              Projects
              <ui-button id="admin-new-project" action="primary" emphasis="minimal" size="s" icon="icon-only" aria-label="New Project" @click=${() => this._onNewProject()}>
                <ui-icon name="add" size="s" slot="icon-start"></ui-icon>
              </ui-button>
            </span>
          </ui-side-panel-menu-section>
          <div id="admin-project-list"></div>
        </ui-side-panel-menu>
        <div class="admin-main">
          <div id="admin-tab-bar" class="admin-tab-bar" style="display:${s.loaded ? "" : "none"}"></div>
          <loading-bounce id="admin-loading" style="display:${s.loaded ? "none" : ""}"></loading-bounce>
          <div id="admin-editor-main" class="admin-editor" style="display:${s.loaded ? "" : "none"}">
            <div id="admin-post-form" class="admin-form" style="display:${s.activeTabType === "project" ? "none" : ""}">
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
            <div id="admin-project-form" class="admin-form" style="display:${s.activeTabType === "project" ? "" : "none"}">
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
                    <ui-button id="admin-project-image-upload" action="secondary" emphasis="subtle" size="s" @click=${() => this._openImageUpload()}>Upload</ui-button>
                    <ui-button id="admin-project-image-gallery" action="secondary" emphasis="subtle" size="s" @click=${() => this._openImageGallery()}>Gallery</ui-button>
                  </div>
                  <div id="admin-project-image-filled" class="project-image-thumb" style="display:none;">
                    <ui-image id="admin-project-image-preview" style="width:200px;--ui-image-height:120px;--ui-image-bg:var(--fd-surface-secondary);--ui-image-fit:cover;border-radius:var(--fd-radius-sm);">
                      <span id="admin-project-image-caption" slot="caption"></span>
                    </ui-image>
                    <div class="project-image-overlay">
                      <ui-button action="contrast" emphasis="minimal" size="m" icon="icon-only" aria-label="Upload" @click=${() => this._openImageUpload()}><ui-icon name="upload" size="m" slot="icon-start"></ui-icon></ui-button>
                      <ui-button action="contrast" emphasis="minimal" size="m" icon="icon-only" aria-label="Gallery" @click=${() => this._openImageGallery()}><ui-icon name="grid_view" size="m" slot="icon-start"></ui-icon></ui-button>
                      <ui-button action="destructive" emphasis="minimal" size="m" icon="icon-only" aria-label="Remove" @click=${() => this._setProjectImage("")}><ui-icon name="delete" size="m" slot="icon-start"></ui-icon></ui-button>
                    </div>
                  </div>
                  <input id="admin-project-image" type="hidden" />
                </div>
              </div>
            </div>
            <ui-toolbar class="admin-toolbar" aria-label="Editor toolbar">
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
                <ui-button icon="icon-only" id="admin-gallery-btn" aria-label="Image gallery" @click=${toggleGallery}><ui-icon name="grid_view" size="s" slot="icon-start"></ui-icon></ui-button>
              </ui-button-group>
              <ui-toolbar-separator></ui-toolbar-separator>
              <ui-button-group action="secondary">
                <ui-button icon="icon-only" data-action="ul" aria-label="Bullet list"><ui-icon name="format_list_bulleted" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="ol" aria-label="Numbered list"><ui-icon name="format_list_numbered" size="s" slot="icon-start"></ui-icon></ui-button>
                <ui-button icon="icon-only" data-action="quote" aria-label="Quote"><ui-icon name="format_quote" size="s" slot="icon-start"></ui-icon></ui-button>
              </ui-button-group>
              <span style="flex:1"></span>
              <ui-button id="admin-preview-btn" action="secondary" emphasis="subtle" size="s">Preview</ui-button>
              <ui-button id="admin-portfolio-btn" action="secondary" emphasis="subtle" size="s" style="display:${s.activeTabType === "project" ? "" : "none"}" @click=${openPortfolioLayout}>Portfolio</ui-button>
              <ui-button id="admin-save-btn" action="primary" size="s" @click=${() => this._onSave()}>Save</ui-button>
              <ui-dropdown-split id="admin-publish-split" action="primary" size="s" label="Publish">
                <ui-dropdown-item id="admin-unpublish-btn" value="unpublish">Unpublish</ui-dropdown-item>
                <ui-dropdown-item id="admin-export-btn" value="export">Export .md</ui-dropdown-item>
              </ui-dropdown-split>
            </ui-toolbar>
            <div class="admin-split">
              <ui-scrollbar emphasis="minimal" class="admin-textarea-wrap">
                <textarea id="admin-content" placeholder="Write your post in Markdown..." spellcheck="false"></textarea>
                <div class="admin-textarea-spacer"></div>
              </ui-scrollbar>
              <ui-scrollbar emphasis="minimal"><div id="admin-preview" class="admin-preview"></div></ui-scrollbar>
            </div>
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
      </div>
    `;
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  protected firstUpdated(): void {
    const root = this.shadowRoot!;

    // Set root references for modules that need them
    setDomRoot(root);
    setUIStateRoot(root);
    setSidebarRoot(root);
    setProjectPreviewRoot(root);

    const textarea = root.querySelector("#admin-content") as HTMLTextAreaElement;
    const titleInput = root.querySelector("#admin-title") as HTMLElement;
    const dateInput = root.querySelector("#admin-date") as HTMLElement;
    const tagsInput = root.querySelector("#admin-tags") as HTMLInputElement;
    const tagInput = root.querySelector("#admin-tag-input") as HTMLInputElement;
    const tagList = root.querySelector("#admin-tag-list")!;
    const excerptInput = root.querySelector("#admin-excerpt") as HTMLElement;
    const publishSplit = root.querySelector("#admin-publish-split") as HTMLElement | null;


    // Buttons inside ui-side-panel-menu-section — Lit @click doesn't attach listeners,
    // and imperative listeners get lost when EditorStoreController triggers re-renders.
    // Use event delegation on the sidebar (stable node) instead.
    const sidebarEl = root.querySelector("#admin-sidebar")!;
    sidebarEl.addEventListener("click", (e: Event) => {
      const target = (e.target as Element).closest?.("ui-button[id]");
      if (!target) return;
      if (target.id === "admin-new-post") this._onNewPost();
      if (target.id === "admin-new-project") this._onNewProject();
    });
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
        const saveBtn = root.querySelector("#admin-save-btn") as HTMLElement | null;
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
    const projectFields = [
      "admin-project-title",
      "admin-project-description",
      "admin-project-url",
      "admin-project-repo",
      "admin-project-image",
    ];
    for (const id of projectFields) {
      root.querySelector(`#${id}`)?.addEventListener("input", autoSave);
    }
    root.querySelector("#admin-project-pinned")?.addEventListener("change", autoSave);

    // Toolbar + plugins
    setupToolbar(textarea, root);
    setupImageUpload(textarea, root);
    initGallery((url, name) => insertAtCursor(textarea, `![${name}](${url})`), root);
    setupContextMenu(textarea);
    setupUndoStack(textarea);

    // Scroll sync between textarea and preview
    const textareaWrap = root.querySelector(".admin-textarea-wrap") as HTMLElement;
    const previewWrap = root.querySelector(".admin-split ui-scrollbar:last-child") as HTMLElement;
    if (textareaWrap && previewWrap) setupScrollSync(textareaWrap, previewWrap);

    // Publish + delete + keyboard + fullscreen
    setupPublish(publishSplit, textarea, root);
    setupDeleteModal(root);
    setupKeyboard(textarea, root);
    setupFullscreenPreview(textarea, titleInput, dateInput, tagsInput, root);

    // Tags
    setupTags(tagInput, tagList as HTMLElement, tagsInput);

    // Project tech tags
    const projectTechInput = root.querySelector("#admin-project-tech-input") as HTMLInputElement;
    const projectTechList = root.querySelector("#admin-project-tech-list") as HTMLElement;
    const projectTechHidden = root.querySelector("#admin-project-tech") as HTMLInputElement;
    if (projectTechInput && projectTechList && projectTechHidden) {
      setupTags(projectTechInput, projectTechList, projectTechHidden);
    }

    // Set default date + render initial state
    if (!(dateInput as any).value) (dateInput as any).value = new Date().toISOString().split("T")[0];
    renderPreview(root);

    // Sidebar events
    const sidebar = root.querySelector("#admin-sidebar")!;
    sidebar.addEventListener("select", ((e: CustomEvent) => {
      const value = e.detail?.value as string;
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
    }) as EventListener);

    sidebar.addEventListener("toggle", () => saveUIState());

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
    setupInit(root);
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
    const saveBtn = this.shadowRoot!.querySelector("#admin-save-btn") as HTMLElement | null;
    if (state.activeTabType === "project") {
      saveCurrentProject(true, saveBtn);
    } else {
      saveCurrent(true, saveBtn);
    }
  }

  // ─── Project image helpers ───────────────────────────────────────────────────

  private _setProjectImage(url: string): void {
    const root = this.shadowRoot!;
    const imageHidden = root.querySelector("#admin-project-image") as HTMLInputElement;
    const imagePreview = root.querySelector("#admin-project-image-preview") as HTMLElement;
    const imageEmpty = root.querySelector("#admin-project-image-empty") as HTMLElement;
    const imageFilled = root.querySelector("#admin-project-image-filled") as HTMLElement;
    const imageCaption = root.querySelector("#admin-project-image-caption") as HTMLElement;

    imageHidden.value = url;
    imageHidden.dispatchEvent(new Event("input", { bubbles: true }));
    const filename = url ? (url.split("/").pop() ?? url) : "";
    imageCaption.textContent = filename;
    imagePreview.setAttribute("src", url);
    imageEmpty.style.display = url ? "none" : "flex";
    imageFilled.style.display = url ? "" : "none";
  }

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
        this._setProjectImage(data.url);
      } catch {
        /* ignore */
      }
    };
    input.click();
  }

  private _openImageGallery(): void {
    openGalleryForPick((url) => this._setProjectImage(url));
  }
}
