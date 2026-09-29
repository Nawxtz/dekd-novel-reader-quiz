"use client";

import React from "react";
import { CheckCircle2, PauseCircle, Clock } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import { PublicationStatus } from "@/types/novel";

interface StatusBadgeProps {
  status: PublicationStatus;
  compact?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  compact = false,
  className = "",
}: StatusBadgeProps) {
  const { locale } = useI18n();

  if (status.kind === "ongoing") {
    const label = locale === "en" ? "Ongoing" : "กำลังเผยแพร่";
    return (
      <span
        data-testid="status-badge-ongoing"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors select-none bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 ${
          compact ? "text-[11px]" : "text-xs"
        } ${className}`}
        title={label}
        aria-label={`สถานะ: ${label}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>{label}</span>
      </span>
    );
  }

  if (status.kind === "season_break") {
    const seasonNum = status.season ?? 1;
    const rDate = status.nextSeasonStart;
    const returnTextTh = rDate ? ` • เริ่มใหม่ ${rDate}` : "";
    const returnTextEn = rDate ? ` • Resumes ${rDate}` : "";
    const label =
      locale === "en"
        ? `Season ${seasonNum} End${returnTextEn}`
        : `จบซีซัน ${seasonNum}${returnTextTh}`;

    return (
      <span
        data-testid="status-badge-season-break"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors select-none bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 ${
          compact ? "text-[11px]" : "text-xs"
        } ${className}`}
        title={label}
        aria-label={`สถานะ: ${label}`}
      >
        <Clock className="w-3 h-3 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  if (status.kind === "hiatus") {
    const rDate = status.expectedReturn;
    const returnTextTh = rDate ? ` • กำหนดกลับมา ${rDate}` : "";
    const returnTextEn = rDate ? ` • Resumes ${rDate}` : "";
    const label =
      locale === "en"
        ? `Hiatus${returnTextEn}`
        : `พักการเขียน${returnTextTh}`;

    return (
      <span
        data-testid="status-badge-hiatus"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors select-none bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 ${
          compact ? "text-[11px]" : "text-xs"
        } ${className}`}
        title={label}
        aria-label={`สถานะ: ${label}`}
      >
        <PauseCircle className="w-3 h-3 flex-shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  if (status.kind === "completed") {
    const label = locale === "en" ? "Completed" : "จบบริบูรณ์";
    return (
      <span
        data-testid="status-badge-completed"
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors select-none bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${
          compact ? "text-[11px]" : "text-xs"
        } ${className}`}
        title={label}
        aria-label={`สถานะ: ${label}`}
      >
        <CheckCircle2 className="w-3 h-3 flex-shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  return null;
}
