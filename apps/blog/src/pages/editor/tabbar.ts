import { state, setState, onTabBarRender, hasUnpublishedChanges } from "./state.js";
import { saveUIState, loadDraftIntoEditor, clearEditor } from "./api.js";
import type { Draft } from "./types.js";

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

      // Tab close — remove from openTabs only (NOT delete from API)
      this.tabGroup.addEventListener("tab-close", ((e: CustomEvent) => {
        const slug = e.detail?.value as string;
        if (!slug) return;
        setState({ openTabs: state.openTabs.filter((d) => d.slug !== slug) });
        saveUIState();
        if (state.currentSlug === slug) {
          if (state.openTabs.length > 0) {
            loadDraftIntoEditor(state.openTabs[state.openTabs.length - 1]);
          } else {
            clearEditor();
          }
        }
      }) as EventListener);

      // Tab select
      this.tabGroup.addEventListener("tab-change", ((e: CustomEvent) => {
        const slug = e.detail?.value as string;
        if (!slug || slug === state.currentSlug) return;
        const draft = state.openTabs.find((d) => d.slug === slug);
        if (draft) loadDraftIntoEditor(draft);
        saveUIState();
      }) as EventListener);

      // New draft (via addable "+" button)
      this.tabGroup.addEventListener("tab-add", () => {
        const draft: Draft = {
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
        setState({ allPosts: [draft, ...state.allPosts], openTabs: [...state.openTabs, draft] });
        loadDraftIntoEditor(draft);
        saveUIState();
      });

      // Theme toggle
      themeBtn.onclick = () => {
        const dark = document.documentElement.getAttribute("data-theme") === "dark";
        if (dark) {
          document.documentElement.removeAttribute("data-theme");
        } else {
          document.documentElement.setAttribute("data-theme", "dark");
        }
        setState({});  // trigger render for theme icon update
        saveUIState();
      };
    }

    const currentSlugs = new Set(state.openTabs.map((t) => t.slug));

    // Remove closed tabs
    for (const [slug, el] of this.tabs) {
      if (!currentSlugs.has(slug)) {
        el.remove();
        this.tabs.delete(slug);
      }
    }

    // Add new tabs, patch existing
    for (const tab of state.openTabs) {
      const existing = this.tabs.get(tab.slug);
      if (existing) {
        this.patchTab(existing, tab);
      } else {
        const el = this.createTab(tab);
        this.tabs.set(tab.slug, el);
        // Insert before the internal add button (last child of tab group)
        this.tabGroup!.appendChild(el);
      }
    }

    // Update theme toggle icon
    const themeBtn = document.getElementById("admin-theme-toggle");
    if (themeBtn) {
      const themeIcon = document.documentElement.getAttribute("data-theme") === "dark" ? "\u263E" : "\u2600\uFE0F";
      if (themeBtn.textContent !== themeIcon) themeBtn.textContent = themeIcon;
    }
  }

  private patchTab(el: HTMLElement, draft: Draft): void {
    const newLabel = (draft.title || "Untitled") + (hasUnpublishedChanges(draft) ? " *" : "");
    if (el.getAttribute("label") !== newLabel) el.setAttribute("label", newLabel);
    if (draft.slug === state.currentSlug) el.setAttribute("selected", "");
    else el.removeAttribute("selected");
  }

  private createTab(draft: Draft): HTMLElement {
    const tabItem = document.createElement("ui-tab-item");
    tabItem.setAttribute("value", draft.slug);
    tabItem.setAttribute("label", (draft.title || "Untitled") + (hasUnpublishedChanges(draft) ? " *" : ""));
    if (draft.slug === state.currentSlug) {
      tabItem.setAttribute("selected", "");
    }
    return tabItem;
  }
}
