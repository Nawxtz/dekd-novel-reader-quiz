import { describe, it, expect, beforeEach } from "vitest";
import {
  CATALOG_NOVELS,
  MOCK_CHAPTERS,
  INITIAL_COMMENTS,
  getMockChapters,
} from "../src/data/mockNovels";
import {
  BOOKMARKS_STORAGE_KEY_V1,
  READING_PROGRESS_STORAGE_KEY,
  READER_PREFS_STORAGE_KEY,
  CHAPTER_COMMENTS_STORAGE_KEY,
  readingProgressStore,
  readerPrefsStore,
  chapterCommentsStore,
} from "../src/context/BookmarkContext";
import { bookmarksStore, STORAGE_KEY } from "../src/hooks/useBookmarks";
import { DEFAULT_READER_PREFERENCES } from "../src/types/reader";

describe("Sprint 1 & Sprint 2: Data Structures and Mock Catalog", () => {
  it("contains exactly 10 rich catalog novels with valid metadata", () => {
    expect(CATALOG_NOVELS).toHaveLength(10);

    const mmm = CATALOG_NOVELS.find((n) => n.id === "myst-might-mayhem");
    expect(mmm).toBeDefined();
    expect(mmm?.author).toBe("Hanjung Wolya");
    expect(mmm?.artist).toBe("Kim Tae-Hyung");
    expect(mmm?.rating).toBe(9.2);
    expect(mmm?.status.kind).toBe("ongoing");
    expect(mmm?.locales).toContain("th");
    expect(mmm?.locales).toContain("en");
    expect(mmm?.followers).toEqual({ week: 14200, month: 48900, all: 182000 });

    const camping = CATALOG_NOVELS.find((n) => n.id === "healing-life-camping");
    expect(camping).toBeDefined();
    expect(camping?.rating).toBe(9.4);
    expect(camping?.schedule?.days).toEqual([2, 4, 6]);

    const regressing = CATALOG_NOVELS.find((n) => n.id === "eternally-regressing-knight");
    expect(regressing?.status.kind).toBe("season_break");
    if (regressing?.status.kind === "season_break") {
      expect(regressing.status.season).toBe(1);
      expect(regressing.status.nextSeasonStart).toBe("2026-11-15");
    }

    const actor = CATALOG_NOVELS.find((n) => n.id === "monster-genius-actor");
    expect(actor?.status.kind).toBe("hiatus");
    if (actor?.status.kind === "hiatus") {
      expect(actor.status.since).toBe("2026-08-01");
      expect(actor.status.expectedReturn).toBe("2026-10-20");
    }

    const sashimi = CATALOG_NOVELS.find((n) => n.id === "sashimi-knife-academy");
    expect(sashimi?.status.kind).toBe("completed");
  });

  it("provides structured content blocks for chapters 1, 2, and 3", () => {
    const mmmChapters = getMockChapters("myst-might-mayhem");
    expect(mmmChapters.length).toBeGreaterThanOrEqual(3);

    const ch1 = mmmChapters.find((c) => c.chapterNumber === 1);
    expect(ch1).toBeDefined();
    expect(ch1?.blocks.length).toBeGreaterThan(0);

    ch1?.blocks.forEach((block) => {
      expect(["p", "dialogue", "heading"]).toContain(block.type);
      expect(block.textTh).toBeTruthy();
      expect(block.textEn).toBeTruthy();
    });
  });

  it("contains initial comments for chapter 1 of featured titles", () => {
    expect(INITIAL_COMMENTS.length).toBeGreaterThanOrEqual(4);

    const mmmComment = INITIAL_COMMENTS.find((c) => c.novelId === "myst-might-mayhem");
    expect(mmmComment).toBeDefined();
    expect(mmmComment?.chapterNumber).toBe(1);

    const campComment = INITIAL_COMMENTS.find((c) => c.novelId === "healing-life-camping");
    expect(campComment).toBeDefined();
    expect(campComment?.chapterNumber).toBe(1);
  });
});

