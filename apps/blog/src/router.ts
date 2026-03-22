/** Minimal hash router for the blog app. */

export interface Route {
  id: string;
  render: () => string;
  setup?: () => void;
}

const routes: Record<string, Route> = {};

export function registerRoute(route: Route): void {
  routes[route.id] = route;
}

export function navigate(routeId: string): void {
  window.location.hash = routeId;
}

export function getCurrentRoute(): string {
  return window.location.hash.slice(1) || "home";
}

export function renderRoute(): void {
  const content = document.getElementById("content")!;
  const routeId = getCurrentRoute();
  const route = routes[routeId];

  if (!route) {
    content.innerHTML = `<p class="body-01 text-secondary">Page not found.</p>`;
    return;
  }

  content.innerHTML = route.render();

  if (route.setup) {
    requestAnimationFrame(() => route.setup!());
  }

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
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
}
