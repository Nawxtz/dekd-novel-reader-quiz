"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  Bookmark,
  BookmarkFormData,
  BookmarkFormDataInput,
  BookmarkItemSchema,
  StorageEnvelopeSchema,
} from "@/types/novel";
import { INITIAL_BOOKMARKS } from "@/data/mockNovels";
import { generateUUID } from "@/lib/uuid";
import { normalizeString, computeChecksum, hasPrototypePollution } from "@/lib/sanitize";

export const STORAGE_KEY = "dekd_bookmarks_v2";
export const BACKUP_KEY = "dekd_novels_backup";

class BookmarksStore {
  private state: Bookmark[] | null = null;
  private subscribers = new Set<() => void>();
  private pendingDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;
  private storageAvailable = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.init();
      // Multi-tab synchronization
      window.addEventListener("storage", this.handleStorageEvent);
      // Flush pending writes on tab close / hide
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
      window.addEventListener("pagehide", this.handlePageHide);
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue);
      const envelope = StorageEnvelopeSchema.safeParse(parsed);
      if (envelope.success) {
        this.state = envelope.data.items;
        this.notify();
      }
    } catch {
      // Ignore remote storage parse errors
    }
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      this.flushPendingWrite();
    }
  };

  private handlePageHide = () => {
    this.flushPendingWrite();
  };

  public init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Rule: Seed ONLY when key is strictly null. If user deleted all, [] persists!
      if (stored === null) {
        this.state = INITIAL_BOOKMARKS;
        this.persistImmediate(INITIAL_BOOKMARKS);
      } else {
        try {
          const parsed = JSON.parse(stored);
          const envelopeResult = StorageEnvelopeSchema.safeParse(parsed);
          if (envelopeResult.success) {
            this.state = envelopeResult.data.items;
          } else if (Array.isArray(parsed)) {
            // Auto-migrate legacy raw arrays into envelope
            const validItems: Bookmark[] = [];
            for (const item of parsed) {
              const res = BookmarkItemSchema.safeParse(item);
              if (res.success) validItems.push(res.data);
            }
            this.state = validItems;
            this.persistImmediate(validItems);
          } else {
            throw new Error("Invalid storage structure");
          }
        } catch (parseError) {
          console.warn("Corrupted bookmark storage detected. Backing up data.", parseError);
          // Preserve corrupted data under backup key
          try {
            localStorage.setItem(BACKUP_KEY, stored);
          } catch {
            // Ignore backup write failure
          }
          this.state = INITIAL_BOOKMARKS;
          this.persistImmediate(INITIAL_BOOKMARKS);
        }
      }
    } catch {
      // localStorage is disabled or throws (Safari private mode)
      this.storageAvailable = false;
      this.state = INITIAL_BOOKMARKS;
    }
    this.notify();
  }

  public getSnapshot = (): Bookmark[] | null => {
    return this.state;
  };

  public getServerSnapshot = (): Bookmark[] | null => {
    // Distinct null sentinel for SSR to eliminate false empty state flash
    return null;
  };

  public subscribe = (callback: () => void): (() => void) => {
    this.subscribers.add(callback);
    // If not initialized yet on client, initialize now
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

  private persistImmediate(items: Bookmark[]) {
    if (!this.storageAvailable || typeof window === "undefined") return;
    try {
      const cappedItems = items.slice(0, 200);
      const itemsJson = JSON.stringify(cappedItems);
      const envelope = {
        version: 1,
        items: cappedItems,
        checksum: computeChecksum(itemsJson),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
      try {
        localStorage.setItem("dekd_bookmarks_v1", JSON.stringify(envelope));
      } catch {
        // Fallback
      }
    } catch {
      this.storageAvailable = false;
    }
  }

  private scheduleDebouncedWrite() {
    if (!this.storageAvailable || typeof window === "undefined") return;
    if (this.pendingDebounceTimer) {
      clearTimeout(this.pendingDebounceTimer);
    }
    this.pendingDebounceTimer = setTimeout(() => {
      if (this.state) {
        this.persistImmediate(this.state);
      }
      this.pendingDebounceTimer = null;
    }, 300);
  }

  public flushPendingWrite() {
    if (this.pendingDebounceTimer) {
      clearTimeout(this.pendingDebounceTimer);
      this.pendingDebounceTimer = null;
      if (this.state) {
        this.persistImmediate(this.state);
      }
    }
  }

  // Store mutations

  public addBookmark(formData: BookmarkFormDataInput | BookmarkFormData, explicitNovelId?: string): Bookmark {
    const nowIso = new Date().toISOString();
    const newBookmark: Bookmark = {
      id: generateUUID(),
      novelId: explicitNovelId || `novel-${Date.now()}`,
      title: normalizeString(formData.title),
      author: normalizeString(formData.author),
      coverUrl: formData.coverUrl.trim(),
      category: formData.category,
      currentChapter: formData.currentChapter,
      totalChapters: formData.totalChapters,
      currentChapterTitle: formData.currentChapterTitle
        ? normalizeString(formData.currentChapterTitle)
        : `ตอนที่ ${formData.currentChapter}`,
      status: formData.status || "reading",
      lastReadAt: nowIso,
      note: formData.note ? normalizeString(formData.note) : "",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const currentList = this.state || [];
    this.state = [newBookmark, ...currentList];
    this.notify();
    this.scheduleDebouncedWrite();
    return newBookmark;
  }

  public updateBookmark(id: string, updates: Partial<BookmarkFormData>): Bookmark | null {
    if (!this.state) return null;
    const nowIso = new Date().toISOString();
    let updatedBookmark: Bookmark | null = null;

    this.state = this.state.map((item) => {
      if (item.id !== id) return item;
      const nextCurrentChapter =
        updates.currentChapter !== undefined ? updates.currentChapter : item.currentChapter;
      const nextTotalChapters =
        updates.totalChapters !== undefined ? updates.totalChapters : item.totalChapters;

      updatedBookmark = {
        ...item,
        title: updates.title !== undefined ? normalizeString(updates.title) : item.title,
        author: updates.author !== undefined ? normalizeString(updates.author) : item.author,
        coverUrl: updates.coverUrl !== undefined ? updates.coverUrl.trim() : item.coverUrl,
        category: updates.category !== undefined ? updates.category : item.category,
        currentChapter: nextCurrentChapter,
        totalChapters: Math.max(nextTotalChapters, nextCurrentChapter),
        currentChapterTitle:
          updates.currentChapterTitle !== undefined
            ? normalizeString(updates.currentChapterTitle)
            : item.currentChapterTitle,
        status: updates.status !== undefined ? updates.status : item.status,
        note: updates.note !== undefined ? normalizeString(updates.note) : item.note,
        updatedAt: nowIso,
      };
      return updatedBookmark;
    });

    if (updatedBookmark) {
      this.notify();
      this.scheduleDebouncedWrite();
    }
    return updatedBookmark;
  }

  public deleteBookmark(id: string): boolean {
    if (!this.state) return false;
    const initialLen = this.state.length;
    this.state = this.state.filter((item) => item.id !== id);
    if (this.state.length !== initialLen) {
      this.notify();
      this.scheduleDebouncedWrite();
      return true;
    }
    return false;
  }

  public bulkDeleteBookmarks(ids: string[]): number {
    if (!this.state || ids.length === 0) return 0;
    const toDeleteSet = new Set(ids);
    const prevLen = this.state.length;
    this.state = this.state.filter((item) => !toDeleteSet.has(item.id));
    const deletedCount = prevLen - this.state.length;
    if (deletedCount > 0) {
      this.notify();
      this.scheduleDebouncedWrite();
    }
    return deletedCount;
  }

  public importData(
    jsonString: string,
    mode: "replace" | "merge" = "replace"
  ): { successCount: number; skippedCount: number } {
    let rawItems: unknown[] = [];
    try {
      const parsed = JSON.parse(jsonString);
      if (hasPrototypePollution(parsed)) {
        throw new Error("Malicious prototype pollution payload detected");
      }
      if (Array.isArray(parsed)) {
        rawItems = parsed;
      } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as { items?: unknown[] }).items)) {
        rawItems = (parsed as { items: unknown[] }).items;
      } else {
        throw new Error("Invalid structure");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid JSON";
      throw new Error(message);
    }

    // Limit import size to 200 items to prevent storage exhaustion attacks
    const limitedItems = rawItems.slice(0, 200);
    const validItems: Bookmark[] = [];
    let skippedCount = 0;

    for (const item of limitedItems) {
      const res = BookmarkItemSchema.safeParse(item);
      if (res.success) {
        if (mode === "merge") {
          // Regenerate UUID on merge to avoid ID collisions
          validItems.push({
            ...res.data,
            id: generateUUID(),
          });
        } else {
          validItems.push(res.data);
        }
      } else {
        skippedCount++;
      }
    }

    if (mode === "replace") {
      this.state = validItems;
    } else {
      this.state = [...validItems, ...(this.state || [])].slice(0, 200);
    }

    this.notify();
    this.persistImmediate(this.state);
    return { successCount: validItems.length, skippedCount };
  }

  public exportData(): string {
    const items = (this.state || []).slice(0, 200);
    const itemsJson = JSON.stringify(items);
    const envelope = {
      version: 1,
      items,
      checksum: computeChecksum(itemsJson),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(envelope, null, 2);
  }
}

// Global singleton instance for in-memory store
export const bookmarksStore = new BookmarksStore();

/**
 * React Hook providing access to the in-memory bookmarks store with zero re-render loops.
 */
export function useBookmarks() {
  const bookmarks = useSyncExternalStore(
    bookmarksStore.subscribe,
    bookmarksStore.getSnapshot,
    bookmarksStore.getServerSnapshot
  );

  const addBookmark = useCallback((formData: BookmarkFormData) => {
    return bookmarksStore.addBookmark(formData);
  }, []);

  const updateBookmark = useCallback((id: string, updates: Partial<BookmarkFormData>) => {
    return bookmarksStore.updateBookmark(id, updates);
  }, []);

  const deleteBookmark = useCallback((id: string) => {
    return bookmarksStore.deleteBookmark(id);
  }, []);

  const bulkDeleteBookmarks = useCallback((ids: string[]) => {
    return bookmarksStore.bulkDeleteBookmarks(ids);
  }, []);

  const importData = useCallback((jsonString: string, mode: "replace" | "merge" = "replace") => {
    return bookmarksStore.importData(jsonString, mode);
  }, []);

  const exportData = useCallback(() => {
    return bookmarksStore.exportData();
  }, []);

  return {
    bookmarks,
    isLoading: bookmarks === null,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    bulkDeleteBookmarks,
    importData,
    exportData,
  };
}
