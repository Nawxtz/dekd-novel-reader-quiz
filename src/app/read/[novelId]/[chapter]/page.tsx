"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Bookmark as BookmarkIcon,
  Check,
} from "lucide-react";
import { useBookmarkContext } from "@/context/BookmarkContext";
import { useI18n } from "@/context/I18nContext";
import { CATALOG_NOVELS, getMockChapter } from "@/data/mockNovels";
import { ReaderToolbar } from "@/components/ReaderToolbar";
import { ChapterComments } from "@/components/ChapterComments";
import { RelatedNovelsShelf } from "@/components/RelatedNovelsShelf";
import { FONT_SIZE_STEPS, ThemeMode, FontFamily } from "@/types/reader";
import { CatalogNovel } from "@/types/novel";

interface ReaderPageProps {
  params: {
    novelId: string;
    chapter: string;
  };
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const router = useRouter();
  const { novelId, chapter: chapterParam } = params;
  const currentChapterNum = Math.max(1, parseInt(chapterParam, 10) || 1);

  const {
    bookmarks,
    readerPrefs,
    setReaderPrefs,
    isBookmarked,
    toggleBookmarkFromCatalog,
    saveReadingProgress,
  } = useBookmarkContext();

  const { locale } = useI18n();
  const isEn = locale === "en";

  // Local state for reader settings with fallback to context
  const [theme, setTheme] = useState<ThemeMode>(readerPrefs?.theme || "day");
  const [fontSizeIndex, setFontSizeIndex] = useState<number>(
    readerPrefs?.fontSizeStep !== undefined ? readerPrefs.fontSizeStep : 2
  );
  const [fontFamily, setFontFamily] = useState<FontFamily>(
    readerPrefs?.fontFamily || "sans"
  );
  const [contentLocale, setContentLocale] = useState<"th" | "en">("th");
  const [searchChapterInput, setSearchChapterInput] = useState("");
  const [searchError, setSearchError] = useState("");

  // Sync state if readerPrefs from context hydrates later
  useEffect(() => {
    if (readerPrefs) {
      if (readerPrefs.theme) setTheme(readerPrefs.theme);
      if (readerPrefs.fontSizeStep !== undefined) setFontSizeIndex(readerPrefs.fontSizeStep);
      if (readerPrefs.fontFamily) setFontFamily(readerPrefs.fontFamily);
    }
  }, [readerPrefs]);

  // Find novel metadata from catalog or existing bookmark
  const novel: CatalogNovel = useMemo(() => {
    const found = CATALOG_NOVELS.find((n) => n.id === novelId);
    if (found) return found;

    // Check if novel metadata exists in bookmarks
    const fromBookmark = bookmarks?.find(
      (b) => b.novelId === novelId || b.id === novelId
    );
    if (fromBookmark) {
      return {
        id: novelId,
        titleTh: fromBookmark.title,
        titleEn: fromBookmark.title,
        author: fromBookmark.author,
        category: fromBookmark.category,
        genres: [fromBookmark.category],
        originalLocale: "th",
        totalChapters: fromBookmark.totalChapters,
        coverUrl:
          fromBookmark.coverUrl ||
          "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
        locales: ["th"],
        status: { kind: "ongoing" },
        latestChapter: {
          number: fromBookmark.totalChapters,
          titleTh: fromBookmark.currentChapterTitle,
          updatedAt: "",
        },
        rating: 9.0,
        followers: { week: 1000, month: 3000, all: 10000 },
        synopsisTh: fromBookmark.note || "เรื่องย่อนิยาย",
      };
    }

    return {
      id: novelId,
      titleTh: "นิยายไม่ระบุชื่อ",
      titleEn: "Untitled Novel",
      author: "ผู้แต่งนิรนาม",
      category: "แฟนตาซี",
      genres: ["แฟนตาซี"],
      originalLocale: "th",
      totalChapters: 120,
      coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
      locales: ["th", "en"],
      status: { kind: "ongoing" },
      latestChapter: { number: 120, titleTh: "ตอนล่าสุด", updatedAt: "" },
      rating: 9.0,
      followers: { week: 1000, month: 3000, all: 10000 },
      synopsisTh: "เรื่องย่อนิยาย",
    };
  }, [novelId, bookmarks]);

