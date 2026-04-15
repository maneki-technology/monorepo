import { LitElement, html, css } from "lit";
import { customElement, state as litState } from "lit/decorators.js";
import { state, setState } from "./state.js";
import { deletePost, deleteProject, loadPostIntoEditor, loadProjectIntoEditor, clearEditor } from "./api.js";
import { EditorStoreController } from "./editor-store.js";

import "@maneki/ui-components/components/ui-modal.js";
import "@maneki/ui-components/components/ui-button.js";

@customElement("editor-delete-modal")
export class EditorDeleteModal extends LitElement {
  private store = new EditorStoreController(this);

  @litState() private _loading = false;

  static styles = css`
    :host {
      display: contents;
    }
  `;

  show(): void {
    const modal = this.renderRoot.querySelector("ui-modal") as (HTMLElement & { show(): void }) | null;
    modal?.show();
  }

  protected render(): unknown {
    return html`
      <ui-modal id="admin-delete-modal" size="m" dismissible>
        Delete Item
        <div slot="body">Are you sure you want to delete this item? This action cannot be undone.</div>
        <div slot="footer-end" style="display:flex;gap:8px;">
          <ui-button action="secondary" size="s" @click=${this._onCancel}>Cancel</ui-button>
          <ui-button action="destructive" size="s" ?loading=${this._loading} @click=${this._onConfirm}
            >Delete</ui-button
          >
        </div>
      </ui-modal>
    `;
  }

  private _onCancel(): void {
    setState({ pendingDeleteSlug: null });
    const modal = this.renderRoot.querySelector("ui-modal") as (HTMLElement & { close(): void }) | null;
    modal?.close();
  }

  private async _onConfirm(): Promise<void> {
    if (!state.pendingDeleteSlug) return;
    this._loading = true;

    const isProject = state.pendingDeleteSlug.startsWith("project:");
    const slug = isProject ? state.pendingDeleteSlug.slice(8) : state.pendingDeleteSlug;

    try {
      if (isProject) {
        const project = state.allProjects.find((p) => p.slug === slug);
        if (project?.persisted) await deleteProject(slug);
        const newAllProjects = state.allProjects.filter((p) => p.slug !== slug);
        const newOpenProjectTabs = state.openProjectTabs.filter((t) => t.slug !== slug);
        setState({ allProjects: newAllProjects, openProjectTabs: newOpenProjectTabs, pendingDeleteSlug: null });
        if (state.currentSlug === slug && state.activeTabType === "project") {
          if (newOpenProjectTabs.length > 0) {
            loadProjectIntoEditor(newOpenProjectTabs[newOpenProjectTabs.length - 1]);
          } else if (state.openTabs.length > 0) {
            loadPostIntoEditor(state.openTabs[state.openTabs.length - 1]);
          } else {
            clearEditor();
          }
        }
      } else {
        const post = state.allPosts.find((p) => p.slug === slug);
        if (post?.persisted) await deletePost(slug);
        const newAllPosts = state.allPosts.filter((p) => p.slug !== slug);
        const newOpenTabs = state.openTabs.filter((t) => t.slug !== slug);
        setState({ allPosts: newAllPosts, openTabs: newOpenTabs, pendingDeleteSlug: null });
        if (state.currentSlug === slug && state.activeTabType === "post") {
          if (newOpenTabs.length > 0) {
            loadPostIntoEditor(newOpenTabs[newOpenTabs.length - 1]);
          } else if (state.openProjectTabs.length > 0) {
            loadProjectIntoEditor(state.openProjectTabs[state.openProjectTabs.length - 1]);
          } else {
            clearEditor();
          }
        }
      }
      const modal = this.renderRoot.querySelector("ui-modal") as (HTMLElement & { close(): void }) | null;
      modal?.close();
    } finally {
      this._loading = false;
    }
  }
}
