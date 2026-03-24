import { SITE_URL, SITE_TITLE } from "./config.js";
/** Minimal History API router for the blog app. */

export interface Route {
  id: string;
  render: () => string;
  setup?: () => void;
  meta?: {
    title?: string;
    description?: string;
  };
  showProgress?: boolean;
}

const routes: Record<string, Route> = {};

export function registerRoute(route: Route): void {
  routes[route.id] = route;
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

export function renderRoute(): void {
  const content = document.getElementById("content")!;
  const routeId = getCurrentRoute();
  const route = routes[routeId];

  if (!route) {
    content.innerHTML = `<p class="body-01 text-secondary">Page not found.</p>`;
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
    content.innerHTML = route.render();
    if (route.setup) {
      requestAnimationFrame(() => route.setup!());
    }
  }

  // Update page title + meta tags
  const pageTitle = route.meta?.title ? `${route.meta.title} \u2014 ${SITE_TITLE}` : SITE_TITLE;
  document.title = pageTitle;
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", pageTitle);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && route.meta?.description) ogDesc.setAttribute("content", route.meta.description);
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && route.meta?.description) metaDesc.setAttribute("content", route.meta.description);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const url = routeId === "home" ? `${SITE_URL}/` : `${SITE_URL}/${routeId}`;
  if (ogUrl) ogUrl.setAttribute("content", url);

  // Toggle reading progress based on route config
  document.body.toggleAttribute("data-show-progress", !!route.showProgress);

  // Update active nav link
  document.querySelectorAll("nav a[data-route]").forEach((a) => {
    const el = a as HTMLAnchorElement;
    const isActive = el.dataset.route === routeId ||
      (routeId === "home" && !el.dataset.route) ||
      (routeId.startsWith("post/") && el.dataset.route === "blog");
    el.classList.toggle("active", isActive);
  });

  // Scroll to top on navigation
  window.scrollTo(0, 0);
}

export function initRouter(): void {
  // Handle browser back/forward
  window.addEventListener("popstate", renderRoute);

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
