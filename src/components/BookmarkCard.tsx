"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  List,
  Bookmark as BookmarkIcon,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import { Bookmark } from "@/types/novel";
import { formatBookmarkDate, formatChapterLabel } from "@/lib/formatters";
import { useI18n } from "@/context/I18nContext";

interface BookmarkCardProps {
  bookmark: Bookmark;
  isEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onQuickAddChapter: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export function BookmarkCard({
  bookmark,
  isEditMode,
  isSelected,
  onToggleSelect,
  onQuickAddChapter,
  onEdit,
  onDelete,
}: BookmarkCardProps) {
  const { locale, t } = useI18n();
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isMaxChapter = bookmark.currentChapter >= bookmark.totalChapters;

  // Stretched-link primary click handler
  const handlePrimaryClick = () => {
    if (isEditMode) {
      onToggleSelect(bookmark.id);
    } else {
      onEdit(bookmark);
    }
  };

  return (
    <article
      data-testid={`bookmark-card-${bookmark.id}`}
      className={`group relative flex items-center gap-3.5 p-3 rounded-xl bg-white dark:bg-gray-900 border transition-all duration-200 ${
        isSelected
          ? "border-dekd-orange ring-2 ring-dekd-orange/20 shadow-md bg-orange-50/30 dark:bg-orange-950/20"
          : "border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md"
      }`}
    >
      {/* Edit Mode Checkbox (relative z-10) */}
      {isEditMode && (
        <div className="relative z-10 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(bookmark.id);
            }}
            className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
              isSelected
                ? "bg-dekd-orange border-dekd-orange text-white"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-dekd-orange"
            }`}
            aria-label={isSelected ? t.editMode.deselectAll : t.editMode.selectAll}
            aria-checked={isSelected}
            role="checkbox"
          >
            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>
        </div>
      )}

      {/* Novel Cover with aspect-[2/3] (relative z-10) */}
      <div className="relative z-10 w-20 sm:w-24 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-800">
        {!imageError && bookmark.coverUrl ? (
          <Image
            src={bookmark.coverUrl}
            alt="" // Decorative since adjacent title provides text alternative
            fill
            sizes="96px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-orange-100 to-amber-200 dark:from-gray-800 dark:to-gray-750 text-gray-500">
            <span className="text-[10px] font-bold text-dekd-orange leading-tight line-clamp-3">
              {bookmark.title}
            </span>
          </div>
        )}

        {/* Category Pill Tag on Cover */}
        <span className="absolute bottom-1 left-1 right-1 text-center py-0.5 text-[9px] font-semibold bg-black/60 backdrop-blur-xs text-white rounded truncate px-1">
          {bookmark.category}
        </span>
      </div>

      {/* Card Content Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
        <div>
          {/* Title (2-line clamped, leading-relaxed, min-h-[3rem] for Thai glyph preservation) */}
          <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 line-clamp-2 leading-relaxed min-h-[3rem] break-words group-hover:text-dekd-orange transition-colors">
            {bookmark.title}
          </h3>

          {/* Author */}
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {bookmark.author}
          </p>
        </div>

        {/* Chapter & Bookmark Timestamp (Figma Match) */}
        <div className="space-y-1 mt-2">
          {/* Current Chapter Badge with List Icon */}
          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 truncate">
            <List className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" />
            <span className="font-medium truncate">
              {formatChapterLabel(bookmark.currentChapter, bookmark.totalChapters, locale)}
              {bookmark.currentChapterTitle && (
                <span className="text-gray-500 dark:text-gray-400 font-normal">
                  : {bookmark.currentChapterTitle}
                </span>
              )}
            </span>
          </div>

          {/* Bookmark Timestamp with Bookmark Icon */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <BookmarkIcon className="w-3.5 h-3.5 text-dekd-orange shrink-0 fill-dekd-orange" />
            <time className="truncate" dateTime={bookmark.lastReadAt}>
              {formatBookmarkDate(bookmark.lastReadAt, locale)}
            </time>
          </div>
        </div>
      </div>

      {/* Action Buttons (relative z-10) */}
      <div className="relative z-10 flex flex-col items-end justify-between self-stretch shrink-0 pl-1">
        {/* Top: More Options Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              {/* Invisible backdrop to dismiss */}
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-6 z-30 w-36 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs font-medium">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(bookmark);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  {t.bookmarks.edit}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(bookmark.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.editMode.confirm}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Bottom: Quick "+1 ตอน" Button */}
        {!isEditMode && (
          <button
            type="button"
            disabled={isMaxChapter}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAddChapter(bookmark.id);
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs active:scale-95 transition-all ${
              isMaxChapter
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "bg-dekd-orange-light dark:bg-orange-950/60 text-dekd-orange hover:bg-dekd-orange hover:text-white border border-orange-200 dark:border-orange-900/60"
            }`}
            title={isMaxChapter ? t.bookmarks.chapterReachedMax : t.bookmarks.quickAddChapter}
            aria-label={`${t.bookmarks.quickAddChapter} ${bookmark.title}`}
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>{t.bookmarks.quickAddChapter}</span>
          </button>
        )}
      </div>

      {/* Primary Stretched Click Area (absolute inset-0) */}
      <button
        type="button"
        onClick={handlePrimaryClick}
        className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-dekd-orange/40 rounded-xl"
        aria-label={`${bookmark.title} - ${bookmark.author}`}
      />
    </article>
  );
}
