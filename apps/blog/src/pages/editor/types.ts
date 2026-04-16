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
  /** JSON snapshot of content at last publish — used to detect unpublished changes */
  publishedSnapshot: string | null;
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
  publishedSnapshot: string | null;
}

export interface PostSnapshot {
  type: "post";
  title: string;
  body_md: string;
  excerpt: string;
  tags: string;
  date: string;
}

export interface ProjectSnapshot {
  type: "project";
  title: string;
  body_md: string;
  description: string;
  tech: string;
}

export interface EditorUIState {
  openTabs: string[];
  openProjectTabs: string[];
  activeTab: string | null;
  activeTabType: "post" | "project" | null;
  sidebarCollapsed: boolean;
  theme: string;
}
