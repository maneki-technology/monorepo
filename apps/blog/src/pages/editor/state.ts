import type { Draft } from "./types.js";

export interface EditorState {
  allPosts: Draft[];
  openTabs: Draft[];
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
  currentSlug: null,
  saving: false,
  deployingSlugs: new Set(),
  deployingAction: null,
  pendingDeleteSlug: null,
  selectedSlugs: new Set(),
};

let renderScheduled = false;
const pendingRenders = { sidebar: false, tabbar: false };

const SIDEBAR_DEPS: (keyof EditorState)[] = ["allPosts", "currentSlug", "deployingSlugs", "pendingDeleteSlug", "selectedSlugs"];
const TABBAR_DEPS: (keyof EditorState)[] = ["openTabs", "currentSlug"];

type RenderCallback = () => void;
const sidebarCallbacks: RenderCallback[] = [];
const tabbarCallbacks: RenderCallback[] = [];

export function onSidebarRender(cb: RenderCallback): void { sidebarCallbacks.push(cb); }
export function onTabBarRender(cb: RenderCallback): void { tabbarCallbacks.push(cb); }

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
  }

  if (!renderScheduled && (pendingRenders.sidebar || pendingRenders.tabbar)) {
    renderScheduled = true;
    queueMicrotask(() => {
      renderScheduled = false;
      if (pendingRenders.sidebar) sidebarCallbacks.forEach((cb) => cb());
      if (pendingRenders.tabbar) tabbarCallbacks.forEach((cb) => cb());
      pendingRenders.sidebar = false;
      pendingRenders.tabbar = false;
    });
  }
}

export function hasUnpublishedChanges(post: Draft): boolean {
  if (!post.publishedAt) return post.status === "published";
  return post.updatedAt > post.publishedAt;
}
