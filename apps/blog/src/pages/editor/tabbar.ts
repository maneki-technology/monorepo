import { state, setState, onTabBarRender, hasUnpublishedChanges } from "./state.js";
import { saveUIState, loadPostIntoEditor, loadProjectIntoEditor, clearEditor } from "./api.js";
import type { Post, Project } from "./types.js";

export class TabBarRenderer {
  private tabs = new Map<string, HTMLElement>();
  private tabGroup: HTMLElement | null = null;
  private actionsContainer: HTMLElement | null = null;
  private bar: HTMLElement | null = null;

  init(barEl: HTMLElement): void {
    this.bar = barEl;
    onTabBarRender(() => this.sync());
  }

  sync(): void {
    if (!this.bar) return;

    // Create tab group on first sync if needed
    if (!this.tabGroup) {
      this.bar.innerHTML = "";

      this.tabGroup = document.createElement("ui-tab-group");
      this.tabGroup.setAttribute("size", "m");
      this.tabGroup.setAttribute("closable", "");
      this.tabGroup.setAttribute("addable", "");

      this.actionsContainer = document.createElement("div");
      this.actionsContainer.className = "admin-tab-bar-actions";

      const themeBtn = document.createElement("ui-button");
      themeBtn.setAttribute("action", "secondary");
      themeBtn.setAttribute("emphasis", "minimal");
      themeBtn.setAttribute("size", "s");
      themeBtn.id = "admin-theme-toggle";
      themeBtn.setAttribute("aria-label", "Toggle dark mode");
      this.actionsContainer.appendChild(themeBtn);

      this.bar.appendChild(this.tabGroup);
      this.bar.appendChild(this.actionsContainer);

      // Tab close
      this.tabGroup.addEventListener("tab-close", ((e: CustomEvent) => {
        const value = e.detail?.value as string;
        if (!value) return;

        if (value.startsWith("project:")) {
          const slug = value.slice(8);
          setState({ openProjectTabs: state.openProjectTabs.filter((d) => d.slug !== slug) });
          saveUIState();
          if (state.currentSlug === slug && state.activeTabType === "project") {
            if (state.openProjectTabs.length > 0) {
              loadProjectIntoEditor(state.openProjectTabs[state.openProjectTabs.length - 1]);
            } else if (state.openTabs.length > 0) {
              loadPostIntoEditor(state.openTabs[state.openTabs.length - 1]);
            } else {
              clearEditor();
            }
          }
        } else {
          setState({ openTabs: state.openTabs.filter((d) => d.slug !== value) });
          saveUIState();
          if (state.currentSlug === value && state.activeTabType === "post") {
            if (state.openTabs.length > 0) {
              loadPostIntoEditor(state.openTabs[state.openTabs.length - 1]);
            } else if (state.openProjectTabs.length > 0) {
              loadProjectIntoEditor(state.openProjectTabs[state.openProjectTabs.length - 1]);
            } else {
              clearEditor();
            }
          }
        }
      }) as EventListener);

      // Tab select
      this.tabGroup.addEventListener("tab-change", ((e: CustomEvent) => {
        const value = e.detail?.value as string;
        if (!value) return;

        if (value.startsWith("project:")) {
          const slug = value.slice(8);
          if (slug === state.currentSlug && state.activeTabType === "project") return;
          const project = state.openProjectTabs.find((d) => d.slug === slug);
          if (project) loadProjectIntoEditor(project);
        } else {
          if (value === state.currentSlug && state.activeTabType === "post") return;
          const post = state.openTabs.find((d) => d.slug === value);
          if (post) loadPostIntoEditor(post);
        }
        saveUIState();
      }) as EventListener);

      // New draft (via addable "+" button)
      this.tabGroup.addEventListener("tab-add", () => {
        const post: Post = {
          slug: `draft-${Date.now().toString(36)}`,
          title: "",
          date: new Date().toISOString().split("T")[0],
          tags: "",
          excerpt: "",
          content: "",
          status: "draft",
          updatedAt: new Date().toISOString(),
          publishedAt: null,
          persisted: false,
          publishedContent: null,
        };
        setState({ allPosts: [post, ...state.allPosts], openTabs: [...state.openTabs, post] });
        loadPostIntoEditor(post);
        saveUIState();
      });

      // Theme toggle
      themeBtn.onclick = () => {
        const dark = document.documentElement.getAttribute("data-theme") === "heroui-dark";
        if (dark) {
          document.documentElement.setAttribute("data-theme", "heroui");
        } else {
          document.documentElement.setAttribute("data-theme", "heroui-dark");
        }
        setState({});  // trigger render for theme icon update
        saveUIState();
      };
    }

    // Build combined tab list: posts then projects
    const allTabKeys = new Set<string>();
    for (const tab of state.openTabs) allTabKeys.add(tab.slug);
    for (const tab of state.openProjectTabs) allTabKeys.add(`project:${tab.slug}`);

    // Remove closed tabs
    for (const [key, el] of this.tabs) {
      if (!allTabKeys.has(key)) {
        el.remove();
        this.tabs.delete(key);
      }
    }

    // Add/patch post tabs
    for (const tab of state.openTabs) {
      const existing = this.tabs.get(tab.slug);
      if (existing) {
        this.patchTab(existing, tab, "post");
      } else {
        const el = this.createTab(tab, "post");
        this.tabs.set(tab.slug, el);
        this.tabGroup!.appendChild(el);
      }
    }

    // Add/patch project tabs
    for (const tab of state.openProjectTabs) {
      const key = `project:${tab.slug}`;
      const existing = this.tabs.get(key);
      if (existing) {
        this.patchTab(existing, tab, "project");
      } else {
        const el = this.createTab(tab, "project");
        this.tabs.set(key, el);
        this.tabGroup!.appendChild(el);
      }
    }

    // Update theme toggle icon
    const themeBtn = document.getElementById("admin-theme-toggle");
    if (themeBtn) {
      const themeIcon = document.documentElement.getAttribute("data-theme") === "heroui-dark" ? "\u263E" : "\u2600\uFE0F";
      if (themeBtn.textContent !== themeIcon) themeBtn.textContent = themeIcon;
    }
  }

