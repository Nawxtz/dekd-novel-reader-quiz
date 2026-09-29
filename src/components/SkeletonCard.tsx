import React from "react";

export function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className="flex items-center gap-3.5 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse"
    >
      {/* Cover Skeleton */}
      <div className="w-20 sm:w-24 aspect-[2/3] shrink-0 rounded-lg bg-gray-200 dark:bg-gray-800" />

      {/* Info Skeleton */}
      <div className="flex-1 min-w-0 space-y-2 py-0.5">
        <div className="min-h-[3rem] space-y-1.5">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/5" />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 pt-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/5" />
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div
      data-testid="skeleton-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
