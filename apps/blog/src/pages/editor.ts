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
    const state: EditorUIState = {
      openTabs: openTabs.map((t) => t.slug),
      activeTab: currentSlug,
      sidebarCollapsed: sidebar?.getAttribute("state") === "collapsed",
      theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
    };
    try {
      await api.api["ui-state"][":page"].$put({
        param: { page: "editor" },
        json: state as unknown as Record<string, unknown>,
      });
    } catch { /* ignore */ }
  }, 500);
}

// ─── State ───────────────────────────────────────────────────────────────────

let allPosts: Draft[] = [];
let openTabs: Draft[] = [];
let currentSlug: string | null = null;
let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let saving = false;
let pendingDeleteSlug: string | null = null;

function clearEditor(): void {
  currentSlug = null;
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
  const list = document.getElementById("admin-post-list");
  if (!list) return;
  list.innerHTML = "";

  for (const post of allPosts) {
    const item = document.createElement("ui-side-panel-menu-item");
    item.setAttribute("value", post.slug);
    if (post.slug === currentSlug) {
      item.setAttribute("selected", "");
    }

    // Build label with title + meta
    const label = document.createElement("span");
    label.style.cssText = "display:flex;flex-direction:column;gap:2px;overflow:hidden;";

    const titleSpan = document.createElement("span");
    titleSpan.style.cssText = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
    titleSpan.textContent = post.title || "Untitled";

    const metaSpan = document.createElement("span");
    metaSpan.style.cssText = "font-size:11px;color:var(--fd-text-secondary, #52525b);display:flex;align-items:center;gap:6px;";
    metaSpan.innerHTML = `${post.date} <ui-badge size="xs" status="${post.status === "published" ? "success" : "warning"}">${post.status}</ui-badge>`;

    label.appendChild(titleSpan);
    label.appendChild(metaSpan);
    item.appendChild(label);
    const deleteBtn = document.createElement("ui-button");
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
      pendingDeleteSlug = post.slug;
      const modal = document.getElementById("admin-delete-modal") as any;
      if (modal) modal.show();
    });
    item.appendChild(deleteBtn);
    item.addEventListener("mouseenter", () => { deleteBtn.style.opacity = "1"; });
    item.addEventListener("mouseleave", () => { deleteBtn.style.opacity = "0"; });

    list.appendChild(item);
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

  for (const d of openTabs) {
    const tabItem = document.createElement("ui-tab-item");
    tabItem.setAttribute("value", d.slug);
    tabItem.setAttribute("label", d.title || "Untitled");
    if (d.slug === currentSlug) {
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
    openTabs = openTabs.filter((d) => d.slug !== slug);
    saveUIState();
    if (currentSlug === slug) {
      if (openTabs.length > 0) {
        loadDraftIntoEditor(openTabs[openTabs.length - 1]);
      } else {
        clearEditor();
        renderTabBar();
      }
    } else {
      renderTabBar();
    }
  }) as EventListener);

  // Tab select
  tabGroup.addEventListener("tab-change", ((e: CustomEvent) => {
    const slug = e.detail?.value as string;
    if (!slug || slug === currentSlug) return;
    const draft = openTabs.find((d) => d.slug === slug);
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
      persisted: false,
    };
    allPosts.unshift(draft);
    openTabs.push(draft);
    loadDraftIntoEditor(draft);
    renderSidebar();
    saveUIState();
    renderSidebar();
  });

  // Theme toggle
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    renderTabBar();
    saveUIState();
  });
}

function loadDraftIntoEditor(draft: Draft): void {
  currentSlug = draft.slug;
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
  renderTabBar();
  renderSidebar();
}

