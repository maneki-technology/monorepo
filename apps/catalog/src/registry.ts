// ─── Page registry ───────────────────────────────────────────────────────────

export interface Page {
  title: string;
  section: string;
  render: () => string;
  setup?: () => void;
}

export const pages: Record<string, Page> = {};

export function registerPage(id: string, page: Page): void {
  pages[id] = page;
}
