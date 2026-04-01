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
}

export interface EditorUIState {
  openTabs: string[];
  activeTab: string | null;
  sidebarCollapsed: boolean;
  theme: string;
}