  // Find bookmarked novel if exists
  const bookmarkedNovel = useMemo(() => {
    if (!bookmarks) return null;
    return bookmarks.find(
      (b) => b.novelId === novelId || b.id === novelId || b.title === novel.titleTh
    );
  }, [bookmarks, novelId, novel.titleTh]);

  // Determine if novel supports bilingual reading
  const hasBilingual = useMemo(() => {
    return (
      novel.locales &&
      novel.locales.includes("th") &&
      novel.locales.includes("en")
    );
  }, [novel]);

  // Retrieve chapter content from mock data
  const chapterData = useMemo(() => {
    const fetched = getMockChapter ? getMockChapter(novelId, currentChapterNum) : null;
    if (fetched) return fetched;

    // Generated fallback chapter content for chapters > 3
    return {
      id: `${novelId}-ch-${currentChapterNum}`,
      novelId,
      chapterNumber: currentChapterNum,
      titleTh: `ตอนที่ ${currentChapterNum}: การผจญภัยในแดนลึกลับ`,
      titleEn: `Chapter ${currentChapterNum}: The Expedition into the Unknown`,
      publishedAt: new Date().toISOString(),
      blocks: [
        {
          id: `b-${currentChapterNum}-1`,
          type: "heading" as const,
          textTh: `บทที่ ${currentChapterNum}: ปรากฏการณ์ฟ้าคำราม`,
          textEn: `Chapter ${currentChapterNum}: The Roaring Phenomenon`,
        },
        {
          id: `b-${currentChapterNum}-2`,
          type: "p" as const,
          textTh:
            "แสงอาทิตย์ยามอัสดงสาดส่องลงมายังหุบเขาสูงชัน สายลมเย็นพัดผ่านยอดไม้โบราณที่แผ่กิ่งก้านสาขาปกคลุมเส้นทางเดิน ทั้งสองฝั่งทางเต็มไปด้วยสมุนไพรวิญญาณที่ส่องประกายระยิบระยับ",
          textEn:
            "The twilight sun cast its amber glow across the steep ravine. A crisp gust swept through the ancient foliage, illuminating luminous spirit herbs along the winding trail.",
        },
        {
          id: `b-${currentChapterNum}-3`,
          type: "dialogue" as const,
          textTh:
            '"หากพวกเราก้าวข้ามแนวเขานี้ไปได้ จะพบกับเมืองหลวงของอาณาจักรโบราณที่สาบสูญ" เสียงเตือนด้วยความระมัดระวังดังขึ้นจากหัวหน้าคณะเดินทาง',
          textEn:
            '"Once we cross this ridge, the ruins of the lost capital will lie before us," warned the party leader with caution.',
        },
        {
          id: `b-${currentChapterNum}-4`,
          type: "p" as const,
          textTh:
            "ทุกคนในคณะพยักหน้ารับอย่างหนักแน่น กระชับอาวุธในมือและก้าวต่อไปข้างหน้าด้วยสมาธิอันแน่วแน่ มุ่งหน้าสู่การทดสอบครั้งสำคัญที่จะเปลี่ยนชะตากรรมของพวกเขาไปตลอดกาล",
          textEn:
            "The entire expedition nodded firmly, steadying their weapons as they pressed onward into the trials that would alter their destiny forever.",
        },
      ],
    };
  }, [novelId, currentChapterNum]);

  // Record reading progress in LocalStorage
  useEffect(() => {
    saveReadingProgress(
      {
        novelId,
        chapter: currentChapterNum,
        blockId: chapterData.blocks[0]?.id || "",
        lastReadAt: new Date().toISOString(),
      },
      chapterData.titleTh
    );
  }, [novelId, currentChapterNum, chapterData, saveReadingProgress]);

  // Handlers for reader settings
  const handleThemeChange = useCallback(
    (newTheme: ThemeMode) => {
      setTheme(newTheme);
      setReaderPrefs({ theme: newTheme });
    },
    [setReaderPrefs]
  );

  const handleFontSizeChange = useCallback(
    (newIndex: number) => {
      setFontSizeIndex(newIndex);
      setReaderPrefs({ fontSizeStep: newIndex });
    },
    [setReaderPrefs]
  );

