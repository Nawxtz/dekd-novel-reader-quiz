"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sun,
  Moon,
  Coffee,
  Type,
  Minus,
  Plus,
  Bookmark,
  Check,
} from "lucide-react";
import { ThemeMode, FontFamily, FONT_SIZE_STEPS } from "@/types/reader";
import { useI18n } from "@/context/I18nContext";

interface ReaderToolbarProps {
  novelId: string;
  novelTitle: string;
  currentChapter: number;
  totalChapters: number;
  chapterTitle?: string;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  fontSizeIndex: number;
  onFontSizeChange: (newIndex: number) => void;
  fontFamily: FontFamily;
  onFontFamilyChange: (family: FontFamily) => void;
  contentLocale: "th" | "en";
  onContentLocaleChange?: (locale: "th" | "en") => void;
  hasBilingual?: boolean;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  className?: string;
}

export function ReaderToolbar({
  novelId,
  novelTitle,
  currentChapter,
  totalChapters,
  chapterTitle,
  theme,
  onThemeChange,
  fontSizeIndex,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  contentLocale,
  onContentLocaleChange,
  hasBilingual = false,
  isBookmarked = false,
  onToggleBookmark,
  className = "",
}: ReaderToolbarProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const currentFontSize = FONT_SIZE_STEPS[fontSizeIndex] ?? 20;

  const handleDecreaseFont = () => {
    if (fontSizeIndex > 0) {
      onFontSizeChange(fontSizeIndex - 1);
    }
  };

  const handleIncreaseFont = () => {
    if (fontSizeIndex < FONT_SIZE_STEPS.length - 1) {
      onFontSizeChange(fontSizeIndex + 1);
    }
  };

  return (
    <header
      data-testid="reader-toolbar"
      className={`sticky top-0 z-40 w-full backdrop-blur-md transition-colors border-b shadow-xs ${
        theme === "night"
          ? "bg-slate-950/90 border-slate-800 text-slate-100"
          : theme === "sepia"
          ? "bg-[#f4e8cb]/95 border-[#e2d2ae] text-[#382e25]"
          : "bg-white/90 border-slate-200 text-slate-900"
      } ${className}`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Back button & Novel Info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            data-novel-id={novelId}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              theme === "night"
                ? "hover:bg-slate-800 text-slate-300"
                : theme === "sepia"
                ? "hover:bg-[#ecdcb8] text-[#5c4a38]"
                : "hover:bg-slate-100 text-slate-600"
            }`}
            title={isEn ? "Back to Homepage" : "กลับหน้าหลัก"}
            aria-label={isEn ? "Back to Homepage" : "กลับหน้าหลัก"}
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{isEn ? "Home" : "หน้าหลัก"}</span>
          </Link>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block" />

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-[340px] md:max-w-[450px]">
              {novelTitle}
            </h1>
            <p className="text-[11px] opacity-75 truncate">
              {isEn
                ? `Chapter ${currentChapter} / ${totalChapters}`
                : `ตอนที่ ${currentChapter} จาก ${totalChapters} ตอน`}
              {chapterTitle ? `: ${chapterTitle}` : ""}
            </p>
          </div>
        </div>

        {/* Right Side: Reader Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Bilingual Switcher (if available) */}
          {hasBilingual && onContentLocaleChange && (
            <div
              className={`flex items-center rounded-xl p-0.5 border text-xs font-medium ${
                theme === "night"
                  ? "bg-slate-900 border-slate-800 text-slate-300"
                  : theme === "sepia"
                  ? "bg-[#ecdcb8] border-[#dfcd9f] text-[#382e25]"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <button
                type="button"
                onClick={() => onContentLocaleChange("th")}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
                  contentLocale === "th"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "hover:text-orange-500"
                }`}
                title="อ่านภาษาไทย"
              >
                ไทย
              </button>
              <button
                type="button"
                onClick={() => onContentLocaleChange("en")}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs font-semibold ${
                  contentLocale === "en"
                    ? "bg-orange-500 text-white shadow-xs"
                    : "hover:text-orange-500"
                }`}
                title="Read in English"
              >
                ENG
              </button>
            </div>
          )}

          {/* Font Size Controls */}
          <div
            className={`flex items-center rounded-xl p-0.5 border text-xs ${
              theme === "night"
                ? "bg-slate-900 border-slate-800"
                : theme === "sepia"
                ? "bg-[#ecdcb8] border-[#dfcd9f]"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={handleDecreaseFont}
              disabled={fontSizeIndex <= 0}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors font-bold ${
                fontSizeIndex <= 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              title={isEn ? "Decrease font size (A-)" : "ลดขนาดตัวอักษร (A-)"}
              aria-label="Decrease font size"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-9 text-center font-mono font-bold text-xs select-none">
              {currentFontSize}
            </span>

            <button
              type="button"
              onClick={handleIncreaseFont}
              disabled={fontSizeIndex >= FONT_SIZE_STEPS.length - 1}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors font-bold ${
                fontSizeIndex >= FONT_SIZE_STEPS.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
              title={isEn ? "Increase font size (A+)" : "เพิ่มขนาดตัวอักษร (A+)"}
              aria-label="Increase font size"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Family Switcher */}
          <button
            type="button"
            onClick={() => onFontFamilyChange(fontFamily === "sans" ? "serif" : "sans")}
            className={`h-8 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              theme === "night"
                ? "bg-slate-900 border-slate-800 hover:bg-slate-800"
                : theme === "sepia"
                ? "bg-[#ecdcb8] border-[#dfcd9f] hover:bg-[#e4d3a9]"
                : "bg-slate-100 border-slate-200 hover:bg-slate-200"
            }`}
            title={fontFamily === "sans" ? "สลับเป็นฟอนต์ Serif" : "สลับเป็นฟอนต์ Sans"}
            aria-label="Toggle font family"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{fontFamily === "sans" ? "Sans" : "Serif"}</span>
          </button>

          {/* Reading Theme Selector (Day, Night, Sepia) */}
          <div
            className={`flex items-center rounded-xl p-0.5 border ${
              theme === "night"
                ? "bg-slate-900 border-slate-800"
                : theme === "sepia"
                ? "bg-[#ecdcb8] border-[#dfcd9f]"
                : "bg-slate-100 border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={() => onThemeChange("day")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                theme === "day"
                  ? "bg-white text-orange-500 shadow-xs"
                  : "opacity-60 hover:opacity-100"
              }`}
              title={isEn ? "Day Mode (Light)" : "โหมดสว่าง (Day)"}
              aria-label="Day mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onThemeChange("sepia")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                theme === "sepia"
                  ? "bg-[#dfcc9b] text-[#382e25] shadow-xs"
                  : "opacity-60 hover:opacity-100"
              }`}
              title={isEn ? "Sepia Mode (Paper)" : "โหมดถนอมสายตา (Sepia)"}
              aria-label="Sepia mode"
            >
              <Coffee className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onThemeChange("night")}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                theme === "night"
                  ? "bg-slate-800 text-orange-400 shadow-xs"
                  : "opacity-60 hover:opacity-100"
              }`}
              title={isEn ? "Night Mode (Dark OLED)" : "โหมดมืด (Night OLED)"}
              aria-label="Night mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`h-8 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isBookmarked
                  ? "bg-orange-500 text-white border-orange-600 shadow-xs hover:bg-orange-600"
                  : theme === "night"
                  ? "bg-slate-900 border-slate-800 hover:border-orange-500 text-slate-300"
                  : theme === "sepia"
                  ? "bg-[#ecdcb8] border-[#dfcd9f] hover:border-orange-500 text-[#382e25]"
                  : "bg-slate-100 border-slate-200 hover:border-orange-500 text-slate-700"
              }`}
              title={isBookmarked ? "คั่นเรื่องนี้แล้ว" : "คั่นเรื่องนี้"}
              aria-label="Bookmark this novel"
            >
              {isBookmarked ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isEn ? "Saved" : "คั่นแล้ว"}</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{isEn ? "Bookmark" : "คั่นเรื่องนี้"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
