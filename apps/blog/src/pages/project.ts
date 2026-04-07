import { projects } from "virtual:projects";
import type { Route } from "../router.js";

export const projectRoutes: Route[] = projects.map((project) => ({
  id: `project/${project.slug}`,
  render: () => `
    <article>
      <a href="/portfolio" class="body-02 text-link" style="text-decoration:none;">\u2190 Back to portfolio</a>
      <h1 class="heading-02 mt-3">${project.title}</h1>
      <p class="body-01 text-secondary mt-1">${project.description}</p>
      <div class="tags mt-2">
        ${project.tech.map((t: string) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>
      <div class="row gap-2 mt-2">
        ${project.url ? `<ui-link size="s" href="${project.url}" external>Live</ui-link>` : ""}
        ${project.repo ? `<ui-link size="s" href="${project.repo}" external>Source</ui-link>` : ""}
      </div>
      ${project.image ? `<ui-image src="${project.image}" alt="${project.title}" style="width:100%;max-height:400px;--ui-image-fit:cover;--ui-image-bg:var(--fd-surface-secondary);border-radius:var(--fd-radius-md);margin-top:var(--fd-space-3);"></ui-image>` : ""}
      ${project.content ? `<div class="post-content mt-4">${project.content}</div>` : ""}
      <div style="border-top:1px solid var(--fd-border-minimal,#e4e4e7);padding-top:24px;margin-top:48px;">
        <a href="/portfolio" class="body-02 text-link" style="text-decoration:none;">\u2190 Back to all projects</a>
      </div>
    </article>
  `,
  meta: {
    title: project.title,
    description: project.description,
  },
}));

/** Lookup a single project route by ID — used by lazy router. */
export function findProjectRoute(id: string): Route | undefined {
  return projectRoutes.find((r) => r.id === id);
}
