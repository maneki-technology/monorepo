import { api } from "../../lib/api.js";
import type { Post, Project } from "./types.js";
import { state, setState } from "./state.js";
import { fetchPosts, fetchProjects, loadUIState, loadPostIntoEditor, loadProjectIntoEditor } from "./api.js";
import { SidebarRenderer } from "./sidebar.js";
import { TabBarRenderer } from "./tabbar.js";

export function setupInit(root: ParentNode): void {
  const sidebarRenderer = new SidebarRenderer();
  const tabBarRenderer = new TabBarRenderer();

  // Load posts + projects + UI state in parallel
  Promise.all([fetchPosts(), fetchProjects(), loadUIState()]).then(async ([posts, projects, uiState]) => {
    setState({ allPosts: posts, allProjects: projects });

    // Init renderers after DOM is ready and state is populated
    const sidebar = root.querySelector("#admin-sidebar");
    const barEl = root.querySelector("#admin-tab-bar") as HTMLElement | null;
    if (sidebar) sidebarRenderer.init(sidebar);
    if (barEl) tabBarRenderer.init(barEl);

    // Restore UI state
    if (uiState) {
      // Theme is already applied by the FOUC prevention script in admin.html
      // from localStorage — no need to override from backend

      // Restore sidebar collapsed state
      const sidebar = root.querySelector("#admin-sidebar") as HTMLElement | null;
      if (uiState.sidebarCollapsed && sidebar) {
        sidebar.setAttribute("state", "collapsed");
      }

      // Restore open post tabs
      const savedTabs = Array.isArray(uiState.openTabs) ? uiState.openTabs : [];
      const restoredTabs: Post[] = [];
      for (const slug of savedTabs) {
        const post = state.allPosts.find((p) => p.slug === slug);
        if (post && !restoredTabs.find((t) => t.slug === slug)) {
          restoredTabs.push(post);
        }
      }

      // Restore open project tabs
      const savedProjectTabs = Array.isArray(uiState.openProjectTabs) ? uiState.openProjectTabs : [];
      const restoredProjectTabs: Project[] = [];
      for (const slug of savedProjectTabs) {
        const project = state.allProjects.find((p) => p.slug === slug);
        if (project && !restoredProjectTabs.find((t) => t.slug === slug)) {
          restoredProjectTabs.push(project);
        }
      }

      setState({ openTabs: restoredTabs, openProjectTabs: restoredProjectTabs });

      // Restore active tab
      const savedType = uiState.activeTabType ?? "post";
      if (savedType === "project" && uiState.activeTab) {
        const activeProject = state.allProjects.find((p) => p.slug === uiState.activeTab);
        if (activeProject) {
          if (!restoredProjectTabs.find((t) => t.slug === activeProject.slug)) {
            setState({ openProjectTabs: [...state.openProjectTabs, activeProject] });
          }
          loadProjectIntoEditor(activeProject);
        } else if (restoredTabs.length > 0) {
          loadPostIntoEditor(restoredTabs[0]);
        }
      } else if (uiState.activeTab) {
        const activePost = state.allPosts.find((p) => p.slug === uiState.activeTab);
        if (activePost) {
          if (!restoredTabs.find((t) => t.slug === activePost.slug)) {
            setState({ openTabs: [...state.openTabs, activePost] });
          }
          loadPostIntoEditor(activePost);
        } else if (restoredTabs.length > 0) {
          loadPostIntoEditor(restoredTabs[0]);
        }
      } else if (restoredTabs.length > 0) {
        loadPostIntoEditor(restoredTabs[0]);
      }
    } else if (state.allPosts.length > 0) {
      // No saved state — open first post
      setState({ openTabs: [state.allPosts[0]] });
      loadPostIntoEditor(state.allPosts[0]);
    }

    setState({ loaded: true });

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
      } catch {
        /* ignore */
      }
    })();
  });
}
