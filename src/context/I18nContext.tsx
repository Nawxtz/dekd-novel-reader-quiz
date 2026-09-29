"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

export type Locale = "th" | "en";

export interface Translations {
  nav: {
    home: string;
    novels: string;
    bookmarks: string;
    searchPlaceholder: string;
    themeToggle: string;
    langToggle: string;
    shortcutsHelp: string;
  };
  hero: {
    badge: string;
    explore: string;
    readNow: string;
    playCarousel: string;
    pauseCarousel: string;
  };
  bookmarks: {
    title: string;
    totalCount: (n: number) => string;
    filteredCount: (filtered: number, total: number) => string;
    edit: string;
    done: string;
    addBookmark: string;
    emptyTitle: string;
    emptyDescription: string;
    addFirst: string;
    quickAddChapter: string;
    chapterReachedMax: string;
    readNow: string;
    lastBookmarked: string;
    currentChapter: string;
  };
  editMode: {
    selectAll: string;
    deselectAll: string;
    selectedCount: (n: number) => string;
    deleteSelected: string;
    confirmDeleteTitle: string;
    confirmDeleteMessage: (n: number) => string;
    cancel: string;
    confirm: string;
  };
  modal: {
    addTitle: string;
    editTitle: string;
    fieldTitle: string;
    fieldAuthor: string;
    fieldCoverUrl: string;
    fieldCategory: string;
    fieldCurrentChapter: string;
    fieldTotalChapters: string;
    fieldChapterTitle: string;
    fieldStatus: string;
    fieldNote: string;
    save: string;
    cancel: string;
    importExport: string;
    exportJson: string;
    importJson: string;
    importModePrompt: string;
    importReplace: string;
    importMerge: string;
  };
  categories: {
    all: string;
    fantasy: string;
    romance: string;
    action: string;
    martialArts: string;
    teen: string;
  };
  status: {
    all: string;
    reading: string;
    completed: string;
    on_hold: string;
  };
  toasts: {
    added: string;
    updated: string;
    deleted: string;
    bulkDeleted: (n: number) => string;
    chapterIncremented: (title: string, ch: number) => string;
    undo: string;
    undoSuccess: string;
    importSuccess: (count: number, skipped: number) => string;
    importError: string;
    storageError: string;
  };
  shortcuts: {
    title: string;
    description: string;
    search: string;
    edit: string;
    add: string;
    escape: string;
    help: string;
    toggleLabel: string;
    close: string;
  };
}

