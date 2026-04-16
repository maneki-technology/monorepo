import { LitElement, html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { state, setState, hasUnpublishedChanges } from "./state.js";
import { saveUIState, loadPostIntoEditor, loadProjectIntoEditor, clearEditor } from "./api.js";
import type { Post, Project } from "./types.js";
import { EditorStoreController } from "./editor-store.js";

@customElement("editor-tabbar")
export class EditorTabbar extends LitElement {
  private store = new EditorStoreController(this);

  createRenderRoot(): this {
    return this;
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  protected render(): unknown {
    const s = this.store.state;

    return html`
      <ui-tab-group
        size="m"
        closable
        addable
        @tab-close=${this._onTabClose}
        @tab-change=${this._onTabChange}
        @tab-add=${this._onTabAdd}
      >
        ${repeat(
          s.openTabs,
          (tab) => tab.slug,
          (tab) => this._renderPostTab(tab),
        )}
        ${repeat(
          s.openProjectTabs,
          (tab) => tab.slug,
          (tab) => this._renderProjectTab(tab),
        )}
      </ui-tab-group>
      <div class="admin-tab-bar-actions">
        <theme-toggle></theme-toggle>
      </div>
      </div>
    `;
  }

  // ─── Tab templates ─────────────────────────────────────────────────────────

  private _renderPostTab(tab: Post): unknown {
    const s = this.store.state;
    const isActive = tab.slug === s.currentSlug && s.activeTabType === "post";
    const unsaved = s.dirtySlugs.has(tab.slug);
    const unpublished = hasUnpublishedChanges(tab);
    const indicator = unsaved
      ? html`<span style="color:var(--fd-status-surface-warning-bold, #f59e0b)">●</span> `
      : unpublished
        ? html`<span style="color:var(--fd-surface-destructive, #d91f11)">●</span> `
        : nothing;

    return html`
      <ui-tab-item value=${tab.slug} label=${tab.title || "Untitled"} ?selected=${isActive}>
        <span slot="prefix">${indicator}📝</span>
      </ui-tab-item>
    `;
  }

  private _renderProjectTab(tab: Project): unknown {
    const s = this.store.state;
    const isActive = tab.slug === s.currentSlug && s.activeTabType === "project";
    const unsaved = s.dirtySlugs.has(tab.slug);
    const unpublished = hasUnpublishedChanges(tab);
    const indicator = unsaved
      ? html`<span style="color:var(--fd-status-surface-warning-bold, #f59e0b)">●</span> `
      : unpublished
        ? html`<span style="color:var(--fd-surface-destructive, #d91f11)">●</span> `
        : nothing;

    return html`
      <ui-tab-item value=${"project:" + tab.slug} label=${tab.title || "Untitled"} ?selected=${isActive}>
        <span slot="prefix">${indicator}📦</span>
      </ui-tab-item>
    `;
  }

  // ─── Event handlers ──────────────────────────────────────────────────────────

  private _onTabClose(e: CustomEvent): void {
    const value = e.detail?.value as string;
    if (!value) return;

    if (value.startsWith("project:")) {
      const slug = value.slice(8);
      setState({ openProjectTabs: state.openProjectTabs.filter((d) => d.slug !== slug) });
      saveUIState();
      if (state.currentSlug === slug && state.activeTabType === "project") {
        if (state.openProjectTabs.length > 0) {
          loadProjectIntoEditor(state.openProjectTabs[state.openProjectTabs.length - 1]);
        } else if (state.openTabs.length > 0) {
          loadPostIntoEditor(state.openTabs[state.openTabs.length - 1]);
        } else {
          clearEditor();
        }
      }
    } else {
      setState({ openTabs: state.openTabs.filter((d) => d.slug !== value) });
      saveUIState();
      if (state.currentSlug === value && state.activeTabType === "post") {
        if (state.openTabs.length > 0) {
          loadPostIntoEditor(state.openTabs[state.openTabs.length - 1]);
        } else if (state.openProjectTabs.length > 0) {
          loadProjectIntoEditor(state.openProjectTabs[state.openProjectTabs.length - 1]);
        } else {
          clearEditor();
        }
      }
    }
  }

  private _onTabChange(e: CustomEvent): void {
    const value = e.detail?.value as string;
    if (!value) return;

    if (value.startsWith("project:")) {
      const slug = value.slice(8);
      if (slug === state.currentSlug && state.activeTabType === "project") return;
      const project = state.openProjectTabs.find((d) => d.slug === slug);
      if (project) loadProjectIntoEditor(project);
    } else {
      if (value === state.currentSlug && state.activeTabType === "post") return;
      const post = state.openTabs.find((d) => d.slug === value);
      if (post) loadPostIntoEditor(post);
    }
    saveUIState();
  }

  private _onTabAdd(): void {
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
      publishedSnapshot: null,
    };
    setState({ allPosts: [post, ...state.allPosts], openTabs: [...state.openTabs, post] });
    loadPostIntoEditor(post);
    saveUIState();
  }

}
