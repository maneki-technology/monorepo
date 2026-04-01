export interface Draft {
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

export interface EditorUIState {
  openTabs: string[];
  activeTab: string | null;
  sidebarCollapsed: boolean;
  theme: string;
}
