import { describe, it, expect } from "vitest";
import { formatBookmarkDate, formatChapterLabel } from "../src/lib/formatters";

describe("formatBookmarkDate", () => {
  it("formats Buddhist Era timestamp exactly matching Figma layout (9 ก.ค. 63 / 22.56 น.)", () => {
    // 2020-07-09 15:56:00 UTC = 2020-07-09 22:56:00 UTC+7 (Asia/Bangkok)
    // 2020 CE = 2563 BE -> 63
    const utcTimestamp = "2020-07-09T15:56:00.000Z";
    const formatted = formatBookmarkDate(utcTimestamp, "th");
    expect(formatted).toBe("คั่นล่าสุด 9 ก.ค. 63 / 22.56 น.");
  });

  it("formats English timestamp correctly with pinned Bangkok timezone", () => {
    const utcTimestamp = "2020-07-09T15:56:00.000Z";
    const formatted = formatBookmarkDate(utcTimestamp, "en");
    expect(formatted).toBe("Bookmarked 9 Jul 20 / 22.56");
  });

  it("handles midnight and single-digit minutes with padding", () => {
    // 2021-01-01 17:05:00 UTC = 2021-01-02 00:05:00 UTC+7
    const timestamp = "2021-01-01T17:05:00.000Z";
    const formatted = formatBookmarkDate(timestamp, "th");
    expect(formatted).toBe("คั่นล่าสุด 2 ม.ค. 64 / 00.05 น.");
  });

  it("returns fallback string on invalid date", () => {
    expect(formatBookmarkDate("invalid-date", "th")).toBe("ไม่ระบุเวลา");
    expect(formatBookmarkDate("invalid-date", "en")).toBe("Unknown date");
  });
});

describe("formatChapterLabel", () => {
  it("formats chapter label with total in Thai", () => {
    expect(formatChapterLabel(18, 85, "th")).toBe("ตอนที่ 18 / 85");
  });

  it("formats chapter label without total in Thai", () => {
    expect(formatChapterLabel(18, undefined, "th")).toBe("ตอนที่ 18");
  });

  it("formats chapter label in English", () => {
    expect(formatChapterLabel(18, 85, "en")).toBe("Ch. 18 / 85");
  });
});
