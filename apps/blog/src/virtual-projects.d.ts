declare module "virtual:projects" {
  interface ProjectData {
    slug: string;
    title: string;
    description: string;
    content: string;
    tech: string[];
    url: string | null;
    repo: string | null;
    image: string | null;
    pinned: boolean;
    sortOrder: number;
  }
  export const projects: ProjectData[];
  export const pinnedProjects: ProjectData[];
}
