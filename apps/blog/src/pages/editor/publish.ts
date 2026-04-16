import { api } from "../../lib/api.js";
import { state, setState } from "./state.js";
import { getCurrentPostData, getCurrentProjectData } from "./api.js";

// ─── Public API (called by editor-page event handlers) ───────────────────────

export async function publishCurrent(): Promise<"success" | "error"> {
  try {
    if (!state.currentSlug) {
      return "error";
    }

    if (state.activeTabType === "project") {
      await publishProject();
    } else {
      await publishPost();
    }

    return "success";
  } catch {
    return "error";
  }
}

export async function unpublishCurrent(): Promise<"success" | "error"> {
  if (!state.currentSlug) return "error";
  try {
    if (state.activeTabType === "project") {
      await unpublishProject();
    } else {
      await unpublishPost();
    }

    return "success";
  } catch {
    return "error";
  }
}

// ─── Post publish/unpublish ─────────────────────────────────────────────────

async function publishPost(): Promise<void> {
  const data = getCurrentPostData();
  const tags = data.tags
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);
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
  if (post) {
    post.status = "published";
    post.publishedAt = new Date().toISOString();
    post.publishedSnapshot = JSON.stringify({ type: "post", title: post.title, body_md: post.content, excerpt: post.excerpt, tags: post.tags, date: post.date });
  }
  const tab = state.openTabs.find((t) => t.slug === state.currentSlug);
  if (tab) {
    tab.status = "published";
    tab.publishedAt = new Date().toISOString();
    tab.publishedSnapshot = JSON.stringify({ type: "post", title: tab.title, body_md: tab.content, excerpt: tab.excerpt, tags: tab.tags, date: tab.date });
  }
  setState({});
}

async function unpublishPost(): Promise<void> {
  await api.api.posts[":slug"].unpublish.$put({ param: { slug: state.currentSlug! } });
  const post = state.allPosts.find((p) => p.slug === state.currentSlug);
  if (post) { post.status = "draft"; post.publishedSnapshot = null; }
  const tab = state.openTabs.find((t) => t.slug === state.currentSlug);
  if (tab) { tab.status = "draft"; tab.publishedSnapshot = null; }
  setState({});
}

// ─── Project publish/unpublish ──────────────────────────────────────────────

async function publishProject(): Promise<void> {
  const data = getCurrentProjectData();
  const tech = data.tech
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);
  await api.api.projects[":slug"].publish.$put({
    param: { slug: state.currentSlug! },
    json: {
      title: data.title,
      description: data.description,
      body_md: data.content,
      tech,
      url: data.url || null,
      repo: data.repo || null,
      image: data.image || null,
      pinned: data.pinned,
      sort_order: data.sortOrder,
    },
  });
  const project = state.allProjects.find((p) => p.slug === state.currentSlug);
  if (project) {
    project.status = "published";
    project.publishedAt = new Date().toISOString();
    project.publishedSnapshot = JSON.stringify({ type: "project", title: project.title, body_md: project.content, description: project.description, tech: project.tech });
  }
  const tab = state.openProjectTabs.find((t) => t.slug === state.currentSlug);
  if (tab) {
    tab.status = "published";
    tab.publishedAt = new Date().toISOString();
    tab.publishedSnapshot = JSON.stringify({ type: "project", title: tab.title, body_md: tab.content, description: tab.description, tech: tab.tech });
  }
  setState({});
}

async function unpublishProject(): Promise<void> {
  await api.api.projects[":slug"].unpublish.$put({ param: { slug: state.currentSlug! } });
  const project = state.allProjects.find((p) => p.slug === state.currentSlug);
  if (project) { project.status = "draft"; project.publishedSnapshot = null; }
  const tab = state.openProjectTabs.find((t) => t.slug === state.currentSlug);
  if (tab) { tab.status = "draft"; tab.publishedSnapshot = null; }
  setState({});
}
