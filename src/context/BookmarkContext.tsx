"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore, useMemo } from "react";
import { Bookmark, BookmarkFormData, CatalogNovel, Category, NOVEL_CATEGORIES } from "@/types/novel";
import { ReadingProgress, ReaderPreferences, CommentItem, DEFAULT_READER_PREFERENCES } from "@/types/reader";
import { bookmarksStore } from "@/hooks/useBookmarks";
import { INITIAL_COMMENTS } from "@/data/mockNovels";
import { generateUUID } from "@/lib/uuid";
import { normalizeString } from "@/lib/sanitize";

export const BOOKMARKS_STORAGE_KEY_V1 = "dekd_bookmarks_v1";
export const READING_PROGRESS_STORAGE_KEY = "dekd_reading_progress_v1";
export const READER_PREFS_STORAGE_KEY = "dekd_reader_prefs_v1";
export const CHAPTER_COMMENTS_STORAGE_KEY = "dekd_chapter_comments_v1";

// Reading progress store

class ReadingProgressStore {
  private state: Record<string, ReadingProgress> = {};
  private subscribers = new Set<() => void>();
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== READING_PROGRESS_STORAGE_KEY || !event.newValue) return;
    try {
      this.state = JSON.parse(event.newValue);
      this.notify();
    } catch {
      // Ignore parse errors from background tabs
    }
  };

  public init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    try {
      const stored = localStorage.getItem(READING_PROGRESS_STORAGE_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
      }
    } catch {
      this.state = {};
    }
    this.notify();
  }

  public getSnapshot = (): Record<string, ReadingProgress> => {
    return this.state;
  };

  public getServerSnapshot = (): Record<string, ReadingProgress> => {
    return {};
  };

  public subscribe = (callback: () => void): (() => void) => {
    this.subscribers.add(callback);
    if (!this.initialized && typeof window !== "undefined") {
      this.init();
    }
    return () => {
      this.subscribers.delete(callback);
    };
  };

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public getProgress(novelId: string): ReadingProgress | undefined {
    return this.state[novelId];
  }

  public saveProgress(progress: ReadingProgress) {
    this.state = {
      ...this.state,
      [progress.novelId]: progress,
    };
    this.notify();
    this.persist();
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(this.state));
    } catch (quotaError) {
      console.warn("Storage quota exceeded for reading progress, pruning older entries", quotaError);
      try {
        const sortedEntries = Object.entries(this.state)
          .sort((a, b) => new Date(b[1].lastReadAt).getTime() - new Date(a[1].lastReadAt).getTime())
          .slice(0, 50);
        this.state = Object.fromEntries(sortedEntries);
        localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Keep in-memory state active
      }
    }
  }
}

export const readingProgressStore = new ReadingProgressStore();

// Reader preferences store

class ReaderPrefsStore {
  private state: ReaderPreferences = DEFAULT_READER_PREFERENCES;
  private subscribers = new Set<() => void>();
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== READER_PREFS_STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      if (parsed && typeof parsed === "object") {
        this.state = { ...DEFAULT_READER_PREFERENCES, ...parsed };
        this.notify();
      }
    } catch {
      // Ignore background parse error
    }
  };

  public init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    try {
      const stored = localStorage.getItem(READER_PREFS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = {
          theme: parsed.theme || DEFAULT_READER_PREFERENCES.theme,
          fontSizeStep:
            typeof parsed.fontSizeStep === "number"
              ? Math.max(0, Math.min(5, parsed.fontSizeStep))
              : DEFAULT_READER_PREFERENCES.fontSizeStep,
          fontFamily: parsed.fontFamily || DEFAULT_READER_PREFERENCES.fontFamily,
          measure: parsed.measure || DEFAULT_READER_PREFERENCES.measure,
        };
      }
    } catch {
      this.state = DEFAULT_READER_PREFERENCES;
    }
    this.notify();
  }

  public getSnapshot = (): ReaderPreferences => {
    return this.state;
  };

  public getServerSnapshot = (): ReaderPreferences => {
    return DEFAULT_READER_PREFERENCES;
  };

  public subscribe = (callback: () => void): (() => void) => {
    this.subscribers.add(callback);
    if (!this.initialized && typeof window !== "undefined") {
      this.init();
    }
    return () => {
      this.subscribers.delete(callback);
    };
  };

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public setPrefs(
    updates: Partial<ReaderPreferences> | ((prev: ReaderPreferences) => ReaderPreferences)
  ) {
    const nextPrefs =
      typeof updates === "function" ? updates(this.state) : { ...this.state, ...updates };

    this.state = {
      ...nextPrefs,
      fontSizeStep: Math.max(0, Math.min(5, nextPrefs.fontSizeStep)),
    };
    this.notify();

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(READER_PREFS_STORAGE_KEY, JSON.stringify(this.state));
      } catch (quotaError) {
        console.warn("Storage quota exceeded for reader preferences", quotaError);
      }
    }
  }
}

