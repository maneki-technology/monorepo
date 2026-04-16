declare module "virtual:pages" {
  export interface VirtualPage {
    slug: string;
    title: string;
    content: string;
    description: string;
    updatedAt: string;
  }
  export const pages: VirtualPage[];
  export function getPage(slug: string): VirtualPage | undefined;
}
