/**
 * Shared admin UI state — single source of truth for all admin pages.
 * Persisted to backend via /api/ui-state/admin.
 * No localStorage — backend only.
 */

type Theme = "light" | "dark";
type ThemeListener = (theme: Theme) => void;

export interface AdminState {
  theme: Theme;
  galleryTab: "photos" | "albums";
  pagesSelectedSlug: string | null;
}

const DEFAULT_STATE: AdminState = { theme: "light", galleryTab: "photos", pagesSelectedSlug: null };

let state: AdminState = { ...DEFAULT_STATE };
const themeListeners: ThemeListener[] = [];

// ── Theme ──

export function getTheme(): Theme {
  return state.theme;
}

export function onThemeChange(cb: ThemeListener): void {
  themeListeners.push(cb);
}

export function toggleTheme(): void {
  const next: Theme = state.theme === "dark" ? "light" : "dark";
  state.theme = next;
  applyTheme(next);
  themeListeners.forEach((cb) => cb(next));
  saveState();
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme === "dark" ? "heroui-dark" : "heroui");
  // Set cookie for FOUC prevention on next page load (read synchronously in HTML)
  document.cookie = `admin-theme=${theme};path=/admin;max-age=31536000;SameSite=Lax`;
}

// ── Gallery tab ──

export function getGalleryTab(): "photos" | "albums" {
  return state.galleryTab;
}

export function setGalleryTab(tab: "photos" | "albums"): void {
  state.galleryTab = tab;
  saveState();
}

// ── Pages selected slug ──

export function getPagesSelectedSlug(): string | null {
  return state.pagesSelectedSlug;
}

export function setPagesSelectedSlug(slug: string | null): void {
  state.pagesSelectedSlug = slug;
  saveState();
}

// ── Persistence ──

/** Save current state to backend. Merges with existing to preserve editor fields. */
export async function saveState(): Promise<void> {
  const isDark = document.documentElement.getAttribute("data-theme") === "heroui-dark";
  state.theme = isDark ? "dark" : "light";
  try {
    let existing: Record<string, unknown> = {};
    const res = await fetch("/api/ui-state/admin", { credentials: "same-origin" });
    if (res.ok) {
      const data = (await res.json()) as { state?: Record<string, unknown> };
      existing = data.state ?? {};
    }
    await fetch("/api/ui-state/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ ...existing, theme: state.theme, galleryTab: state.galleryTab, pagesSelectedSlug: state.pagesSelectedSlug }),
    });
  } catch {
    /* ignore */
  }
}

// Keep old exports for backward compat
export const saveThemeToBackend = saveState;

/** Load admin state from backend. Returns the resolved state. */
export async function loadAdminState(): Promise<AdminState> {
  try {
    const res = await fetch("/api/ui-state/admin", { credentials: "same-origin" });
    if (res.ok) {
      const data = (await res.json()) as { state?: Partial<AdminState> };
      const saved = data.state;
      if (saved) {
        if (saved.theme === "dark" || saved.theme === "light") state.theme = saved.theme;
        if (saved.galleryTab === "photos" || saved.galleryTab === "albums") state.galleryTab = saved.galleryTab;
        if (typeof saved.pagesSelectedSlug === "string" || saved.pagesSelectedSlug === null) state.pagesSelectedSlug = saved.pagesSelectedSlug ?? null;
      }
    }
  } catch {
    /* default */
  }

  applyTheme(state.theme);
  themeListeners.forEach((cb) => cb(state.theme));
  return state;
}

// Keep old export name for backward compat
export const loadTheme = loadAdminState;