const translations: Record<Locale, Translations> = {
  th: {
    nav: {
      home: "หน้าแรก",
      novels: "นิยาย",
      bookmarks: "ที่คั่นไว้",
      searchPlaceholder: "ค้นหาชื่อนิยาย หรือชื่อผู้แต่ง (กด / เพื่อค้นหา)",
      themeToggle: "สลับโหมดมืด สว่าง",
      langToggle: "เปลี่ยนภาษา TH EN",
      shortcutsHelp: "คีย์ลัดแป้นพิมพ์",
    },
    hero: {
      badge: "นิยายแนะนำ",
      explore: "สำรวจนิยายทั้งหมด",
      readNow: "เริ่มอ่านเลย",
      playCarousel: "เล่นภาพสไลด์อัตโนมัติ",
      pauseCarousel: "หยุดภาพสไลด์ชั่วคราว",
    },
    bookmarks: {
      title: "รายการที่คั่นไว้",
      totalCount: (n) => `จำนวนทั้งหมด ${n} รายการ`,
      filteredCount: (filtered, total) => `แสดง ${filtered} จาก ${total} รายการ`,
      edit: "แก้ไข",
      done: "เสร็จสิ้น",
      addBookmark: "เพิ่มที่คั่น",
      emptyTitle: "ยังไม่มีรายการที่คั่นไว้",
      emptyDescription: "คุณสามารถค้นหานิยายที่ชื่นชอบและกดคั่นหน้าเพื่อติดตามตอนล่าสุดได้ที่นี่",
      addFirst: "เพิ่มนิยายเรื่องแรก",
      quickAddChapter: "+1 ตอน",
      chapterReachedMax: "อ่านถึงตอนล่าสุดแล้ว",
      readNow: "อ่านต่อ",
      lastBookmarked: "คั่นล่าสุด",
      currentChapter: "ตอนที่",
    },
    editMode: {
      selectAll: "เลือกทั้งหมด",
      deselectAll: "ยกเลิกการเลือก",
      selectedCount: (n) => `เลือกไว้ ${n} รายการ`,
      deleteSelected: "ลบรายการที่เลือก",
      confirmDeleteTitle: "ยืนยันการลบรายการที่คั่นไว้",
      confirmDeleteMessage: (n) => `คุณต้องการลบ ${n} รายการที่เลือกใช่หรือไม่ ข้อมูลจะหายไปทันที`,
      cancel: "ยกเลิก",
      confirm: "ลบรายการ",
    },
    modal: {
      addTitle: "เพิ่มนิยายที่คั่นไว้",
      editTitle: "แก้ไขข้อมูลที่คั่น",
      fieldTitle: "ชื่อเรื่อง",
      fieldAuthor: "ชื่อผู้แต่ง",
      fieldCoverUrl: "ลิงก์รูปภาพหน้าปก",
      fieldCategory: "หมวดหมู่นิยาย",
      fieldCurrentChapter: "ตอนที่อ่านอยู่",
      fieldTotalChapters: "จำนวนตอนทั้งหมด",
      fieldChapterTitle: "ชื่อตอนปัจจุบัน",
      fieldStatus: "สถานะการอ่าน",
      fieldNote: "บันทึกช่วยจำ",
      save: "บันทึกข้อมูล",
      cancel: "ยกเลิก",
      importExport: "สำรองและนำเข้าข้อมูล",
      exportJson: "ส่งออกไฟล์ JSON",
      importJson: "นำเข้าไฟล์ JSON",
      importModePrompt: "เลือกรูปแบบการนำเข้าข้อมูล",
      importReplace: "แทนที่ข้อมูลเดิมทั้งหมด",
      importMerge: "เพิ่มต่อจากข้อมูลเดิม",
    },
    categories: {
      all: "ทั้งหมด",
      fantasy: "แฟนตาซี",
      romance: "รักโรแมนติก",
      action: "แอ็กชัน",
      martialArts: "กำลังภายใน",
      teen: "วัยรุ่น",
    },
    status: {
      all: "ทุกสถานะ",
      reading: "กำลังอ่าน",
      completed: "อ่านจบแล้ว",
      on_hold: "ดองไว้",
    },
    toasts: {
      added: "เพิ่มรายการที่คั่นเรียบร้อยแล้ว",
      updated: "บันทึกการแก้ไขเรียบร้อยแล้ว",
      deleted: "ลบรายการที่คั่นเรียบร้อยแล้ว",
      bulkDeleted: (n) => `ลบรายการที่เลือกแล้ว ${n} รายการ`,
      chapterIncremented: (title, ch) => `อัปเดต ${title} เป็นตอนที่ ${ch}`,
      undo: "เลิกทำ",
      undoSuccess: "ย้อนกลับการเปลี่ยนแปลงเรียบร้อยแล้ว",
      importSuccess: (count, skipped) =>
        skipped > 0
          ? `นำเข้าสำเร็จ ${count} รายการ (ข้าม ${skipped} รายการที่ไม่ถูกต้อง)`
          : `นำเข้าสำเร็จทั้งหมด ${count} รายการ`,
      importError: "ไฟล์ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบไฟล์ JSON",
      storageError: "ไม่สามารถบันทึกข้อมูลลง Storage ได้ ระบบจะจำข้อมูลในหน่วยความจำชั่วคราว",
    },
    shortcuts: {
      title: "คีย์ลัดบนแป้นพิมพ์",
      description: "ใช้ปุ่มลัดเพื่อจัดการรายการที่คั่นและเข้าถึงฟังก์ชันต่างๆ อย่างรวดเร็ว",
      search: "ค้นหานิยาย",
      edit: "เปิดหรือปิดโหมดแก้ไข",
      add: "เปิดหน้าต่างเพิ่มนิยาย",
      escape: "ปิดหน้าต่างแจ้งเตือน",
      help: "เปิดคู่มือคีย์ลัดนี้",
      toggleLabel: "เปิดใช้งานคีย์ลัดปุ่มเดียว",
      close: "ปิด",
    },
  },
  en: {
    nav: {
      home: "Home",
      novels: "Novels",
      bookmarks: "Bookmarks",
      searchPlaceholder: "Search novels or authors (Press / to search)",
      themeToggle: "Toggle Light/Dark Theme",
      langToggle: "Switch Language TH/EN",
      shortcutsHelp: "Keyboard Shortcuts",
    },
    hero: {
      badge: "Featured Novels",
      explore: "Explore All Novels",
      readNow: "Read Now",
      playCarousel: "Play carousel autoplay",
      pauseCarousel: "Pause carousel autoplay",
    },
    bookmarks: {
      title: "Bookmarked Novels",
      totalCount: (n) => `Total ${n} items`,
      filteredCount: (filtered, total) => `Showing ${filtered} of ${total} items`,
      edit: "Edit",
      done: "Done",
      addBookmark: "Add Bookmark",
      emptyTitle: "No bookmarks yet",
      emptyDescription: "Find your favorite novels and bookmark them to keep track of your reading progress.",
      addFirst: "Add your first novel",
      quickAddChapter: "+1 Ch.",
      chapterReachedMax: "Reached latest chapter",
      readNow: "Continue Reading",
      lastBookmarked: "Bookmarked",
      currentChapter: "Chapter",
    },
    editMode: {
      selectAll: "Select All",
      deselectAll: "Deselect All",
      selectedCount: (n) => `${n} selected`,
      deleteSelected: "Delete Selected",
      confirmDeleteTitle: "Confirm Bulk Deletion",
      confirmDeleteMessage: (n) => `Are you sure you want to delete ${n} selected novels? This action cannot be undone.`,
      cancel: "Cancel",
      confirm: "Delete",
    },
    modal: {
      addTitle: "Add Novel Bookmark",
      editTitle: "Edit Novel Bookmark",
      fieldTitle: "Novel Title",
      fieldAuthor: "Author",
      fieldCoverUrl: "Cover Image URL",
      fieldCategory: "Category",
      fieldCurrentChapter: "Current Chapter",
      fieldTotalChapters: "Total Chapters",
      fieldChapterTitle: "Current Chapter Title",
      fieldStatus: "Reading Status",
      fieldNote: "Personal Notes",
      save: "Save",
      cancel: "Cancel",
      importExport: "Backup & Import Data",
      exportJson: "Export JSON",
      importJson: "Import JSON",
      importModePrompt: "Choose import method",
      importReplace: "Replace all current data",
      importMerge: "Merge into existing bookmarks",
    },
    categories: {
      all: "All",
      fantasy: "Fantasy",
      romance: "Romance",
      action: "Action",
      martialArts: "Martial Arts",
      teen: "Teen",
    },
    status: {
      all: "All Statuses",
      reading: "Reading",
      completed: "Completed",
      on_hold: "On Hold",
    },
    toasts: {
      added: "Novel bookmark added successfully",
      updated: "Changes saved successfully",
      deleted: "Bookmark deleted successfully",
      bulkDeleted: (n) => `Deleted ${n} selected bookmarks`,
      chapterIncremented: (title, ch) => `Updated ${title} to Chapter ${ch}`,
      undo: "Undo",
      undoSuccess: "Change reverted successfully",
      importSuccess: (count, skipped) =>
        skipped > 0
          ? `Imported ${count} items successfully (${skipped} invalid rows skipped)`
          : `Imported all ${count} items successfully`,
      importError: "Invalid JSON format. Please verify your file.",
      storageError: "Storage is not accessible. Data will be preserved in-memory for this session.",
    },
    shortcuts: {
      title: "Keyboard Shortcuts",
      description: "Use shortcuts to navigate and manage your bookmarks efficiently.",
      search: "Focus search bar",
      edit: "Toggle bulk edit mode",
      add: "Open add bookmark modal",
      escape: "Close open dialog",
      help: "Open this cheat sheet",
      toggleLabel: "Enable single-key shortcuts",
      close: "Close",
    },
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translations;
}

const I18N_STORAGE_KEY = "dekd_locale_v1";

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(I18N_STORAGE_KEY) as Locale | null;
      if (stored === "th" || stored === "en") {
        setLocaleState(stored);
      }
    } catch {
      // Fallback
      setLocaleState("th");
    }
  }, []);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    try {
      localStorage.setItem(I18N_STORAGE_KEY, nextLocale);
    } catch {
      // Ignore
    }
    // Set document lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLocale;
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === "th" ? "en" : "th";
      try {
        localStorage.setItem(I18N_STORAGE_KEY, next);
      } catch {
        // Ignore
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = next;
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: translations[locale],
    }),
    [locale, setLocale, toggleLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
