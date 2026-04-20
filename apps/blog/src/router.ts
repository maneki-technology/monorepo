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

type FlipDirection = "forward" | "reverse";

/** FLIP shared element: animate signature between hero and header site-name. */
function flipSignature(
  clone: HTMLElement,
  sourceRect: DOMRect,
  targetEl: HTMLElement,
  direction: FlipDirection,
  onComplete?: () => void,
): void {
  if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  const targetRect = targetEl.getBoundingClientRect();
  const targetStyles = getComputedStyle(targetEl);

  // Temporarily append clone to read computed styles (detached elements return defaults)
  clone.classList.add("sig-clone");
  clone.style.position = "fixed";
  clone.style.visibility = "hidden";
  document.body.appendChild(clone);

  // Capture source computed styles while classes are still applied
  const sourceStyles = getComputedStyle(clone);
  const sourceFontFamily = sourceStyles.fontFamily;
  const sourceColor = sourceStyles.color;

  // Strip classes that apply text-stroke (hero-accent, site-name) to avoid CSS conflicts
  clone.classList.remove("hero-accent", "site-name");

  // Use target's stroke — seamless handoff at landing
  const targetStrokePx = parseFloat(targetStyles.webkitTextStrokeWidth || "0");
  const flightStroke = `${targetStrokePx}px`;

  // Style the clone as fixed overlay at source position
  Object.assign(clone.style, {
    top: `${sourceRect.top}px`,
    left: `${sourceRect.left}px`,
    margin: "0",
    zIndex: "9999",
    pointerEvents: "none",
    willChange: "font-size, top, left",
    lineHeight: "1",
    fontFamily: sourceFontFamily,
    color: sourceColor,
    textDecoration: "none",
    visibility: "visible",
    webkitTextStrokeWidth: flightStroke,
    webkitTextStrokeColor: "currentColor",
  });

  // Ensure SVG underline in clone is fully visible (no clip-path animation)
  const svgInClone = clone.querySelector(".sig-underline") as SVGElement | null;
  if (svgInClone) {
    const path = svgInClone.querySelector("path");
    if (path) {
      path.style.clipPath = "inset(0 0 0 0)";
      path.style.animation = "none";
    }
  }

  // Hide target (clone is already in DOM)
  targetEl.style.opacity = "0";

  const duration = 400;
  const easing = "cubic-bezier(0.33, 0, 0.2, 1)";

  // Forward: use computed fontSize (hero's 1.8em resolves wrong on <body>)
  // Reverse: use bounding box height (matches the visual size of the source element)
  const sourceFontSize = direction === "forward" ? sourceStyles.fontSize : `${sourceRect.height}px`;
  const anim = clone.animate(
    [
      {
        fontSize: sourceFontSize,
        top: `${sourceRect.top}px`,
        left: `${sourceRect.left}px`,
      },
      {
        fontSize: targetStyles.fontSize,
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
      },
    ],
    { duration, easing, fill: "forwards" },
  );


  // SVG underline: retract on forward (un-draw right-to-left), fade in on reverse
  if (svgInClone) {
    const isForward = direction === "forward";
    if (isForward) {
      // Retract the underline — clip from right, thin out, and fade
      svgInClone.style.transformOrigin = "left bottom";
      svgInClone.animate(
        [
          { clipPath: "inset(0 0 0 0)", transform: "scaleY(1)", opacity: 1 },
          { clipPath: "inset(0 100% 0 0)", transform: "scaleY(0.05)", opacity: 0 },
        ],
        { duration: 250, easing: "ease-in", fill: "forwards" },
      );
    } else {
      svgInClone.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 200, delay: 200, easing: "ease-in", fill: "forwards" },
      );
    }
  }

  // Instant handoff: show target, remove clone
  const cleanup = () => {
    targetEl.style.opacity = "";
    clone.remove();
    // On reverse, re-trigger SVG underline draw animation on the hero
    if (direction === "reverse") {
      const heroSvgPath = targetEl.querySelector(".sig-underline path") as SVGElement | null;
      if (heroSvgPath) {
        heroSvgPath.style.animation = "none";
        targetEl.offsetHeight;
        heroSvgPath.style.animation = "sig-write 800ms ease-out forwards";
      }
    }
    onComplete?.();
  };
  anim.finished.then(cleanup, cleanup);
}

