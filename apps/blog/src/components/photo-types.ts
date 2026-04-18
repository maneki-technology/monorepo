export interface Photo {
  id: number;
  url: string;
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
