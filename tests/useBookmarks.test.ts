import { describe, it, expect, beforeEach, vi } from "vitest";
import { bookmarksStore, STORAGE_KEY, BACKUP_KEY } from "../src/hooks/useBookmarks";
import { INITIAL_BOOKMARKS } from "../src/data/mockNovels";

describe("bookmarksStore", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllTimers();
    // Reset store internal state
    (bookmarksStore as any).initialized = false;
    (bookmarksStore as any).state = null;
    bookmarksStore.init();
  });

  it("initializes with INITIAL_BOOKMARKS when localStorage is empty (null)", () => {
    const snapshot = bookmarksStore.getSnapshot();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.length).toBe(INITIAL_BOOKMARKS.length);
  });

  it("preserves empty array [] if user has deleted all bookmarks and does not re-seed", () => {
    // Simulate user having deleted everything previously
    const emptyEnvelope = JSON.stringify({ version: 1, items: [] });
    localStorage.setItem(STORAGE_KEY, emptyEnvelope);

    (bookmarksStore as any).initialized = false;
    bookmarksStore.init();

    const snapshot = bookmarksStore.getSnapshot();
    expect(snapshot).toEqual([]);
  });

  it("recovers from corrupted storage by saving to backup key", () => {
    localStorage.setItem(STORAGE_KEY, "corrupted-invalid-json{{{");

    (bookmarksStore as any).initialized = false;
    bookmarksStore.init();

    expect(localStorage.getItem(BACKUP_KEY)).toBe("corrupted-invalid-json{{{");
    const snapshot = bookmarksStore.getSnapshot();
    expect(snapshot?.length).toBe(INITIAL_BOOKMARKS.length);
  });

  it("adds a new bookmark with generated UUID and normalized strings", () => {
    const newBm = bookmarksStore.addBookmark({
      title: "  นิยายเรื่องใหม่  ",
      author: "  นักเขียนมือใหม่  ",
      coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
      category: "แฟนตาซี",
      currentChapter: 1,
      totalChapters: 50,
      status: "reading",
    });

    expect(newBm.title).toBe("นิยายเรื่องใหม่");
    expect(newBm.author).toBe("นักเขียนมือใหม่");
    expect(bookmarksStore.getSnapshot()?.[0].id).toBe(newBm.id);
  });

  it("updates existing bookmark fields", () => {
    const firstId = INITIAL_BOOKMARKS[0].id;
    const updated = bookmarksStore.updateBookmark(firstId, {
      title: "ชื่อเรื่องแก้ไขใหม่",
      currentChapter: 20,
    });

    expect(updated?.title).toBe("ชื่อเรื่องแก้ไขใหม่");
    expect(updated?.currentChapter).toBe(20);
  });

  it("increments chapter by 1 and supports undo restoring both chapter and timestamp", () => {
    const target = INITIAL_BOOKMARKS[0];
    const initialChapter = target.currentChapter;
    const initialTimestamp = target.lastReadAt;

    const res = bookmarksStore.incrementChapter(target.id);
    expect(res).not.toBeNull();
    expect(res?.bookmark.currentChapter).toBe(initialChapter + 1);

    // Apply undo
    if (res) {
      const undoSuccess = bookmarksStore.applyUndo(res.undo);
      expect(undoSuccess).toBe(true);

      const restored = bookmarksStore.getSnapshot()?.find((b) => b.id === target.id);
      expect(restored?.currentChapter).toBe(initialChapter);
      expect(restored?.lastReadAt).toBe(initialTimestamp);
    }
  });

  it("caps chapter increment at totalChapters", () => {
    const target = INITIAL_BOOKMARKS[0];
    // Update to match totalChapters
    bookmarksStore.updateBookmark(target.id, {
      currentChapter: target.totalChapters,
    });

    const res = bookmarksStore.incrementChapter(target.id);
    expect(res).toBeNull();
  });

  it("deletes a bookmark by ID", () => {
    const targetId = INITIAL_BOOKMARKS[0].id;
    const initialLen = bookmarksStore.getSnapshot()?.length || 0;

    const success = bookmarksStore.deleteBookmark(targetId);
    expect(success).toBe(true);
    expect(bookmarksStore.getSnapshot()?.length).toBe(initialLen - 1);
  });

  it("bulk deletes only the specified IDs", () => {
    const idsToDelete = [INITIAL_BOOKMARKS[0].id, INITIAL_BOOKMARKS[1].id];
    const initialLen = bookmarksStore.getSnapshot()?.length || 0;

    const count = bookmarksStore.bulkDeleteBookmarks(idsToDelete);
    expect(count).toBe(2);
    expect(bookmarksStore.getSnapshot()?.length).toBe(initialLen - 2);
  });

  it("imports data in replace mode and merge mode", () => {
    const importPayload = JSON.stringify({
      version: 1,
      items: [
        {
          id: "69983b1f-28e7-42b5-8a80-d8fe0ee19b8a",
          novelId: "import-1",
          title: "นิยายนำเข้า",
          author: "ผู้แต่งนำเข้า",
          coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
          category: "แฟนตาซี",
          currentChapter: 1,
          totalChapters: 10,
          status: "reading",
          lastReadAt: "2020-07-09T15:56:00.000Z",
          createdAt: "2020-07-09T15:56:00.000Z",
          updatedAt: "2020-07-09T15:56:00.000Z",
        },
      ],
    });

    const replaceRes = bookmarksStore.importData(importPayload, "replace");
    expect(replaceRes.successCount).toBe(1);
    expect(bookmarksStore.getSnapshot()?.length).toBe(1);

    const mergeRes = bookmarksStore.importData(importPayload, "merge");
    expect(mergeRes.successCount).toBe(1);
    expect(bookmarksStore.getSnapshot()?.length).toBe(2);
  });
});
