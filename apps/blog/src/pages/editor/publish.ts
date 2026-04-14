import { api } from "../../lib/api.js";
import { state, setState } from "./state.js";
import { getCurrentPostData, getCurrentProjectData } from "./api.js";

export function setupPublish(publishSplit: HTMLElement | null, _textarea: HTMLTextAreaElement, root: ParentNode): void {
  // Publish (split button left action) — save, publish (triggers deploy), poll
  publishSplit?.addEventListener("action", async () => {
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
        await publishProject(publishSplit);
      } else {
        await publishPost(publishSplit);
      }
    } catch {
      if (publishSplit) publishSplit.setAttribute("status", "error");
      setTimeout(() => {
        if (publishSplit) publishSplit.setAttribute("status", "none");
      }, 2000);
    }
  });

  // Unpublish (dropdown item) — unpublish + poll deploy status
  const unpublishBtn = root.querySelector("#admin-unpublish-btn") as HTMLElement | null;
  unpublishBtn?.addEventListener("select", async () => {
    if (!state.currentSlug) return;
    if (publishSplit) publishSplit.setAttribute("status", "loading");
    try {
      if (state.activeTabType === "project") {
        await unpublishProject(publishSplit);
      } else {
        await unpublishPost(publishSplit);
      }
    } catch {
      if (publishSplit) publishSplit.setAttribute("status", "error");
      setTimeout(() => {
        if (publishSplit) publishSplit.setAttribute("status", "none");
      }, 2000);
    }
  });

  // Export (split button dropdown item)
  const exportBtn = root.querySelector("#admin-export-btn") as HTMLElement | null;
  exportBtn?.addEventListener("select", exportAsMarkdown);
}

// Re-export from api.js to keep the import local
import { exportAsMarkdown } from "./api.js";

// ─── Post publish/unpublish ─────────────────────────────────────────────────

async function publishPost(publishSplit: HTMLElement | null): Promise<void> {
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
  if (post) post.status = "published";
  const tab = state.openTabs.find((t) => t.slug === state.currentSlug);
  if (tab) tab.status = "published";
  setState({ deployingSlugs: new Set([state.currentSlug!]), deployingAction: "publishing" });

  await pollDeployStatus(publishSplit, () => {
    if (state.currentSlug) {
      const p = state.allPosts.find((x) => x.slug === state.currentSlug);
      if (p) {
        p.publishedAt = new Date().toISOString();
        p.publishedContent = `${p.title}\n${p.content}\n${p.excerpt}\n${p.tags}\n${p.date}`;
      }
      const t = state.openTabs.find((x) => x.slug === state.currentSlug);
      if (t) {
        t.publishedAt = new Date().toISOString();
        t.publishedContent = `${t.title}\n${t.content}\n${t.excerpt}\n${t.tags}\n${t.date}`;
      }
    }
    setState({}); // trigger render
  });
}

async function unpublishPost(publishSplit: HTMLElement | null): Promise<void> {
  await api.api.posts[":slug"].unpublish.$put({ param: { slug: state.currentSlug! } });
  const post = state.allPosts.find((p) => p.slug === state.currentSlug);
  if (post) post.status = "draft";
  const tab = state.openTabs.find((t) => t.slug === state.currentSlug);
  if (tab) tab.status = "draft";
  setState({ deployingSlugs: new Set([state.currentSlug!]), deployingAction: "unpublishing" });
  await pollDeployStatus(publishSplit);
}

// ─── Project publish/unpublish ──────────────────────────────────────────────

async function publishProject(publishSplit: HTMLElement | null): Promise<void> {
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
  if (project) project.status = "published";
  const tab = state.openProjectTabs.find((t) => t.slug === state.currentSlug);
  if (tab) tab.status = "published";
  setState({ deployingSlugs: new Set([state.currentSlug!]), deployingAction: "publishing" });

  await pollDeployStatus(publishSplit, () => {
    if (state.currentSlug) {
      const p = state.allProjects.find((x) => x.slug === state.currentSlug);
      if (p) {
        p.publishedAt = new Date().toISOString();
        p.publishedContent = `${p.title}\n${p.content}\n${p.description}\n${p.tech}`;
      }
      const t = state.openProjectTabs.find((x) => x.slug === state.currentSlug);
      if (t) {
        t.publishedAt = new Date().toISOString();
        t.publishedContent = `${t.title}\n${t.content}\n${t.description}\n${t.tech}`;
      }
    }
    setState({});
  });
}

async function unpublishProject(publishSplit: HTMLElement | null): Promise<void> {
  await api.api.projects[":slug"].unpublish.$put({ param: { slug: state.currentSlug! } });
  const project = state.allProjects.find((p) => p.slug === state.currentSlug);
  if (project) project.status = "draft";
  const tab = state.openProjectTabs.find((t) => t.slug === state.currentSlug);
  if (tab) tab.status = "draft";
  setState({ deployingSlugs: new Set([state.currentSlug!]), deployingAction: "unpublishing" });
  await pollDeployStatus(publishSplit);
}

// ─── Shared deploy polling ──────────────────────────────────────────────────

async function pollDeployStatus(publishSplit: HTMLElement | null, onSuccess?: () => void): Promise<void> {
  const poll = async (): Promise<boolean> => {
    try {
      const statusRes = await api.api.deploy.status.$get();
      if (!statusRes.ok) return false;
      const { status: deployStatus } = await statusRes.json();

      if (deployStatus === "success") {
        setState({ deployingSlugs: new Set(), deployingAction: null });
        if (onSuccess) onSuccess();
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

  const done = await poll();
  if (!done) {
    const pollInterval = setInterval(async () => {
      if (await poll()) clearInterval(pollInterval);
    }, 5000);
  }
}
