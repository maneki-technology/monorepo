import type { Post, Project } from "./types.js";

export interface EditorState {
  allPosts: Post[];
  openTabs: Post[];
  allProjects: Project[];
  openProjectTabs: Project[];
  activeTabType: "post" | "project" | null;
  loaded: boolean;
  currentSlug: string | null;
  saving: boolean;
  deployingSlugs: Set<string>;
  deployingAction: "publishing" | "unpublishing" | null;
  pendingDeleteSlug: string | null;
  selectedSlugs: Set<string>;
}

export const state: EditorState = {
  allPosts: [],
  openTabs: [],
  allProjects: [],
  openProjectTabs: [],
  activeTabType: null,
  loaded: false,
  currentSlug: null,
  saving: false,
  deployingSlugs: new Set(),
  deployingAction: null,
  pendingDeleteSlug: null,
  selectedSlugs: new Set(),
};

let renderScheduled = false;
const pendingRenders = { sidebar: false, tabbar: false, form: false };

const SIDEBAR_DEPS: (keyof EditorState)[] = ["allPosts", "allProjects", "currentSlug", "deployingSlugs", "pendingDeleteSlug", "selectedSlugs"];
const TABBAR_DEPS: (keyof EditorState)[] = ["openTabs", "openProjectTabs", "currentSlug", "activeTabType"];
const FORM_DEPS: (keyof EditorState)[] = ["loaded", "activeTabType"];

type RenderCallback = () => void;
const sidebarCallbacks: RenderCallback[] = [];
const tabbarCallbacks: RenderCallback[] = [];
const formCallbacks: RenderCallback[] = [];

export function onSidebarRender(cb: RenderCallback): void { sidebarCallbacks.push(cb); }
export function onTabBarRender(cb: RenderCallback): void { tabbarCallbacks.push(cb); }
export function onFormRender(cb: RenderCallback): void { formCallbacks.push(cb); }

export function setState(partial: Partial<EditorState>): void {
  const keys = Object.keys(partial) as (keyof EditorState)[];
  Object.assign(state, partial);

  // Empty setState({}) forces both renders (used for in-place mutations)
  if (keys.length === 0) {
    pendingRenders.sidebar = true;
    pendingRenders.tabbar = true;
  } else {
    if (keys.some((k) => SIDEBAR_DEPS.includes(k))) pendingRenders.sidebar = true;
    if (keys.some((k) => TABBAR_DEPS.includes(k))) pendingRenders.tabbar = true;
    if (keys.some((k) => FORM_DEPS.includes(k))) pendingRenders.form = true;
  }

  if (!renderScheduled && (pendingRenders.sidebar || pendingRenders.tabbar || pendingRenders.form)) {
    renderScheduled = true;
    queueMicrotask(() => {
      renderScheduled = false;
      if (pendingRenders.sidebar) sidebarCallbacks.forEach((cb) => cb());
      if (pendingRenders.tabbar) tabbarCallbacks.forEach((cb) => cb());
      if (pendingRenders.form) formCallbacks.forEach((cb) => cb());
      pendingRenders.sidebar = false;
      pendingRenders.tabbar = false;
      pendingRenders.form = false;
    });
  }
}

export function hasUnpublishedChanges(item: Post | Project): boolean {
  if (item.status !== "published") return false;
  if (item.publishedContent === null) return false;
  if ("date" in item) {
    // Post (post)
    const current = `${item.title}\n${item.content}\n${item.excerpt}\n${item.tags}\n${item.date}`;
    return current !== item.publishedContent;
  }
  // Project
  const current = `${item.title}\n${item.content}\n${item.description}\n${item.tech}`;
  return current !== item.publishedContent;
}
