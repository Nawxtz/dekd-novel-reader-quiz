"use client";

import { useEffect, useState, useCallback } from "react";

export interface ShortcutHandlers {
  onSearch?: () => void;
  onToggleEdit?: () => void;
  onAddNovel?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
  isModalOpen?: boolean;
}

const SHORTCUTS_ENABLED_KEY = "dekd_shortcuts_enabled_v1";

export function useKeyboardShortcuts({
  onSearch,
  onToggleEdit,
  onAddNovel,
  onEscape,
  onHelp,
  isModalOpen = false,
}: ShortcutHandlers) {
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SHORTCUTS_ENABLED_KEY);
      if (stored !== null) {
        setShortcutsEnabled(stored === "true");
      }
    } catch {
      // Fallback
    }
  }, []);

  const toggleShortcutsEnabled = useCallback(() => {
    setShortcutsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SHORTCUTS_ENABLED_KEY, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Always allow Escape to close open modal even if inside input or shortcuts disabled
      if (e.code === "Escape") {
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      // Check if user disabled single-key shortcuts (WCAG 2.1.4)
      if (!shortcutsEnabled) return;

      // Ignore if modifier keys (Ctrl, Meta, Alt) are pressed
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Ignore during IME composition (crucial for Thai/Asian languages)
      if (e.isComposing) return;

      // Ignore if typing inside input, textarea, select, or contenteditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // If a modal is open, suppress single-key actions to prevent background triggers
      if (isModalOpen) return;

      // Shortcut: '?' (Shift + Slash) -> Open cheat sheet
      if (e.code === "Slash" && e.shiftKey) {
        e.preventDefault();
        onHelp?.();
        return;
      }

      // Shortcut: '/' -> Focus Search
      if (e.code === "Slash" && !e.shiftKey) {
        e.preventDefault();
        onSearch?.();
        return;
      }

      // Shortcut: 'e' -> Toggle Edit mode
      if (e.code === "KeyE") {
        e.preventDefault();
        onToggleEdit?.();
        return;
      }

      // Shortcut: 'n' -> Open Add Bookmark modal
      if (e.code === "KeyN") {
        e.preventDefault();
        onAddNovel?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    shortcutsEnabled,
    isModalOpen,
    onSearch,
    onToggleEdit,
    onAddNovel,
    onEscape,
    onHelp,
  ]);

  return {
    shortcutsEnabled,
    toggleShortcutsEnabled,
  };
}
