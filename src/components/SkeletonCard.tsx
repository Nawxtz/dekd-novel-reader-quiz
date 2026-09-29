import React from "react";

export function SkeletonCard() {
  return (
    <div
      data-testid="skeleton-card"
      className="flex flex-col justify-between rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs animate-pulse overflow-hidden"
    >
      {/* Cover Skeleton */}
      <div className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-800" />

      {/* Info Skeleton */}
      <div className="p-2.5 sm:p-3 space-y-2">
        <div className="h-3.5 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/5" />
        <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-2/5" />
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div
      data-testid="skeleton-grid"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5"
    >
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
