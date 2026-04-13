import { api } from "../../lib/api.js";
import { state, setState } from "./state.js";
import type { Post, EditorUIState, Project } from "./types.js";
import { renderPreview } from "./preview.js";
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
      publishedContent: p.status === "published"
        ? `${p.title}\n${p.body_md}\n${p.excerpt}\n${(p.tags as string[]).join(", ")}\n${(p.created_at as string).split("T")[0]}`
        : null,
    }));
  } catch {
    return [];
  }
}

export async function savePost(post: Post): Promise<string | null> {
  try {
    const slug = post.persisted ? post.slug : toSlug(post.date, post.title);
    const tags = post.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (post.persisted) {
      await api.api.posts[":slug"].$put({
        param: { slug },
        json: {
          title: post.title,
          body_md: post.content,
          excerpt: post.excerpt,
          tags,
          status: post.status as "draft" | "published",
          date: post.date,
        },
      });
      return slug;
    }

    await api.api.posts.$post({
      json: {
        title: post.title || "Untitled",
        slug,
        body_md: post.content,
        excerpt: post.excerpt,
        tags,
        status: post.status as "draft" | "published",
        date: post.date,
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
      publishedContent: p.status === "published"
        ? `${p.title}\n${p.body_md}\n${p.description}\n${(p.tech as string[]).join(", ")}`
        : null,
    }));
  } catch { return []; }
}

export async function saveProject(project: Project): Promise<string | null> {
  try {
    const slug = project.persisted ? project.slug : project.slug || `project-${Date.now().toString(36)}`;
    const tech = project.tech.split(",").map((t) => t.trim()).filter(Boolean);

    if (project.persisted) {
      await api.api.projects[":slug"].$put({
        param: { slug },
        json: {
          title: project.title,
          description: project.description,
          body_md: project.content,
          tech,
          url: project.url || null,
          repo: project.repo || null,
          image: project.image || null,
          pinned: project.pinned,
          sort_order: project.sortOrder,
          status: project.status as "draft" | "published",
        },
      });
      return slug;
    }

    await api.api.projects.$post({
      json: {
        title: project.title || "Untitled",
        slug,
        description: project.description,
        body_md: project.content,
        tech,
        url: project.url || null,
        repo: project.repo || null,
        image: project.image || null,
        pinned: project.pinned,
        sort_order: project.sortOrder,
        status: project.status as "draft" | "published",
      },
    });
    return slug;
  } catch { return null; }
}

export async function deleteProject(slug: string): Promise<void> {
  try { await api.api.projects[":slug"].$delete({ param: { slug } }); } catch { /* ignore */ }
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
    const sidebar = document.getElementById("admin-sidebar");
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
    } catch { /* ignore */ }
  }, 500);
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

