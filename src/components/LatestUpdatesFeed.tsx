"use client";

import React, { useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, BookOpen, Check, BookmarkPlus, X, ChevronRight } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useI18n } from "@/context/I18nContext";
import { CatalogNovel, Category, NOVEL_CATEGORIES } from "@/types/novel";
import { CATALOG_NOVELS } from "@/data/mockNovels";

interface LatestUpdatesFeedProps {
  novels?: CatalogNovel[];
  selectedAuthor?: string | null;
  onClearAuthor?: () => void;
  onSelectAuthor?: (author: string) => void;
  className?: string;
}

export function LatestUpdatesFeed({
  novels = CATALOG_NOVELS,
  selectedAuthor = null,
  onClearAuthor,
  onSelectAuthor,
  className = "",
}: LatestUpdatesFeedProps) {
  const { bookmarks, addBookmark, deleteBookmark } = useBookmarks();
  const { locale } = useI18n();
  const isEn = locale === "en";

  // Filter by selected author if any
  const filteredNovels = useMemo(() => {
    if (!selectedAuthor) return novels;
    return novels.filter(
      (n) =>
        n.author.toLowerCase() === selectedAuthor.toLowerCase() ||
        n.artist?.toLowerCase() === selectedAuthor.toLowerCase()
    );
  }, [novels, selectedAuthor]);

  // Set of bookmarked novel titles/IDs for fast O(1) lookup
  const bookmarkedMap = useMemo(() => {
    const map = new Map<string, string>();
    if (bookmarks) {
      for (const b of bookmarks) {
        if (b.novelId) map.set(b.novelId, b.id);
        if (b.title) map.set(b.title.trim().toLowerCase(), b.id);
      }
    }
    return map;
  }, [bookmarks]);

  const handleToggleBookmark = useCallback(
    (novel: CatalogNovel) => {
      const existingBookmarkId =
        bookmarkedMap.get(novel.id) ||
        bookmarkedMap.get(novel.titleTh.trim().toLowerCase());

      if (existingBookmarkId) {
        deleteBookmark(existingBookmarkId);
      } else {
        const validCategory: Category = NOVEL_CATEGORIES.includes(novel.category as Category)
          ? (novel.category as Category)
          : "แฟนตาซี";

        addBookmark({
          title: novel.titleTh,
          author: novel.author,
          coverUrl: novel.coverUrl,
          category: validCategory,
          currentChapter: 1,
          totalChapters: novel.totalChapters || 50,
          currentChapterTitle: novel.latestChapter?.titleTh || "",
          status: "reading",
          note: "",
        });
      }
    },
    [bookmarkedMap, addBookmark, deleteBookmark]
  );

  return (
    <section
      data-testid="latest-updates-feed"
      className={`flex flex-col gap-4 ${className}`}
      aria-label={isEn ? "Latest Novel Updates" : "นิยายอัปเดตล่าสุด"}
    >
      {/* Header & Author Filter Chip */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Sparkles className="w-4 h-4 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isEn ? "Latest Updates" : "นิยายอัปเดตล่าสุด"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? "Fresh chapters directly from creators" : "ตอนใหม่ล่าสุดส่งตรงจากนักเขียนและนักวาด"}
            </p>
          </div>
        </div>

        {/* Selected Author Filter Badge */}
        {selectedAuthor && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/80 text-xs font-medium">
            <span>
              {isEn ? "Works by" : "ผลงานของ"}: <strong className="font-semibold">{selectedAuthor}</strong>
            </span>
            <button
              type="button"
              onClick={onClearAuthor}
              className="w-4 h-4 rounded-full bg-orange-200/60 dark:bg-orange-800/60 hover:bg-orange-300 dark:hover:bg-orange-700 flex items-center justify-center transition-colors"
              title={isEn ? "Clear filter" : "ล้างตัวกรอง"}
              aria-label={isEn ? "Clear author filter" : "ล้างตัวกรองผู้เขียน"}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Novel Feed List */}
      {filteredNovels.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isEn
              ? "No novels found matching this creator."
              : "ไม่พบนิยายของผู้เขียนหรือผู้วาดท่านนี้"}
          </p>
          {selectedAuthor && (
            <button
              type="button"
              onClick={onClearAuthor}
              className="mt-3 px-4 py-2 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/40 rounded-lg hover:bg-orange-100 transition-colors"
            >
              {isEn ? "View all novels" : "ดูนิยายทั้งหมด"}
            </button>
          )}
        </div>
      ) : (
        <div
          data-testid="latest-updates-grid"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-5"
        >
          {filteredNovels.map((novel) => {
            const isSaved =
              bookmarkedMap.has(novel.id) ||
              bookmarkedMap.has(novel.titleTh.trim().toLowerCase());

            const latestChapterNum = novel.latestChapter?.number || 1;
            const readHref = `/read/${novel.id}/${latestChapterNum}`;

            return (
              <article
                key={novel.id}
                className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <div>
                  {/* 1. Large Cover Art - Visual Hero */}
                  <div className="relative w-full aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <Link
                      href={readHref}
                      className="block w-full h-full relative"
                      title={novel.titleTh}
                    >
                      <Image
                        src={novel.coverUrl}
                        alt={novel.titleTh}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                    </Link>

                    {/* Floating Category Tag on Top-Left */}
                    <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-white bg-black/60 backdrop-blur-md border border-white/20 shadow-xs">
                        {novel.category}
                      </span>
                      {novel.status?.kind === "completed" && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-emerald-300 bg-emerald-950/70 backdrop-blur-md border border-emerald-500/30">
                          {isEn ? "Ended" : "จบแล้ว"}
                        </span>
                      )}
                    </div>

                    {/* Floating 1-Click Bookmark Button on Top-Right */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleBookmark(novel);
                      }}
                      className={`absolute top-2.5 right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md active:scale-90 ${
                        isSaved
                          ? "bg-dekd-orange text-white ring-2 ring-white/60"
                          : "bg-black/50 text-white/90 hover:bg-black/70 hover:text-white border border-white/20"
                      }`}
                      title={
                        isSaved
                          ? isEn
                            ? "Remove from bookmarks"
                            : "ยกเลิกคั่นเรื่องนี้"
                          : isEn
                          ? "Add to bookmarks"
                          : "คั่นเรื่องนี้"
                      }
                      aria-label={
                        isSaved
                          ? isEn
                            ? `Remove ${novel.titleTh} from bookmarks`
                            : `ยกเลิกคั่น ${novel.titleTh}`
                          : isEn
                          ? `Bookmark ${novel.titleTh}`
                          : `คั่น ${novel.titleTh}`
                      }
                      aria-pressed={isSaved}
                    >
                      {isSaved ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <BookmarkPlus className="w-3.5 h-3.5 stroke-[2.2]" />
                      )}
                    </button>

                    {/* Latest Chapter Bar anchored at bottom of cover */}
                    {novel.latestChapter && (
                      <Link
                        href={readHref}
                        className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-white/95 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 transition-colors shadow-xs"
                      >
                        <span className="truncate">{novel.latestChapter.titleTh}</span>
                        <span className="text-[9px] sm:text-[10px] text-orange-400 font-semibold shrink-0 ml-1">
                          {isEn ? "NEW" : "ใหม่"}
                        </span>
                      </Link>
                    )}
                  </div>

                  {/* 2. Details Below Cover */}
                  <div className="p-2.5 sm:p-3">
                    <Link
                      href={readHref}
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors line-clamp-2 leading-snug min-h-[2rem] sm:min-h-[2.5rem]"
                      title={novel.titleTh}
                    >
                      {novel.titleTh}
                    </Link>

                    {/* Author & Chapter Count */}
                    <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-slate-400 text-[10px] shrink-0">{isEn ? "By" : "โดย"}</span>
                        <button
                          type="button"
                          onClick={() => onSelectAuthor?.(novel.author)}
                          className="font-medium text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 underline decoration-slate-300 dark:decoration-slate-700 underline-offset-2 transition-colors truncate max-w-[100px] sm:max-w-[130px]"
                          title={`กรองผลงานของ ${novel.author}`}
                        >
                          {novel.author}
                        </button>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                        {novel.totalChapters} ตอน
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Action: Read Button */}
                <div className="p-2.5 sm:p-3 pt-0">
                  <Link
                    href={readHref}
                    className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 active:scale-98 text-white transition-all shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{isEn ? "Read" : "อ่านตอนล่าสุด"}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
