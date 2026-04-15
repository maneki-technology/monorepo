declare module "virtual:albums" {
  export interface VirtualAlbum {
    id: number;
    slug: string;
    title: string;
    description: string;
    coverPhotoId: number | null;
    sortOrder: number;
    photoCount: number;
  }
  export const albums: VirtualAlbum[];
}
