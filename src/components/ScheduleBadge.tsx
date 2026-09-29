"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

export interface ReleaseSchedule {
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  days?: (1 | 2 | 3 | 4 | 5 | 6 | 7)[]; // 1 = Mon, 7 = Sun or similar
  timeString?: string;
  time?: string;
  tz?: string;
}

interface ScheduleBadgeProps {
  schedule?: ReleaseSchedule;
  compact?: boolean;
  className?: string;
}

const THAI_DAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสฯ", "ศุกร์", "เสาร์"];
const ENGLISH_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleBadge({
  schedule,
  compact = false,
  className = "",
}: ScheduleBadgeProps) {
  const { locale } = useI18n();

  const rawDays = schedule?.daysOfWeek ?? (schedule?.days ? schedule.days.map((d) => (d === 7 ? 0 : d)) : undefined);

  if (!schedule || !rawDays || rawDays.length === 0) {
    return null;
  }

  const isAllDays = rawDays.length === 7;
  let formattedDays = "";

  if (isAllDays) {
    formattedDays = locale === "en" ? "Daily update" : "อัปเดตทุกวัน";
  } else {
    const dayNames = [...rawDays]
      .sort((a, b) => a - b)
      .map((d) => (locale === "en" ? ENGLISH_DAYS[d] : THAI_DAYS[d]));

    formattedDays =
      locale === "en"
        ? `Every ${dayNames.join(", ")}`
        : `อัปเดต ${dayNames.join(", ")}`;
  }

  const displayTime = schedule.timeString || schedule.time;
  const timeLabel = displayTime ? ` ${displayTime} น.` : "";
  const fullLabel = `${formattedDays}${displayTime && locale !== "en" ? timeLabel : ""}`;

  return (
    <span
      data-testid="schedule-badge"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors select-none bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60 ${
        compact ? "text-[11px]" : "text-xs"
      } ${className}`}
      title={fullLabel}
      aria-label={`กำหนดการอัปเดต: ${fullLabel}`}
    >
      <Calendar className="w-3 h-3 flex-shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />
      <span>{fullLabel}</span>
    </span>
  );
}
