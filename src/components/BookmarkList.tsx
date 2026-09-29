"use client";

import React, { useState, useMemo } from "react";
import {
  Bookmark,
  CategoryFilter,
  NOVEL_CATEGORIES,
  ReadingStatus,
} from "@/types/novel";
import { BookmarkCard } from "./BookmarkCard";
import { SkeletonGrid } from "./SkeletonCard";
import { BulkDeleteModal } from "./BulkDeleteModal";
import { sanitizeSearchRegex } from "@/lib/sanitize";
import { useI18n } from "@/context/I18nContext";
import { Edit3, Check, Plus, BookOpen, Trash2, CheckSquare, Square } from "lucide-react";

interface BookmarkListProps {
  bookmarks: Bookmark[] | null;
  isLoading: boolean;
  searchQuery: string;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddModal: () => void;
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onQuickAddChapter: (id: string) => void;
}

export function BookmarkList({
  bookmarks,
  isLoading,
  searchQuery,
  isEditMode,
  onToggleEditMode,
  onOpenAddModal,
  onEditBookmark,
  onDeleteBookmark,
  onBulkDelete,
  onQuickAddChapter,
}: BookmarkListProps) {
  const { t } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ทั้งหมด");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ReadingStatus>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

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

  const isAllFilteredSelected =
    filteredBookmarks.length > 0 &&
    filteredBookmarks.every((b) => selectedIds.has(b.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      // Deselect filtered
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredBookmarks.forEach((b) => next.delete(b.id));
        return next;
      });
    } else {
      // Select all filtered
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredBookmarks.forEach((b) => next.add(b.id));
        return next;
      });
    }
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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      aria-labelledby="bookmarks-heading"
    >
      {/* 1. Section Header: Title matching Figma with subtle divider line */}
      <div className="pb-3 border-b-2 border-gray-200 dark:border-gray-800 mb-4 sm:mb-6">
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
        <div className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
          {isLoading ? (
            <span className="text-gray-400">กำลังโหลดรายการ...</span>
          ) : isFiltered ? (
            <span>{t.bookmarks.filteredCount(filteredBookmarks.length, totalCount)}</span>
          ) : (
            <span>{t.bookmarks.totalCount(totalCount)}</span>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Edit Pill Button */}
          <button
            type="button"
            disabled={isLoading || totalCount === 0}
            onClick={onToggleEditMode}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
              isEditMode
                ? "bg-dekd-orange text-white shadow-sm shadow-orange-500/25"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
            aria-pressed={isEditMode}
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.bookmarks.done}</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>{t.bookmarks.edit}</span>
              </>
            )}
          </button>

          {/* Add Bookmark Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-dekd-orange bg-dekd-orange-light dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200 dark:border-orange-900/60 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t.bookmarks.addBookmark}</span>
          </button>
        </div>
      </div>

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
            {t.categories.all}
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
              {cat}
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
              {t.status[status]}
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
        </div>
      ) : (
        /* 3-Column Responsive Novel Card Grid matching Figma */
        <div
          data-testid="bookmarks-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              isEditMode={isEditMode}
              isSelected={selectedIds.has(bookmark.id)}
              onToggleSelect={handleToggleSelect}
              onQuickAddChapter={onQuickAddChapter}
              onEdit={onEditBookmark}
              onDelete={onDeleteBookmark}
            />
          ))}
        </div>
      )}

      {/* 5. Bulk Edit Floating Action Bar */}
      {isEditMode && totalCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-lg p-3 rounded-2xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300">
          {/* Select All Toggle */}
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-dekd-orange transition-colors"
          >
            {isAllFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-dekd-orange" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
            <span>{isAllFilteredSelected ? t.editMode.deselectAll : t.editMode.selectAll}</span>
          </button>

          {/* Selected Count & Delete Button */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {t.editMode.selectedCount(selectedIds.size)}
            </span>
            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.editMode.deleteSelected}</span>
            </button>
          </div>
        </div>
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