export function getCurrentPostData(): Omit<Post, "slug" | "updatedAt" | "publishedAt" | "persisted" | "publishedContent"> {
  return {
    title: (document.getElementById("admin-title") as any)?.value ?? "",
    date: (document.getElementById("admin-date") as any)?.value ?? "",
    tags: (document.getElementById("admin-tags") as HTMLInputElement)?.value ?? "",
    excerpt: (document.getElementById("admin-excerpt") as any)?.value ?? "",
    content: (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "",
    status: state.allPosts.find((p) => p.slug === state.currentSlug)?.status ?? "draft",
  };
}

export async function saveCurrent(_forceApi = false, statusEl?: HTMLElement | null): Promise<boolean> {
  if (state.saving) return false;
  setState({ saving: true });
  if (statusEl) statusEl.setAttribute("status", "loading");
  try {
    const currentPost = state.allPosts.find((p) => p.slug === state.currentSlug);
    const data = getCurrentPostData();
    const post: Post = {
      slug: state.currentSlug || "",
      ...data,
      updatedAt: new Date().toISOString(),
      publishedAt: currentPost?.publishedAt ?? null,
      persisted: currentPost?.persisted ?? false,
      publishedContent: currentPost?.publishedContent ?? null,
    };

    // Always persist to API (auto-save and explicit save both go to API)
    const slug = await savePost(post);
    if (slug) {
      const idxAll = state.allPosts.findIndex((d) => d.slug === state.currentSlug);
      const idxTab = state.openTabs.findIndex((d) => d.slug === state.currentSlug);
      const saved: Post = { ...post, slug, persisted: true };
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

export function loadPostIntoEditor(post: Post): void {
  setState({ currentSlug: post.slug, activeTabType: "post" });
  (document.getElementById("admin-title") as any).value = post.title;
  (document.getElementById("admin-date") as any).value = post.date;
  (document.getElementById("admin-tags") as HTMLInputElement).value = post.tags;
  const tagList = document.getElementById("admin-tag-list");
  if (tagList) {
    tagList.innerHTML = "";
    post.tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((name) => {
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
  (document.getElementById("admin-excerpt") as any).value = post.excerpt;
  (document.getElementById("admin-content") as HTMLTextAreaElement).value = post.content;
  renderPreview();
  // Reset undo stack with the loaded content as the initial state
  resetUndoStack();
}

export function exportAsMarkdown(): void {
  const data = getCurrentPostData();
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

// ─── Project DOM helpers ──────────────────────────────────────────────────────

export function getCurrentProjectData(): Omit<Project, "slug" | "updatedAt" | "publishedAt" | "persisted" | "publishedContent"> {
  return {
    title: (document.getElementById("admin-project-title") as any)?.value ?? "",
    description: (document.getElementById("admin-project-description") as any)?.value ?? "",
    content: (document.getElementById("admin-content") as HTMLTextAreaElement)?.value ?? "",
    tech: (document.getElementById("admin-project-tech") as HTMLInputElement)?.value ?? "",
    url: (document.getElementById("admin-project-url") as any)?.value ?? "",
    repo: (document.getElementById("admin-project-repo") as any)?.value ?? "",
    image: (document.getElementById("admin-project-image") as any)?.value ?? "",
    pinned: (document.getElementById("admin-project-pinned") as HTMLElement)?.hasAttribute("checked") ?? false,
    sortOrder: 0,
    status: state.allProjects.find((p) => p.slug === state.currentSlug)?.status ?? "draft",
  };
}

export async function saveCurrentProject(_forceApi = false, statusEl?: HTMLElement | null): Promise<boolean> {
  if (state.saving) return false;
  setState({ saving: true });
  if (statusEl) statusEl.setAttribute("status", "loading");
  try {
    const currentProject = state.allProjects.find((p) => p.slug === state.currentSlug);
    const data = getCurrentProjectData();
    const project: Project = {
      slug: state.currentSlug || "",
      ...data,
      updatedAt: new Date().toISOString(),
      publishedAt: currentProject?.publishedAt ?? null,
      persisted: currentProject?.persisted ?? false,
      publishedContent: currentProject?.publishedContent ?? null,
    };

    const slug = await saveProject(project);
    if (slug) {
      const idxAll = state.allProjects.findIndex((d) => d.slug === state.currentSlug);
      const idxTab = state.openProjectTabs.findIndex((d) => d.slug === state.currentSlug);
      const saved: Project = { ...project, slug, persisted: true };
      const newAllProjects = [...state.allProjects];
      if (idxAll >= 0) newAllProjects[idxAll] = saved;
      else newAllProjects.push(saved);
      const newOpenProjectTabs = [...state.openProjectTabs];
      if (idxTab >= 0) newOpenProjectTabs[idxTab] = saved;
      else newOpenProjectTabs.push(saved);
      setState({ allProjects: newAllProjects, openProjectTabs: newOpenProjectTabs, currentSlug: slug });
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

export function loadProjectIntoEditor(project: Project): void {
  setState({ currentSlug: project.slug, activeTabType: "project" });
  (document.getElementById("admin-project-title") as any).value = project.title;
  (document.getElementById("admin-project-description") as any).value = project.description;
  (document.getElementById("admin-content") as HTMLTextAreaElement).value = project.content;
  (document.getElementById("admin-project-tech") as HTMLInputElement).value = project.tech;
  const techList = document.getElementById("admin-project-tech-list");
  if (techList) {
    techList.innerHTML = "";
    project.tech.split(",").map((t) => t.trim()).filter(Boolean).forEach((name) => {
      const tag = document.createElement("ui-tag");
      tag.setAttribute("size", "s");
      tag.setAttribute("emphasis", "subtle");
      tag.setAttribute("dismissible", "");
      tag.textContent = name;
      tag.addEventListener("dismiss", () => {
        tag.remove();
        const tags = Array.from(techList.querySelectorAll("ui-tag")).map((t) => t.textContent?.trim() ?? "");
        (document.getElementById("admin-project-tech") as HTMLInputElement).value = tags.join(", ");
      });
      techList.appendChild(tag);
    });
  }
  (document.getElementById("admin-project-url") as any).value = project.url;
  (document.getElementById("admin-project-repo") as any).value = project.repo;
  const imagePreview = document.getElementById("admin-project-image-preview");
  const imageCaption = document.getElementById("admin-project-image-caption");
  const filename = project.image ? project.image.split("/").pop() ?? project.image : "";
  if (imageCaption) imageCaption.textContent = filename;
  if (imagePreview) imagePreview.setAttribute("src", project.image);
  const imageEmpty = document.getElementById("admin-project-image-empty");
  const imageFilled = document.getElementById("admin-project-image-filled");
  if (imageEmpty) imageEmpty.style.display = project.image ? "none" : "flex";
  if (imageFilled) imageFilled.style.display = project.image ? "" : "none";
  const pinnedEl = document.getElementById("admin-project-pinned") as HTMLElement;
  if (pinnedEl) {
    if (project.pinned) pinnedEl.setAttribute("checked", "");
    else pinnedEl.removeAttribute("checked");
  }
  renderPreview();
  resetUndoStack();
}