describe("Sprint 1 & Sprint 2: Storage Normalization & Stores", () => {
  beforeEach(() => {
    localStorage.clear();
    (readingProgressStore as any).initialized = false;
    (readingProgressStore as any).state = {};
    readingProgressStore.init();

    (readerPrefsStore as any).initialized = false;
    (readerPrefsStore as any).state = DEFAULT_READER_PREFERENCES;
    readerPrefsStore.init();

    (chapterCommentsStore as any).initialized = false;
    (chapterCommentsStore as any).state = [];
    chapterCommentsStore.init();

    (bookmarksStore as any).initialized = false;
    (bookmarksStore as any).state = null;
    bookmarksStore.init();
  });

  it("saves and retrieves reading progress under dekd_reading_progress_v1", () => {
    readingProgressStore.saveProgress({
      novelId: "myst-might-mayhem",
      chapter: 3,
      blockId: "mmm-3-b2",
      lastReadAt: new Date().toISOString(),
    });

    const progress = readingProgressStore.getProgress("myst-might-mayhem");
    expect(progress?.chapter).toBe(3);
    expect(progress?.blockId).toBe("mmm-3-b2");

    const raw = localStorage.getItem(READING_PROGRESS_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed["myst-might-mayhem"].chapter).toBe(3);
  });

  it("updates reader preferences and clamps fontSizeStep under dekd_reader_prefs_v1", () => {
    readerPrefsStore.setPrefs({ fontSizeStep: 5, theme: "sepia" });
    expect(readerPrefsStore.getSnapshot().fontSizeStep).toBe(5);
    expect(readerPrefsStore.getSnapshot().theme).toBe("sepia");

    // Clamp over max
    readerPrefsStore.setPrefs({ fontSizeStep: 10 });
    expect(readerPrefsStore.getSnapshot().fontSizeStep).toBe(5);

    const raw = localStorage.getItem(READER_PREFS_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.theme).toBe("sepia");
  });

  it("adds, gets, and deletes chapter comments under dekd_chapter_comments_v1", () => {
    const newComment = chapterCommentsStore.addComment(
      "mmm-ch-1",
      "myst-might-mayhem",
      1,
      "ทดสอบการส่งความคิดเห็นใหม่"
    );

    expect(newComment.id).toBeTruthy();
    expect(newComment.isSelf).toBe(true);

    const comments = chapterCommentsStore.getComments("mmm-ch-1");
    expect(comments.some((c) => c.id === newComment.id)).toBe(true);

    // Delete comment
    chapterCommentsStore.deleteComment(newComment.id);
    const updatedComments = chapterCommentsStore.getComments("mmm-ch-1");
    expect(updatedComments.some((c) => c.id === newComment.id)).toBe(false);
  });

  it("synchronizes bookmarks to dekd_bookmarks_v1", () => {
    bookmarksStore.addBookmark({
      title: "ทดสอบการบันทึก V1",
      author: "ผู้แต่ง",
      coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
      category: "แฟนตาซี",
      currentChapter: 1,
      totalChapters: 50,
      status: "reading",
    });

    bookmarksStore.flushPendingWrite();

    const storedV1 = localStorage.getItem(BOOKMARKS_STORAGE_KEY_V1);
    expect(storedV1).toBeTruthy();
    const parsed = JSON.parse(storedV1!);
    expect(parsed.items.length).toBeGreaterThan(0);
    expect(parsed.items[0].title).toBe("ทดสอบการบันทึก V1");
  });
});

