/** Shared route manifest — importable by both browser and Node prerender script. */

import type { Route } from "./router.js";
import { homeRoute } from "./pages/home.js";
import { blogRoute } from "./pages/blog.js";
import { postRoutes } from "./pages/post.js";
import { portfolioRoute } from "./pages/portfolio.js";
import { resumeRoute } from "./pages/resume.js";
import { aboutRoute } from "./pages/about.js";

export const routes: Route[] = [
  homeRoute,
  blogRoute,
  ...postRoutes,
  portfolioRoute,
  resumeRoute,
  aboutRoute,
];
