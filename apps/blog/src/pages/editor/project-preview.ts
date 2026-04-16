/**
 * <editor-project-preview> — Fullscreen portfolio layout preview.
 * Uses @maneki/grid-layout for drag-to-reorder project cards.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import { state as editorState, setState } from "./state.js";
import { api } from "../../lib/api.js";
import type { Project } from "./types.js";
import type { Layout, LayoutItem, GridConfig, ResizeConfig } from "@maneki/grid-layout";

import "@maneki/grid-layout";
import "@maneki/ui-components/components/ui-card.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-image.js";
import "@maneki/ui-components/components/ui-button.js";
import "@maneki/ui-components/components/ui-scrollbar.js";

const COLS = 3;

@customElement("editor-project-preview")
export class EditorProjectPreview extends LitElement {
  @state() declare _open: boolean;
  @state() declare _projects: Project[];
  private _layout: Layout = [];

  private _gridRef: Ref<
    HTMLElement & {
      layout: Layout;
      gridConfig: GridConfig;
      resizeConfig: ResizeConfig;
    }
  > = createRef();

  constructor() {
    super();
    this._open = false;
    this._projects = [];
  }

  private _cachedGridConfig: GridConfig = {
    cols: COLS,
    rowHeight: 420,
    margin: [16, 16] as [number, number],
    containerPadding: [0, 0] as [number, number],
    maxRows: Infinity,
  };

  private _cachedResizeConfig: ResizeConfig = { enabled: false, handles: [] };

  static styles = css`
    :host {
      display: contents;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 200;
      display: flex;
      flex-direction: column;
      background: var(--fd-surface-primary, #fff);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 24px;
      border-bottom: 1px solid var(--fd-border-minimal, #e4e4e7);
    }

    .heading-05 {
      font-size: 16px;
      line-height: 24px;
      font-weight: 500;
    }

    .grid-wrap {
      max-width: 900px;
      margin: 0 auto;
      padding: 48px 24px;
      width: 100%;
      box-sizing: border-box;
    }

    grid-layout {
      display: block;
      width: 100%;
      --grid-item-transition-duration: 0.15s;
      --grid-placeholder-bg: var(--fd-surface-secondary, #f4f4f5);
      --grid-placeholder-border: 2px dashed var(--fd-border-moderate, #a1a1aa);
      --grid-placeholder-radius: var(--fd-radius-sm, 4px);
    }

    .card-wrap {
      position: relative;
      height: 100%;
      cursor: grab;
      padding: 2px;
      box-sizing: border-box;
    }

    .card-wrap:active {
      cursor: grabbing;
    }

    .card-wrap ui-card {
      pointer-events: none;
      height: 100%;
    }


    .card-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }


    .card-title {
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .pin-toggle {
      pointer-events: auto;
      position: absolute;
      top: 22px;
      right: 22px;
      z-index: 2;
      cursor: pointer;
      font-size: 14px;
      transition: opacity 0.15s;
      background: none;
      border: none;
      padding: 2px;
    }

    .description {
      font-size: 14px;
      line-height: 20px;
      color: var(--fd-text-secondary, #52525b);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0;
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .status {
      margin-top: auto;
    }
  `;

  show(): void {
    this._projects = editorState.allProjects.filter((p) => p.status !== "deleted");
    this._layout = this._buildLayout();
    this._open = true;
  }

  hide(): void {
    this._open = false;
  }

  private _buildLayout(): Layout {
    return this._projects.map((p, i) => ({
      i: p.slug,
      x: i % COLS,
      y: Math.floor(i / COLS),
      w: 1,
      h: 1,
    }));
  }


  private async _onLayoutChange(e: CustomEvent<{ layout: Layout }>): Promise<void> {
    const layout = e.detail.layout;
    // Sort by row (y) then column (x) to derive visual order
    const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    const slugs = sorted.map((item: LayoutItem) => item.i);

    // Reorder internal array in-place — do NOT reassign _projects to avoid Lit re-render
    // Grid-layout already shows the correct positions
    const orderMap = new Map(slugs.map((s, i) => [s, i]));
    this._projects.sort((a, b) => (orderMap.get(a.slug) ?? 0) - (orderMap.get(b.slug) ?? 0));
    this._projects.forEach((p, i) => { p.sortOrder = i; });

    // Sync cached layout so future re-renders don't reset
    this._layout = layout.map(item => ({ ...item }));

    // Update global state
    const updated = [...this._projects];
    for (const p of editorState.allProjects) {
      if (!updated.find((u) => u.slug === p.slug)) updated.push(p);
    }
    setState({ allProjects: updated });

    try {
      await api.api.projects.reorder.$put({ json: { slugs } });
    } catch {
      /* ignore */
    }
  }

  private async _togglePin(project: Project, e: Event): Promise<void> {
    const newPinned = !project.pinned;
    project.pinned = newPinned;
    // Update opacity directly — don't trigger Lit re-render
    const btn = e.currentTarget as HTMLElement;
    btn.style.opacity = newPinned ? "1" : "0.3";
    try {
      await api.api.projects[":slug"].$put({
        param: { slug: project.slug },
        json: { pinned: newPinned },
      });
    } catch {
      /* ignore */
    }
    setState({});
  }

  private _onKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") this.hide();
  }

  protected render(): unknown {
    if (!this._open) return nothing;

    return html`
      <div class="overlay" @keydown=${this._onKeydown} tabindex="-1">
        <div class="header">
          <span class="heading-05">Portfolio Layout</span>
          <ui-button action="secondary" emphasis="subtle" size="s" @click=${this.hide}>Close</ui-button>
        </div>
        <ui-scrollbar emphasis="minimal">
          <div class="grid-wrap">
            <grid-layout
              ${ref(this._gridRef)}
              .layout=${this._layout}
              .gridConfig=${this._cachedGridConfig}
              .resizeConfig=${this._cachedResizeConfig}
              .compactType=${"horizontal" as const}
              @layout-change=${this._onLayoutChange}
            >
              ${repeat(this._projects, (p) => p.slug, (project) => html`
                  <grid-item item-id=${project.slug} w="1" h="1">
                    <div class="card-wrap">
                      <button
                        class="pin-toggle"
                        aria-label="Pin to homepage"
                        style="opacity:${project.pinned ? "1" : "0.3"}"
                        @pointerdown=${(e: Event) => e.stopPropagation()}
                        @click=${(e: Event) => {
                          e.stopPropagation();
                          this._togglePin(project, e);
                        }}
                      >
                        📌
                      </button>
                      <ui-card size="m" bordered>
                        ${project.image
                          ? html`<ui-image
                              src=${project.image}
                              alt=${project.title}
                              slot="image"
                              style="width:100%;height:180px;--ui-image-fit:cover;"
                            ></ui-image>`
                          : nothing}
                        <div class="card-body">
                          <span class="card-title">${project.title || "Untitled"}</span>
                          <p class="description">${project.description}</p>
                          <div class="tags">
                            ${project.tech
                              .split(",")
                              .map((t: string) => t.trim())
                              .filter(Boolean)
                              .map((t: string) => html`<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`)}
                          </div>
                          <div class="status">
                            <ui-badge size="s" status=${project.status === "published" ? "success" : "warning"}>${project.status}</ui-badge>
                          </div>
                        </div>
                      </ui-card>
                    </div>
                  </grid-item>
                `,
              )}
            </grid-layout>
          </div>
        </ui-scrollbar>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "editor-project-preview": EditorProjectPreview;
  }
}
