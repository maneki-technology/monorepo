import type { Route } from "../router.js";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { api } from "../lib/api.js";
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

// ─── Types ───────────────────────────────────────────────────────────────────

interface Draft {
  slug: string;
  title: string;
  date: string;
  tags: string;
  excerpt: string;
  content: string;
  status: string;
  updatedAt: string;
  publishedAt: string | null;
  persisted: boolean;
}

// ─── Markdown renderer (client-side, lazy Shiki for syntax highlighting) ─────

import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { fromHighlighter } from "@shikijs/markdown-it";

let mdReady: Promise<MarkdownIt> | null = null;

function getMd(): Promise<MarkdownIt> {
  if (mdReady) return mdReady;
  mdReady = (async () => {
    const highlighter = await createHighlighterCore({
      themes: [
        import("@shikijs/themes/github-light"),
        import("@shikijs/themes/github-dark"),
      ],
      langs: [
        import("@shikijs/langs/typescript"),
        import("@shikijs/langs/javascript"),
        import("@shikijs/langs/html"),
        import("@shikijs/langs/css"),
        import("@shikijs/langs/json"),
        import("@shikijs/langs/bash"),
        import("@shikijs/langs/markdown"),
        import("@shikijs/langs/yaml"),
        import("@shikijs/langs/rust"),
        import("@shikijs/langs/sql"),
      ],
      engine: createJavaScriptRegexEngine(),
    });
    const instance = new MarkdownIt({ html: true, linkify: true, typographer: true });
    type HighlighterParam = Parameters<typeof fromHighlighter>[0];
    instance.use(fromHighlighter(highlighter as unknown as HighlighterParam, {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    }));
    instance.use(anchor, {
      slugify: (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
      permalink: false,
    });
    return instance;
  })();
  return mdReady;
}

// Fallback sync md for initial render before Shiki loads
const mdSync = new MarkdownIt({ html: true, linkify: true, typographer: true });
mdSync.use(anchor, {
  slugify: (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
  permalink: false,
});

// ─── API helpers ─────────────────────────────────────────────────────────────

async function fetchDrafts(): Promise<Draft[]> {
  try {
    const res = await api.api.posts.$get({ query: {} });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts as Record<string, unknown>[]).map((p) => ({
      slug: p.slug as string,
      title: p.title as string,
      date: (p.created_at as string).split("T")[0],
      tags: (p.tags as string[]).join(", "),
      excerpt: p.excerpt as string,
      content: p.body_md as string,
      status: p.status as string,
      updatedAt: p.updated_at as string,
      publishedAt: (p.published_at as string) ?? null,
      persisted: true,
    }));
  } catch {
    return [];
  }
}

async function savePost(draft: Draft): Promise<string | null> {
  try {
    const slug = draft.persisted ? draft.slug : toSlug(draft.date, draft.title);
    const tags = draft.tags.split(",").map((t) => t.trim()).filter(Boolean);

    // Try update first, create if 404
    const existing = await api.api.posts[":slug"].$get({ param: { slug } });
    if (existing.ok) {
      await api.api.posts[":slug"].$put({
        param: { slug },
        json: {
          title: draft.title,
          body_md: draft.content,
          excerpt: draft.excerpt,
          tags,
          status: draft.status as "draft" | "published",
          date: draft.date,
        },
      });
      return slug;
    }

    await api.api.posts.$post({
      json: {
        title: draft.title || "Untitled",
        slug,
        body_md: draft.content,
        excerpt: draft.excerpt,
        tags,
        status: draft.status as "draft" | "published",
        date: draft.date,
      },
    });
    return slug;
  } catch {
    return null;
  }
}

async function deletePost(slug: string): Promise<void> {
  try {
    await api.api.posts[":slug"].$delete({ param: { slug } });
  } catch { /* ignore */ }
}

function toSlug(date: string, title: string): string {
  if (!title) return `draft-${Date.now().toString(36)}`;
  const base = title.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
  return date ? `${date}-${base}` : base;
}

// ─── UI state persistence ────────────────────────────────────────────────────

interface EditorUIState {
  openTabs: string[];
  activeTab: string | null;
  sidebarCollapsed: boolean;
  theme: string;
}

let uiStateSaveTimer: ReturnType<typeof setTimeout> | null = null;

async function loadUIState(): Promise<EditorUIState | null> {
  try {
    const res = await api.api["ui-state"][":page"].$get({ param: { page: "editor" } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.state ?? null) as EditorUIState | null;
  } catch {
    return null;
  }
}

function saveUIState(): void {
  if (uiStateSaveTimer) clearTimeout(uiStateSaveTimer);
  uiStateSaveTimer = setTimeout(async () => {
    const sidebar = document.getElementById("admin-sidebar");
    const uiStateData: EditorUIState = {
      openTabs: state.openTabs.map((t) => t.slug),
      activeTab: state.currentSlug,
      sidebarCollapsed: sidebar?.getAttribute("state") === "collapsed",
      theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
    };
    try {
      await api.api["ui-state"][":page"].$put({
        param: { page: "editor" },
        json: uiStateData as unknown as Record<string, unknown>,
      });
    } catch { /* ignore */ }
  }, 500);
}

// ─── Reactive State ──────────────────────────────────────────────────────────

interface EditorState {
  allPosts: Draft[];
  openTabs: Draft[];
  currentSlug: string | null;
  saving: boolean;
  deployingSlugs: Set<string>;
  deployingAction: "publishing" | "unpublishing" | null;
  pendingDeleteSlug: string | null;
  selectedSlugs: Set<string>;
}

const state: EditorState = {
  allPosts: [],
  openTabs: [],
  currentSlug: null,
  saving: false,
  deployingSlugs: new Set(),
  deployingAction: null,
  pendingDeleteSlug: null,
  selectedSlugs: new Set(),
};

let renderScheduled = false;
let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const pendingRenders = { sidebar: false, tabbar: false };

const SIDEBAR_DEPS: (keyof EditorState)[] = ["allPosts", "currentSlug", "deployingSlugs", "pendingDeleteSlug", "selectedSlugs"];
const TABBAR_DEPS: (keyof EditorState)[] = ["openTabs", "currentSlug"];

function setState(partial: Partial<EditorState>): void {
  const keys = Object.keys(partial) as (keyof EditorState)[];
  Object.assign(state, partial);

  // Empty setState({}) forces both renders (used for in-place mutations)
  if (keys.length === 0) {
    pendingRenders.sidebar = true;
    pendingRenders.tabbar = true;
  } else {
    if (keys.some((k) => SIDEBAR_DEPS.includes(k))) pendingRenders.sidebar = true;
    if (keys.some((k) => TABBAR_DEPS.includes(k))) pendingRenders.tabbar = true;
  }

  if (!renderScheduled && (pendingRenders.sidebar || pendingRenders.tabbar)) {
    renderScheduled = true;
    queueMicrotask(() => {
      renderScheduled = false;
      if (pendingRenders.sidebar) renderSidebar();
      if (pendingRenders.tabbar) renderTabBar();
      pendingRenders.sidebar = false;
      pendingRenders.tabbar = false;
    });
  }
}

function hasUnpublishedChanges(post: Draft): boolean {
  if (!post.publishedAt) return post.status === "published";
  return post.updatedAt > post.publishedAt;
}

function clearEditor(): void {
  setState({ currentSlug: null });
  const titleInput = document.getElementById("admin-title") as HTMLElement;
  const dateInput = document.getElementById("admin-date") as HTMLElement;
  const tagsInput = document.getElementById("admin-tags") as HTMLInputElement;
  const tagList = document.getElementById("admin-tag-list");
  const excerptInput = document.getElementById("admin-excerpt") as HTMLElement;
  const textarea = document.getElementById("admin-content") as HTMLTextAreaElement;
  if (titleInput) (titleInput as any).value = "";
  if (dateInput) (dateInput as any).value = new Date().toISOString().split("T")[0];
  if (tagsInput) tagsInput.value = "";
  if (tagList) tagList.innerHTML = "";
  if (excerptInput) (excerptInput as any).value = "";
  if (textarea) textarea.value = "";
  renderPreview();
}

// ─── Toolbar actions ─────────────────────────────────────────────────────────

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string): void {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end);
  const replacement = `${before}${selected || "text"}${after}`;
  textarea.setRangeText(replacement, start, end, "select");
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function insertAtCursor(textarea: HTMLTextAreaElement, text: string): void {
  const start = textarea.selectionStart;
  textarea.setRangeText(text, start, start, "end");
  textarea.focus();
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

// Wrap <pre> code blocks in <ui-scrollbar> for horizontal scroll
function wrapCodeBlocks(container: HTMLElement): void {
  container.querySelectorAll("pre").forEach((pre) => {
    if (pre.parentElement?.tagName === "UI-SCROLLBAR") return;
    const wrapper = document.createElement("ui-scrollbar");
    wrapper.setAttribute("orientation", "horizontal");
    wrapper.setAttribute("emphasis", "minimal");
    pre.parentNode!.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);
  });
}

// ─── Render ────────────────────────────────────────────────────────────────────

function renderPreview(): void {
  const title = (document.getElementById("admin-title") as any)?.value ?? "";
  const date = (document.getElementById("admin-date") as any)?.value ?? "";
  const tags = (document.getElementById("admin-tags") as HTMLInputElement)?.value ?? "";
  const content = (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "";
  const preview = document.getElementById("admin-preview");
  if (!preview) return;

  const tagBadges = tags.split(",").map((t) => t.trim()).filter(Boolean)
    .map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("");
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  // Render with sync md first, then upgrade with Shiki when ready
  const html = mdSync.render(content);
  preview.innerHTML = `
    <article>
      <h1 class="heading-02">${title || "Untitled"}</h1>
      ${formattedDate ? `<div class="post-meta mt-1">${formattedDate}</div>` : ""}
      ${tagBadges ? `<div class="tags mt-2">${tagBadges}</div>` : ""}
      <div class="post-content mt-4">${html}</div>
    </article>
  `;

  // Re-render with Shiki highlighting (async)
  getMd().then((mdShiki) => {
    const highlighted = mdShiki.render(content);
    if (highlighted !== html) {
      preview.innerHTML = `
        <article>
          <h1 class="heading-02">${title || "Untitled"}</h1>
          ${formattedDate ? `<div class="post-meta mt-1">${formattedDate}</div>` : ""}
          ${tagBadges ? `<div class="tags mt-2">${tagBadges}</div>` : ""}
          <div class="post-content mt-4">${highlighted}</div>
        </article>
      `;
    }
    wrapCodeBlocks(preview);
  });
}

function renderSidebar(): void {
  // Toggle toolbar buttons based on deploy state
  const isDeploying = state.deployingSlugs.size > 0;
  const saveBtn = document.getElementById("admin-save-btn");
  const publishSplit = document.getElementById("admin-publish-split");
  if (saveBtn) { if (isDeploying) saveBtn.setAttribute("disabled", ""); else saveBtn.removeAttribute("disabled"); }
  if (publishSplit) { if (isDeploying) publishSplit.setAttribute("disabled", ""); else publishSplit.removeAttribute("disabled"); }

  const list = document.getElementById("admin-post-list");
  if (!list) return;
  list.innerHTML = "";

  for (const post of state.allPosts) {
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("value", post.slug);
    if (post.slug === state.currentSlug) {
      item.setAttribute("selected", "");
    }

    // Build label with title + meta
    const label = document.createElement("span");
    label.style.cssText = "display:flex;flex-direction:column;gap:2px;overflow:hidden;";

    const titleSpan = document.createElement("span");
    titleSpan.style.cssText = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    titleSpan.textContent = (post.title || "Untitled") + (hasUnpublishedChanges(post) ? " *" : "");

    const metaSpan = document.createElement("span");
    metaSpan.style.cssText = "font-size:11px;color:var(--fd-text-secondary, #52525b);display:flex;align-items:center;gap:6px;";

    let badgeStatus = "warning";
    let badgeLabel = post.status;
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

    list.appendChild(item);
  }

  // Bulk action bar
  const existingBar = document.getElementById("admin-bulk-actions");
  if (existingBar) existingBar.remove();

  if (state.selectedSlugs.size > 0) {
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

function renderTabBar(): void {
  const bar = document.getElementById("admin-tab-bar");
  if (!bar) return;

  bar.innerHTML = "";

  const tabGroup = document.createElement("ui-tab-group");
  tabGroup.setAttribute("size", "m");
  tabGroup.setAttribute("closable", "");
  tabGroup.setAttribute("addable", "");

  for (const d of state.openTabs) {
    const tabItem = document.createElement("ui-tab-item");
    tabItem.setAttribute("value", d.slug);
    tabItem.setAttribute("label", (d.title || "Untitled") + (hasUnpublishedChanges(d) ? " *" : ""));
    if (d.slug === state.currentSlug) {
      tabItem.setAttribute("selected", "");
    }
    tabGroup.appendChild(tabItem);
  }

  const actions = document.createElement("div");
  actions.className = "admin-tab-bar-actions";

  const themeIcon = document.documentElement.getAttribute("data-theme") === "dark" ? "\u263E" : "\u2600\uFE0F";
  const themeBtn = document.createElement("ui-button");
  themeBtn.setAttribute("action", "secondary");
  themeBtn.setAttribute("emphasis", "minimal");
  themeBtn.setAttribute("size", "s");
  themeBtn.id = "admin-theme-toggle";
  themeBtn.setAttribute("aria-label", "Toggle dark mode");
  themeBtn.textContent = themeIcon;
  actions.appendChild(themeBtn);

  bar.appendChild(tabGroup);
  bar.appendChild(actions);

  // Tab close — remove from openTabs only (NOT delete from API)
  tabGroup.addEventListener("tab-close", ((e: CustomEvent) => {
    const slug = e.detail?.value as string;
    if (!slug) return;
    setState({ openTabs: state.openTabs.filter((d) => d.slug !== slug) });
    saveUIState();
    if (state.currentSlug === slug) {
      if (state.openTabs.length > 0) {
        loadDraftIntoEditor(state.openTabs[state.openTabs.length - 1]);
      } else {
        clearEditor();
      }
    }
  }) as EventListener);

  // Tab select
  tabGroup.addEventListener("tab-change", ((e: CustomEvent) => {
    const slug = e.detail?.value as string;
    if (!slug || slug === state.currentSlug) return;
    const draft = state.openTabs.find((d) => d.slug === slug);
    if (draft) loadDraftIntoEditor(draft);
    saveUIState();
  }) as EventListener);

  // New draft (via addable "+" button)
  tabGroup.addEventListener("tab-add", () => {
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
    saveUIState();
  });

  // Theme toggle
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    setState({});  // trigger render for theme icon update
    saveUIState();
  });
}

function loadDraftIntoEditor(draft: Draft): void {
  setState({ currentSlug: draft.slug });
  (document.getElementById("admin-title") as any).value = draft.title;
  (document.getElementById("admin-date") as any).value = draft.date;
  (document.getElementById("admin-tags") as HTMLInputElement).value = draft.tags;
  const tagList = document.getElementById("admin-tag-list");
  if (tagList) {
    tagList.innerHTML = "";
    draft.tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((name) => {
      const tag = document.createElement("ui-tag");
      tag.setAttribute("size", "s");
      tag.setAttribute("emphasis", "subtle");
      tag.setAttribute("dismissible", "");
      tag.textContent = name;
      tag.addEventListener("dismiss", () => {
        tag.remove();
        const tags = Array.from(tagList.querySelectorAll("ui-tag")).map((t) => t.textContent?.trim() ?? "");
        (document.getElementById("admin-tags") as HTMLInputElement).value = tags.join(", ");
      });
      tagList.appendChild(tag);
    });
  }
  (document.getElementById("admin-excerpt") as any).value = draft.excerpt;
  (document.getElementById("admin-content") as HTMLTextAreaElement).value = draft.content;
  renderPreview();
}

function getCurrentDraftData(): Omit<Draft, "slug" | "updatedAt" | "publishedAt" | "persisted"> {
  return {
    title: (document.getElementById("admin-title") as any)?.value ?? "",
    date: (document.getElementById("admin-date") as any)?.value ?? "",
    tags: (document.getElementById("admin-tags") as HTMLInputElement)?.value ?? "",
    excerpt: (document.getElementById("admin-excerpt") as any)?.value ?? "",
    content: (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "",
    status: state.allPosts.find((p) => p.slug === state.currentSlug)?.status ?? "draft",
  };
}

async function saveCurrent(forceApi = false, statusEl?: HTMLElement | null): Promise<boolean> {
  if (state.saving) return false;
  setState({ saving: true });
  if (statusEl) statusEl.setAttribute("status", "loading");
  try {
    const currentPost = state.allPosts.find((p) => p.slug === state.currentSlug);
    const data = getCurrentDraftData();
    const draft: Draft = {
      slug: state.currentSlug || "",
      ...data,
      updatedAt: new Date().toISOString(),
      publishedAt: currentPost?.publishedAt ?? null,
      persisted: currentPost?.persisted ?? false,
    };

    // Always persist to API (auto-save and explicit save both go to API)
    const slug = await savePost(draft);
    if (slug) {
      const idxAll = state.allPosts.findIndex((d) => d.slug === state.currentSlug);
      const idxTab = state.openTabs.findIndex((d) => d.slug === state.currentSlug);
      const saved: Draft = { ...draft, slug, persisted: true };
      const newAllPosts = [...state.allPosts];
      if (idxAll >= 0) newAllPosts[idxAll] = saved;
      else newAllPosts.push(saved);
      const newOpenTabs = [...state.openTabs];
      if (idxTab >= 0) newOpenTabs[idxTab] = saved;
      else newOpenTabs.push(saved);
      setState({ allPosts: newAllPosts, openTabs: newOpenTabs, currentSlug: slug });
      saveUIState();
      if (statusEl) {
        statusEl.setAttribute("status", "success");
        setTimeout(() => statusEl.setAttribute("status", "none"), 1500);
      }
      return true;
    }
    if (statusEl) {
      statusEl.setAttribute("status", "error");
      setTimeout(() => statusEl.setAttribute("status", "none"), 2000);
    }
    return false;
  } finally {
    setState({ saving: false });
  }
}

function exportAsMarkdown(): void {
  const data = getCurrentDraftData();
  const frontmatter = [
    "---",
    `title: ${data.title}`,
    `date: ${data.date}`,
    `excerpt: "${data.excerpt}"`,
    `tags: [${data.tags.split(",").map((t) => t.trim()).filter(Boolean).join(", ")}]`,
    "---",
    "",
    data.content,
  ].join("\n");

  const slug = data.date && data.title
    ? `${data.date}-${data.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "")}`
    : "untitled";

  const blob = new Blob([frontmatter], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Route ───────────────────────────────────────────────────────────────────

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
    // Load posts from API + UI state in parallel
    Promise.all([fetchDrafts(), loadUIState()]).then(async ([loaded, uiState]) => {
      setState({ allPosts: loaded });

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

    // Live preview (debounced)
    const triggerPreview = () => {
      if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
      previewDebounceTimer = setTimeout(renderPreview, 150);
    };

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
    document.querySelector(".admin-toolbar")?.addEventListener("click", (e) => {
      const btn = (e.target as Element).closest("[data-action]") as HTMLElement | null;
      if (!btn) return;
      const action = btn.dataset.action;
      switch (action) {
        case "bold": wrapSelection(textarea, "**", "**"); break;
        case "italic": wrapSelection(textarea, "*", "*"); break;
        case "h2": insertAtCursor(textarea, "\n## "); break;
        case "h3": insertAtCursor(textarea, "\n### "); break;
        case "link": wrapSelection(textarea, "[", "](url)"); break;
        case "code": wrapSelection(textarea, "`", "`"); break;
        case "codeblock": insertAtCursor(textarea, "\n```ts\n\n```\n"); break;
        case "image": insertAtCursor(textarea, "![alt](/images/)"); break;
        case "ul": insertAtCursor(textarea, "\n- "); break;
        case "ol": insertAtCursor(textarea, "\n1. "); break;
        case "quote": insertAtCursor(textarea, "\n> "); break;
      }
    });

    const saveBtn = document.getElementById("admin-save-btn");
    document.getElementById("admin-save-btn")?.addEventListener("click", async () => {
      if (state.saving) {
        await new Promise<void>((resolve) => {
          const check = setInterval(() => { if (!state.saving) { clearInterval(check); resolve(); } }, 100);
        });
      }
      saveCurrent(true, saveBtn);
    });

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
    const previewFull = document.getElementById("admin-preview-full")!;

    document.getElementById("admin-preview-btn")?.addEventListener("click", () => {
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
            <a href="/blog" class="body-02 text-link" style="text-decoration:none;">\u2190 Back to blog</a>
            <h1 class="heading-02 mt-3">${title || "Untitled"}</h1>
            ${formattedDate ? `<div class="post-meta mt-1">${formattedDate}</div>` : ""}
            ${tagBadges ? `<div class="tags mt-2">${tagBadges}</div>` : ""}
            <div class="post-content mt-4">${highlighted}</div>
          </article>
        `;
        wrapCodeBlocks(previewFull);
        overlay.style.display = "flex";
      });
    });

    document.getElementById("admin-preview-close")?.addEventListener("click", () => {
      overlay.style.display = "none";
    });

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
    cancelBtn.addEventListener("click", () => {
      setState({ pendingDeleteSlug: null });
      (deleteModal as any).close();
    });
    const confirmBtn = document.createElement("ui-button");
    confirmBtn.setAttribute("action", "destructive");
    confirmBtn.setAttribute("size", "s");
    confirmBtn.textContent = "Delete";
    confirmBtn.addEventListener("click", async () => {
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
    });
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