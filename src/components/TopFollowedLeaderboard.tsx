"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Star, Users, Check, BookmarkPlus } from "lucide-react";
import { useBookmarkContext } from "@/context/BookmarkContext";
import { useI18n } from "@/context/I18nContext";
import { CatalogNovel } from "@/types/novel";
import { CATALOG_NOVELS } from "@/data/mockNovels";

export type LeaderboardPeriod = "week" | "month" | "all";

interface TopFollowedLeaderboardProps {
  novels?: CatalogNovel[];
  onSelectAuthor?: (author: string) => void;
  className?: string;
}

function formatFollowerCount(count: number, isEn: boolean): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}k`;
  }
  return count.toLocaleString(isEn ? "en-US" : "th-TH");
}

export function TopFollowedLeaderboard({
  novels = CATALOG_NOVELS,
  onSelectAuthor,
  className = "",
}: TopFollowedLeaderboardProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const { bookmarks, toggleBookmarkFromCatalog } = useBookmarkContext();
  const { locale } = useI18n();
  const isEn = locale === "en";

  // Sort novels by follower count for active period
  const sortedNovels = useMemo(() => {
    const list = [...novels];
    list.sort((a, b) => {
      const followersA = a.followers?.[period] ?? 0;
      const followersB = b.followers?.[period] ?? 0;
      return followersB - followersA;
    });
    return list.slice(0, 10);
  }, [novels, period]);

  // Set of bookmarked novel titles/IDs for fast O(1) lookup
  const bookmarkedMap = useMemo(() => {
    const map = new Map<string, string>(); // novelId or title -> bookmark.id
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
      toggleBookmarkFromCatalog(novel);
    },
    [toggleBookmarkFromCatalog]
  );

  return (
    <aside
      data-testid="top-followed-leaderboard"
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col ${className}`}
      aria-label={isEn ? "Most Followed Novels Leaderboard" : "อันดับนิยายที่คนติดตามมากที่สุด"}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 flex items-center justify-center text-orange-700 dark:text-orange-400">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-700" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isEn ? "Most Followed" : "มังงะ/นิยายที่คนติดตามมากที่สุด"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? "Top 10 highest community readers" : "อันดับยอดนิยม 10 อันดับแรก"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 my-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        <button
          type="button"
          onClick={() => setPeriod("week")}
          className={`hit-area-y flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            period === "week"
              ? "bg-white dark:bg-slate-900 text-orange-700 dark:text-orange-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
          aria-pressed={period === "week"}
        >
          {isEn ? "Weekly" : "รายสัปดาห์"}
        </button>
        <button
          type="button"
          onClick={() => setPeriod("month")}
          className={`hit-area-y flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            period === "month"
              ? "bg-white dark:bg-slate-900 text-orange-700 dark:text-orange-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
          aria-pressed={period === "month"}
        >
          {isEn ? "Monthly" : "รายเดือน"}
        </button>
        <button
          type="button"
          onClick={() => setPeriod("all")}
          className={`hit-area-y flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            period === "all"
              ? "bg-white dark:bg-slate-900 text-orange-700 dark:text-orange-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
          aria-pressed={period === "all"}
        >
          {isEn ? "All Time" : "ทั้งหมด"}
        </button>
      </div>

      {/* Novel Rows List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {sortedNovels.map((novel, index) => {
          const rank = index + 1;
          const isSaved =
            bookmarkedMap.has(novel.id) ||
            bookmarkedMap.has(novel.titleTh.trim().toLowerCase());
          const followerCount = novel.followers?.[period] ?? 0;

          // Rank box styling
          let rankBadgeClass =
            "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
          if (rank === 1) {
            rankBadgeClass = "bg-amber-400 text-amber-950 shadow-xs";
          } else if (rank === 2) {
            rankBadgeClass = "bg-slate-500 text-white shadow-xs";
          } else if (rank === 3) {
            rankBadgeClass = "bg-amber-700 text-white shadow-xs";
          }

          return (
            <div
              key={novel.id}
              className="py-2.5 flex items-center gap-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl px-1.5"
            >
              {/* Rank number */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankBadgeClass}`}
                aria-label={`อันดับ ${rank}`}
              >
                {rank}
              </div>

              {/* Cover thumbnail */}
              <Link
                href={`/read/${novel.id}/1`}
                className="w-12 h-16 sm:w-14 sm:h-[4.5rem] rounded-lg overflow-hidden relative flex-shrink-0 bg-slate-200 dark:bg-slate-800 shadow-xs group"
                title={novel.titleTh}
              >
                <Image
                  src={novel.coverUrl}
                  alt={novel.titleTh}
                  fill
                  sizes="56px"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </Link>

              {/* Novel Information */}
              <div className="flex-1 min-w-0 pr-1">
                <Link
                  href={`/read/${novel.id}/1`}
                  className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 break-words hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
                  title={novel.titleTh}
                >
                  {novel.titleTh}
                </Link>

                {/* Author */}
                <div className="mt-0.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectAuthor?.(novel.author)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-orange-700 dark:hover:text-orange-400 transition-colors truncate max-w-[130px] text-left"
                    title={`กรองผลงานของ ${novel.author}`}
                  >
                    {novel.author}
                  </button>
                </div>

                {/* Rating & Followers */}
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-0.5 font-medium text-amber-700 dark:text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{novel.rating?.toFixed(1) ?? "9.0"}</span>
                  </span>
                  <span
                    className="inline-flex items-center gap-0.5"
                    title={`${followerCount.toLocaleString()} ${isEn ? "followers" : "คนติดตาม"}`}
                  >
                    <Users className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <span>{formatFollowerCount(followerCount, isEn)}</span>
                  </span>
                </div>

              {/* Bookmark 1-Click Button (under the info so the title keeps its width) */}
              <button
                type="button"
                onClick={() => handleToggleBookmark(novel)}
                className={`hit-area-y mt-1.5 px-2.5 h-8 w-fit rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1 border ${
                  isSaved
                    ? "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800"
                    : "bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:text-orange-700 hover:bg-orange-50/40 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:border-orange-500"
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
                aria-pressed={isSaved}
              >
                {isSaved ? (
                  <>
                    <Check className="w-3 h-3 text-orange-700 dark:text-orange-400 flex-shrink-0" />
                    <span>{isEn ? "Saved" : "คั่นแล้ว"}</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3 h-3 text-slate-500 flex-shrink-0 dark:text-slate-400" />
                    <span>{isEn ? "+ Bookmark" : "+ คั่นเรื่องนี้"}</span>
                  </>
                )}
              </button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
