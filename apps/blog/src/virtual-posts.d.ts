declare module "virtual:posts" {
  export interface Post {
    slug: string;
    title: string;
    date: string;
    readTime: string;
    excerpt: string;
    tags: string[];
    content: string;
  }
  export const posts: Post[];
}
