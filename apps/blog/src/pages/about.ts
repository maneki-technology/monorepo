import { getPage } from "virtual:pages";
import type { Route } from "../router.js";

function renderBadges(items: string[]): string {
  return `<div class="row gap-1" style="flex-wrap:wrap;">${items.map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}</div>`;
}

function renderAboutPage(): string {
  const page = getPage("about");

  if (!page) {
    return `
      <h1 class="heading-02 mb-4">About</h1>
      <div class="post-content reveal">
        <p>About page coming soon.</p>
      </div>`;
  }

  const meta = page.meta as {
    skills?: string[];
    focusAreas?: string[];
    social?: { github?: string; linkedin?: string; email?: string };
  };

  // Rendered markdown HTML from the plugin — contains prose + headings.
  // Enhance "What I work with" and "Areas of focus" sections with badge rows
  // by replacing the plain-text comma lists that follow those headings.
  let html = page.content;

  if (meta.skills?.length) {
    html = html.replace(/(<h2>What I work with<\/h2>\s*)<p>[^<]+<\/p>/, `$1${renderBadges(meta.skills)}`);
  }

  if (meta.focusAreas?.length) {
    html = html.replace(/(<h2>Areas of focus<\/h2>\s*)<p>[^<]+<\/p>/, `$1${renderBadges(meta.focusAreas)}`);
  }

  return `
    <h1 class="heading-02 mb-4">${page.title || "About"}</h1>
    <div class="post-content reveal">
      ${html}
    </div>`;
}

export const aboutRoute: Route = {
  id: "about",
  meta: {
    title: "About",
    description:
      "Senior Software Engineer with 14+ years of experience across the full stack. Polyglot engineer specializing in distributed systems, micro-frontend architecture, and fine-grained authorization.",
  },
  render: renderAboutPage,
};