export const readerPrefsStore = new ReaderPrefsStore();

// Chapter comments store

class ChapterCommentsStore {
  private state: CommentItem[] = [];
  private subscribers = new Set<() => void>();
  private initialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== CHAPTER_COMMENTS_STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      if (Array.isArray(parsed)) {
        this.state = parsed;
        this.notify();
      }
    } catch {
      // Ignore background parse error
    }
  };

  public init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    try {
      const stored = localStorage.getItem(CHAPTER_COMMENTS_STORAGE_KEY);
      if (stored === null) {
        this.state = INITIAL_COMMENTS;
        this.persist();
      } else {
        const parsed = JSON.parse(stored);
        this.state = Array.isArray(parsed) ? parsed : INITIAL_COMMENTS;
      }
    } catch {
      this.state = INITIAL_COMMENTS;
    }
    this.notify();
  }

  public getSnapshot = (): CommentItem[] => {
    return this.state;
  };

  public getServerSnapshot = (): CommentItem[] => {
    return INITIAL_COMMENTS;
  };

  public subscribe = (callback: () => void): (() => void) => {
    this.subscribers.add(callback);
    if (!this.initialized && typeof window !== "undefined") {
      this.init();
    }
    return () => {
      this.subscribers.delete(callback);
    };
  };

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public getComments(chapterId: string): CommentItem[] {
    const list = Array.isArray(this.state) ? this.state : [];
    return list.filter((c) => c.chapterId === chapterId);
  }

  public addComment(
    chapterId: string,
    novelId: string,
    chapterNumber: number,
    body: string
  ): CommentItem {
    const trimmedBody = normalizeString(body);
    const newComment: CommentItem = {
      id: generateUUID(),
      chapterId,
      novelId,
      chapterNumber,
      authorName: "คุณ (ผู้อ่าน)",
      body: trimmedBody,
      createdAt: new Date().toISOString(),
      isSelf: true,
    };

    const currentList = Array.isArray(this.state) ? this.state : [];
    this.state = [newComment, ...currentList];
    this.notify();
    this.persist();
    return newComment;
  }

  public deleteComment(commentId: string): void {
    const currentList = Array.isArray(this.state) ? this.state : [];
    const prevLen = currentList.length;
    this.state = currentList.filter((c) => c.id !== commentId);
    if (this.state.length !== prevLen) {
      this.notify();
      this.persist();
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CHAPTER_COMMENTS_STORAGE_KEY, JSON.stringify(this.state));
    } catch (quotaError) {
      console.warn("Storage quota exceeded for chapter comments, pruning older entries", quotaError);
      try {
        const selfComments = this.state.filter((c) => c.isSelf);
        const otherComments = this.state.filter((c) => !c.isSelf).slice(0, 30);
        this.state = [...selfComments, ...otherComments];
        localStorage.setItem(CHAPTER_COMMENTS_STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // In-memory fallback
      }
    }
  }
}

export const chapterCommentsStore = new ChapterCommentsStore();

// Unified bookmark context

export interface BookmarkContextType {
  // Core Bookmarks
  bookmarks: Bookmark[] | null;
  isLoading: boolean;
  isBookmarked: (novelId: string) => boolean;
  toggleBookmarkFromCatalog: (novel: CatalogNovel) => boolean;
  addBookmark: (formData: BookmarkFormData, explicitNovelId?: string) => Bookmark;
  updateBookmark: (id: string, updates: Partial<BookmarkFormData>) => Bookmark | null;
  deleteBookmark: (id: string) => boolean;
  bulkDeleteBookmarks: (ids: string[]) => number;
  importData: (
    jsonString: string,
    mode?: "replace" | "merge"
  ) => { successCount: number; skippedCount: number };
  exportData: () => string;

  // Reading Progress
  getReadingProgress: (novelId: string) => ReadingProgress | undefined;
  saveReadingProgress: (progress: ReadingProgress, chapterTitle?: string) => void;

  // Reader Preferences
  readerPrefs: ReaderPreferences;
  setReaderPrefs: (
    prefs: Partial<ReaderPreferences> | ((prev: ReaderPreferences) => ReaderPreferences)
  ) => void;

  // Chapter Comments
  getChapterComments: (chapterId: string) => CommentItem[];
  addChapterComment: (
    chapterId: string,
    novelId: string,
    chapterNumber: number,
    body: string
  ) => CommentItem;
  deleteChapterComment: (commentId: string) => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const bookmarks = useSyncExternalStore(
    bookmarksStore.subscribe,
    bookmarksStore.getSnapshot,
    bookmarksStore.getServerSnapshot
  );

  const readingProgressMap = useSyncExternalStore(
    readingProgressStore.subscribe,
    readingProgressStore.getSnapshot,
    readingProgressStore.getServerSnapshot
  );

