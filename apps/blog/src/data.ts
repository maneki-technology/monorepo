/** Portfolio project data. Blog posts come from content/posts/*.md via virtual:posts. */

export interface Project {
  title: string;
  description: string;
  tags: string[];
  url?: string;
  repo?: string;
}

export const projects: Project[] = [
  {
    title: "Maneki Design System",
    description: "A zero-dependency Web Component design system with 50+ components, design tokens, and full dark theme support.",
    tags: ["TypeScript", "Web Components", "Figma"],
    url: "https://maneki-catalog.pages.dev/",
    repo: "https://github.com/maneki-technology/monorepo",
  },
  {
    title: "Grid Layout Engine",
    description: "Drag-and-resize grid layout as a Web Component. ~8KB gzipped, keyboard accessible, responsive breakpoints.",
    tags: ["TypeScript", "Algorithms", "A11y"],
    repo: "https://github.com/maneki-technology/monorepo",
  },
  {
    title: "Fullstack Dashboard",
    description: "Real-time analytics dashboard with WebSocket streaming, server-side aggregation, and responsive panel layouts.",
    tags: ["Node.js", "PostgreSQL", "WebSockets"],
  },
  {
    title: "CLI Build Tool",
    description: "Custom monorepo build orchestrator with dependency graph resolution, parallel execution, and incremental caching.",
    tags: ["Rust", "CLI", "DevTools"],
  },
];
