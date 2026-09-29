"use client";

import React, { useState, useRef, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { BannerCarousel } from "@/components/BannerCarousel";
import { BookmarkList } from "@/components/BookmarkList";
import { BookmarkModal } from "@/components/BookmarkModal";
import { ToastContainer } from "@/components/ToastContainer";
import { KeyboardCheatSheet } from "@/components/KeyboardCheatSheet";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { MOCK_BANNERS } from "@/data/mockNovels";
import { Bookmark, BookmarkFormData } from "@/types/novel";

export default function Home() {
  const {
    bookmarks,
    isLoading,
    addBookmark,
    updateBookmark,
    incrementChapter,
    deleteBookmark,
    bulkDeleteBookmarks,
    activeUndo,
    triggerUndo,
    importData,
    exportData,
  } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut handlers
  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

  const handleToggleEdit = useCallback(() => {
    if (bookmarks && bookmarks.length > 0) {
      setIsEditMode((prev) => !prev);
    }
  }, [bookmarks]);

  const handleOpenAdd = useCallback(() => {
    setEditingBookmark(null);
    setIsAddEditModalOpen(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    setIsAddEditModalOpen(false);
    setIsShortcutsModalOpen(false);
  }, []);

  const handleOpenHelp = useCallback(() => {
    setIsShortcutsModalOpen(true);
  }, []);

  const isAnyModalOpen = isAddEditModalOpen || isShortcutsModalOpen;

  const { shortcutsEnabled, toggleShortcutsEnabled } = useKeyboardShortcuts({
    onSearch: handleFocusSearch,
    onToggleEdit: handleToggleEdit,
    onAddNovel: handleOpenAdd,
    onEscape: handleCloseModals,
    onHelp: handleOpenHelp,
    isModalOpen: isAnyModalOpen,
  });

  const handleEditClick = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsAddEditModalOpen(true);
  };

  const handleSaveBookmark = (data: BookmarkFormData) => {
    if (editingBookmark) {
      updateBookmark(editingBookmark.id, data);
    } else {
      addBookmark(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)]">
      {/* Top Sticky Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={handleOpenAdd}
        onOpenShortcuts={handleOpenHelp}
        searchInputRef={searchInputRef}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Promotional Novel Banner Carousel */}
        <BannerCarousel banners={MOCK_BANNERS} />

        {/* Bookmarks Section Header, Filters, and Cards Grid */}
        <BookmarkList
          bookmarks={bookmarks}
          isLoading={isLoading}
          searchQuery={searchQuery}
          isEditMode={isEditMode}
          onToggleEditMode={() => setIsEditMode((prev) => !prev)}
          onOpenAddModal={handleOpenAdd}
          onEditBookmark={handleEditClick}
          onDeleteBookmark={deleteBookmark}
          onBulkDelete={bulkDeleteBookmarks}
          onQuickAddChapter={incrementChapter}
        />
      </main>

      {/* Add / Edit Novel Modal */}
      <BookmarkModal
        isOpen={isAddEditModalOpen}
        initialBookmark={editingBookmark}
        onClose={() => setIsAddEditModalOpen(false)}
        onSave={handleSaveBookmark}
        onExport={exportData}
        onImport={importData}
      />

      {/* Keyboard Shortcuts Cheat Sheet */}
      <KeyboardCheatSheet
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        shortcutsEnabled={shortcutsEnabled}
        onToggleShortcuts={toggleShortcutsEnabled}
      />

      {/* Toast Notification Container with Undo */}
      <ToastContainer activeUndo={activeUndo} onUndo={triggerUndo} />

      {/* Footer */}
      <footer className="w-full py-6 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400 dark:text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Dek-D Interactive Front-end Developer Intern Take-Home Quiz</span>
          <span>Crafted with Next.js 14, TypeScript, Tailwind CSS and Vitest</span>
        </div>
      </footer>
    </div>
  );
}
