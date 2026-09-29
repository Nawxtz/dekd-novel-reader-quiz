"use client";

import React, { useEffect, useRef } from "react";
import { X, Keyboard, Shield } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

interface KeyboardCheatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  shortcutsEnabled: boolean;
  onToggleShortcuts: () => void;
}

export function KeyboardCheatSheet({
  isOpen,
  onClose,
  shortcutsEnabled,
  onToggleShortcuts,
}: KeyboardCheatSheetProps) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const shortcutList = [
    { key: "/", description: t.shortcuts.search },
    { key: "e", description: t.shortcuts.edit },
    { key: "n", description: t.shortcuts.add },
    { key: "?", description: t.shortcuts.help },
    { key: "Esc", description: t.shortcuts.escape },
  ];

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="shortcuts-modal-title"
      className="m-auto p-0 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full focus:outline-none"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-dekd-orange flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="shortcuts-modal-title"
                className="text-base sm:text-lg font-bold text-gray-900 dark:text-white"
              >
                {t.shortcuts.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
          {t.shortcuts.description}
        </p>

        {/* Shortcuts Table */}
        <div className="space-y-2 mb-6">
          {shortcutList.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800"
            >
              <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                {item.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-mono font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-2xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* WCAG 2.1.4 Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-dekd-orange shrink-0" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {t.shortcuts.toggleLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleShortcuts}
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center px-0.5 ${
              shortcutsEnabled ? "bg-dekd-orange" : "bg-gray-300 dark:bg-gray-700"
            }`}
            role="switch"
            aria-checked={shortcutsEnabled}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                shortcutsEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            {t.shortcuts.close}
          </button>
        </div>
      </div>
    </dialog>
  );
}