describe("Sprint 1 & Sprint 2: I18n Translations Coverage", () => {
  it("provides comprehensive translations for badges, schedule, status, leaderboard, and reader", async () => {
    const { I18nProvider, useI18n } = await import("../src/context/I18nContext");
    const { renderHook, act } = await import("@testing-library/react");
    const React = await import("react");

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(I18nProvider, null, children);

    const { result } = renderHook(() => useI18n(), { wrapper });

    // Thai translations
    expect(result.current.t.badges.thOnly).toBe("ไทยเท่านั้น");
    expect(result.current.t.badges.enOnly).toBe("อังกฤษเท่านั้น");
    expect(result.current.t.badges.dual).toBe("2 ภาษา");

    expect(result.current.t.schedule.updateDaily).toBe("อัปเดตทุกวัน");
    expect(result.current.t.schedule.updateOn).toBe("อัปเดตทุกวัน");

    expect(result.current.t.status.ongoing).toBe("กำลังเผยแพร่");
    expect(result.current.t.status.seasonBreak).toBe("จบซีซัน");
    expect(result.current.t.status.hiatus).toBe("พักการเขียน");
    expect(result.current.t.status.completed).toBe("จบบริบูรณ์");

    expect(result.current.t.leaderboard.topFollowed).toBe("มังงะ/นิยายที่คนติดตามมากที่สุด");
    expect(result.current.t.leaderboard.weekly).toBe("รายสัปดาห์");
    expect(result.current.t.leaderboard.monthly).toBe("รายเดือน");
    expect(result.current.t.leaderboard.allTime).toBe("ตลอดกาล");
    expect(result.current.t.leaderboard.followers).toBe("ติดตาม");

    expect(result.current.t.reader.firstChapter).toBe("ตอนแรก");
    expect(result.current.t.reader.continueReading).toBe("อ่านต่อ");
    expect(result.current.t.reader.latestChapter).toBe("ตอนใหม่");
    expect(result.current.t.reader.searchChapterPlaceholder).toBe("ค้นหาเลขตอน เช่น 25 หรือ 108");
    expect(result.current.t.reader.fontSize).toBe("ขนาดอักษร");
    expect(result.current.t.reader.theme).toBe("ธีม");
    expect(result.current.t.reader.day).toBe("สว่าง");
    expect(result.current.t.reader.night).toBe("มืด");
    expect(result.current.t.reader.sepia).toBe("ถนอมสายตา");
    expect(result.current.t.reader.comments).toBe("ความคิดเห็น");
    expect(result.current.t.reader.sendComment).toBe("ส่งความคิดเห็น");
    expect(result.current.t.reader.commentPlaceholder).toBe("เขียนความคิดเห็นของคุณ");
    expect(result.current.t.reader.relatedNovels).toBe("นิยายที่เกี่ยวข้อง");

    // Switch to English
    act(() => {
      result.current.setLocale("en");
    });

    expect(result.current.t.badges.thOnly).toBe("TH Only");
    expect(result.current.t.badges.enOnly).toBe("ENG Only");
    expect(result.current.t.badges.dual).toBe("TH / EN");

    expect(result.current.t.schedule.updateDaily).toBe("Updates Daily");
    expect(result.current.t.schedule.updateOn).toBe("Updates on");

    expect(result.current.t.status.ongoing).toBe("Ongoing");
    expect(result.current.t.status.seasonBreak).toBe("Season End");
    expect(result.current.t.status.hiatus).toBe("Hiatus");
    expect(result.current.t.status.completed).toBe("Completed");

    expect(result.current.t.leaderboard.topFollowed).toBe("Most Followed Novels");
    expect(result.current.t.leaderboard.weekly).toBe("Weekly");
    expect(result.current.t.leaderboard.monthly).toBe("Monthly");
    expect(result.current.t.leaderboard.allTime).toBe("All");
    expect(result.current.t.leaderboard.followers).toBe("Followers");

    expect(result.current.t.reader.firstChapter).toBe("First Chapter");
    expect(result.current.t.reader.continueReading).toBe("Continue Reading");
    expect(result.current.t.reader.latestChapter).toBe("Latest Chapter");
    expect(result.current.t.reader.searchChapterPlaceholder).toBe("Search chapter, e.g. 25 or 108");
    expect(result.current.t.reader.fontSize).toBe("Font Size");
    expect(result.current.t.reader.theme).toBe("Theme");
    expect(result.current.t.reader.day).toBe("Day");
    expect(result.current.t.reader.night).toBe("Night");
    expect(result.current.t.reader.sepia).toBe("Sepia");
    expect(result.current.t.reader.comments).toBe("Comments");
    expect(result.current.t.reader.sendComment).toBe("Post Comment");
    expect(result.current.t.reader.commentPlaceholder).toBe("Write your comment");
    expect(result.current.t.reader.relatedNovels).toBe("Related Novels");
  });
});

describe("Sprint 1 & Sprint 2: BookmarkContext Integration", () => {
  it("toggles novel from catalog into bookmarks and out of bookmarks", async () => {
    const { BookmarkProvider, useBookmarkContext } = await import("../src/context/BookmarkContext");
    const { renderHook, act } = await import("@testing-library/react");
    const React = await import("react");

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(BookmarkProvider, null, children);

    const { result } = renderHook(() => useBookmarkContext(), { wrapper });

    const targetNovel = CATALOG_NOVELS[0];

    // Initial state
    const initialStatus = result.current.isBookmarked(targetNovel.id);
    expect(initialStatus).toBe(false);

    // Toggle on (add)
    let added = false;
    act(() => {
      added = result.current.toggleBookmarkFromCatalog(targetNovel);
    });
    expect(added).toBe(true);
    expect(result.current.isBookmarked(targetNovel.id)).toBe(true);

    // Toggle off (remove)
    let removed = true;
    act(() => {
      removed = result.current.toggleBookmarkFromCatalog(targetNovel);
    });
    expect(removed).toBe(false);
    expect(result.current.isBookmarked(targetNovel.id)).toBe(false);
  });
});

