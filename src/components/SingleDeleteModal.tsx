"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

interface SingleDeleteModalProps {
  isOpen: boolean;
  novelTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function SingleDeleteModal({
  isOpen,
  novelTitle,
  onClose,
  onConfirm,
}: SingleDeleteModalProps) {
  const { locale, t } = useI18n();
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
      aria-labelledby="single-delete-title"
      aria-describedby="single-delete-description"
      className="m-auto p-0 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl max-w-md w-full focus:outline-none backdrop:bg-black/50"
    >
      <div className="p-6">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="single-delete-title"
              className="text-base sm:text-lg font-bold text-gray-900 dark:text-white"
            >
              {locale === "th" ? "ยืนยันการลบที่คั่นนิยาย" : "Confirm Delete Bookmark"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {locale === "th"
                ? "การดำเนินการนี้จะไม่สามารถย้อนกลับได้"
                : "This action cannot be undone"}
            </p>
          </div>
        </div>

        <p
          id="single-delete-description"
          className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed"
        >
          {locale === "th" ? (
            <>
              คุณต้องการลบที่คั่นนิยายเรื่อง{" "}
              <strong className="font-semibold text-gray-900 dark:text-white">
                &ldquo;{novelTitle}&rdquo;
              </strong>{" "}
              ออกจากรายการที่คั่นไว้ใช่หรือไม่?
            </>
          ) : (
            <>
              Are you sure you want to remove{" "}
              <strong className="font-semibold text-gray-900 dark:text-white">
                &ldquo;{novelTitle}&rdquo;
              </strong>{" "}
              from your bookmarks?
            </>
          )}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {t.editMode.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.editMode.confirm}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}