  const handleFontFamilyChange = useCallback(
    (newFamily: FontFamily) => {
      setFontFamily(newFamily);
      setReaderPrefs({ fontFamily: newFamily });
    },
    [setReaderPrefs]
  );

  // Jump to specific chapter from search input
  const handleSearchChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(searchChapterInput.trim(), 10);
    if (isNaN(parsed) || parsed < 1) {
      setSearchError(isEn ? "Please enter a valid chapter number" : "กรุณากรอกเลขตอนที่ถูกต้อง");
      return;
    }
    const max = novel.totalChapters || 200;
    if (parsed > max) {
      setSearchError(
        isEn
          ? `Chapter number cannot exceed ${max}`
          : `เลขตอนต้องไม่เกินตอนล่าสุด (${max})`
      );
      return;
    }
    setSearchError("");
    setSearchChapterInput("");
    router.push(`/read/${novelId}/${parsed}`);
  };

  const isSaved = isBookmarked(novel.id) || isBookmarked(novel.titleTh);

  // Theme container classes
  const themeContainerStyles = {
    day: "bg-[#ffffff] text-slate-800",
    night: "bg-[#0b0f19] text-[#cbd5e1]",
    sepia: "bg-[#fbf0d9] text-[#382e25]",
  }[theme];

  const currentFontSizePx = FONT_SIZE_STEPS[fontSizeIndex] ?? 20;

  return (
    <div
      data-testid="novel-reader-page"
      className={`min-h-screen transition-colors ${themeContainerStyles}`}
    >
      {/* Sticky Reader Toolbar */}
      <ReaderToolbar
        novelId={novel.id}
        novelTitle={novel.titleTh}
        currentChapter={currentChapterNum}
        totalChapters={novel.totalChapters || 100}
        chapterTitle={chapterData.titleTh}
        theme={theme}
        onThemeChange={handleThemeChange}
        fontSizeIndex={fontSizeIndex}
        onFontSizeChange={handleFontSizeChange}
        fontFamily={fontFamily}
        onFontFamilyChange={handleFontFamilyChange}
        contentLocale={contentLocale}
        onContentLocaleChange={setContentLocale}
        hasBilingual={hasBilingual}
        isBookmarked={isSaved}
        onToggleBookmark={() => toggleBookmarkFromCatalog(novel)}
      />

      {/* Main Reader Wrapper */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Novel Hero Summary Banner with "Read at Current/Saved Episode" CTA */}
        <section
          data-testid="novel-reader-hero"
          className={`p-4 sm:p-5 rounded-2xl border mb-6 transition-colors shadow-xs ${
            theme === "night"
              ? "bg-slate-900/90 border-slate-800 text-slate-200"
              : theme === "sepia"
              ? "bg-[#f4e8cb] border-[#e2d2ae] text-[#382e25]"
              : "bg-white border-slate-200 text-slate-800"
          }`}
          aria-label="Novel summary and continue reading"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Novel Cover Thumbnail */}
            <div className="relative w-20 sm:w-24 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-xs border border-black/10">
              <Image
                src={novel.coverUrl}
                alt={novel.titleTh}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-cover"
              />
            </div>

            {/* Novel Info & Reading CTA */}
            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch text-center sm:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400">
                    {novel.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {isEn ? `Total ${novel.totalChapters || 100} Chapters` : `ทั้งหมด ${novel.totalChapters || 100} ตอน`}
                  </span>
                </div>

                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  {novel.titleTh}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {isEn ? "Author" : "ผู้แต่ง"}: {novel.author}
                </p>
              </div>

              {/* Action Banner: Read at current episode that was read before */}
              <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <BookOpen className="w-4 h-4 text-dekd-orange shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {bookmarkedNovel
                      ? (isEn
                          ? `Bookmarked episode: Ch. ${bookmarkedNovel.currentChapter}`
                          : `ตอนที่คุณอ่านค้างไว้: ตอนที่ ${bookmarkedNovel.currentChapter}`)
                      : (isEn
                          ? `Current reading: Ch. ${currentChapterNum}`
                          : `กำลังอ่าน: ตอนที่ ${currentChapterNum}`)}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {bookmarkedNovel && bookmarkedNovel.currentChapter !== currentChapterNum ? (
                    <Link
                      href={`/read/${novelId}/${bookmarkedNovel.currentChapter}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-dekd-orange hover:bg-dekd-orange-hover shadow-xs active:scale-95 transition-all"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {isEn
                          ? `Read at Current Ep (Ch. ${bookmarkedNovel.currentChapter})`
                          : `อ่านต่อ ตอนที่ ${bookmarkedNovel.currentChapter} ที่อ่านค้างไว้`}
                      </span>
                    </Link>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {isEn
                          ? `Reading at Bookmarked Ep (${currentChapterNum})`
                          : `คุณกำลังอ่านตอนที่คั่นไว้ (ตอนที่ ${currentChapterNum})`}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleBookmarkFromCatalog(novel)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-orange-400 hover:text-dekd-orange transition-all"
                    title={isSaved ? (isEn ? "Remove from bookmarks" : "ยกเลิกคั่นนิยาย") : (isEn ? "Bookmark this novel" : "คั่นนิยายเรื่องนี้")}
                  >
                    <BookmarkIcon
                      className={`w-3.5 h-3.5 ${
                        isSaved ? "text-dekd-orange fill-dekd-orange" : "text-gray-400"
                      }`}
                    />
                    <span>{isSaved ? (isEn ? "Bookmarked" : "คั่นแล้ว") : (isEn ? "Bookmark" : "คั่นนิยาย")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Chapter Navigation Bar */}
        <section
          data-testid="chapter-quick-nav"
          className={`p-3.5 sm:p-4 rounded-2xl border mb-6 transition-colors shadow-xs ${
            theme === "night"
              ? "bg-slate-900/80 border-slate-800"
              : theme === "sepia"
              ? "bg-[#f4e8cb] border-[#e2d2ae]"
              : "bg-slate-50/90 border-slate-200"
          }`}
          aria-label="Chapter quick navigation"
        >
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Quick jump pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/read/${novelId}/1`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  currentChapterNum === 1
                    ? "bg-orange-500 text-white border-orange-600 shadow-xs"
                    : theme === "night"
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-orange-500"
                    : theme === "sepia"
                    ? "bg-[#ecdcb8] border-[#dfcd9f] text-[#382e25] hover:border-orange-500"
                    : "bg-white border-slate-200 text-slate-700 hover:border-orange-500"
                }`}
              >
                {isEn ? "First Chapter" : "ตอนแรก"}
              </Link>

              {currentChapterNum > 1 && (
                <Link
                  href={`/read/${novelId}/${currentChapterNum - 1}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                    theme === "night"
                      ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-orange-500"
                      : theme === "sepia"
                      ? "bg-[#ecdcb8] border-[#dfcd9f] text-[#382e25] hover:border-orange-500"
                      : "bg-white border-slate-200 text-slate-700 hover:border-orange-500"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? "Prev" : "ตอนก่อนหน้า"}</span>
                </Link>
              )}

              {currentChapterNum < (novel.totalChapters || 100) && (
                <Link
                  href={`/read/${novelId}/${currentChapterNum + 1}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                    theme === "night"
                      ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-orange-500"
                      : theme === "sepia"
                      ? "bg-[#ecdcb8] border-[#dfcd9f] text-[#382e25] hover:border-orange-500"
                      : "bg-white border-slate-200 text-slate-700 hover:border-orange-500"
                  }`}
                >
                  <span>{isEn ? "Next" : "ตอนถัดไป"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}

              <Link
                href={`/read/${novelId}/${novel.totalChapters || 120}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  currentChapterNum === (novel.totalChapters || 120)
                    ? "bg-orange-500 text-white border-orange-600 shadow-xs"
                    : theme === "night"
                    ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-orange-500"
                    : theme === "sepia"
                    ? "bg-[#ecdcb8] border-[#dfcd9f] text-[#382e25] hover:border-orange-500"
                    : "bg-white border-slate-200 text-slate-700 hover:border-orange-500"
                }`}
              >
                {isEn ? "Latest Chapter" : "ตอนล่าสุด"}
              </Link>
            </div>

            {/* Chapter search input matching user image */}
            <form
              onSubmit={handleSearchChapterSubmit}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchChapterInput}
                  onChange={(e) => {
                    setSearchChapterInput(e.target.value);
                    if (searchError) setSearchError("");
                  }}
                  placeholder={
                    isEn
                      ? "Search chapter e.g. 25"
                      : "ค้นหาเลขตอน เช่น 25 หรือ 108"
                  }
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    theme === "night"
                      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      : theme === "sepia"
                      ? "bg-[#ecdcb8] border-[#dfcd9f] text-[#382e25] placeholder:text-[#8a7258]"
                      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex-shrink-0 shadow-xs"
              >
                {isEn ? "Go" : "ไปที่ตอน"}
              </button>
            </form>
          </div>

          {searchError && (
            <p className="text-[11px] text-rose-500 mt-2 font-medium">
              {searchError}
            </p>
          )}
        </section>

        {/* Thai Typography Content Container */}
        <article
          data-testid="reader-content-body"
          lang="th"
          className={`py-8 px-4 sm:px-8 rounded-3xl transition-all ${
            theme === "night"
              ? "bg-slate-900/60"
              : theme === "sepia"
              ? "bg-[#f7eddc]/80"
              : "bg-white shadow-xs"
          } ${fontFamily === "serif" ? "font-serif" : "font-sans"}`}
          style={{
            fontSize: `${currentFontSizePx}px`,
            lineHeight: 1.85,
            textAlign: "left",
          }}
        >
          {/* Chapter Heading */}
          <header className="mb-8 pb-6 border-b border-black/10 dark:border-white/10">
            <span className="text-xs uppercase tracking-wider font-semibold opacity-60 block mb-1">
              {novel.titleTh}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {contentLocale === "en" && chapterData.titleEn
                ? chapterData.titleEn
                : chapterData.titleTh}
            </h2>
          </header>

          {/* Structured Text Content Blocks */}
          <div className="space-y-6">
            {chapterData.blocks.map((block) => {
              const text =
                contentLocale === "en" && block.textEn
                  ? block.textEn
                  : block.textTh;

              if (block.type === "heading") {
                return (
                  <h3
                    key={block.id}
                    className="font-bold text-lg sm:text-xl pt-4 pb-2 border-l-4 border-orange-500 pl-3 my-4"
                  >
                    {text}
                  </h3>
                );
              }

              if (block.type === "dialogue") {
                return (
                  <blockquote
                    key={block.id}
                    className="pl-4 py-1 my-3 border-l-2 border-orange-400 dark:border-orange-500/80 font-medium italic opacity-95"
                  >
                    {text}
                  </blockquote>
                );
              }

              return (
                <p
                  key={block.id}
                  className="indent-6 sm:indent-8 leading-relaxed tracking-normal"
                >
                  {text}
                </p>
              );
            })}
          </div>

          {/* Chapter End Marker */}
          <div className="mt-12 pt-8 border-t border-black/10 dark:border-white/10 text-center">
            <span className="text-xs tracking-wider opacity-60 uppercase font-semibold">
              {isEn
                ? `— End of Chapter ${currentChapterNum} —`
                : `จบบริบูรณ์ ตอนที่ ${currentChapterNum}`}
            </span>
          </div>
        </article>

        {/* Bottom Chapter Switcher Navigation */}
        <nav
          className="mt-8 flex items-center justify-between gap-4"
          aria-label="Bottom chapter navigation"
        >
          {currentChapterNum > 1 ? (
            <Link
              href={`/read/${novelId}/${currentChapterNum - 1}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all hover:border-orange-500"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isEn ? "Previous Chapter" : "ตอนก่อนหน้า"}</span>
            </Link>
          ) : (
            <div />
          )}

          {currentChapterNum < (novel.totalChapters || 100) ? (
            <Link
              href={`/read/${novelId}/${currentChapterNum + 1}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-xs"
            >
              <span>{isEn ? "Next Chapter" : "ตอนถัดไป"}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </nav>

        {/* Chapter Comments Section */}
        <ChapterComments
          novelId={novel.id}
          chapterId={chapterData.id}
          chapterNumber={currentChapterNum}
        />

        {/* Related Novels Shelf */}
        <RelatedNovelsShelf
          currentNovelId={novel.id}
          category={novel.category as string}
        />
      </main>
    </div>
  );
}
