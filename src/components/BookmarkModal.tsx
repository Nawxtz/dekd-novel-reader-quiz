"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  BookOpen,
  Image as ImageIcon,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";
import {
  Bookmark,
  BookmarkFormData,
  BookmarkFormSchema,
  NOVEL_CATEGORIES,
  Category,
  ReadingStatus,
} from "@/types/novel";
import { isValidHttpsUrl } from "@/lib/sanitize";
import { useI18n } from "@/context/I18nContext";

interface BookmarkModalProps {
  isOpen: boolean;
  initialBookmark?: Bookmark | null;
  onClose: () => void;
  onSave: (data: BookmarkFormData) => void;
  onDelete?: (id: string) => void;
  onExport: () => string;
  onImport: (jsonString: string, mode: "replace" | "merge") => { successCount: number; skippedCount: number };
}

export function BookmarkModal({
  isOpen,
  initialBookmark,
  onClose,
  onSave,
  onDelete,
  onExport,
  onImport,
}: BookmarkModalProps) {
  const { locale, t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [category, setCategory] = useState<Category>("แฟนตาซี");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [totalChapters, setTotalChapters] = useState(50);
  const [currentChapterTitle, setCurrentChapterTitle] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("reading");
  const [note, setNote] = useState("");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge">("merge");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) {
        dialog.showModal();
      }
      if (initialBookmark) {
        setTitle(initialBookmark.title);
        setAuthor(initialBookmark.author);
        setCoverUrl(initialBookmark.coverUrl);
        setCategory(initialBookmark.category);
        setCurrentChapter(initialBookmark.currentChapter);
        setTotalChapters(initialBookmark.totalChapters);
        setCurrentChapterTitle(initialBookmark.currentChapterTitle || "");
        setStatus(initialBookmark.status);
        setNote(initialBookmark.note || "");
      } else {
        setTitle("");
        setAuthor("");
        setCoverUrl("https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80");
        setCategory("แฟนตาซี");
        setCurrentChapter(1);
        setTotalChapters(50);
        setCurrentChapterTitle("");
        setStatus("reading");
        setNote("");
      }
      setFormErrors({});
      setImportMessage(null);
      setIsConfirmingDelete(false);
    } else {
      if (dialog.open) {
        dialog.close();
      }
      setIsConfirmingDelete(false);
      triggerRef.current?.focus();
    }
  }, [isOpen, initialBookmark]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: BookmarkFormData = {
      title,
      author,
      coverUrl,
      category,
      currentChapter: Number(currentChapter),
      totalChapters: Number(totalChapters),
      currentChapterTitle,
      status,
      note,
    };

    const result = BookmarkFormSchema.safeParse(payload);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[String(issue.path[0])] = issue.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    onSave(result.data);
    onClose();
  };

  const handleExportClick = () => {
    const jsonString = onExport();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dekd_bookmarks_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImportMessage("ขนาดไฟล์เกินขีดจำกัด 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const result = onImport(content, importMode);
        setImportMessage(t.toasts.importSuccess(result.successCount, result.skippedCount));
      } catch {
        setImportMessage(t.toasts.importError);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleDialogClick}
      aria-labelledby="bookmark-modal-title"
      className="m-auto p-0 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto focus:outline-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
    >
      <div className="p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-dekd-orange dark:text-orange-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 id="bookmark-modal-title" className="text-lg font-bold text-gray-900 dark:text-white">
              {initialBookmark ? t.modal.editTitle : t.modal.addTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dekd-orange dark:text-slate-400"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="bookmark-modal-title-input"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.modal.fieldTitle} <span className="text-red-500">*</span>
            </label>
            <input
              id="bookmark-modal-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ระบุชื่อเรื่องนิยาย"
              aria-invalid={Boolean(formErrors.title)}
              aria-describedby={formErrors.title ? "bookmark-title-error" : undefined}
              className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-dekd-orange/20 transition-all ${
                formErrors.title ? "border-red-500" : "border-gray-200 dark:border-gray-700"
              }`}
            />
            {formErrors.title && (
              <p id="bookmark-title-error" role="alert" className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                {formErrors.title}
              </p>
            )}
          </div>

          {/* Author and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="bookmark-modal-author-input"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.modal.fieldAuthor} <span className="text-red-500">*</span>
              </label>
              <input
                id="bookmark-modal-author-input"
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="ระบุชื่อผู้แต่ง"
                aria-invalid={Boolean(formErrors.author)}
                aria-describedby={formErrors.author ? "bookmark-author-error" : undefined}
                className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-dekd-orange/20 transition-all ${
                  formErrors.author ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                }`}
              />
              {formErrors.author && (
                <p id="bookmark-author-error" role="alert" className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {formErrors.author}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="bookmark-modal-category-select"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.modal.fieldCategory}
              </label>
              <select
                id="bookmark-modal-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-dekd-orange/20 transition-all"
              >
                {NOVEL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover URL and Thumbnail Preview */}
          <div>
            <label
              htmlFor="bookmark-modal-cover-url-input"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.modal.fieldCoverUrl} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                id="bookmark-modal-cover-url-input"
                type="url"
                required
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-example"
                aria-invalid={Boolean(formErrors.coverUrl)}
                aria-describedby={formErrors.coverUrl ? "bookmark-cover-url-error" : undefined}
                className={`flex-1 px-3.5 py-2 text-sm rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-dekd-orange/20 transition-all ${
                  formErrors.coverUrl ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                }`}
              />
              <div className="w-10 h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700 relative">
                {coverUrl && isValidHttpsUrl(coverUrl) ? (
                  <Image src={coverUrl.trim()} alt="Preview" fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
            {formErrors.coverUrl && (
              <p id="bookmark-cover-url-error" role="alert" className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                {formErrors.coverUrl}
              </p>
            )}
          </div>

          {/* Chapters and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label
                htmlFor="bookmark-modal-current-chapter-input"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.modal.fieldCurrentChapter}
              </label>
              <input
                id="bookmark-modal-current-chapter-input"
                type="number"
                min="0"
                value={currentChapter}
                onChange={(e) => setCurrentChapter(parseInt(e.target.value, 10) || 0)}
                aria-invalid={Boolean(formErrors.currentChapter)}
                aria-describedby={formErrors.currentChapter ? "bookmark-current-chapter-error" : undefined}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-dekd-orange/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="bookmark-modal-total-chapters-input"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.modal.fieldTotalChapters}
              </label>
              <input
                id="bookmark-modal-total-chapters-input"
                type="number"
                min="1"
                value={totalChapters}
                onChange={(e) => setTotalChapters(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-dekd-orange/20 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="bookmark-modal-status-select"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                {t.modal.fieldStatus}
              </label>
              <select
                id="bookmark-modal-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-dekd-orange/20 transition-all"
              >
                <option value="reading">{t.status.reading}</option>
                <option value="completed">{t.status.completed}</option>
                <option value="on_hold">{t.status.on_hold}</option>
              </select>
            </div>
          </div>
          {formErrors.currentChapter && (
            <p id="bookmark-current-chapter-error" role="alert" className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              {formErrors.currentChapter}
            </p>
          )}

          {/* Chapter Title */}
          <div>
            <label
              htmlFor="bookmark-modal-current-chapter-title-input"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.modal.fieldChapterTitle}
            </label>
            <input
              id="bookmark-modal-current-chapter-title-input"
              type="text"
              value={currentChapterTitle}
              onChange={(e) => setCurrentChapterTitle(e.target.value)}
              placeholder="ระบุชื่อตอน เช่น ชายารองแห่งจวนอ๋อง"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dekd-orange/20 transition-all"
            />
          </div>

          {/* Personal Note */}
          <div>
            <label
              htmlFor="bookmark-modal-note-textarea"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.modal.fieldNote}
            </label>
            <textarea
              id="bookmark-modal-note-textarea"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="บันทึกความรู้สึก หรือจุดที่อ่านค้างไว้"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-dekd-orange/20 transition-all"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
            {initialBookmark && onDelete ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50">
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">
                    {locale === "th" ? "ยืนยันการลบที่คั่นนี้ใช่หรือไม่?" : "Confirm deleting this bookmark?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(initialBookmark.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600"
                  >
                    {t.editMode.confirm}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dekd-orange"
                  >
                    {t.modal.cancel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                >
                  {t.bookmarks.deleteSingle}
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dekd-orange"
              >
                {t.modal.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-dekd-orange hover:bg-dekd-orange-hover rounded-xl shadow-sm shadow-orange-500/25 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-dekd-orange"
              >
                {t.modal.save}
              </button>
            </div>
          </div>
        </form>

        {/* Data Backup and Import Section */}
        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="bookmark-modal-import-mode-select"
              className="text-xs font-bold text-gray-600 dark:text-gray-400 cursor-pointer"
            >
              {t.modal.importExport}
            </label>
            <div className="flex items-center gap-2">
              <select
                id="bookmark-modal-import-mode-select"
                value={importMode}
                onChange={(e) => setImportMode(e.target.value as "replace" | "merge")}
                className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-dekd-orange"
              >
                <option value="merge">{t.modal.importMerge}</option>
                <option value="replace">{t.modal.importReplace}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-dekd-orange"
            >
              <Download className="w-3.5 h-3.5" />
              {t.modal.exportJson}
            </button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-dekd-orange rounded-lg">
              <Upload className="w-3.5 h-3.5" />
              <span>{t.modal.importJson}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {importMessage && (
            <div className="mt-3 p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 text-xs text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-dekd-orange dark:text-orange-400" />
              <span>{importMessage}</span>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