  private patchTab(el: HTMLElement, item: Post | Project, type: "post" | "project"): void {
    const newLabel = item.title || "Untitled";
    if (el.getAttribute("label") !== newLabel) el.setAttribute("label", newLabel);

    let prefixEl = el.querySelector("[slot=\"prefix\"]") as HTMLElement;
    if (!prefixEl) {
      prefixEl = document.createElement("span");
      prefixEl.setAttribute("slot", "prefix");
      el.appendChild(prefixEl);
    }
    const icon = type === "project" ? "📦" : "📝";
    const dirty = hasUnpublishedChanges(item) ? '<span style="color:var(--fd-surface-destructive, #d91f11)">*</span> ' : "";
    prefixEl.innerHTML = dirty + icon;

    const isActive = item.slug === state.currentSlug && state.activeTabType === type;
    if (isActive) el.setAttribute("selected", "");
    else el.removeAttribute("selected");
  }

  private createTab(item: Post | Project, type: "post" | "project"): HTMLElement {
    const tabItem = document.createElement("ui-tab-item");
    const value = type === "project" ? `project:${item.slug}` : item.slug;
    tabItem.setAttribute("value", value);
    const icon = type === "project" ? "📦" : "📝";
    const dirty = hasUnpublishedChanges(item) ? '<span style="color:var(--fd-surface-destructive, #d91f11)">*</span> ' : "";
    const prefixEl = document.createElement("span");
    prefixEl.setAttribute("slot", "prefix");
    prefixEl.innerHTML = dirty + icon;
    tabItem.appendChild(prefixEl);
    tabItem.setAttribute("label", item.title || "Untitled");
    const isActive = item.slug === state.currentSlug && state.activeTabType === type;
    if (isActive) {
      tabItem.setAttribute("selected", "");
    }
    return tabItem;
  }
}
