export interface CultureEntry {
  id: string;
  title: string;
  type: string; // e.g. "Cerita Rakyat", "Tarian", "Musik dan Lagu"
  province: string; // e.g. "Kalimantan Tengah"
  description: string;
  image?: string;
  author?: string;
}
