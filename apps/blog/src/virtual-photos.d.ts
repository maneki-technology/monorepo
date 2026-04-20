declare module "virtual:photos" {
  export interface VirtualPhoto {
    id: number;
    r2Key: string;
    url: string;
    thumbnailUrl: string;
    title: string;
    caption: string;
    albumId: number | null;
    category: string;
    tags: string[];
    location: string;
    latitude: number | null;
    longitude: number | null;
    width: number;
    height: number;
    thumbhash: string;
    exif: Record<string, unknown>;
    sortOrder: number;
    featured: boolean;
  }
  export const photos: VirtualPhoto[];
  export const featuredPhotos: VirtualPhoto[];
  export const tags: string[];
}
