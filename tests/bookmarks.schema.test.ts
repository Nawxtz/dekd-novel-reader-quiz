import { describe, it, expect } from "vitest";
import {
  BookmarkItemSchema,
  StorageEnvelopeSchema,
  BookmarkFormSchema,
} from "../src/types/novel";
import { INITIAL_BOOKMARKS } from "../src/data/mockNovels";

describe("BookmarkItemSchema", () => {
  it("validates all initial seed mock bookmarks without errors", () => {
    INITIAL_BOOKMARKS.forEach((item) => {
      const parsed = BookmarkItemSchema.safeParse(item);
      expect(parsed.success).toBe(true);
    });
  });

  it("rejects invalid non-UUID identifiers", () => {
    const invalid = {
      ...INITIAL_BOOKMARKS[0],
      id: "not-a-uuid-1234",
    };
    const res = BookmarkItemSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("rejects non-https URLs and javascript: pseudo-protocols", () => {
    const invalidHttp = {
      ...INITIAL_BOOKMARKS[0],
      coverUrl: "http://insecure.example.com/cover.jpg",
    };
    expect(BookmarkItemSchema.safeParse(invalidHttp).success).toBe(false);

    const invalidJs = {
      ...INITIAL_BOOKMARKS[0],
      coverUrl: "javascript:alert(1)",
    };
    expect(BookmarkItemSchema.safeParse(invalidJs).success).toBe(false);
  });

  it("rejects when currentChapter exceeds totalChapters", () => {
    const invalid = {
      ...INITIAL_BOOKMARKS[0],
      currentChapter: 100,
      totalChapters: 50,
    };
    const res = BookmarkItemSchema.safeParse(invalid);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0].message).toContain("ตอนที่อ่านอยู่ต้องไม่เกิน");
    }
  });

  it("normalizes unicode and strips control/bidi-override characters", () => {
    const withBidi = {
      ...INITIAL_BOOKMARKS[0],
      title: "  มังกรผงาด\u202Eฟ้า  ", // Includes right-to-left override and leading/trailing whitespace
    };
    const res = BookmarkItemSchema.safeParse(withBidi);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.title).toBe("มังกรผงาดฟ้า");
    }
  });
});

describe("StorageEnvelopeSchema", () => {
  it("accepts valid version 1 storage envelope", () => {
    const envelope = {
      version: 1,
      items: INITIAL_BOOKMARKS,
    };
    const res = StorageEnvelopeSchema.safeParse(envelope);
    expect(res.success).toBe(true);
  });

  it("rejects payloads containing prototype pollution keys", () => {
    const payload = JSON.parse(
      '{"version": 1, "items": [], "__proto__": {"polluted": true}}'
    );
    const res = StorageEnvelopeSchema.safeParse(payload);
    expect(res.success).toBe(false);
  });
});
