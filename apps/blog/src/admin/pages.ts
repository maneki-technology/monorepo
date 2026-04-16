/**
 * <admin-pages> — Admin page editor for about, resume, and other pages.
 * Layout matches the blog editor (sidebar with back nav, split pane with scroll sync).
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { unsafeCSS } from "lit";
import { loadAdminState, saveThemeToBackend, getPagesSelectedSlug, setPagesSelectedSlug } from "./theme.js";
import { getMd, mdSync, wrapCodeBlocks } from "../pages/editor/preview.js";
import { setupScrollSync } from "../pages/editor/scroll-sync.js";
import { TEXT_PRIMARY, TEXT_SECONDARY, BORDER_MINIMAL, FORM_INPUT_BG } from "@maneki/foundation";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-side-panel-menu.js";
import "@maneki/ui-components/components/ui-side-panel-menu-section.js";
import "@maneki/ui-components/components/ui-side-panel-menu-item.js";
import "@maneki/ui-components/components/ui-scrollbar.js";
// Components used in markdown preview
import "@maneki/ui-components/components/ui-link.js";
import "@maneki/ui-components/components/ui-image.js";
import "@maneki/ui-components/components/ui-accordion-item.js";

interface Page {
  slug: string;
  title: string;
  content: string;
  description: string;
  styles: string;
  status: string;
  updated_at: string;
}

@customElement("admin-pages")
export class AdminPages extends LitElement {
  @state() declare _ready: boolean;
  @state() declare _pages: Page[];
  @state() declare _selectedSlug: string | null;
  @state() declare _saveStatus: string;
  @state() declare _showPreview: boolean;
  private _originalSlug: string | null = null;

  private _textareaWrapRef: Ref<HTMLElement> = createRef();
  private _previewWrapRef: Ref<HTMLElement> = createRef();
  private _scrollSyncSetup = false;

  constructor() {
    super();
    this._ready = false;
    this._pages = [];
    this._selectedSlug = null;
    this._saveStatus = "";
    this._showPreview = false;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("theme-change", () => saveThemeToBackend());
    loadAdminState().then(() => {
      this._fetchPages().then(() => {
        const saved = getPagesSelectedSlug();
        if (saved && this._pages.find((p) => p.slug === saved)) {
          this._selectedSlug = saved;
          this._originalSlug = saved;
        } else if (this._pages.length) {
          this._selectedSlug = this._pages[0].slug;
          this._originalSlug = this._pages[0].slug;
        }
        this._ready = true;
      });
    });
  }

  // ── Data ──

  private async _fetchPages(): Promise<void> {
    try {
      const res = await fetch("/api/pages", { credentials: "same-origin" });
      if (!res.ok) return;
      const data = (await res.json()) as { pages: Page[] };
      this._pages = data.pages;
    } catch {
      /* ignore */
    }
  }

  private get _selected(): Page | undefined {
    return this._pages.find((p) => p.slug === this._selectedSlug);
  }

  // ── Actions ──

  private async _save(): Promise<void> {
    const page = this._selected;
    if (!page) return;

    const originalSlug = this._originalSlug ?? page.slug;
    const body: Record<string, string> = {
      title: page.title,
      content: page.content,
      description: page.description,
      styles: page.styles,
    };
    if (page.slug !== originalSlug) body.new_slug = page.slug;

    try {
      const res = await fetch(`/api/pages/${originalSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        this._saveStatus = "success";
        this._originalSlug = page.slug;
        this._selectedSlug = page.slug;
        setPagesSelectedSlug(page.slug);
      } else {
        this._saveStatus = "error";
      }
    } catch {
      this._saveStatus = "error";
    }
    setTimeout(() => {
      this._saveStatus = "";
    }, 1500);
  }

  private async _togglePublish(page: Page): Promise<void> {
    const newStatus = page.status === "published" ? "draft" : "published";
    try {
      await fetch(`/api/pages/${page.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: newStatus }),
      });
      page.status = newStatus;
      this.requestUpdate();
    } catch {
      /* ignore */
    }
  }

  private async _deletePage(page: Page): Promise<void> {
    try {
      await fetch(`/api/pages/${page.slug}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      this._pages = this._pages.filter((p) => p.slug !== page.slug);
      if (this._selectedSlug === page.slug) { this._selectedSlug = null; setPagesSelectedSlug(null); }
    } catch {
      /* ignore */
    }
  }

  private async _createPage(): Promise<void> {
    const slug = `page-${Date.now().toString(36)}`;
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ slug, title: "", content: "", description: "", status: "draft" }),
      });
      if (res.ok) {
        const data = (await res.json()) as { page: Page };
        this._pages = [...this._pages, data.page];
        this._selectedSlug = data.page.slug; this._originalSlug = data.page.slug; setPagesSelectedSlug(data.page.slug);
      }
    } catch {
      /* ignore */
    }
  }

  private _autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  private _onInput(): void {
    this._updatePreview();
    if (this._autoSaveTimer) clearTimeout(this._autoSaveTimer);
    this._autoSaveTimer = setTimeout(() => this._save(), 1000);
  }

  // ── Preview ──

  private _previewTimer: ReturnType<typeof setTimeout> | null = null;

  private _updatePreview(): void {
    if (!this._showPreview) return;
    if (this._previewTimer) clearTimeout(this._previewTimer);
    this._previewTimer = setTimeout(() => this._renderPreview(), 200);
  }

  private _renderPreview(): void {
    const page = this._selected;
    const previewEl = this.shadowRoot!.querySelector<HTMLElement>("#page-preview");
    if (!previewEl || !page) return;

    const titleHtml = `<h1 class="heading-02">${page.title || "Untitled"}</h1>`;
    const styleTag = page.styles ? `<style>#page-preview { ${page.styles} }</style>` : "";

    previewEl.innerHTML = `${styleTag}<article>${titleHtml}<div class="post-content mt-4">${mdSync.render(page.content)}</div></article>`;
    getMd().then((mdShiki) => {
      const highlighted = mdShiki.render(page.content);
      previewEl.innerHTML = `${styleTag}<article>${titleHtml}<div class="post-content mt-4">${highlighted}</div></article>`;
      wrapCodeBlocks(previewEl);
    });
  }

  private _setupScrollSync(): void {
    if (this._scrollSyncSetup) return;
    const textareaWrap = this._textareaWrapRef.value;
    const previewWrap = this._previewWrapRef.value;
    if (textareaWrap && previewWrap) {
      setupScrollSync(textareaWrap, previewWrap);
      this._scrollSyncSetup = true;
    }
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("_showPreview") && this._showPreview) {
      this._scrollSyncSetup = false;
      requestAnimationFrame(() => {
        this._renderPreview();
        this._setupScrollSync();
      });
    }
    if (changed.has("_selectedSlug")) {
      this._scrollSyncSetup = false;
      if (this._showPreview) {
        requestAnimationFrame(() => {
          this._renderPreview();
          this._setupScrollSync();
        });
      }
    }
  }

  // ── Styles (matches editor layout) ──

  static styles = css`
    :host {
      display: flex;
      height: 100vh;
      overflow: hidden;
      font-family: Geist, sans-serif;
    }

    /* ── Form (same as editor .admin-form) ── */

    .admin-form {
      padding: 12px;
      border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7);
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex-shrink: 0;
    }

    .admin-form-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* ── Toolbar (same as editor .admin-toolbar) ── */

    .admin-toolbar {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7);
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .spacer {
      flex: 1;
    }

    /* ── Main area ── */

    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    /* ── Split pane (same as editor .admin-split) ── */

    .admin-split {
      flex: 1;
      display: flex;
      min-height: 0;
    }

    .admin-split ui-scrollbar {
      flex: 1;
    }

    .admin-textarea-wrap {
      border-right: 1px solid var(--fd-border-minimal, #e4e4e7);
      background: var(--fd-surface-primary, #fff);
    }

    #page-content {
      width: 100%;
      min-height: 100%;
      resize: none;
      border: none;
      padding: 16px;
      font-family: "Geist Mono", monospace;
      font-size: 13px;
      line-height: 1.6;
      background: var(--fd-surface-primary, #fff);
      color: ${unsafeCSS(TEXT_PRIMARY)};
      outline: none;
      tab-size: 2;
      overflow: hidden;
      box-sizing: border-box;
      field-sizing: content;
    }

    .styles-textarea {
      width: 100%;
      min-height: 160px;
      resize: vertical;
      font-family: "Geist Mono", monospace;
      font-size: 12px;
      line-height: 1.5;
      padding: 8px;
      border: 1px solid var(--fd-border-minimal, #e4e4e7);
      border-radius: 6px;
      background: var(--fd-surface-primary, #fff);
      color: var(--fd-text-primary, #27272a);
      outline: none;
      margin-top: 8px;
      box-sizing: border-box;
    }

    .styles-textarea:focus {
      border-color: var(--fd-border-focus, #186ade);
    }
    .admin-textarea-spacer {
      height: 25vh;
      background: var(--fd-surface-primary, #fff);
    }

    /* ── Preview (matches public page styles from index.html) ── */

    .admin-preview {
      padding: 16px 24px;
      background: var(--fd-surface-primary, #fff);
    }

    .heading-02 {
      font-size: var(--fd-type-heading-02-font-size, 32px);
      line-height: var(--fd-type-heading-02-line-height, 40px);
      font-weight: var(--fd-type-heading-02-font-weight, 500);
      margin: 0;
    }

    .mt-4 { margin-top: var(--fd-space-4, 32px); }

    .post-content h2 { font-size: var(--fd-type-heading-03-font-size); line-height: var(--fd-type-heading-03-line-height); font-weight: var(--fd-type-heading-03-font-weight); margin: var(--fd-space-6) 0 var(--fd-space-2); }
    .post-content h3 { font-size: var(--fd-type-heading-04-font-size); line-height: var(--fd-type-heading-04-line-height); font-weight: var(--fd-type-heading-04-font-weight); margin: var(--fd-space-4) 0 var(--fd-space-1-5); }
    .post-content h4 { font-size: var(--fd-type-heading-05-font-size); line-height: var(--fd-type-heading-05-line-height); font-weight: var(--fd-type-heading-05-font-weight); margin: var(--fd-space-3) 0 var(--fd-space-1); }
    .post-content p { font-size: var(--fd-type-body-01-font-size); line-height: var(--fd-type-body-01-line-height); margin: 0 0 var(--fd-space-2); }
    .post-content ul, .post-content ol { font-size: var(--fd-type-body-01-font-size); line-height: var(--fd-type-body-01-line-height); margin: 0 0 var(--fd-space-2); padding-left: var(--fd-space-3); }
    .post-content li { margin-bottom: var(--fd-space-0-5); }
    .post-content pre {
      border: 1px solid var(--fd-border-minimal, #e4e4e7);
      border-radius: var(--fd-radius-sm);
      padding: var(--fd-space-2);
      overflow-x: auto;
      margin: 0 0 var(--fd-space-2);
      font-family: 'Roboto Mono', monospace;
      font-size: var(--fd-type-code-01-font-size);
      line-height: var(--fd-type-code-01-line-height);
    }
    .post-content code {
      font-family: 'Roboto Mono', monospace;
      font-size: var(--fd-type-code-02-font-size);
      background: var(--fd-surface-secondary, #f4f4f5);
      padding: 2px 6px;
      border-radius: var(--fd-radius-sm);
    }
    .post-content pre code { background: none; padding: 0; border-radius: 0; }
    .post-content ui-image { --ui-image-bg: transparent; --ui-image-fit: contain; display: block; max-width: 100%; margin: var(--fd-space-2) 0; }
    .post-content img { max-width: 100%; border-radius: var(--fd-radius-sm); margin: 0 0 var(--fd-space-2); }
    .post-content blockquote {
      border-left: 3px solid var(--fd-border-moderate, #a1a1aa);
      padding-left: var(--fd-space-2);
      margin: 0 0 var(--fd-space-2);
      color: var(--fd-text-secondary, #52525b);
      font-style: italic;
    }
    .post-content a { color: var(--fd-global-brand, #186ade); text-decoration: none; }
    .post-content a:hover { text-decoration: underline; }
    .post-content hr { border: none; border-top: 1px solid var(--fd-border-minimal, #e4e4e7); margin: var(--fd-space-3) 0; }

    /* Shiki dual-theme */
    .post-content pre.shiki, .post-content pre.shiki span { color: var(--shiki-light); background-color: var(--shiki-light-bg); }
    :host-context([data-theme="heroui-dark"]) .post-content pre.shiki,
    :host-context([data-theme="heroui-dark"]) .post-content pre.shiki span { color: var(--shiki-dark); background-color: var(--shiki-dark-bg); }

    /* Utility classes (same as public page index.html) */
    .heading-02 { font-size: var(--fd-type-heading-02-font-size, 32px); line-height: var(--fd-type-heading-02-line-height, 40px); font-weight: var(--fd-type-heading-02-font-weight, 500); margin: 0; }
    .heading-03 { font-size: var(--fd-type-heading-03-font-size); line-height: var(--fd-type-heading-03-line-height); font-weight: var(--fd-type-heading-03-font-weight); }
    .heading-04 { font-size: var(--fd-type-heading-04-font-size); line-height: var(--fd-type-heading-04-line-height); font-weight: var(--fd-type-heading-04-font-weight); }
    .heading-05 { font-size: var(--fd-type-heading-05-font-size); line-height: var(--fd-type-heading-05-line-height); font-weight: var(--fd-type-heading-05-font-weight); }
    .body-01 { font-size: var(--fd-type-body-01-font-size); line-height: var(--fd-type-body-01-line-height); font-weight: var(--fd-type-body-01-font-weight); }
    .body-02 { font-size: var(--fd-type-body-02-font-size); line-height: var(--fd-type-body-02-line-height); font-weight: var(--fd-type-body-02-font-weight); }
    .body-03 { font-size: var(--fd-type-body-03-font-size); line-height: var(--fd-type-body-03-line-height); font-weight: var(--fd-type-body-03-font-weight); }
    .text-secondary { color: var(--fd-text-secondary, #52525b); }
    .mt-1 { margin-top: var(--fd-space-1); }
    .mt-2 { margin-top: var(--fd-space-2); }
    .mt-3 { margin-top: var(--fd-space-3); }
    .mt-4 { margin-top: var(--fd-space-4); }
    .mb-1 { margin-bottom: var(--fd-space-1); }
    .mb-2 { margin-bottom: var(--fd-space-2); }
    .mb-3 { margin-bottom: var(--fd-space-3); }
    .mb-4 { margin-bottom: var(--fd-space-4); }
    .gap-1 { gap: var(--fd-space-1); }
    .gap-2 { gap: var(--fd-space-2); }
    .gap-3 { gap: var(--fd-space-3); }
    .gap-4 { gap: var(--fd-space-4); }
    .stack { display: flex; flex-direction: column; }
    .row { display: flex; flex-wrap: wrap; }
    .reveal { opacity: 1; }
    .post-content pre.shiki, .post-content pre.shiki span { color: var(--shiki-light); background-color: var(--shiki-light-bg); }
    :host-context([data-theme="heroui-dark"]) .post-content pre.shiki,
    :host-context([data-theme="heroui-dark"]) .post-content pre.shiki span { color: var(--shiki-dark); background-color: var(--shiki-dark-bg); }

    /* ── Sidebar footer ── */

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid var(--fd-border-minimal, #e4e4e7);
    }

    /* ── Empty state ── */

    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${unsafeCSS(TEXT_SECONDARY)};
      font-size: 14px;
    }

    /* ── Create modal ── */

    .create-form {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .create-form .admin-form-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `;

  // ── Render ──

  render() {
    if (!this._ready) return html`<loading-bounce></loading-bounce>`;

    const page = this._selected;

    return html`
      <ui-side-panel-menu>
        <span slot="header" style="display:flex;align-items:center;gap:8px;">
          <ui-button
            action="secondary"
            emphasis="minimal"
            size="s"
            @click=${() => {
              window.location.href = "/admin";
            }}
          >
            <ui-icon name="chevron_left" size="s" slot="icon-start"></ui-icon>
            Admin
          </ui-button>
          <span style="font-size:13px;font-weight:600;">Pages</span>
        </span>
        <ui-side-panel-menu-section>
          <span style="display:flex;align-items:center;justify-content:space-between;width:100%;">
            Pages
            <ui-button
              action="primary"
              emphasis="minimal"
              size="s"
              icon="icon-only"
              aria-label="New Page"
              @click=${() => this._createPage()}
            ><ui-icon name="add" size="s" slot="icon-start"></ui-icon></ui-button>
          </span>
        </ui-side-panel-menu-section>
        ${this._pages.map(
          (p) => html`
            <ui-side-panel-menu-item
              value=${p.slug}
              ?selected=${p.slug === this._selectedSlug}
              @click=${() => { if (this._autoSaveTimer) { clearTimeout(this._autoSaveTimer); this._autoSaveTimer = null; } this._selectedSlug = p.slug; this._originalSlug = p.slug; setPagesSelectedSlug(p.slug); }}
            >
              <span style="display:flex;flex-direction:column;gap:2px;overflow:hidden;">
                <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.title || "Untitled"}</span>
                <span style="font-size:11px;color:var(--fd-text-secondary,#71717a);display:flex;align-items:center;gap:6px;">
                  /${p.slug}
                  <ui-badge size="xs" status=${p.status === "published" ? "success" : "warning"}>${p.status}</ui-badge>
                </span>
              </span>
              <ui-button
                slot="actions"
                action="destructive"
                emphasis="minimal"
                size="s"
                icon="icon-only"
                style="flex-shrink:0;opacity:0;transition:opacity 0.15s;"
                @click=${(e: Event) => { e.stopPropagation(); this._deletePage(p); }}
              >
                <ui-icon name="delete" size="s" slot="icon-start"></ui-icon>
              </ui-button>
            </ui-side-panel-menu-item>
          `,
        )}
      </ui-side-panel-menu>
      <div class="admin-main">
        ${page ? this._renderEditor(page) : html`<div class="empty-state">Select a page to edit</div>`}
      </div>
    `;
  }

  private _renderEditor(page: Page) {
    return html`
      <div class="admin-form">
        <div class="admin-form-row" style="flex-direction:row;gap:8px;">
          <div class="admin-form-row" style="flex:0 0 200px;">
            <ui-input id="page-slug" placeholder="slug" size="m" .value=${page.slug} @input=${(e: Event) => { page.slug = (e.target as HTMLInputElement).value; this._onInput(); }}>
              <ui-label slot="label" size="m">Slug (URL path)</ui-label>
            </ui-input>
          </div>
          <div class="admin-form-row" style="flex:1;min-width:0;">
            <ui-input id="page-title" placeholder="Page title" size="m" .value=${page.title} @input=${(e: Event) => { page.title = (e.target as HTMLInputElement).value; this._onInput(); }}>
              <ui-label slot="label" size="m">Title</ui-label>
            </ui-input>
          </div>
        </div>
        <div class="admin-form-row">
          <ui-input id="page-description" placeholder="Short description for SEO" size="m" .value=${page.description} @input=${(e: Event) => { page.description = (e.target as HTMLInputElement).value; this._onInput(); }}>
            <ui-label slot="label" size="m">Description</ui-label>
          </ui-input>
        </div>
      </div>
      <div class="admin-toolbar">
        <ui-button
          action="secondary"
          size="s"
          @click=${() => {
            this._showPreview = !this._showPreview;
          }}
        >
          <ui-icon name=${this._showPreview ? "visibility_off" : "visibility"} size="s" slot="icon-start"></ui-icon>
          ${this._showPreview ? "Hide Preview" : "Preview"}
        </ui-button>
        <ui-button
          action=${page.status === "published" ? "secondary" : "primary"}
          emphasis="subtle"
          size="s"
          @click=${() => this._togglePublish(page)}
          >${page.status === "published" ? "Unpublish" : "Publish"}</ui-button
        >
        <ui-button action="destructive" emphasis="subtle" size="s" @click=${() => this._deletePage(page)}
          >Delete</ui-button
        >
        <span class="spacer"></span>
        <ui-button action="primary" size="s" status=${this._saveStatus} @click=${() => this._save()}>Save</ui-button>
      </div>
      <div class="admin-split">
        <ui-scrollbar ${ref(this._textareaWrapRef)} emphasis="minimal" class="admin-textarea-wrap">
          <ui-accordion-item size="s" emphasis="subtle" style="--ui-acc-content-padding:0;padding:0 16px;">
            <span slot="label">Page Styles (CSS)</span>
            <textarea id="page-styles" class="styles-textarea" .value=${page.styles} @input=${(e: Event) => { page.styles = (e.target as HTMLTextAreaElement).value; this._onInput(); }}></textarea>
          </ui-accordion-item>
          <textarea id="page-content" .value=${page.content} @input=${(e: Event) => { page.content = (e.target as HTMLTextAreaElement).value; this._onInput(); }}></textarea>
          <div class="admin-textarea-spacer"></div>
        </ui-scrollbar>
        ${this._showPreview
          ? html`<ui-scrollbar ${ref(this._previewWrapRef)} emphasis="minimal"
              ><div id="page-preview" class="admin-preview"></div
            ></ui-scrollbar>`
          : nothing}
      </div>
    `;
  }

  }
