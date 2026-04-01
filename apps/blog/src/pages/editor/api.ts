import { api } from "../../lib/api.js";
import { state, setState } from "./state.js";
import type { Draft, EditorUIState } from "./types.js";
import { renderPreview } from "./preview.js";

// ─── API helpers ─────────────────────────────────────────────────────────────

export async function fetchDrafts(): Promise<Draft[]> {
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

export async function savePost(draft: Draft): Promise<string | null> {
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

export async function deletePost(slug: string): Promise<void> {
  try {
    await api.api.posts[":slug"].$delete({ param: { slug } });
  } catch { /* ignore */ }
}

export function toSlug(date: string, title: string): string {
  if (!title) return `draft-${Date.now().toString(36)}`;
  const base = title.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
  return date ? `${date}-${base}` : base;
}

// ─── UI state persistence ────────────────────────────────────────────────────

let uiStateSaveTimer: ReturnType<typeof setTimeout> | null = null;

export async function loadUIState(): Promise<EditorUIState | null> {
  try {
    const res = await api.api["ui-state"][":page"].$get({ param: { page: "editor" } });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.state ?? null) as EditorUIState | null;
  } catch {
    return null;
  }
}

export function saveUIState(): void {
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

// ─── DOM helpers ─────────────────────────────────────────────────────────────

export function getCurrentDraftData(): Omit<Draft, "slug" | "updatedAt" | "publishedAt" | "persisted"> {
  return {
    title: (document.getElementById("admin-title") as any)?.value ?? "",
    date: (document.getElementById("admin-date") as any)?.value ?? "",
    tags: (document.getElementById("admin-tags") as HTMLInputElement)?.value ?? "",
    excerpt: (document.getElementById("admin-excerpt") as any)?.value ?? "",
    content: (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "",
    status: state.allPosts.find((p) => p.slug === state.currentSlug)?.status ?? "draft",
  };
}

export async function saveCurrent(forceApi = false, statusEl?: HTMLElement | null): Promise<boolean> {
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

export function clearEditor(): void {
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

export function loadDraftIntoEditor(draft: Draft): void {
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

export function exportAsMarkdown(): void {
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
