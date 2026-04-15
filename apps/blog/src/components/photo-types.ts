export interface Photo {
  id: number;
  url: string;
  title: string;
  caption: string;
  albumId: number | null;
  category: string;
  width: number;
  height: number;
  thumbhash: string;
  exif: Record<string, unknown>;
  sortOrder: number;
  featured: boolean;
}
