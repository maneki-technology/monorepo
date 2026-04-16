import { api } from "../../lib/api.js";
import { state, setState } from "./state.js";
import type { Post, EditorUIState, Project } from "./types.js";
import type { EditorPage } from "./editor-page.js";
import { resetUndoStack } from "./undo.js";
// ─── API helpers ─────────────────────────────────────────────────────────────

export async function fetchPosts(): Promise<Post[]> {
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
      publishedSnapshot: p.published_snapshot ? JSON.stringify({ type: "post", ...JSON.parse(p.published_snapshot as string) }) : null,
    }));
  } catch {
    return [];
  }
}

export async function savePost(post: Post): Promise<{ slug: string; saved: Post } | null> {
  try {
    const newSlug = toSlug(post.date, post.title || `untitled-${post.slug.split("-").pop()}`);
    const slug = post.persisted ? post.slug : newSlug;
    const tags = post.tags.split(",").map((t) => t.trim()).filter(Boolean);

    const mapPost = (p: Record<string, unknown>): Post => ({
      slug: p.slug as string,
      title: p.title as string,
      date: ((p.created_at as string) || "").split("T")[0],
      tags: Array.isArray(p.tags) ? (p.tags as string[]).join(", ") : "",
      excerpt: (p.excerpt as string) || "",
      content: (p.body_md as string) || "",
      status: p.status as string,
      updatedAt: (p.updated_at as string) || new Date().toISOString(),
      publishedAt: (p.published_at as string) || null,
      persisted: true,
      publishedSnapshot: p.published_snapshot ? JSON.stringify({ type: "post", ...JSON.parse(p.published_snapshot as string) }) : null,
    });

    if (post.persisted) {
      // Use PUT with new_slug for atomic rename (no DELETE + CREATE)
      const res = await api.api.posts[":slug"].$put({
        param: { slug },
        json: {
          title: post.title || "Untitled",
          body_md: post.content,
          excerpt: post.excerpt,
          tags,
          status: post.status as "draft" | "published",
          date: post.date,
          ...(newSlug !== slug ? { new_slug: newSlug } : {}),
        },
      });
      const data = await res.json() as { post: Record<string, unknown>; slug?: string };
      const savedSlug = (data.slug as string) || slug;
      return { slug: savedSlug, saved: mapPost(data.post) };
    }

    const res = await api.api.posts.$post({
      json: { title: post.title || "Untitled", slug: newSlug, body_md: post.content, excerpt: post.excerpt, tags, status: post.status as "draft" | "published", date: post.date },
    });
    const data = await res.json() as { post: Record<string, unknown> };
    return { slug: newSlug, saved: mapPost(data.post) };
  } catch {
    return null;
  }
}

export async function deletePost(slug: string): Promise<void> {
  try {
    await api.api.posts[":slug"].$delete({ param: { slug } });
  } catch {
    /* ignore */
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await api.api.projects.$get({ query: {} });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.projects as Record<string, unknown>[]).map((p) => ({
      slug: p.slug as string,
      title: p.title as string,
      description: (p.description as string) ?? "",
      content: (p.body_md as string) ?? "",
      tech: (p.tech as string[]).join(", "),
      url: (p.url as string) ?? "",
      repo: (p.repo as string) ?? "",
      image: (p.image as string) ?? "",
      pinned: !!p.pinned,
      sortOrder: (p.sort_order as number) ?? 0,
      status: p.status as string,
      updatedAt: p.updated_at as string,
      publishedAt: (p.published_at as string) ?? null,
      persisted: true,
      publishedSnapshot: p.published_snapshot ? JSON.stringify({ type: "project", ...JSON.parse(p.published_snapshot as string) }) : null,
    }));
  } catch {
    return [];
  }
}

