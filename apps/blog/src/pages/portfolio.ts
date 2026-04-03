import { projects } from "virtual:projects";
import type { Route } from "../router.js";

export const portfolioRoute: Route = {
  id: "portfolio",
  meta: { title: "Portfolio", description: "Things I've built \u2014 from design systems to CLI tools." },
  render: () => `
    <h1 class="heading-02 mb-2">Portfolio</h1>
    <p class="body-01 text-secondary mb-4">Things I've built \u2014 from design systems to CLI tools.</p>
    <div class="project-grid">
      ${projects.map((project: any) => `
          <ui-card size="m" bordered>
            ${project.image ? `<ui-image src="${project.image}" alt="${project.title}" slot="image" style="width:100%;height:180px;--ui-image-fit:cover;"></ui-image>` : ""}
            <div class="stack gap-1" style="padding:20px;">
              <a href="/project/${project.slug}" class="heading-05" style="text-decoration:none;color:inherit;">${project.title}</a>
              <p class="body-02 text-secondary">${project.description}</p>
              <div class="tags">
                ${project.tech.map((t: string) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
              </div>
              <div class="row gap-2 mt-1">
                ${project.url ? `<ui-link size="s" href="${project.url}" external>Live</ui-link>` : ""}
                ${project.repo ? `<ui-link size="s" href="${project.repo}" external>Source</ui-link>` : ""}
              </div>
            </div>
          </ui-card>
      `).join("")}
    </div>
  `,
};
