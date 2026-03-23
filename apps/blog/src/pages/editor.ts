import type { Route } from "../router.js";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
// These components are used in the editor but not detected by auto-import plugin
import "@maneki/ui-components/components/ui-tag.js";
import "@maneki/ui-components/components/ui-badge.js";
import "@maneki/ui-components/components/ui-tab-group.js";
import "@maneki/ui-components/components/ui-tab-item.js";
import "@maneki/ui-components/components/ui-input.js";
import "@maneki/ui-components/components/ui-label.js";
import "@maneki/ui-components/components/ui-textarea.js";
import "@maneki/ui-components/components/ui-datetime-picker.js";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Draft {
  id: string;
  title: string;
  date: string;
  tags: string;
  excerpt: string;
  content: string;
  updatedAt: number;
}

// ─── Markdown renderer (client-side, no Shiki — keep it fast) ────────────────

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
md.use(anchor, {
  slugify: (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
  permalink: false,
});

// ─── localStorage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = "blog-admin-drafts";

function loadDrafts(): Draft[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveDrafts(drafts: Draft[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─── State ───────────────────────────────────────────────────────────────────

let drafts: Draft[] = [];
let currentDraftId: string | null = null;
let previewDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function clearEditor(): void {
  currentDraftId = null;
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

// ─── Render ──────────────────────────────────────────────────────────────────

function renderPreview(): void {
  const title = (document.getElementById("admin-title") as any)?.value ?? "";
  const date = (document.getElementById("admin-date") as any)?.value ?? "";
  const tags = (document.getElementById("admin-tags") as HTMLInputElement)?.value ?? "";
  const content = (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "";
  const preview = document.getElementById("admin-preview");
  if (!preview) return;

  const html = md.render(content);
      const tagBadges = tags.split(",").map((t) => t.trim()).filter(Boolean)
        .map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("");

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  preview.innerHTML = `
    <article>
      <h1 class="heading-02">${title || "Untitled"}</h1>
      ${formattedDate ? `<div class="post-meta mt-1">${formattedDate}</div>` : ""}
      ${tagBadges ? `<div class="tags mt-2">${tagBadges}</div>` : ""}
      <div class="post-content mt-4">${html}</div>
    </article>
  `;
}

function renderTabBar(): void {
  const bar = document.getElementById("admin-tab-bar");
  if (!bar) return;

  bar.innerHTML = "";

  const sorted = drafts;

  // Build ui-tab-group imperatively
  const tabGroup = document.createElement("ui-tab-group");
  tabGroup.setAttribute("size", "m");
  tabGroup.setAttribute("closable", "");
  tabGroup.setAttribute("addable", "");

  for (const d of sorted) {
    const tabItem = document.createElement("ui-tab-item");
    tabItem.setAttribute("value", d.id);
    tabItem.setAttribute("label", d.title || "Untitled");
    if (d.id === currentDraftId) {
      tabItem.setAttribute("selected", "");
    }
    tabGroup.appendChild(tabItem);
  }

  // Theme toggle (outside tab group)
  const actions = document.createElement("div");
  actions.className = "admin-tab-bar-actions";

  const themeIcon = document.documentElement.getAttribute("data-theme") === "dark" ? "\u263E" : "\u2600\uFE0F";
  const themeBtn = document.createElement("button");
  themeBtn.className = "admin-btn";
  themeBtn.id = "admin-theme-toggle";
  themeBtn.setAttribute("aria-label", "Toggle dark mode");
  themeBtn.textContent = themeIcon;
  actions.appendChild(themeBtn);

  bar.appendChild(tabGroup);
  bar.appendChild(actions);

  // ─── Event listeners ───

  // Tab close
  tabGroup.addEventListener("tab-close", ((e: CustomEvent) => {
    const id = e.detail?.value as string;
    if (!id) return;
    drafts = drafts.filter((d) => d.id !== id);
    saveDrafts(drafts);
    if (currentDraftId === id) {
      if (drafts.length > 0) {
        const next = [...drafts].sort((a, b) => b.updatedAt - a.updatedAt)[0];
        loadDraftIntoEditor(next);
      } else {
        clearEditor();
        renderTabBar();
      }
    } else {
      renderTabBar();
    }
  }) as EventListener);

  // Tab select (click on a tab)
  tabGroup.addEventListener("tab-change", ((e: CustomEvent) => {
    const id = e.detail?.value as string;
    if (!id || id === currentDraftId) return;
    const draft = drafts.find((d) => d.id === id);
    if (draft) loadDraftIntoEditor(draft);
  }) as EventListener);

  // New draft (via addable "+" button)
  tabGroup.addEventListener("tab-add", () => {
    const draft: Draft = {
      id: generateId(),
      title: "",
      date: new Date().toISOString().split("T")[0],
      tags: "",
      excerpt: "",
      content: "",
      updatedAt: Date.now(),
    };
    drafts.push(draft);
    saveDrafts(drafts);
    loadDraftIntoEditor(draft);
  });

  // Theme toggle
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    if (dark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("blog-theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("blog-theme", "dark");
    }
    renderTabBar();
  });
}

function loadDraftIntoEditor(draft: Draft): void {
  currentDraftId = draft.id;
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
}

function getCurrentDraftData(): Omit<Draft, "id" | "updatedAt"> {
  return {
    title: (document.getElementById("admin-title") as any)?.value ?? "",
    date: (document.getElementById("admin-date") as any)?.value ?? "",
    tags: (document.getElementById("admin-tags") as HTMLInputElement)?.value ?? "",
    excerpt: (document.getElementById("admin-excerpt") as any)?.value ?? "",
    content: (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "",
  };
}

function saveCurrent(): void {
  const data = getCurrentDraftData();
  if (currentDraftId) {
    const idx = drafts.findIndex((d) => d.id === currentDraftId);
    if (idx >= 0) {
      drafts[idx] = { ...drafts[idx], ...data, updatedAt: Date.now() };
    }
  } else {
    const draft: Draft = { id: generateId(), ...data, updatedAt: Date.now() };
    drafts.push(draft);
    currentDraftId = draft.id;
  }
  saveDrafts(drafts);
  renderTabBar();
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
      <div id="admin-tab-bar" class="admin-tab-bar"></div>

      <div class="admin-editor">
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
          <button data-action="bold" title="Bold">B</button>
          <button data-action="italic" title="Italic">I</button>
          <button data-action="h2" title="Heading 2">H2</button>
          <button data-action="h3" title="Heading 3">H3</button>
          <button data-action="link" title="Link">🔗</button>
          <button data-action="code" title="Inline code">&lt;/&gt;</button>
          <button data-action="codeblock" title="Code block">▤</button>
          <button data-action="image" title="Image">🖼</button>
          <button data-action="ul" title="Bullet list">•</button>
          <button data-action="ol" title="Numbered list">1.</button>
          <button data-action="quote" title="Blockquote">"</button>
          <span class="admin-toolbar-spacer"></span>
          <button id="admin-preview-btn" class="admin-btn">Preview</button>
          <button id="admin-save-btn" class="admin-btn admin-btn-primary">Save</button>
          <button id="admin-export-btn" class="admin-btn">Export .md</button>
        </div>

        <div class="admin-split">
          <textarea id="admin-content" placeholder="Write your post in Markdown..." spellcheck="false"></textarea>
          <div id="admin-preview" class="admin-preview"></div>
        </div>
      </div>

      <!-- Fullscreen preview overlay -->
      <div id="admin-preview-overlay" class="admin-preview-overlay" style="display:none;">
        <div class="admin-preview-overlay-header">
          <span class="heading-05">Preview</span>
          <button id="admin-preview-close" class="admin-btn">Close</button>
        </div>
        <div class="admin-preview-overlay-content">
          <div id="admin-preview-full" style="max-width:720px;margin:0 auto;padding:48px 24px;"></div>
        </div>
      </div>
    </div>
  `,
  setup: () => {
    drafts = loadDrafts();

    const textarea = document.getElementById("admin-content") as HTMLTextAreaElement;
    const titleInput = document.getElementById("admin-title") as HTMLElement;
    const dateInput = document.getElementById("admin-date") as HTMLElement;
    const tagsInput = document.getElementById("admin-tags") as HTMLInputElement;
    const tagInput = document.getElementById("admin-tag-input") as HTMLInputElement;
    const tagList = document.getElementById("admin-tag-list")!;
    const excerptInput = document.getElementById("admin-excerpt") as HTMLElement;

    // clearEditor is now module-level (used by renderTabBar's tab-close handler)

    // ─── Tab bar: clearEditor is used by renderTabBar's tab-close handler ───
    // (event listeners are attached inside renderTabBar itself)

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
        if (currentDraftId || textarea.value.trim()) saveCurrent();
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

    // Save / Export / Preview buttons
    document.getElementById("admin-save-btn")?.addEventListener("click", saveCurrent);
    document.getElementById("admin-export-btn")?.addEventListener("click", exportAsMarkdown);

    // Fullscreen preview
    const overlay = document.getElementById("admin-preview-overlay")!;
    const previewFull = document.getElementById("admin-preview-full")!;

    document.getElementById("admin-preview-btn")?.addEventListener("click", () => {
      const title = (titleInput as any).value;
      const date = (dateInput as any).value;
      const tags = tagsInput.value;
      const content = textarea.value;
      const html = md.render(content);
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
          <div class="post-content mt-4">${html}</div>
        </article>
      `;
      overlay.style.display = "flex";
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
        saveCurrent();
      }
    });

    // Set default date + render initial state
    if (!(dateInput as any).value) (dateInput as any).value = new Date().toISOString().split("T")[0];
    renderPreview();

    // Load most recent draft or create a new one
    if (drafts.length > 0) {
      const latest = drafts.sort((a, b) => b.updatedAt - a.updatedAt)[0];
      loadDraftIntoEditor(latest);
    } else {
      const draft: Draft = {
        id: generateId(),
        title: "",
        date: new Date().toISOString().split("T")[0],
        tags: "",
        excerpt: "",
        content: "",
        updatedAt: Date.now(),
      };
      drafts.push(draft);
      saveDrafts(drafts);
      loadDraftIntoEditor(draft);
    }
    renderTabBar();
  },
};

