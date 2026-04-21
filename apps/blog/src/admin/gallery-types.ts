export interface Photo {
  id: number;
  r2_key: string;
  url: string;
  title: string;
  caption: string;
  album_id: number | null;
  category: string;
  width: number;
  height: number;
  thumbhash: string;
  thumbnail_url: string;
  exif_json: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  sort_order: number;
  featured: number;
  status: string;
  created_at: string;
}

export interface Album {
  id: number;
  slug: string;
  title: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  cover_photo_id: number | null;
  sort_order: number;
  status: string;
  created_at: string;
  photo_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}
