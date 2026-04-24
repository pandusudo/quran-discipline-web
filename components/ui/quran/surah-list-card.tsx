"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { Surah } from "@/interfaces/quran-interfaces";

interface SurahListCardProps {
  surah: Surah;
  isSelected?: boolean;
}

export function SurahListCard({
  surah,
  isSelected = false,
}: SurahListCardProps) {
  const startPage = surah.pages?.[0] ?? 1;

  return (
    <Link
      href={`/quran/${startPage}`}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
        isSelected ? "bg-accent text-accent-foreground" : "hover:bg-muted"
      }`}
    >
      <div className="flex size-10 items-center justify-center rounded-lg border bg-linear-to-br from-primary/10 to-primary/5 text-sm font-semibold shrink-0 tabular-nums text-primary">
        {surah.id}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{surah.name_simple}</p>
          <p
            className="text-base text-muted-foreground shrink-0 font-arabic"
            dir="rtl"
          >
            {surah.name_arabic}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {surah.verses_count} verses
          </span>
          <span className="text-muted-foreground/40">•</span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 h-4 capitalize ${
              surah.revelation_place === "makkah"
                ? "border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950"
                : "border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:bg-blue-950"
            }`}
          >
            {surah.revelation_place === "makkah" ? "Meccan" : "Medinan"}
          </Badge>
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function SurahListCardSkeleton() {
  return (
    <div className="w-full flex items-center gap-3 px-3 py-3">
      <div className="size-10 rounded-lg bg-muted animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          <div className="h-4 w-14 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="size-4 bg-muted rounded animate-pulse" />
    </div>
  );
}
