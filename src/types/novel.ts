import { z } from "zod";
import {
  normalizeString,
  stripHtmlTags,
  isValidHttpsUrl,
  hasPrototypePollution,
} from "@/lib/sanitize";

export const NOVEL_CATEGORIES = [
  "แฟนตาซี",
  "รักโรแมนติก",
  "แอ็กชัน",
  "กำลังภายใน",
  "วัยรุ่น",
] as const;

export type Category = (typeof NOVEL_CATEGORIES)[number];
export type CategoryFilter = "ทั้งหมด" | Category;

export const READING_STATUSES = ["reading", "completed", "on_hold"] as const;
export type ReadingStatus = (typeof READING_STATUSES)[number];

export type SortOption = "latest" | "title" | "progress";

/**
 * Zod schema for a single Bookmark entity.
 */
export const BookmarkItemSchema = z
  .object({
    id: z.string().uuid("รหัส ID ต้องเป็นรูปแบบ UUID v4"),
    novelId: z.string().min(1, "กรุณาระบุ Novel ID"),
    title: z
      .string()
      .min(1, "กรุณากรอกชื่อเรื่อง")
      .max(200, "ชื่อเรื่องยาวเกิน 200 ตัวอักษร")
      .transform((val) => normalizeString(stripHtmlTags(val))),
    author: z
      .string()
      .min(1, "กรุณากรอกชื่อผู้แต่ง")
      .max(100, "ชื่อผู้แต่งยาวเกิน 100 ตัวอักษร")
      .transform((val) => normalizeString(stripHtmlTags(val))),
    coverUrl: z
      .string()
      .min(1, "กรุณากรอก URL ภาพหน้าปก")
      .refine(isValidHttpsUrl, {
        message: "URL รูปภาพต้องขึ้นต้นด้วย https:// หรือเป็นพาธภายใน",
      }),
    category: z.enum(NOVEL_CATEGORIES, {
      message: "หมวดหมู่นิยายไม่ถูกต้อง",
    }),
    currentChapter: z
      .number()
      .int("จำนวนตอนต้องเป็นจำนวนเต็ม")
      .nonnegative("จำนวนตอนต้องไม่ติดลบ")
      .max(100000, "จำนวนตอนเกินขีดจำกัด"),
    totalChapters: z
      .number()
      .int("จำนวนตอนทั้งหมดต้องเป็นจำนวนเต็ม")
      .positive("จำนวนตอนทั้งหมดต้องมากกว่า 0")
      .max(100000, "จำนวนตอนเกินขีดจำกัด"),
    currentChapterTitle: z
      .string()
      .max(200, "ชื่อตอนยาวเกิน 200 ตัวอักษร")
      .optional()
      .default("")
      .transform((val) => (val ? normalizeString(stripHtmlTags(val)) : "")),
    status: z.enum(READING_STATUSES).default("reading"),
    lastReadAt: z.string().datetime({ message: "รูปแบบเวลา lastReadAt ต้องเป็น ISO UTC" }),
    note: z
      .string()
      .max(2000, "บันทึกช่วยจำยาวเกิน 2000 ตัวอักษร")
      .optional()
      .default("")
      .transform((val) => (val ? normalizeString(stripHtmlTags(val)) : "")),
    createdAt: z.string().datetime({ message: "รูปแบบเวลา createdAt ต้องเป็น ISO UTC" }),
    updatedAt: z.string().datetime({ message: "รูปแบบเวลา updatedAt ต้องเป็น ISO UTC" }),
  })
  .superRefine((data, ctx) => {
    if (data.currentChapter > data.totalChapters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ตอนที่อ่านอยู่ต้องไม่เกินจำนวนตอนทั้งหมด",
        path: ["currentChapter"],
      });
    }
  });

export type Bookmark = z.infer<typeof BookmarkItemSchema>;

/**
 * Zod schema for Form submissions (Add/Edit Modal).
 */
