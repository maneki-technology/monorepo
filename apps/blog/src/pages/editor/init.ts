import { api } from "../../lib/api.js";
import type { Draft } from "./types.js";
import { state, setState } from "./state.js";
import { fetchDrafts, loadUIState, loadDraftIntoEditor } from "./api.js";
import { SidebarRenderer } from "./sidebar.js";
import { TabBarRenderer } from "./tabbar.js";

export function setupInit(): void {
  const sidebarRenderer = new SidebarRenderer();
  const tabBarRenderer = new TabBarRenderer();

  // Load posts from API + UI state in parallel
  Promise.all([fetchDrafts(), loadUIState()]).then(async ([loaded, uiState]) => {
    setState({ allPosts: loaded });

    // Init renderers after DOM is ready and state is populated
    const listEl = document.getElementById("admin-post-list");
    const barEl = document.getElementById("admin-tab-bar");
    if (listEl) sidebarRenderer.init(listEl);
    if (barEl) tabBarRenderer.init(barEl);

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
}
