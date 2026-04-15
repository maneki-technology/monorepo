import { api } from "../../lib/api.js";
import { state, setState } from "./state.js";
import { getCurrentPostData, getCurrentProjectData } from "./api.js";

// ─── Public API (called by editor-page event handlers) ───────────────────────

export async function publishCurrent(publishSplit: HTMLElement | null): Promise<void> {
  if (publishSplit) publishSplit.setAttribute("status", "loading");
  try {
    if (!state.currentSlug) {
      if (publishSplit) publishSplit.setAttribute("status", "error");
      setTimeout(() => {
        if (publishSplit) publishSplit.setAttribute("status", "none");
      }, 2000);
      return;
    }

    if (state.activeTabType === "project") {
      await publishProject();
    } else {
      await publishPost();
    }

    if (publishSplit) {
      publishSplit.setAttribute("status", "success");
      setTimeout(() => publishSplit.setAttribute("status", "none"), 1500);
    }
  } catch {
    if (publishSplit) publishSplit.setAttribute("status", "error");
    setTimeout(() => {
      if (publishSplit) publishSplit.setAttribute("status", "none");
    }, 2000);
  }
}

export async function unpublishCurrent(publishSplit: HTMLElement | null): Promise<void> {
  if (!state.currentSlug) return;
  if (publishSplit) publishSplit.setAttribute("status", "loading");
  try {
    if (state.activeTabType === "project") {
      await unpublishProject();
    } else {
      await unpublishPost();
    }

    if (publishSplit) {
      publishSplit.setAttribute("status", "success");
      setTimeout(() => publishSplit.setAttribute("status", "none"), 1500);
    }
  } catch {
    if (publishSplit) publishSplit.setAttribute("status", "error");
    setTimeout(() => {
      if (publishSplit) publishSplit.setAttribute("status", "none");
    }, 2000);
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
    post.publishedContent = `${post.title}\n${post.content}\n${post.excerpt}\n${post.tags}\n${post.date}`;
  }
  const tab = state.openTabs.find((t) => t.slug === state.currentSlug);
  if (tab) {
    tab.status = "published";
    tab.publishedAt = new Date().toISOString();
    tab.publishedContent = `${tab.title}\n${tab.content}\n${tab.excerpt}\n${tab.tags}\n${tab.date}`;
  }
  setState({});
}

async function unpublishPost(): Promise<void> {
  await api.api.posts[":slug"].unpublish.$put({ param: { slug: state.currentSlug! } });
  const post = state.allPosts.find((p) => p.slug === state.currentSlug);
  if (post) post.status = "draft";
  const tab = state.openTabs.find((t) => t.slug === state.currentSlug);
  if (tab) tab.status = "draft";
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
    project.publishedContent = `${project.title}\n${project.content}\n${project.description}\n${project.tech}`;
  }
  const tab = state.openProjectTabs.find((t) => t.slug === state.currentSlug);
  if (tab) {
    tab.status = "published";
    tab.publishedAt = new Date().toISOString();
    tab.publishedContent = `${tab.title}\n${tab.content}\n${tab.description}\n${tab.tech}`;
  }
  setState({});
}

async function unpublishProject(): Promise<void> {
  await api.api.projects[":slug"].unpublish.$put({ param: { slug: state.currentSlug! } });
  const project = state.allProjects.find((p) => p.slug === state.currentSlug);
  if (project) project.status = "draft";
  const tab = state.openProjectTabs.find((t) => t.slug === state.currentSlug);
  if (tab) tab.status = "draft";
  setState({});
}
