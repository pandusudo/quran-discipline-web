"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SurahListPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      {/* Search Skeleton */}
      <Skeleton className="h-10 w-full max-w-md" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <SurahCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SurahCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-3 w-28" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PageDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="size-9 rounded-full" />
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24 mt-1" />
        </div>
      </div>

      {/* Surah Header Card Skeleton */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24 bg-white/20" />
              <Skeleton className="h-4 w-32 bg-white/20" />
            </div>
            <Skeleton className="h-10 w-20 bg-white/20" />
          </div>
        </div>
      </Card>

      {/* Verses Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <AyahSkeleton key={i} />
          ))}
        </CardContent>
      </Card>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export function AyahSkeleton() {
  return (
    <div className="py-6 px-1">
      <div className="flex items-start justify-between gap-4 mb-4">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded" />
      </div>
      <div className="space-y-2 mb-5">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4 ml-auto" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
