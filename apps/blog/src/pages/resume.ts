import { getPage } from "virtual:pages";
import type { Route } from "../router.js";

function renderBadges(items: string[]): string {
  return `<div class="row gap-1" style="flex-wrap:wrap;">${items.map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}</div>`;
}

function renderResumePage(): string {
  const page = getPage("resume");

  if (!page) {
    return `
      <h1 class="heading-02 mb-4">Resume</h1>
      <div class="post-content reveal">
        <p>Resume coming soon.</p>
      </div>`;
  }

  const meta = page.meta as {
    role?: string;
    links?: { label: string; href: string }[];
    skills?: Record<string, string[]>;
  };

  let html = "";

  // Header
  html += `<h1 class="heading-02 mb-2">${page.title || "Resume"}</h1>`;
  if (meta.role) html += `<p class="body-01 text-secondary">${meta.role}</p>`;
  if (meta.links?.length) {
    html += `<div class="row gap-2 mt-1" style="flex-wrap:wrap;">`;
    for (const link of meta.links) {
      const isExternal = link.href.startsWith("http");
      const isMail = link.href.startsWith("mailto:");
      html += `<ui-link href="${link.href}" size="s"${isExternal && !isMail ? " external" : ""}>${link.label}</ui-link>`;
    }
    html += `</div>`;
  }

  // Skills section — render as badge groups before the markdown content
  let content = page.content;
  if (meta.skills) {
    const skillsHtml = Object.entries(meta.skills)
      .map(([group, items]) => `<div><p class="heading-05 mb-1">${group}</p>${renderBadges(items)}</div>`)
      .join("");
    content = content.replace(
      /(<h2>Skills<\/h2>\s*)(<[^]*?)(?=<h2>)/,
      `$1<div class="stack gap-2 reveal">${skillsHtml}</div>`,
    );
  }

  html += `<div class="post-content mt-4">${content}</div>`;

  return html;
}

export const resumeRoute: Route = {
  id: "resume",
  meta: {
    title: "Resume",
    description:
      "Senior Software Engineer with 14+ years of experience. Go, TypeScript, Java, Python. Distributed systems, micro-frontends, fine-grained authorization.",
  },
  showProgress: true,
  render: renderResumePage,
};
