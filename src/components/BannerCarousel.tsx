"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles } from "lucide-react";
import { Banner } from "@/types/novel";
import { useI18n } from "@/context/I18nContext";

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = banners.length;

  // Next / Prev slide handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsPlaying(false);
    }
  }, []);

  // Autoplay management
  useEffect(() => {
    if (!isPlaying || isHovered || total <= 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isHovered, total, handleNext]);

  // Pause on tab visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Touch / Pointer gesture handlers with touch-action: pan-y
  const handlePointerDown = (e: React.PointerEvent) => {
    setTouchStartX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchStartX === null) return;
    const diff = e.clientX - touchStartX;
    const threshold = 40;
    if (diff > threshold) {
      handlePrev();
    } else if (diff < -threshold) {
      handleNext();
    }
    setTouchStartX(null);
  };

  if (total === 0) return null;

  return (
    <section
      data-testid="banner-carousel"
      className="relative w-full overflow-hidden py-4 sm:py-6 select-none bg-gradient-to-b from-orange-50/50 to-transparent dark:from-gray-900/40 dark:to-transparent"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      aria-roledescription="carousel"
      aria-label={t.hero.badge}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Carousel Container */}
        <div
          className="relative h-[220px] sm:h-[280px] md:h-[340px] touch-pan-y flex items-center justify-center cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {banners.map((banner, index) => {
            // Determine position relative to currentIndex
            let offset = index - currentIndex;
            if (offset < -1 && total > 2) offset += total;
            if (offset > 1 && total > 2) offset -= total;

            const isActive = offset === 0;
            const isPrev = offset === -1 || (offset === total - 1 && total > 2);
            const isNext = offset === 1 || (offset === -(total - 1) && total > 2);

            let styleClasses = "opacity-0 pointer-events-none scale-90 translate-x-0 z-0";
            if (isActive) {
              styleClasses = "opacity-100 scale-100 translate-x-0 z-20 shadow-xl";
            } else if (isPrev) {
              styleClasses = "opacity-40 scale-[0.88] -translate-x-[65%] sm:-translate-x-[55%] z-10 hidden sm:block";
            } else if (isNext) {
              styleClasses = "opacity-40 scale-[0.88] translate-x-[65%] sm:translate-x-[55%] z-10 hidden sm:block";
            }

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 max-w-4xl mx-auto rounded-2xl overflow-hidden transition-all duration-500 ease-out transform ${styleClasses}`}
                aria-hidden={!isActive}
              >
                {/* Background Banner Image with Gradient Overlay */}
                <div className="relative w-full h-full">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 896px"
                    className="object-cover"
                  />
                  {/* Subtle Dark / Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient} opacity-85 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Banner Content Details */}
                  <div className="absolute inset-0 p-5 sm:p-8 md:p-10 flex flex-col justify-end text-white">
                    {/* Badge */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/25">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {banner.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1.5 drop-shadow-md line-clamp-1">
                      {banner.title}
                    </h2>

                    {/* Subtitle & Author */}
                    <p className="text-xs sm:text-sm text-white/90 font-medium mb-3 line-clamp-1 drop-shadow">
                      {banner.subtitle}
                    </p>

                    {/* CTA Button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const el = document.getElementById("bookmarks-section");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex items-center justify-center px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-white text-gray-900 hover:bg-orange-50 active:scale-95 shadow-lg shadow-black/25 transition-all"
                      >
                        {t.hero.readNow}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-2 sm:p-2.5 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white shadow-md backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 active:scale-90 transition-all"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white shadow-md backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 active:scale-90 transition-all"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel Bottom Sub-bar: Dots & Play/Pause (WCAG 2.2.2) */}
        <div className="flex items-center justify-center gap-4 mt-3">
          {/* Indicator Dots */}
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Slide indicators">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === i
                    ? "w-6 h-2 bg-dekd-orange"
                    : "w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
                }`}
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={currentIndex === i}
                role="tab"
              />
            ))}
          </div>

          {/* WCAG 2.2.2 Play / Pause Button */}
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/60 transition-colors"
            aria-label={isPlaying ? t.hero.pauseCarousel : t.hero.playCarousel}
            title={isPlaying ? t.hero.pauseCarousel : t.hero.playCarousel}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </section>
  );
}
