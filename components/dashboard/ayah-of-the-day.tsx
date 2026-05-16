"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuranApi } from "@/hooks/use-quran-api";
import type { RandomVerseApiResponse } from "@/interfaces";

const CACHE_KEY = "ayah_of_the_day";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CachedAyah {
  arabic: string;
  translation: string;
  surahName: string;
  verseKey: string;
  cachedAt: number;
}

const SKIP_OPTIONS = { skip: true } as const;

export function AyahOfTheDay() {
  const [ayah, setAyah] = useState<CachedAyah | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { execute: fetchVerse } = useQuranApi<RandomVerseApiResponse>(
    "/random-verse?include_translation=true",
    SKIP_OPTIONS,
  );

  useEffect(() => {
    const loadAyah = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedAyah = JSON.parse(cached);
          if (Date.now() - parsed.cachedAt < ONE_DAY_MS) {
            setAyah(parsed);
            setIsLoading(false);
            return;
          }
        }

        const data = await fetchVerse({});

        if (!data?.success)
          throw new Error(data?.message || "Failed to fetch ayah");

        const verse = data.data.verse;
        const translationText =
          verse.translations?.[0]?.text?.replace(/<[^>]*>/g, "") ?? "";

        const newAyah: CachedAyah = {
          arabic: verse.text_uthmani,
          translation: translationText,
          surahName: verse.chapter_name_simple ?? `Surah ${verse.chapter_id}`,
          verseKey: verse.verse_key,
          cachedAt: Date.now(),
        };

        localStorage.setItem(CACHE_KEY, JSON.stringify(newAyah));
        setAyah(newAyah);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadAyah();
  }, [fetchVerse]);

  return (
    <div
      className="relative rounded-2xl border border-border overflow-hidden"
      style={{
        background: "#faf8f4",
        borderLeft: "4px solid #b89b5e",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <div className="px-7 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="flex size-7 items-center justify-center rounded-full text-sm"
              style={{ background: "#eef5f1", color: "#3d7a5c" }}
            >
              ✦
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#6b6b6b" }}
            >
              Ayah of the Day
            </span>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-32 rounded-full" />
          ) : ayah ? (
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "#f5f0e8", color: "#b89b5e" }}
            >
              {ayah.surahName} · {ayah.verseKey}
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-2 mb-5">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4 ml-auto" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400 mb-5">Failed to load ayah.</p>
        ) : ayah ? (
          <p
            className="font-arabic text-right leading-loose text-[1.75rem] text-[#2c2c2c] mb-5"
            dir="rtl"
            lang="ar"
          >
            {ayah.arabic}
          </p>
        ) : null}

        <Separator className="mb-5" style={{ background: "#e8e8e8" }} />

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : ayah ? (
          <p className="text-[0.95rem] italic text-[#6b6b6b] leading-relaxed">
            &ldquo;{ayah.translation}&rdquo;
          </p>
        ) : null}
      </div>
    </div>
  );
}