export async function saveProject(project: Project): Promise<{ slug: string; saved: Project } | null> {
  try {
    const slug = project.persisted ? project.slug : project.slug || `project-${Date.now().toString(36)}`;
    const tech = project.tech.split(",").map((t) => t.trim()).filter(Boolean);

    const mapProject = (p: Record<string, unknown>): Project => ({
      slug: p.slug as string,
      title: p.title as string,
      description: (p.description as string) || "",
      content: (p.body_md as string) || "",
      tech: Array.isArray(p.tech) ? (p.tech as string[]).join(", ") : "",
      url: (p.url as string) || "",
      repo: (p.repo as string) || "",
      image: (p.image as string) || "",
      pinned: !!p.pinned,
      sortOrder: (p.sort_order as number) || 0,
      status: p.status as string,
      updatedAt: (p.updated_at as string) || new Date().toISOString(),
      publishedAt: (p.published_at as string) || null,
      persisted: true,
      publishedSnapshot: p.published_snapshot ? JSON.stringify({ type: "project", ...JSON.parse(p.published_snapshot as string) }) : null,
    });

    if (project.persisted) {
      const res = await api.api.projects[":slug"].$put({
        param: { slug },
        json: { title: project.title || "Untitled", description: project.description, body_md: project.content, tech, url: project.url || null, repo: project.repo || null, image: project.image || null, pinned: project.pinned, sort_order: project.sortOrder, status: project.status as "draft" | "published" },
      });
      const data = await res.json() as { project: Record<string, unknown> };
      return { slug, saved: mapProject(data.project) };
    }

    const res = await api.api.projects.$post({
      json: { title: project.title || "Untitled", slug, description: project.description, body_md: project.content, tech, url: project.url || null, repo: project.repo || null, image: project.image || null, pinned: project.pinned, sort_order: project.sortOrder, status: project.status as "draft" | "published" },
    });
    const data = await res.json() as { project: Record<string, unknown> };
    return { slug, saved: mapProject(data.project) };
  } catch {
    return null;
  }
}

export async function deleteProject(slug: string): Promise<void> {
  try {
    await api.api.projects[":slug"].$delete({ param: { slug } });
  } catch {
    /* ignore */
  }
}

export function toSlug(date: string, title: string): string {
  if (!title) return `draft-${Date.now().toString(36)}`;
  const base = title
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return date ? `${date}-${base}` : base;
}

// ─── UI state persistence ────────────────────────────────────────────────────

let uiStateSaveTimer: ReturnType<typeof setTimeout> | null = null;

export async function loadUIState(): Promise<EditorUIState | null> {
  try {
    const res = await api.api["ui-state"][":page"].$get({ param: { page: "admin" } });
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
    const root = _editorPage?.shadowRoot ?? null;
    const sidebar = root?.querySelector("#admin-sidebar") ?? null;
    const editorFields = {
      openTabs: state.openTabs.map((t) => t.slug),
      openProjectTabs: state.openProjectTabs.map((t) => t.slug),
      activeTab: state.currentSlug,
      activeTabType: state.activeTabType,
      sidebarCollapsed: sidebar?.getAttribute("state") === "collapsed",
      theme: document.documentElement.getAttribute("data-theme")?.includes("dark") ? "dark" : "light",
    };
    try {
      // Read existing state to preserve gallery fields
      let existing: Record<string, unknown> = {};
      const res = await api.api["ui-state"][":page"].$get({ param: { page: "admin" } });
      if (res.ok) {
        const data = await res.json();
        existing = (data.state ?? {}) as Record<string, unknown>;
      }
      await api.api["ui-state"][":page"].$put({
        param: { page: "admin" },
        json: { ...existing, ...editorFields } as unknown as Record<string, unknown>,
      });
    } catch {
      /* ignore */
    }
  }, 500);
}

// ─── Editor page reference ─────────────────────────────────────────────────

let _editorPage: EditorPage | null = null;

export function setEditorPage(page: EditorPage): void {
  _editorPage = page;
}

export function getCurrentPostData(): Omit<
  Post,
  "slug" | "updatedAt" | "publishedAt" | "persisted" | "publishedSnapshot"
> {
  return _editorPage!.getPostData();
}

