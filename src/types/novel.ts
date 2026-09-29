export type Category =
  | "แฟนตาซี"
  | "รักโรแมนติก"
  | "แอ็กชัน"
  | "กำลังภายใน"
  | "วัยรุ่น";

export type CategoryFilter = "ทั้งหมด" | Category;

export interface Novel {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: Category;
  totalChapters: number;
  synopsis: string;
  rating?: number;
  views?: number;
}

export interface Bookmark {
  id: string;
  novelId: string;
  title: string;
  author: string;
  coverUrl: string;
  category: Category;
  currentChapter: number;
  totalChapters: number;
  currentChapterTitle: string;
  lastReadAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  author: string;
  illustrator?: string;
  imageUrl: string;
  gradient: string;
  novelId?: string;
}

export type SortOption = "latest" | "title" | "progress";

export interface BookmarkFormData {
  title: string;
  author: string;
  category: Category;
  currentChapter: number;
  totalChapters: number;
  currentChapterTitle?: string;
  coverUrl: string;
  note?: string;
}
