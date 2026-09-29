"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Bookmark,
  CategoryFilter,
  NOVEL_CATEGORIES,
  ReadingStatus,
} from "@/types/novel";
import { BookmarkCard } from "./BookmarkCard";
import { SkeletonGrid } from "./SkeletonCard";
import { BulkDeleteModal } from "./BulkDeleteModal";
import { SingleDeleteModal } from "./SingleDeleteModal";
import { sanitizeSearchRegex } from "@/lib/sanitize";
import { useI18n } from "@/context/I18nContext";
import Image from "next/image";
import Link from "next/link";
import { Edit3, Plus, BookOpen, Trash2, Sparkles } from "lucide-react";

interface BookmarkListProps {
  bookmarks: Bookmark[] | null;
  isLoading: boolean;
  searchQuery: string;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddModal: () => void;
  onEditBookmark?: (bookmark: Bookmark) => void;
  onDeleteBookmark?: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onClearSearch?: () => void;
}

export function BookmarkList({
  bookmarks,
  isLoading,
  searchQuery,
  isEditMode,
  onToggleEditMode,
  onOpenAddModal,
  onDeleteBookmark,
  onBulkDelete,
  onClearSearch,
}: BookmarkListProps) {
  const { t, locale } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ReadingStatus>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [deletingBookmark, setDeletingBookmark] = useState<Bookmark | null>(null);

  const handleRequestSingleDelete = (id: string) => {
    const target = bookmarks?.find((b) => b.id === id);
    if (target) {
      setDeletingBookmark(target);
    } else if (onDeleteBookmark) {
      onDeleteBookmark(id);
    }
  };

  const handleConfirmSingleDelete = () => {
    if (deletingBookmark && onDeleteBookmark) {
      onDeleteBookmark(deletingBookmark.id);
    }
    setDeletingBookmark(null);
  };

  // Clear selections when exiting edit mode
  useEffect(() => {
    if (!isEditMode) {
      setSelectedIds(new Set());
    }
  }, [isEditMode]);

  // Clear selections when switching category, status, or search query
  const handleCategoryChange = (cat: CategoryFilter) => {
    setSelectedCategory(cat);
    setSelectedIds(new Set());
  };

  const handleStatusChange = (status: "all" | ReadingStatus) => {
    setSelectedStatus(status);
    setSelectedIds(new Set());
  };

  // Filtered bookmark list
  const filteredBookmarks = useMemo(() => {
    if (!bookmarks) return [];

    let list = bookmarks;

    // Filter by Category
    if (selectedCategory !== "ทั้งหมด") {
      list = list.filter((b) => b.category === selectedCategory);
    }

    // Filter by Status
    if (selectedStatus !== "all") {
      list = list.filter((b) => b.status === selectedStatus);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const cleanRegex = new RegExp(sanitizeSearchRegex(searchQuery.trim()), "i");
      list = list.filter((b) => cleanRegex.test(b.title) || cleanRegex.test(b.author));
    }

    return list;
  }, [bookmarks, selectedCategory, selectedStatus, searchQuery]);

  // Most recently read novel for Quick Resume Bar
  const latestReadBookmark = useMemo(() => {
    if (!bookmarks || bookmarks.length === 0) return null;
    return [...bookmarks].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];
  }, [bookmarks]);

  // Real-time counts for Category Tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ทั้งหมด: bookmarks?.length || 0 };
    if (!bookmarks) return counts;
    for (const b of bookmarks) {
      counts[b.category] = (counts[b.category] || 0) + 1;
    }
    return counts;
  }, [bookmarks]);

  // Real-time counts for Reading Status Chips
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookmarks?.length || 0 };
    if (!bookmarks) return counts;
    for (const b of bookmarks) {
      counts[b.status] = (counts[b.status] || 0) + 1;
    }
    return counts;
  }, [bookmarks]);

  // Selection toggle handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmBulkDelete = () => {
    const idsToDelete = Array.from(selectedIds);
    if (idsToDelete.length > 0) {
      onBulkDelete(idsToDelete);
      setSelectedIds(new Set());
      if (bookmarks && bookmarks.length - idsToDelete.length === 0) {
        if (isEditMode) onToggleEditMode();
      }
    }
  };

  const totalCount = bookmarks?.length || 0;
  const isFiltered =
    selectedCategory !== "ทั้งหมด" ||
    selectedStatus !== "all" ||
    Boolean(searchQuery.trim());

  return (
    <section
      id="bookmarks-section"
      className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-8 pb-12 border-t border-gray-200 dark:border-gray-800"
      aria-labelledby="bookmarks-heading"
    >
      {/* 1. Section Header: Title matching Figma */}
      <div className="mb-4 sm:mb-5">
        <h1
          id="bookmarks-heading"
          className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight"
        >
          {t.bookmarks.title}
        </h1>
      </div>

      {/* 2. Controls Sub-bar: Count on left, Edit & Add on right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        {/* Dynamic Count */}
        <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
          {isLoading ? (
            <span className="text-gray-400">กำลังโหลดรายการ</span>
          ) : isFiltered ? (
            <span>{t.bookmarks.filteredCount(filteredBookmarks.length, totalCount)}</span>
          ) : (
            <span>{t.bookmarks.totalCount(totalCount)}</span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onToggleEditMode}
                className="inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 active:scale-95 transition-all"
              >
                {t.editMode.cancel}
              </button>

              {/* Delete count items Button */}
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-red-600 hover:border-red-300 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.editMode.deleteCount(selectedIds.size)}</span>
              </button>
            </>
          ) : (
            <>
              {/* Edit Pill Button matching Figma */}
              <button
                type="button"
                disabled={isLoading || totalCount === 0}
                onClick={onToggleEditMode}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all active:scale-95 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-300 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-pressed={isEditMode}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.bookmarks.edit}</span>
              </button>

              {/* Add Bookmark Button */}
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-dekd-orange hover:bg-dekd-orange-hover shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.bookmarks.addBookmark}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Resume Bar: Most recently read novel */}
      {!isLoading && !isEditMode && latestReadBookmark && (
        <div className="mb-6 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-lg overflow-hidden shadow-xs bg-gray-200 dark:bg-gray-800">
              <Image
                src={latestReadBookmark.coverUrl}
                alt={latestReadBookmark.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-dekd-orange mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{locale === "th" ? "อ่านค้างไว้ล่าสุด" : "Continue Reading"}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                {latestReadBookmark.title}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {locale === "th"
                  ? `ตอนที่ ${latestReadBookmark.currentChapter} จากทั้งหมด ${latestReadBookmark.totalChapters} ตอน`
                  : `Chapter ${latestReadBookmark.currentChapter} of ${latestReadBookmark.totalChapters}`}
              </p>
            </div>
          </div>
          <Link
            href={`/novel/${latestReadBookmark.id}?ch=${latestReadBookmark.currentChapter}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-dekd-orange hover:bg-dekd-orange-hover shadow-xs active:scale-95 transition-all shrink-0"
          >
            <span>{locale === "th" ? "อ่านต่อทันที" : "Resume Now"}</span>
          </Link>
        </div>
      )}

      {/* 3. Category Filter Tabs & Status Chips */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => handleCategoryChange("ทั้งหมด")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === "ทั้งหมด"
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {t.categories.all} ({categoryCounts["ทั้งหมด"] || 0})
          </button>
          {NOVEL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat
                  ? "bg-dekd-orange text-white shadow-xs shadow-orange-500/20"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {cat} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium hidden sm:inline">สถานะ:</span>
          {(["all", "reading", "completed", "on_hold"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedStatus === status
                  ? "text-dekd-orange bg-orange-50 dark:bg-orange-950/40 font-semibold"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {t.status[status]} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* 4. Content Area: Skeleton or Grid or Empty State */}
      {isLoading ? (
        <SkeletonGrid />
      ) : filteredBookmarks.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 my-4">
          <div className="w-14 h-14 rounded-full bg-orange-50 dark:bg-orange-950/40 text-dekd-orange flex items-center justify-center mb-3.5">
            <BookOpen className="w-7 h-7" />
          </div>
          {isFiltered ? (
            <>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                ไม่พบรายการนิยายที่ตรงกับเงื่อนไขการค้นหา
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5 leading-relaxed">
                ลองตรวจสอบตัวสะกดคำค้นหา หรือรีเซ็ตตัวกรองหมวดหมู่เพื่อดูรายการทั้งหมด
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("ทั้งหมด");
                  setSelectedStatus("all");
                  if (onClearSearch) onClearSearch();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-dekd-orange hover:bg-dekd-orange-hover shadow-sm active:scale-95 transition-all"
              >
                <span>ล้างการค้นหาและตัวกรองทั้งหมด</span>
              </button>
            </>
          ) : (
            <>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
                {t.bookmarks.emptyTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5 leading-relaxed">
                {t.bookmarks.emptyDescription}
              </p>
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-dekd-orange hover:bg-dekd-orange-hover shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t.bookmarks.addFirst}</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          data-testid="bookmarks-grid"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
        >
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              isEditMode={isEditMode}
              isSelected={selectedIds.has(bookmark.id)}
              onToggleSelect={handleToggleSelect}
              onDelete={handleRequestSingleDelete}
            />
          ))}
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {deletingBookmark && (
        <SingleDeleteModal
          isOpen={!!deletingBookmark}
          novelTitle={deletingBookmark.title}
          onClose={() => setDeletingBookmark(null)}
          onConfirm={handleConfirmSingleDelete}
        />
      )}

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        selectedCount={selectedIds.size}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
      />
    </section>
  );
}
