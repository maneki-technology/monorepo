import { SITE_URL, SITE_TITLE } from "./config.js";
/** Minimal History API router for the blog app. */

export interface Route {
  id: string;
  render?: () => string;
  setup?: () => void;
  meta?: {
    title?: string;
    description?: string;
  };
  showProgress?: boolean;
  /** Lazy loader — returns the full route with render/setup. Called once, then cached. */
  load?: () => Promise<Route>;
}

/** Pattern route: matches a prefix like "post/" and lazily loads the matching route. */
interface PatternRoute {
  prefix: string;
  load: (id: string) => Promise<Route | undefined>;
}

const routes: Record<string, Route> = {};
const patternRoutes: PatternRoute[] = [];
/** Cache for resolved lazy routes — load() is called at most once per route. */
const loadCache: Record<string, Route> = {};

export function registerRoute(route: Route): void {
  routes[route.id] = route;
}

export function registerPatternRoute(pattern: PatternRoute): void {
  patternRoutes.push(pattern);
}

export function navigate(routeId: string): void {
  const path = routeId === "home" ? "/" : `/${routeId}`;
  history.pushState(null, "", path);
  renderRoute();
}

export function getCurrentRoute(): string {
  const path = window.location.pathname.slice(1).replace(/\/$/, ""); // remove leading and trailing /
  return path || "home";
}

async function resolveRoute(routeId: string): Promise<Route | undefined> {
  // Check exact match first
  const exact = routes[routeId];
  if (exact) {
    // If it has a lazy loader and hasn't been resolved yet, resolve it
    if (exact.load && !exact.render) {
      if (!loadCache[routeId]) {
        const loaded = await exact.load();
        loadCache[routeId] = loaded;
      }
      return { ...exact, ...loadCache[routeId], meta: { ...loadCache[routeId].meta, ...exact.meta } };
    }
    return exact;
  }

  // Check pattern routes (post/*, project/*)
  if (loadCache[routeId]) return loadCache[routeId];
  for (const pattern of patternRoutes) {
    if (routeId.startsWith(pattern.prefix)) {
      const loaded = await pattern.load(routeId);
      if (loaded) {
        loadCache[routeId] = loaded;
        return loaded;
      }
    }
  }

  return undefined;
}

export async function renderRoute(): Promise<void> {
  const content = document.getElementById("content")!;
  const routeId = getCurrentRoute();
  const route = await resolveRoute(routeId);

  if (!route) {
    content.innerHTML = `<p class="body-01 text-secondary">Page not found.</p>`;
    updateMeta(routeId, undefined);
    return;
  }
  const isPrerendered = content.hasAttribute("data-prerendered") && !content.dataset.hydrated;
  if (isPrerendered) {
    content.removeAttribute("data-prerendered");
    content.dataset.hydrated = "true";
    // Still run setup for interactive features (search, etc.)
    if (route.setup) {
      requestAnimationFrame(() => route.setup!());
    }
  } else {
    content.dataset.hydrated = "true";
    // Exit animation
    content.classList.add("page-exit");
    await new Promise((r) => setTimeout(r, 150));
    content.innerHTML = route.render!();
    content.classList.remove("page-exit");
    // Re-trigger enter animation
    content.style.animation = "none";
    content.offsetHeight; // force reflow
    content.style.animation = "";
    if (route.setup) {
      requestAnimationFrame(() => route.setup!());
    }
  }

  updateMeta(routeId, route);
  window.dispatchEvent(new Event("route-changed"));
}

function updateMeta(routeId: string, route: Route | undefined): void {
  // Update page title + meta tags
  const pageTitle = route?.meta?.title ? `${route.meta.title} — ${SITE_TITLE}` : SITE_TITLE;
  document.title = pageTitle;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", pageTitle);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && route?.meta?.description) ogDesc.setAttribute("content", route.meta.description);
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && route?.meta?.description) metaDesc.setAttribute("content", route.meta.description);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const url = routeId === "home" ? `${SITE_URL}/` : `${SITE_URL}/${routeId}`;
  if (ogUrl) ogUrl.setAttribute("content", url);

  // Toggle reading progress based on route config
  document.body.toggleAttribute("data-show-progress", !!route?.showProgress);

  // Update active nav link with directional underline
  const navLinks = Array.from(document.querySelectorAll("nav a[data-route]")) as HTMLAnchorElement[];
  const oldIndex = navLinks.findIndex((a) => a.classList.contains("active"));
  let newIndex = -1;
  navLinks.forEach((el, i) => {
    const isActive =
      el.dataset.route === routeId ||
      (routeId === "home" && !el.dataset.route) ||
      (routeId.startsWith("post/") && el.dataset.route === "blog");
    if (isActive) newIndex = i;
  });
  const dir = oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex ? (newIndex > oldIndex ? "right" : "left") : null;
  navLinks.forEach((el, i) => {
    const isActive =
      el.dataset.route === routeId ||
      (routeId === "home" && !el.dataset.route) ||
      (routeId.startsWith("post/") && el.dataset.route === "blog");
    if (dir) {
      // Outgoing: shrink toward the new item. Incoming: grow from the old item.
      el.dataset.navDir = i === oldIndex ? dir : i === newIndex ? (dir === "right" ? "left" : "right") : "";
    } else {
      el.dataset.navDir = "";
    }
    el.classList.toggle("active", isActive);
  });

  // Scroll to top on navigation
  window.scrollTo(0, 0);
}

export function initRouter(): void {
  // Handle browser back/forward
  window.addEventListener("popstate", () => {
    renderRoute();
  });

  // Intercept link clicks for SPA navigation
  document.addEventListener("click", (e) => {
    const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || anchor.hasAttribute("external")) return;
    if (href.startsWith("/")) {
      e.preventDefault();
      history.pushState(null, "", href);
      renderRoute();
    }
  });

  renderRoute();
}
