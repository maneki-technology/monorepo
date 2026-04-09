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
let previousRoute = "";

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

/** FLIP shared element: animate hero signature → header site-name on leaving home. */
function animateHeroToHeader(hero: HTMLElement): void {
  // Respect reduced motion preference
  if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  const siteName = document.querySelector(".site-name") as HTMLElement | null;
  if (!siteName) return;

  // F — First: capture source and target rects
  const heroRect = hero.getBoundingClientRect();
  const targetRect = siteName.getBoundingClientRect();
  const heroColor = getComputedStyle(hero).color;
  const heroFontSize = getComputedStyle(hero).fontSize;
  const targetFontSize = getComputedStyle(siteName).fontSize;

  // Scale based on font-size ratio (more accurate than bounding rect ratio)
  const scale = parseFloat(targetFontSize) / parseFloat(heroFontSize);

  // Build the clone — single Homeland span (no font cross-fade needed)
  const clone = document.createElement("div");
  clone.className = "sig-clone";
  clone.style.transformOrigin = "left top";
  clone.style.color = heroColor;

  const textSpan = document.createElement("span");
  textSpan.className = "sig-text sig-text-homeland";
  textSpan.textContent = "Kien Nguyen";
  textSpan.style.fontSize = heroFontSize;
  textSpan.style.lineHeight = "1";
  textSpan.style.position = "relative";

  // Clone the SVG underline if present
  const svgUnderline = hero.querySelector(".sig-underline") as SVGElement | null;
  let svgClone: SVGElement | null = null;
  if (svgUnderline) {
    svgClone = svgUnderline.cloneNode(true) as SVGElement;
    const path = svgClone.querySelector("path");
    if (path) {
      path.style.clipPath = "inset(0 0 0 0)";
      path.style.animation = "none";
      path.style.fill = heroColor;
    }
    svgClone.style.position = "absolute";
    svgClone.style.bottom = "-2px";
    svgClone.style.left = "-4%";
    svgClone.style.width = "115%";
    svgClone.style.height = "12px";
    svgClone.style.overflow = "visible";
    textSpan.appendChild(svgClone);
  }

  clone.appendChild(textSpan);

  // Position clone at hero's viewport location
  clone.style.transform = `translate(${heroRect.left}px, ${heroRect.top}px)`;
  document.body.appendChild(clone);

  // Hide originals
  hero.style.visibility = "hidden";
  siteName.style.opacity = "0";

  const duration = 450;
  const easing = "cubic-bezier(0.25, 0.1, 0.25, 1)";

  // P — Play: animate position + scale from hero to header
  const containerAnim = clone.animate(
    [
      { transform: `translate(${heroRect.left}px, ${heroRect.top}px) scale(1)` },
      { transform: `translate(${targetRect.left}px, ${targetRect.top}px) scale(${scale})` },
    ],
    { duration, easing, fill: "forwards" },
  );

  // Fade clone out in the last third for smooth handoff
  clone.animate(
    [{ opacity: 1 }, { opacity: 1, offset: 0.65 }, { opacity: 0 }],
    { duration, fill: "forwards" },
  );

  // Fade site-name in, overlapping with clone fade-out
  const siteNameAnim = siteName.animate(
    [{ opacity: 0 }, { opacity: 0, offset: 0.55 }, { opacity: 1 }],
    { duration, fill: "forwards" },
  );

  // Fade out SVG underline during flight
  if (svgClone) {
    svgClone.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 200, easing: "ease-in", fill: "forwards" },
    );
  }

  // Cleanup
  containerAnim.finished.then(
    () => { clone.remove(); siteNameAnim.cancel(); siteName.style.opacity = ""; },
    () => { clone.remove(); siteNameAnim.cancel(); siteName.style.opacity = ""; },
  );
  }

export async function renderRoute(): Promise<void> {
  const content = document.getElementById("content")!;
  const routeId = getCurrentRoute();
  const prevRoute = previousRoute;
  const route = await resolveRoute(routeId);

  if (!route) {
    content.innerHTML = `<p class="body-01 text-secondary">Page not found.</p>`;
    updateMeta(routeId, undefined);
    previousRoute = routeId;
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

    // FLIP shared element: hero signature → header site-name
    const isLeavingHome = prevRoute === "home";
    const heroEl = isLeavingHome ? document.querySelector(".hero-accent") as HTMLElement | null : null;
    if (heroEl) {
      animateHeroToHeader(heroEl);
    }

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
  previousRoute = routeId;
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

  // Toggle page identifier for conditional styling (e.g., hide site-name on home)
  document.documentElement.dataset.page = routeId === "home" ? "home" : "";
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
  // Set initial route so first SPA navigation knows where we came from
  previousRoute = getCurrentRoute();

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