export const BookmarkFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "กรุณากรอกชื่อเรื่อง")
      .max(200, "ชื่อเรื่องยาวเกิน 200 ตัวอักษร")
      .transform((val) => normalizeString(stripHtmlTags(val))),
    author: z
      .string()
      .min(1, "กรุณากรอกชื่อผู้แต่ง")
      .max(100, "ชื่อผู้แต่งยาวเกิน 100 ตัวอักษร")
      .transform((val) => normalizeString(stripHtmlTags(val))),
    coverUrl: z
      .string()
      .min(1, "กรุณากรอก URL ภาพหน้าปก")
      .refine(isValidHttpsUrl, {
        message: "URL รูปภาพต้องขึ้นต้นด้วย https:// หรือเป็นพาธภายใน",
      }),
    category: z.enum(NOVEL_CATEGORIES, {
      message: "กรุณาเลือกหมวดหมู่นิยาย",
    }),
    currentChapter: z
      .number({ message: "กรุณาระบุตอนเป็นตัวเลข" })
      .int()
      .nonnegative("จำนวนตอนต้องไม่ติดลบ"),
    totalChapters: z
      .number({ message: "กรุณาระบุจำนวนตอนทั้งหมดเป็นตัวเลข" })
      .int()
      .positive("จำนวนตอนทั้งหมดต้องมากกว่า 0"),
    currentChapterTitle: z
      .string()
      .max(200)
      .optional()
      .transform((val) => (val ? normalizeString(stripHtmlTags(val)) : "")),
    status: z.enum(READING_STATUSES).default("reading"),
    note: z
      .string()
      .max(2000)
      .optional()
      .transform((val) => (val ? normalizeString(stripHtmlTags(val)) : "")),
  })
  .superRefine((data, ctx) => {
    if (data.currentChapter > data.totalChapters) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ตอนที่อ่านอยู่ต้องไม่เกินจำนวนตอนทั้งหมด",
        path: ["currentChapter"],
      });
    }
  });

export type BookmarkFormDataInput = z.input<typeof BookmarkFormSchema>;
export type BookmarkFormData = z.infer<typeof BookmarkFormSchema>;

/**
 * Versioned LocalStorage Envelope Schema with quota cap and optional integrity metadata.
 */
export const StorageEnvelopeSchema = z.preprocess(
  (val, ctx) => {
    if (hasPrototypePollution(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dangerous prototype pollution detected in storage envelope",
      });
      return z.NEVER;
    }
    return val;
  },
  z.object({
    version: z.literal(1),
    items: z.array(BookmarkItemSchema).max(200, "จำนวนรายการนิยายที่คั่นไว้เกินขีดจำกัด (สูงสุด 200 เรื่อง)"),
    checksum: z.string().optional(),
    exportedAt: z.string().optional(),
  })
);

export type StorageEnvelope = z.infer<typeof StorageEnvelopeSchema>;

/**
 * Banner entity for promotion carousel.
 */
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  author: string;
  illustrator?: string;
  imageUrl: string;
  gradient: string;
  novelId?: string;
}

export type Locale = "th" | "en";

export type PublicationStatus =
  | { kind: "ongoing" }
  | { kind: "season_break"; season: number; nextSeasonStart: string | null }
  | { kind: "hiatus"; since: string; expectedReturn: string | null }
  | { kind: "completed"; completedAt?: string };

export interface ReleaseSchedule {
  days: (1 | 2 | 3 | 4 | 5 | 6 | 7)[];
  time?: string;
  tz: "Asia/Bangkok";
}

export interface CatalogNovel {
  id: string;
  titleTh: string;
  titleEn?: string;
  author: string;
  artist?: string;
  coverUrl: string;
  category: Category | string;
  genres: string[];
  originalLocale: Locale;
  locales: Locale[];
  status: PublicationStatus;
  schedule?: ReleaseSchedule;
  totalChapters: number;
  latestChapter: {
    number: number;
    titleTh: string;
    titleEn?: string;
    updatedAt: string;
  };
  rating: number; // 0-10
  followers: {
    week: number;
    month: number;
    all: number;
  };
  synopsisTh: string;
  synopsisEn?: string;
}

