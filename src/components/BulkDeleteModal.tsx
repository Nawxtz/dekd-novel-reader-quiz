"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

interface BulkDeleteModalProps {
  isOpen: boolean;
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function BulkDeleteModal({
  isOpen,
  selectedCount,
  onClose,
  onConfirm,
}: BulkDeleteModalProps) {
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

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="bulk-delete-title"
      aria-describedby="bulk-delete-description"
      className="m-auto p-0 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full focus:outline-none"
    >
      <div className="p-6">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="bulk-delete-title"
              className="text-base sm:text-lg font-bold text-gray-900 dark:text-white"
            >
              {t.editMode.confirmDeleteTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.editMode.selectedCount(selectedCount)}
            </p>
          </div>
        </div>

        <p
          id="bulk-delete-description"
          className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6"
        >
          {t.editMode.confirmDeleteMessage(selectedCount)}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {t.editMode.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.editMode.confirm}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