export async function renderRoute(): Promise<void> {
  const content = document.getElementById("content")!;
  const routeId = getCurrentRoute();
  const prevRoute = previousRoute;
  const route = await resolveRoute(routeId);

  if (!route) {
    // If path has a file extension, hand off to server (e.g. /feed.xml, /sitemap.xml)
    if (/\.[a-z]+$/i.test(window.location.pathname)) {
      window.location.reload();
      return;
    }
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

    const isLeavingHome = prevRoute === "home";
    const isGoingHome = routeId === "home";
    const siteName = document.querySelector(".site-name") as HTMLElement | null;

    // Forward: capture hero clone + rect BEFORE content swap destroys it
    // Fire FLIP immediately — don't wait for exit animation
    let forwardClone: HTMLElement | null = null;
    let forwardSourceRect: DOMRect | null = null;
    if (isLeavingHome && siteName) {
      const heroEl = document.querySelector(".hero-accent") as HTMLElement | null;
      if (heroEl) {
        forwardSourceRect = heroEl.getBoundingClientRect();
        forwardClone = heroEl.cloneNode(true) as HTMLElement;
        // Capture computed font-size while hero is still in its original context
        // (1.8em resolves differently on <body> vs inside <h1>)
        forwardClone.style.fontSize = getComputedStyle(heroEl).fontSize;
        heroEl.style.visibility = "hidden";
        // Start FLIP immediately — clone flies while page blurs out underneath
        flipSignature(forwardClone, forwardSourceRect, siteName, "forward", () => {
          if (routeId === "photography") {
            setTimeout(() => document.body.classList.add("wide-layout"), 50);
          }
        });
      }
    }

    // Exit animation (runs in parallel with FLIP on forward)
    content.classList.add("page-exit");
    await new Promise((r) => setTimeout(r, 150));
    content.innerHTML = route.render!();
    content.classList.remove("page-exit");

    // Toggle wide layout — delay when FLIP is active to avoid moving the target
    const hasFlip = isLeavingHome || isGoingHome;
    if (!hasFlip) {
      document.body.classList.toggle("wide-layout", routeId === "photography");
    } else if (!isLeavingHome) {
      // Going home — remove wide-layout after FLIP finishes
      setTimeout(() => {
        document.body.classList.remove("wide-layout");
      }, 400);
    }
    // Re-trigger enter animation
    content.style.animation = "none";
    content.offsetHeight; // force reflow
    content.style.animation = "";
    if (route.setup) {
      requestAnimationFrame(() => route.setup!());
    }

    // Reverse: fire FLIP after content swap (hero needs to exist first)
    if (isGoingHome && siteName) {
      const newHero = content.querySelector(".hero-accent") as HTMLElement | null;
      if (newHero) {
        const siteNameRect = siteName.getBoundingClientRect();
        const siteNameClone = siteName.cloneNode(true) as HTMLElement;
        newHero.style.opacity = "0";
        siteName.style.opacity = "0";
        const revealParent = newHero.closest(".reveal");
        if (revealParent) revealParent.classList.add("revealed");
        flipSignature(siteNameClone, siteNameRect, newHero, "reverse", () => {
          siteName.style.opacity = "";
        });
      }
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
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", url);

  // Toggle reading progress based on route config
  document.body.toggleAttribute("data-show-progress", !!route?.showProgress);

  // Toggle page identifier for conditional styling (e.g., hide site-name on home)
  document.documentElement.dataset.page = routeId === "home" ? "home" : "";



  // Update active nav link with directional underline
  const navLinks = Array.from(document.querySelectorAll("nav a[data-route]")) as HTMLAnchorElement[];
  const oldIndex = navLinks.findIndex((a) => a.classList.contains("active"));
  let newIndex = -1;
  navLinks.forEach((el, i) => {
    const isActive =
      el.dataset.route === routeId ||
      (routeId === "home" && !el.dataset.route) ||
      (routeId.startsWith("post/") && el.dataset.route === "blog");
      (routeId.startsWith("photography/") && el.dataset.route === "photography");
    if (isActive) newIndex = i;
  });
  const dir = oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex ? (newIndex > oldIndex ? "right" : "left") : null;
  navLinks.forEach((el, i) => {
    const isActive =
      el.dataset.route === routeId ||
      (routeId === "home" && !el.dataset.route) ||
      (routeId.startsWith("post/") && el.dataset.route === "blog");
      (routeId.startsWith("photography/") && el.dataset.route === "photography");
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
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || anchor.hasAttribute("external") || /\.[a-z]+$/i.test(href)) return;
    if (href.startsWith("/")) {
      e.preventDefault();
      history.pushState(null, "", href);
      renderRoute();
    }
  });

  renderRoute();
}