function getCurrentDraftData(): Omit<Draft, "slug" | "updatedAt" | "persisted"> {
  return {
    title: (document.getElementById("admin-title") as any)?.value ?? "",
    date: (document.getElementById("admin-date") as any)?.value ?? "",
    tags: (document.getElementById("admin-tags") as HTMLInputElement)?.value ?? "",
    excerpt: (document.getElementById("admin-excerpt") as any)?.value ?? "",
    content: (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "",
    status: allPosts.find((p) => p.slug === currentSlug)?.status ?? "draft",
  };
}

async function saveCurrent(forceApi = false, statusEl?: HTMLElement | null): Promise<boolean> {
  if (saving) return false;
  saving = true;
  if (statusEl) statusEl.setAttribute("status", "loading");
  try {
    const currentPost = allPosts.find((p) => p.slug === currentSlug);
    const data = getCurrentDraftData();
    const draft: Draft = {
      slug: currentSlug || "",
      ...data,
      updatedAt: new Date().toISOString(),
      persisted: currentPost?.persisted ?? false,
    };

    // Always persist to API (auto-save and explicit save both go to API)
    const slug = await savePost(draft);
    if (slug) {
      const idxAll = allPosts.findIndex((d) => d.slug === currentSlug);
      const idxTab = openTabs.findIndex((d) => d.slug === currentSlug);
      const saved: Draft = { ...draft, slug, persisted: true };
      if (idxAll >= 0) allPosts[idxAll] = saved;
      else allPosts.push(saved);
      if (idxTab >= 0) openTabs[idxTab] = saved;
      else openTabs.push(saved);
      currentSlug = slug;
      renderTabBar();
      renderSidebar();
      saveUIState();
      if (statusEl) {
        statusEl.setAttribute("status", "success");
        setTimeout(() => statusEl.setAttribute("status", "none"), 1500);
      }
    }
    if (statusEl) {
      statusEl.setAttribute("status", "error");
      setTimeout(() => statusEl.setAttribute("status", "none"), 2000);
    }
    return false;
  } finally {
    saving = false;
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
    Promise.all([fetchDrafts(), loadUIState()]).then(([loaded, uiState]) => {
      allPosts = loaded;

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
        for (const slug of savedTabs) {
          const post = allPosts.find((p) => p.slug === slug);
          if (post && !openTabs.find((t) => t.slug === slug)) {
            openTabs.push(post);
          }
        }

        // Restore active tab
        const activePost = uiState.activeTab ? allPosts.find((p) => p.slug === uiState.activeTab) : null;
        if (activePost) {
          if (!openTabs.find((t) => t.slug === activePost.slug)) {
            openTabs.push(activePost);
          }
          loadDraftIntoEditor(activePost);
        } else if (openTabs.length > 0) {
          loadDraftIntoEditor(openTabs[0]);
        }
      } else if (allPosts.length > 0) {
        // No saved state — open first post
        openTabs.push(allPosts[0]);
        loadDraftIntoEditor(allPosts[0]);
      }

      document.getElementById("admin-loading")!.style.display = "none";
      document.getElementById("admin-editor-main")!.style.display = "";
      document.getElementById("admin-tab-bar")!.style.display = "";
      document.getElementById("admin-sidebar")!.style.display = "";
      renderSidebar();
      if (!currentSlug) renderTabBar();
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
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        if (currentSlug || textarea.value.trim()) saveCurrent();
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
    document.getElementById("admin-save-btn")?.addEventListener("click", () => saveCurrent(true, saveBtn));

    // Publish (split button left action)
    const publishSplit = document.getElementById("admin-publish-split");
    publishSplit?.addEventListener("action", async () => {
      if (publishSplit) publishSplit.setAttribute("status", "loading");
      try {
        const saved = await saveCurrent(true);
        if (!saved || !currentSlug) {
          if (publishSplit) publishSplit.setAttribute("status", "error");
          setTimeout(() => { if (publishSplit) publishSplit.setAttribute("status", "none"); }, 2000);
          return;
        }
        await api.api.posts[":slug"].publish.$put({ param: { slug: currentSlug } });
        const post = allPosts.find((p) => p.slug === currentSlug);
        if (post) post.status = "published";
        const tab = openTabs.find((t) => t.slug === currentSlug);
        if (tab) tab.status = "published";
        renderTabBar();
        renderSidebar();
        if (publishSplit) publishSplit.setAttribute("status", "success");
        setTimeout(() => { if (publishSplit) publishSplit.setAttribute("status", "none"); }, 1500);
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
      pendingDeleteSlug = null;
      (deleteModal as any).close();
    });
    const confirmBtn = document.createElement("ui-button");
    confirmBtn.setAttribute("action", "destructive");
    confirmBtn.setAttribute("size", "s");
    confirmBtn.textContent = "Delete";
    confirmBtn.addEventListener("click", async () => {
      if (!pendingDeleteSlug) return;
      confirmBtn.setAttribute("status", "loading");
      try {
        const post = allPosts.find((p) => p.slug === pendingDeleteSlug);
        if (post?.persisted) {
          await deletePost(pendingDeleteSlug);
        }
        allPosts = allPosts.filter((p) => p.slug !== pendingDeleteSlug);
        openTabs = openTabs.filter((t) => t.slug !== pendingDeleteSlug);
        if (currentSlug === pendingDeleteSlug) {
          if (openTabs.length > 0) {
            loadDraftIntoEditor(openTabs[openTabs.length - 1]);
          } else {
            clearEditor();
            renderTabBar();
          }
        }
        renderSidebar();
        renderTabBar();
        pendingDeleteSlug = null;
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
    if (!(dateInput as any).value) (dateInput as any).value = new Date().toISOString().split("T")[0];
    renderPreview();

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
      persisted: false,
      };
      allPosts.unshift(draft);
      openTabs.push(draft);
      loadDraftIntoEditor(draft);
      renderSidebar();
    });
    // Sidebar select event (open existing post in tab)
    const sidebar = document.getElementById("admin-sidebar")!;
    sidebar.addEventListener("select", ((e: CustomEvent) => {
      const value = e.detail?.value as string;
      if (!value) return;
      const post = allPosts.find((p) => p.slug === value);
      if (!post) return;
      if (!openTabs.find((t) => t.slug === post.slug)) {
        openTabs.push(post);
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