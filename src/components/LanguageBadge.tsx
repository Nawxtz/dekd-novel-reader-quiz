"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

export type LanguageAvailability = "th-only" | "en-only" | "both";

interface LanguageBadgeProps {
  language: LanguageAvailability;
  compact?: boolean;
  className?: string;
}

export function LanguageBadge({
  language,
  compact = false,
  className = "",
}: LanguageBadgeProps) {
  const { locale } = useI18n();

  const config = {
    "th-only": {
      labelTh: "ไทยเท่านั้น",
      labelEn: "TH Only",
      classes:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
      dotClass: "bg-emerald-500",
    },
    "en-only": {
      labelTh: "อังกฤษเท่านั้น",
      labelEn: "EN Only",
      classes:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
      dotClass: "bg-blue-500",
    },
    both: {
      labelTh: "2 ภาษา (TH / EN)",
      labelEn: "Bilingual (TH / EN)",
      classes:
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
      dotClass: "bg-purple-500",
    },
  }[language];

  if (!config) return null;

  const label = locale === "en" ? config.labelEn : config.labelTh;

  return (
    <span
      data-testid="language-badge"
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors select-none ${
        compact ? "text-[11px]" : "text-xs"
      } ${config.classes} ${className}`}
      title={label}
      aria-label={`ภาษา: ${label}`}
    >
      {language === "both" ? (
        <Globe className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      ) : (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
}