  const readerPrefs = useSyncExternalStore(
    readerPrefsStore.subscribe,
    readerPrefsStore.getSnapshot,
    readerPrefsStore.getServerSnapshot
  );

  const allComments = useSyncExternalStore(
    chapterCommentsStore.subscribe,
    chapterCommentsStore.getSnapshot,
    chapterCommentsStore.getServerSnapshot
  );

  const isBookmarked = useCallback(
    (novelId: string): boolean => {
      if (!bookmarks) return false;
      return bookmarks.some((b) => b.novelId === novelId || b.id === novelId);
    },
    [bookmarks]
  );

  const toggleBookmarkFromCatalog = useCallback(
    (novel: CatalogNovel): boolean => {
      const existing = bookmarks?.find((b) => b.novelId === novel.id || b.id === novel.id);
      if (existing) {
        bookmarksStore.deleteBookmark(existing.id);
        return false;
      }

      const validCategory: Category = (
        NOVEL_CATEGORIES as readonly string[]
      ).includes(novel.category)
        ? (novel.category as Category)
        : "แฟนตาซี";

      bookmarksStore.addBookmark(
        {
          title: novel.titleTh,
          author: novel.author,
          coverUrl: novel.coverUrl,
          category: validCategory,
          currentChapter: 1,
          totalChapters: novel.totalChapters,
          currentChapterTitle: novel.latestChapter?.titleTh || "ตอนที่ 1",
          status: "reading",
          note: "",
        },
        novel.id
      );
      return true;
    },
    [bookmarks]
  );

  const getReadingProgress = useCallback(
    (novelId: string): ReadingProgress | undefined => {
      return readingProgressMap[novelId];
    },
    [readingProgressMap]
  );

  const saveReadingProgress = useCallback(
    (progress: ReadingProgress, chapterTitle?: string) => {
      readingProgressStore.saveProgress(progress);

      // Auto-update bookmark if the user has bookmarked this novel
      if (bookmarks) {
        const match = bookmarks.find(
          (b) =>
            b.novelId === progress.novelId ||
            b.id === progress.novelId ||
            b.title.trim().toLowerCase() === progress.novelId.toLowerCase()
        );
        if (match && match.currentChapter !== progress.chapter) {
          bookmarksStore.updateBookmark(match.id, {
            currentChapter: progress.chapter,
            currentChapterTitle: chapterTitle || `ตอนที่ ${progress.chapter}`,
            status: progress.chapter >= match.totalChapters ? "completed" : match.status,
          });
        }
      }
    },
    [bookmarks]
  );

  const getChapterComments = useCallback(
    (chapterId: string): CommentItem[] => {
      return allComments.filter((c) => c.chapterId === chapterId);
    },
    [allComments]
  );

  const addChapterComment = useCallback(
    (chapterId: string, novelId: string, chapterNumber: number, body: string): CommentItem => {
      return chapterCommentsStore.addComment(chapterId, novelId, chapterNumber, body);
    },
    []
  );

  const deleteChapterComment = useCallback((commentId: string) => {
    chapterCommentsStore.deleteComment(commentId);
  }, []);

  const setReaderPrefs = useCallback(
    (updates: Partial<ReaderPreferences> | ((prev: ReaderPreferences) => ReaderPreferences)) => {
      readerPrefsStore.setPrefs(updates);
    },
    []
  );

  const contextValue = useMemo<BookmarkContextType>(
    () => ({
      bookmarks,
      isLoading: bookmarks === null,
      isBookmarked,
      toggleBookmarkFromCatalog,
      addBookmark: (formData, explicitId) => bookmarksStore.addBookmark(formData, explicitId),
      updateBookmark: (id, updates) => bookmarksStore.updateBookmark(id, updates),
      deleteBookmark: (id) => bookmarksStore.deleteBookmark(id),
      bulkDeleteBookmarks: (ids) => bookmarksStore.bulkDeleteBookmarks(ids),
      importData: (json, mode) => bookmarksStore.importData(json, mode),
      exportData: () => bookmarksStore.exportData(),
      getReadingProgress,
      saveReadingProgress,
      readerPrefs,
      setReaderPrefs,
      getChapterComments,
      addChapterComment,
      deleteChapterComment,
    }),
    [
      bookmarks,
      isBookmarked,
      toggleBookmarkFromCatalog,
      getReadingProgress,
      saveReadingProgress,
      readerPrefs,
      setReaderPrefs,
      getChapterComments,
      addChapterComment,
      deleteChapterComment,
    ]
  );

  return <BookmarkContext.Provider value={contextValue}>{children}</BookmarkContext.Provider>;
}

export function useBookmarkContext(): BookmarkContextType {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarkContext must be used within a BookmarkProvider");
  }
  return context;
}
