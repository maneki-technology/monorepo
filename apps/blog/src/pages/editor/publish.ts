import { api } from "../../lib/api.js";
import { state, setState } from "./state.js";
import { getCurrentDraftData } from "./api.js";

export function setupPublish(publishSplit: HTMLElement | null, textarea: HTMLTextAreaElement): void {
  // Publish (split button left action) — save, publish (triggers deploy), poll
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
}

// Re-export from api.js to keep the import local
import { exportAsMarkdown } from "./api.js";
