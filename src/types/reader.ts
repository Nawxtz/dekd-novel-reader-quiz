export type ThemeMode = 'day' | 'night' | 'sepia';
export type FontFamily = 'sans' | 'serif';
export type ColumnMeasure = 'narrow' | 'normal' | 'wide';

export interface ReaderPreferences {
  theme: ThemeMode;
  fontSizeStep: number;
  fontFamily: FontFamily;
  measure: ColumnMeasure;
}

export const FONT_SIZE_STEPS = [16, 18, 20, 22, 24, 28] as const;

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  theme: 'day',
  fontSizeStep: 2,
  fontFamily: 'sans',
  measure: 'normal',
};

export interface ReadingProgress {
  novelId: string;
  chapter: number;
  blockId: string;
  lastReadAt: string;
}

export interface CommentItem {
  id: string;
  chapterId: string;
  novelId: string;
  chapterNumber: number;
  authorName: string;
  body: string;
  createdAt: string;
  isSelf: boolean;
}

export interface ContentBlock {
  id: string;
  type: 'p' | 'dialogue' | 'heading';
  textTh: string;
  textEn?: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  titleTh: string;
  titleEn?: string;
  publishedAt: string;
  blocks: ContentBlock[];
}
