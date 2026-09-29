"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star, ChevronRight } from "lucide-react";
import { CATALOG_NOVELS } from "@/data/mockNovels";
import { useI18n } from "@/context/I18nContext";

interface RelatedNovelsShelfProps {
  currentNovelId: string;
  category: string;
  className?: string;
}

export function RelatedNovelsShelf({
  currentNovelId,
  category,
  className = "",
}: RelatedNovelsShelfProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const relatedList = useMemo(() => {
    // Novels in same category first, excluding current novel
    const sameCategory = CATALOG_NOVELS.filter(
      (n) => n.id !== currentNovelId && n.category === category
    );
    const others = CATALOG_NOVELS.filter(
      (n) => n.id !== currentNovelId && n.category !== category
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [currentNovelId, category]);

  if (relatedList.length === 0) return null;

  return (
    <section
      data-testid="related-novels-shelf"
      className={`my-10 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm ${className}`}
      aria-label="Related novels"
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {isEn ? "You May Also Like" : "เรื่องที่คุณอาจชอบ"}
          </h3>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-0.5"
        >
          <span>{isEn ? "See all" : "ดูทั้งหมด"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {relatedList.map((novel) => (
          <Link
            key={novel.id}
            href={`/read/${novel.id}/1`}
            className="group flex flex-col gap-2 transition-transform hover:-translate-y-1"
          >
            <div className="aspect-[2/3] w-full rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 shadow-xs">
              <Image
                src={novel.coverUrl}
                alt={novel.titleTh}
                fill
                sizes="(max-width: 640px) 45vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div>
              <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-orange-500 transition-colors">
                {novel.titleTh}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {novel.author}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{novel.rating?.toFixed(1) ?? "9.0"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
