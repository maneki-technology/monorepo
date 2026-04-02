export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string;
  excerpt: string;
  content: string;
  status: string;
  updatedAt: string;
  publishedAt: string | null;
  persisted: boolean;
  /** Snapshot of content at last publish — used to detect unpublished changes */
  publishedContent: string | null;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  content: string;
  tech: string;
  url: string;
  repo: string;
  image: string;
  pinned: boolean;
  sortOrder: number;
  status: string;
  updatedAt: string;
  publishedAt: string | null;
  persisted: boolean;
  publishedContent: string | null;
}

export interface EditorUIState {
  openTabs: string[];
  openProjectTabs: string[];
  activeTab: string | null;
  activeTabType: "post" | "project" | null;
  sidebarCollapsed: boolean;
  theme: string;
}
