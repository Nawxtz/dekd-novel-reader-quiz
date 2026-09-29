"use client";

import React from "react";
import { Search, Sun, Moon, Globe, Keyboard, BookOpen, Plus, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/context/I18nContext";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenShortcuts: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenShortcuts,
  searchInputRef,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale, t } = useI18n();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dekd-orange to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Dek<span className="text-dekd-orange">-D</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dekd-orange-light dark:bg-orange-950/60 text-dekd-orange border border-orange-200 dark:border-orange-800/60 hidden sm:inline-block">
                  Novel
                </span>
              </span>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium hidden sm:block">
                Take-Home Reader
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
                className="w-full pl-10 pr-16 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800/80 border border-transparent focus:border-dekd-orange dark:focus:border-dekd-orange text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-dekd-orange/20 transition-all"
                aria-label={t.nav.searchPlaceholder}
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-mono font-medium text-gray-400 dark:text-gray-500 bg-gray-200/80 dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded">
                  /
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Add Novel Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-dekd-orange hover:bg-dekd-orange-hover shadow-sm shadow-orange-500/25 active:scale-95 transition-all"
              title={t.bookmarks.addBookmark}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">{t.bookmarks.addBookmark}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLocale}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 active:scale-95 transition-all"
              aria-label={t.nav.langToggle}
              title={t.nav.langToggle}
            >
              <Globe className="w-3.5 h-3.5 text-dekd-orange" />
              <span>{locale === "th" ? "TH" : "EN"}</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 active:scale-95 transition-all"
              aria-label={t.nav.themeToggle}
              title={t.nav.themeToggle}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Shortcuts Help Button */}
            <button
              onClick={onOpenShortcuts}
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 active:scale-95 transition-all hidden sm:inline-flex"
              aria-label={t.nav.shortcutsHelp}
              title={t.nav.shortcutsHelp}
            >
              <Keyboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