export async function saveCurrent(_forceApi = false): Promise<"success" | "error"> {
  if (state.saving) return "error";
  setState({ saving: true });
  try {
    const currentPost = state.allPosts.find((p) => p.slug === state.currentSlug);
    const data = getCurrentPostData();
    const post: Post = {
      slug: state.currentSlug || "",
      ...data,
      updatedAt: new Date().toISOString(),
      publishedAt: currentPost?.publishedAt ?? null,
      persisted: currentPost?.persisted ?? false,
      publishedSnapshot: currentPost?.publishedSnapshot ?? null,
    };

    const result = await savePost(post);
    if (result) {
      const { slug, saved } = result;
      const idxAll = state.allPosts.findIndex((d) => d.slug === state.currentSlug);
      const idxTab = state.openTabs.findIndex((d) => d.slug === state.currentSlug);
      const newAllPosts = [...state.allPosts];
      if (idxAll >= 0) newAllPosts[idxAll] = saved;
      else newAllPosts.push(saved);
      const newOpenTabs = [...state.openTabs];
      if (idxTab >= 0) newOpenTabs[idxTab] = saved;
      else newOpenTabs.push(saved);
      setState({ allPosts: newAllPosts, openTabs: newOpenTabs, currentSlug: slug });
      // Clear dirty state after successful save
      const dirty = new Set(state.dirtySlugs);
      dirty.delete(state.currentSlug || "");
      dirty.delete(slug);
      setState({ dirtySlugs: dirty });
      _editorPage?.loadPost(saved);
      saveUIState();
      return "success";
    }
    return "error";
  } finally {
    setState({ saving: false });
  }
}

export function clearEditor(): void {
  setState({ currentSlug: null });
  _editorPage!.clearPost();
}

export function loadPostIntoEditor(post: Post): void {
  setState({ currentSlug: post.slug, activeTabType: "post" });
  _editorPage!.loadPost(post);
  resetUndoStack();
}

export function exportAsMarkdown(): void {
  const data = getCurrentPostData();
  const frontmatter = [
    "---",
    `title: ${data.title}`,
    `date: ${data.date}`,
    `excerpt: "${data.excerpt}"`,
    `tags: [${data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .join(", ")}]`,
    "---",
    "",
    data.content,
  ].join("\n");

  const slug =
    data.date && data.title
      ? `${data.date}-${data.title
          .toLowerCase()
          .replace(/[^\w]+/g, "-")
          .replace(/(^-|-$)/g, "")}`
      : "untitled";

  const blob = new Blob([frontmatter], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Project DOM helpers ──────────────────────────────────────────────────────

export function getCurrentProjectData(): Omit<
  Project,
  "slug" | "updatedAt" | "publishedAt" | "persisted" | "publishedSnapshot"
> {
  return _editorPage!.getProjectData();
}

export async function saveCurrentProject(_forceApi = false): Promise<"success" | "error"> {
  if (state.saving) return "error";
  setState({ saving: true });
  try {
    const currentProject = state.allProjects.find((p) => p.slug === state.currentSlug);
    const data = getCurrentProjectData();
    const project: Project = {
      slug: state.currentSlug || "",
      ...data,
      updatedAt: new Date().toISOString(),
      publishedAt: currentProject?.publishedAt ?? null,
      persisted: currentProject?.persisted ?? false,
      publishedSnapshot: currentProject?.publishedSnapshot ?? null,
    };

    const result = await saveProject(project);
    if (result) {
      const { slug, saved } = result;
      const idxAll = state.allProjects.findIndex((d) => d.slug === state.currentSlug);
      const idxTab = state.openProjectTabs.findIndex((d) => d.slug === state.currentSlug);
      const newAllProjects = [...state.allProjects];
      if (idxAll >= 0) newAllProjects[idxAll] = saved;
      else newAllProjects.push(saved);
      const newOpenProjectTabs = [...state.openProjectTabs];
      if (idxTab >= 0) newOpenProjectTabs[idxTab] = saved;
      else newOpenProjectTabs.push(saved);
      setState({ allProjects: newAllProjects, openProjectTabs: newOpenProjectTabs, currentSlug: slug });
      const dirty = new Set(state.dirtySlugs);
      dirty.delete(state.currentSlug || "");
      dirty.delete(slug);
      setState({ dirtySlugs: dirty });
      _editorPage?.loadProject(saved);
      saveUIState();
      return "success";
    }
    return "error";
  } finally {
    setState({ saving: false });
  }
}

export function loadProjectIntoEditor(project: Project): void {
  setState({ currentSlug: project.slug, activeTabType: "project" });
  _editorPage!.loadProject(project);
  resetUndoStack();
}
