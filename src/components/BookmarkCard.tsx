"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark as BookmarkIcon,
  Check,
  BookOpen,
  Trash2,
} from "lucide-react";
import { Bookmark } from "@/types/novel";
import { formatBookmarkDate } from "@/lib/formatters";
import { useI18n } from "@/context/I18nContext";

interface BookmarkCardProps {
  bookmark: Bookmark;
  isEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function BookmarkCard({
  bookmark,
  isEditMode,
  isSelected,
  onToggleSelect,
  onDelete,
}: BookmarkCardProps) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [imageError, setImageError] = useState(false);

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((bookmark.currentChapter / (bookmark.totalChapters || 1)) * 100))
  );

  const readRoute = `/read/${bookmark.novelId || bookmark.id}/${bookmark.currentChapter}`;

  const handlePrimaryClick = () => {
    if (isEditMode) {
      onToggleSelect(bookmark.id);
    } else {
      router.push(readRoute);
    }
  };

  return (
    <article
      data-testid={`bookmark-card-${bookmark.id}`}
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden ${
        isSelected
          ? "bg-orange-50/60 dark:bg-orange-950/30 ring-2 ring-dekd-orange border-dekd-orange shadow-xs"
          : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div>
        {/* 1. Large Cover Art - Visual Hero */}
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {!imageError && bookmark.coverUrl ? (
            <Image
              src={bookmark.coverUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-orange-100 to-amber-200 dark:from-gray-800 dark:to-gray-750 text-gray-500">
              <span className="text-xs font-bold text-dekd-orange leading-tight line-clamp-3">
                {bookmark.title}
              </span>
            </div>
          )}

          {/* Contrast Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/35 pointer-events-none" />

          {/* Top-Left Category Badge */}
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-white bg-black/60 backdrop-blur-md border border-white/20 shadow-xs">
              {bookmark.category}
            </span>
          </div>

          {/* Top-Right Action: Checkbox in Edit Mode, Quick Delete in Normal Mode */}
          {isEditMode ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(bookmark.id);
              }}
              className="absolute top-2.5 right-2.5 z-20"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={isSelected ? t.editMode.deselectAll : t.editMode.selectAll}
            >
              {isSelected ? (
                <div className="w-6 h-6 rounded-full bg-dekd-orange flex items-center justify-center text-white shadow-md ring-2 ring-white/70">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-white/90 bg-black/40 backdrop-blur-xs shadow-md" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(bookmark.id);
              }}
              className="absolute top-2.5 right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md active:scale-90 bg-black/50 text-white/90 hover:bg-red-600 hover:text-white border border-white/20"
              title={locale === "th" ? `ลบที่คั่น ${bookmark.title}` : `Delete bookmark ${bookmark.title}`}
              aria-label={locale === "th" ? `ลบที่คั่น ${bookmark.title}` : `Delete bookmark ${bookmark.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Cover Bottom: Progress Info & Bar */}
          <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-white/95 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-xs">
            <span className="truncate">
              {locale === "th"
                ? `ตอนที่ ${bookmark.currentChapter}/${bookmark.totalChapters}`
                : `Ch. ${bookmark.currentChapter}/${bookmark.totalChapters}`}
            </span>
            <span className="text-[10px] font-bold text-orange-400 shrink-0 ml-1">
              {progressPercent}%
            </span>
          </div>

          {/* Ambient Progress Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 z-10 overflow-hidden">
            <div
              className="bg-dekd-orange h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`ความคืบหน้า ${progressPercent}%`}
            />
          </div>
        </div>

        {/* 2. Details Below Cover */}
        <div className="p-2.5 sm:p-3">
          <Link
            href={readRoute}
            onClick={(e) => {
              if (isEditMode) {
                e.preventDefault();
                onToggleSelect(bookmark.id);
              }
            }}
            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-orange-500 dark:hover:text-orange-400 transition-colors line-clamp-2 leading-snug min-h-[2rem] sm:min-h-[2.5rem]"
            title={bookmark.title}
          >
            {bookmark.title}
          </Link>

          {/* Author */}
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
            โดย {bookmark.author}
          </p>

          {/* Bookmark Timestamp */}
          <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
            <BookmarkIcon className="w-3 h-3 text-dekd-orange shrink-0 fill-dekd-orange" />
            <time dateTime={bookmark.lastReadAt} className="truncate">
              {formatBookmarkDate(bookmark.lastReadAt, locale)}
            </time>
          </div>
        </div>
      </div>

      {/* 3. Action Row (hidden in edit mode) */}
      {!isEditMode && (
        <div className="p-2.5 sm:p-3 pt-0">
          <Link
            href={readRoute}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 active:scale-98 text-white transition-all shadow-xs"
            title={`${locale === "th" ? `อ่านต่อ ตอนที่ ${bookmark.currentChapter}` : `Continue Ch. ${bookmark.currentChapter}`} ${bookmark.title}`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {locale === "th"
                ? `อ่านต่อ ตอนที่ ${bookmark.currentChapter}`
                : `Continue Ch. ${bookmark.currentChapter}`}
            </span>
          </Link>
        </div>
      )}

      {/* Primary Click Handler for Edit Selection and Card Button Accessibility */}
      <button
        type="button"
        onClick={handlePrimaryClick}
        className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-dekd-orange/40 rounded-2xl z-0"
        aria-label={
          isEditMode
            ? `${isSelected ? t.editMode.deselectAll : t.editMode.selectAll}: ${bookmark.title}`
            : `${bookmark.title} - ${bookmark.author}`
        }
      />
    </article>
  );
}
