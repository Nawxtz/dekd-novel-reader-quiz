/**
 * Date and number formatting utilities.
 * Enforces pinned Asia/Bangkok timezone and exact Figma formatting.
 */

export interface DateParts {
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
}

/**
 * Extract date parts pinned to Asia/Bangkok timezone.
 */
export function getBangkokDateParts(
  dateInput: Date | string | number,
  locale: "th" | "en" = "th"
): DateParts {
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);

  // Validate date
  if (isNaN(date.getTime())) {
    return { day: "-", month: "-", year: "-", hour: "--", minute: "--" };
  }

  const intlLocale = locale === "th" ? "th-TH-u-ca-buddhist" : "en-US";
  const formatter = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      partMap[part.type] = part.value;
    }
  }

  return {
    day: partMap.day || "",
    month: partMap.month || "",
    year: partMap.year || "",
    hour: (partMap.hour || "00").padStart(2, "0"),
    minute: (partMap.minute || "00").padStart(2, "0"),
  };
}

/**
 * Format bookmark date string matching Figma specification.
 * Thai: "คั่นล่าสุด 9 ก.ค. 63 / 22.56 น."
 * English: "Bookmarked 9 Jul 20 / 22.56"
 */
export function formatBookmarkDate(
  dateInput: Date | string | number,
  locale: "th" | "en" = "th"
): string {
  const parts = getBangkokDateParts(dateInput, locale);
  if (parts.day === "-") {
    return locale === "th" ? "ไม่ระบุเวลา" : "Unknown date";
  }

  if (locale === "th") {
    return `คั่นล่าสุด ${parts.day} ${parts.month} ${parts.year} / ${parts.hour}.${parts.minute} น.`;
  }

  return `Bookmarked ${parts.day} ${parts.month} ${parts.year} / ${parts.hour}.${parts.minute}`;
}

/**
 * Format chapter label.
 */
export function formatChapterLabel(
  current: number,
  total?: number,
  locale: "th" | "en" = "th"
): string {
  if (locale === "th") {
    return total ? `ตอนที่ ${current} / ${total}` : `ตอนที่ ${current}`;
  }
  return total ? `Ch. ${current} / ${total}` : `Ch. ${current}`;
}

/**
 * Format count numbers with commas.
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
