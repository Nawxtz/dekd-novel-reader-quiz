import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import React from "react";
import { LanguageBadge } from "../src/components/LanguageBadge";
import { StatusBadge } from "../src/components/StatusBadge";
import { ScheduleBadge } from "../src/components/ScheduleBadge";
import { TopFollowedLeaderboard } from "../src/components/TopFollowedLeaderboard";
import { LatestUpdatesFeed } from "../src/components/LatestUpdatesFeed";
import { BookmarkList } from "../src/components/BookmarkList";
import { I18nProvider } from "../src/context/I18nContext";
import {
  BookmarkProvider,
  readingProgressStore,
  readerPrefsStore,
  chapterCommentsStore,
  READING_PROGRESS_STORAGE_KEY,
  READER_PREFS_STORAGE_KEY,
  CHAPTER_COMMENTS_STORAGE_KEY,
  useBookmarkContext,
} from "../src/context/BookmarkContext";
import { CATALOG_NOVELS } from "../src/data/mockNovels";
import { bookmarksStore } from "../src/hooks/useBookmarks";
import ReaderPage from "../src/app/read/[novelId]/[chapter]/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
}));

describe("Sprint 3 & 4: Section 3 Badges, Leaderboard, and Feed", () => {
  beforeEach(() => {
    localStorage.clear();
    (bookmarksStore as any).initialized = false;
    (bookmarksStore as any).state = null;
    bookmarksStore.init();
  });

  describe("Badges Components", () => {
    it("renders LanguageBadge with correct Thai labels for th-only, en-only, and both", () => {
      const { unmount } = render(
        <I18nProvider>
          <LanguageBadge language="th-only" />
        </I18nProvider>
      );
      expect(screen.getByText("ไทยเท่านั้น")).toBeInTheDocument();
      unmount();

      const { unmount: unmount2 } = render(
        <I18nProvider>
          <LanguageBadge language="en-only" />
        </I18nProvider>
      );
      expect(screen.getByText("อังกฤษเท่านั้น")).toBeInTheDocument();
      unmount2();

      render(
        <I18nProvider>
          <LanguageBadge language="both" />
        </I18nProvider>
      );
      expect(screen.getByText("2 ภาษา (TH / EN)")).toBeInTheDocument();
    });

    it("renders StatusBadge with ongoing, season_break, hiatus, and completed", () => {
      const { unmount } = render(
        <I18nProvider>
          <StatusBadge status={{ kind: "ongoing" }} />
        </I18nProvider>
      );
      expect(screen.getByText("กำลังเผยแพร่")).toBeInTheDocument();
      unmount();

      const { unmount: unmount2 } = render(
        <I18nProvider>
          <StatusBadge
            status={{
              kind: "season_break",
              season: 1,
              nextSeasonStart: "15 พ.ย. 67",
            }}
          />
        </I18nProvider>
      );
      expect(screen.getByText(/จบซีซัน 1/)).toBeInTheDocument();
      expect(screen.getByText(/เริ่มใหม่ 15 พ.ย. 67/)).toBeInTheDocument();
      unmount2();

      const { unmount: unmount3 } = render(
        <I18nProvider>
          <StatusBadge
            status={{
              kind: "hiatus",
              since: "2026-08-01",
              expectedReturn: "1 ธ.ค. 67",
            }}
          />
        </I18nProvider>
      );
      expect(screen.getByText(/พักการเขียน/)).toBeInTheDocument();
      expect(screen.getByText(/กำหนดกลับมา 1 ธ.ค. 67/)).toBeInTheDocument();
      unmount3();

      render(
        <I18nProvider>
          <StatusBadge status={{ kind: "completed" }} />
        </I18nProvider>
      );
      expect(screen.getByText("จบบริบูรณ์")).toBeInTheDocument();
    });

    it("renders ScheduleBadge with formatted days of week", () => {
      const { unmount } = render(
        <I18nProvider>
          <ScheduleBadge schedule={{ days: [1, 3, 5], tz: "Asia/Bangkok" }} />
        </I18nProvider>
      );
      expect(screen.getByText(/อัปเดต/)).toBeInTheDocument();
      expect(screen.getByText(/จันทร์/)).toBeInTheDocument();
      unmount();

      render(
        <I18nProvider>
          <ScheduleBadge
            schedule={{ days: [1, 2, 3, 4, 5, 6, 7], tz: "Asia/Bangkok" }}
          />
        </I18nProvider>
      );
      expect(screen.getByText("อัปเดตทุกวัน")).toBeInTheDocument();
    });
  });

  describe("TopFollowedLeaderboard", () => {
    it("renders leaderboard with rank boxes, switching tabs, and 1-click bookmarking", () => {
      render(
        <I18nProvider>
          <BookmarkProvider>
            <TopFollowedLeaderboard novels={CATALOG_NOVELS} />
          </BookmarkProvider>
        </I18nProvider>
      );

      // Verify header
      expect(
        screen.getByText("มังงะ/นิยายที่คนติดตามมากที่สุด")
      ).toBeInTheDocument();

      // Verify Weekly, Monthly, All tabs
      const weeklyTab = screen.getByRole("button", { name: "รายสัปดาห์" });
      const monthlyTab = screen.getByRole("button", { name: "รายเดือน" });
      const allTab = screen.getByRole("button", { name: "ทั้งหมด" });

      expect(weeklyTab).toBeInTheDocument();
      expect(monthlyTab).toBeInTheDocument();
      expect(allTab).toBeInTheDocument();

      // Switch to Monthly tab
      fireEvent.click(monthlyTab);
      expect(monthlyTab).toHaveClass("bg-white");

      // Verify rank 1 badge exists
      expect(screen.getByLabelText("อันดับ 1")).toBeInTheDocument();

      // Verify 1-click bookmark button
      const bookmarkButtons = screen.getAllByRole("button", {
        name: /\+ คั่นเรื่องนี้|คั่นแล้ว/,
      });
      expect(bookmarkButtons.length).toBeGreaterThan(0);

      const firstBtn = bookmarkButtons[0];
      fireEvent.click(firstBtn);

      // Verify state changes to saved
      expect(firstBtn).toHaveTextContent(/คั่นแล้ว/);
    });
  });

  describe("LatestUpdatesFeed", () => {
    it("renders latest updates feed, allows author filtering and clearing", () => {
      const handleSelectAuthor = vi.fn();
      const handleClearAuthor = vi.fn();

      const { rerender } = render(
        <I18nProvider>
          <BookmarkProvider>
            <LatestUpdatesFeed
              novels={CATALOG_NOVELS}
              selectedAuthor={null}
              onSelectAuthor={handleSelectAuthor}
              onClearAuthor={handleClearAuthor}
            />
          </BookmarkProvider>
        </I18nProvider>
      );

      // Verify section header
      expect(screen.getByText("นิยายอัปเดตล่าสุด")).toBeInTheDocument();

      // Click on an author button
      const authorBtn = screen.getByRole("button", {
        name: "Hanjung Wolya",
      });
      fireEvent.click(authorBtn);
      expect(handleSelectAuthor).toHaveBeenCalledWith("Hanjung Wolya");

      // Rerender with selectedAuthor active
      rerender(
        <I18nProvider>
          <BookmarkProvider>
            <LatestUpdatesFeed
              novels={CATALOG_NOVELS}
              selectedAuthor="Hanjung Wolya"
              onSelectAuthor={handleSelectAuthor}
              onClearAuthor={handleClearAuthor}
            />
          </BookmarkProvider>
        </I18nProvider>
      );

      // Verify author filter chip is present
      expect(screen.getByText(/ผลงานของ/)).toBeInTheDocument();
      expect(screen.getAllByText("Hanjung Wolya").length).toBe(2);

      // Click clear button
      const clearBtn = screen.getByRole("button", {
        name: "ล้างตัวกรองผู้เขียน",
      });
      fireEvent.click(clearBtn);
      expect(handleClearAuthor).toHaveBeenCalled();
    });

    it("renders novels in a multi-column responsive grid container (3 novels per row on desktop)", () => {
      const { container } = render(
        <I18nProvider>
          <BookmarkProvider>
            <LatestUpdatesFeed
              novels={CATALOG_NOVELS}
              selectedAuthor={null}
              onSelectAuthor={vi.fn()}
              onClearAuthor={vi.fn()}
            />
          </BookmarkProvider>
        </I18nProvider>
      );

      const gridContainer = screen.getByTestId("latest-updates-grid");
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer.children.length).toBe(CATALOG_NOVELS.length);
    });
  });

  describe("ReaderPage Hero and Saved Episode CTA", () => {
    it("renders novel hero summary banner and auto-syncs bookmark progress to active chapter", () => {
      render(
        <I18nProvider>
          <BookmarkProvider>
            <ReaderPage params={{ novelId: "novel-dekd-001", chapter: "18" }} />
          </BookmarkProvider>
        </I18nProvider>
      );

      // Hero banner is present
      const hero = screen.getByTestId("novel-reader-hero");
      expect(hero).toBeInTheDocument();

      // Novel metadata from bookmark scoped within hero
      expect(within(hero).getByText("เป็นอนุสุขใจยิ่ง ชื่อยาวไปๆ")).toBeInTheDocument();
      expect(within(hero).getByText(/G.Lina/)).toBeInTheDocument();

      // Displays currently reading bookmarked chapter indicator
      expect(
        within(hero).getByText("คุณกำลังอ่านตอนที่คั่นไว้ (ตอนที่ 18)")
      ).toBeInTheDocument();
    });

    it("safely rejects invalid novelId with unsafe characters and renders fallback message", () => {
      render(
        <I18nProvider>
          <BookmarkProvider>
            <ReaderPage params={{ novelId: "novel<script>bad", chapter: "1" }} />
          </BookmarkProvider>
        </I18nProvider>
      );

      expect(screen.getByText("รหัสนิยายไม่ถูกต้อง")).toBeInTheDocument();
      expect(screen.getByText("รหัสนิยายที่ระบุมีอักขระที่ไม่ปลอดภัย")).toBeInTheDocument();
      expect(screen.getByText("กลับสู่หน้าหลัก")).toBeInTheDocument();
    });

    it("renders quick resume link with correct /read/[novelId]/[chapter] path in BookmarkList", () => {
      const mockBookmarks = [
        {
          id: "b-001",
          novelId: "dekd-novel-99",
          title: "ยอดจอมเวท",
          author: "นักเขียน",
          category: "แฟนตาซี" as const,
          currentChapter: 7,
          totalChapters: 50,
          currentChapterTitle: "บทที่ 7",
          status: "reading" as const,
          note: "",
          coverUrl: "",
          lastReadAt: "2026-01-02T00:00:00.000Z",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ];

      render(
        <I18nProvider>
          <BookmarkList
            bookmarks={mockBookmarks}
            isLoading={false}
            searchQuery=""
            isEditMode={false}
            onToggleEditMode={vi.fn()}
            onOpenAddModal={vi.fn()}
            onBulkDelete={vi.fn()}
          />
        </I18nProvider>
      );

      const resumeLink = screen.getByRole("link", { name: "อ่านต่อทันที" });
      expect(resumeLink).toHaveAttribute("href", "/read/dekd-novel-99/7");
    });

    it("toggleBookmarkFromCatalog preserves activeChapter parameter instead of resetting to chapter 1", () => {
      let contextRef: any = null;
      function TestConsumer() {
        contextRef = useBookmarkContext();
        return null;
      }

      render(
        <I18nProvider>
          <BookmarkProvider>
            <TestConsumer />
          </BookmarkProvider>
        </I18nProvider>
      );

      const catalogNovel = CATALOG_NOVELS[0];
      act(() => {
        contextRef.toggleBookmarkFromCatalog(catalogNovel, 15);
      });

      const bookmark = bookmarksStore.getSnapshot()?.find(
        (b) => b.novelId === catalogNovel.id
      );
      expect(bookmark).toBeDefined();
      expect(bookmark?.currentChapter).toBe(15);
      expect(bookmark?.currentChapterTitle).toBe("ตอนที่ 15");
    });

    it("safely ignores prototype pollution payloads when deserializing storage stores", () => {
      localStorage.setItem(
        READING_PROGRESS_STORAGE_KEY,
        '{"__proto__": {"polluted": true}, "test-novel": {"novelId": "test", "chapter": 1, "blockId": "", "lastReadAt": ""}}'
      );
      (readingProgressStore as any).initialized = false;
      readingProgressStore.init();
      expect((Object.prototype as any).polluted).toBeUndefined();
      expect(readingProgressStore.getSnapshot()).toEqual({});

      localStorage.setItem(
        READER_PREFS_STORAGE_KEY,
        '{"__proto__": {"polluted": true}, "theme": "night"}'
      );
      (readerPrefsStore as any).initialized = false;
      readerPrefsStore.init();
      expect((Object.prototype as any).polluted).toBeUndefined();

      localStorage.setItem(
        CHAPTER_COMMENTS_STORAGE_KEY,
        '{"__proto__": {"polluted": true}}'
      );
      (chapterCommentsStore as any).initialized = false;
      chapterCommentsStore.init();
      expect((Object.prototype as any).polluted).toBeUndefined();
    });
  });
});

