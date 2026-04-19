declare module "virtual:posts" {
  export interface Post {
    slug: string;
    title: string;
    date: string;
    readTime: string;
    excerpt: string;
    tags: string[];
    headings: { level: number; text: string; id: string }[];
    content: string;
  }
  export const posts: Post[];
}

declare module "virtual:drafts" {
  import type { Post } from "virtual:posts";
  export const drafts: Post[];
}
