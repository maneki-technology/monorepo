/** Shared route manifest — importable by both browser and Node prerender script. */

import type { Route } from "./router.js";

/**
 * Browser routes use lazy loading — page modules are only fetched on navigation.
 * The prerender script (scripts/prerender.ts) imports pages directly and doesn't use this file.
 *
 * Route metadata (id, meta, showProgress) is eagerly available for nav highlighting and meta tags.
 * The render/setup functions are loaded on-demand via dynamic import().
 */
export const routes: Route[] = [
  {
    id: "home",
    meta: {
      title: "Home",
      description: "Senior Software Engineer. Distributed systems, micro-frontend architecture, and design systems.",
    },
    load: () => import("./pages/home.js").then((m) => m.homeRoute),
  },
  {
    id: "blog",
    meta: { title: "Blog", description: "Posts about fullstack development, design systems, and the web." },
    load: () => import("./pages/blog.js").then((m) => m.blogRoute),
  },
  {
    id: "portfolio",
    meta: {
      title: "Portfolio",
      description: "Selected engineering work across authorization, fintech dashboards, and frontend platforms.",
    },
    load: () => import("./pages/portfolio.js").then((m) => m.portfolioRoute),
  },
  {
    id: "photography",
    meta: { title: "Photography", description: "Photos from travels and daily life." },
    load: () => import("./pages/photography.js").then((m) => m.photographyRoute),
  },
  {
    id: "map",
    meta: { title: "Photo Map", description: "Explore photos on a treasure hunt map." },
    load: () => import("./pages/map.js").then((m) => m.mapRoute),
  },
  {
    id: "resume",
    meta: {
      title: "Resume",
      description:
        "Senior Software Engineer with 14+ years of experience. Go, TypeScript, Java, Python. Distributed systems, micro-frontends, fine-grained authorization.",
    },
    showProgress: true,
    load: () => import("./pages/resume.js").then((m) => m.resumeRoute),
  },
  {
    id: "about",
    meta: {
      title: "About",
      description:
        "Senior Software Engineer with 14+ years of hands-on experience across the full stack. Polyglot engineer specializing in distributed systems, micro-frontend architecture, and fine-grained authorization.",
    },
    load: () => import("./pages/about.js").then((m) => m.aboutRoute),
  },
];
