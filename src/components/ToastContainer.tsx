"use client";

import React from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { UndoRecord } from "@/hooks/useBookmarks";
import { useI18n } from "@/context/I18nContext";

interface ToastContainerProps {
  activeUndo: UndoRecord | null;
  onUndo: () => void;
}

export function ToastContainer({ activeUndo, onUndo }: ToastContainerProps) {
  const { t } = useI18n();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {activeUndo && (
        <div className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-900/95 dark:bg-gray-800/95 text-white shadow-xl border border-gray-800 dark:border-gray-700 backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-dekd-green shrink-0" />
            <span className="text-xs sm:text-sm font-medium truncate">
              {t.toasts.chapterIncremented("", activeUndo.previousChapter + 1)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onUndo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-dekd-orange bg-orange-500/15 hover:bg-dekd-orange hover:text-white border border-orange-500/30 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.toasts.undo}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
