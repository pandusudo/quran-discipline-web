"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AyahCard } from "@/components/ui/quran/ayah-card";
import { QuranPagination } from "@/components/ui/quran/quran-pagination";
import { useApi } from "@/hooks/use-api";
import type { Ayah, VerseResponse } from "@/interfaces/quran-interfaces";

export default function PageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;

  const {
    data: versesData,
    isLoading,
    error,
  } = useApi<VerseResponse>(`/verses/page/${pageId}`);
  const pageAyahs = versesData?.verses || [];
  const totalPages = 604;

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex flex-col">
        <div className="sticky top-0 z-10 h-15 border-b flex items-center px-6 bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/quran")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <main className="flex-1 overflow-auto container mx-auto p-6">
          <div className="space-y-6">
            {/* Surah Card Skeleton */}
            <Card className="p-6 bg-linear-to-r from-primary/5 to-primary/5 mb-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
            </Card>

            {/* Ayahs Skeleton */}
            <Card className="p-8">
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="border-b pb-4 last:border-b-0">
                    <div className="flex gap-4">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (error || !pageAyahs.length) {
    return (
      <div className="flex-1 w-full flex flex-col">
        <div className="sticky top-0 z-10 h-15 border-b flex items-center px-6 bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/quran")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
        <main className="flex-1 overflow-auto container mx-auto p-6">
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
            <p className="text-sm text-destructive">
              {error || "No verses found for this page"}
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 h-15 border-b flex items-center px-6 bg-background">
        <Button variant="ghost" size="sm" onClick={() => router.push("/quran")}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto container mx-auto p-6">
        <div className="space-y-6">
          {/* Verses Card */}
          <div className="space-y-6">
            {pageAyahs.length > 0 ? (
              (() => {
                const groupedAyahs: { [key: string]: Ayah[] } = {};
                pageAyahs.forEach((ayah) => {
                  const chapterName =
                    ayah.chapter_name_simple || `Chapter ${ayah.chapter_id}`;
                  if (!groupedAyahs[chapterName]) {
                    groupedAyahs[chapterName] = [];
                  }
                  groupedAyahs[chapterName].push(ayah);
                });

                return Object.entries(groupedAyahs).map(
                  ([chapterName, ayahs]) => (
                    <div key={chapterName}>
                      {/* Surah Card */}
                      <Card className="p-6 bg-linear-to-r from-primary/5 to-primary/5 mb-4">
                        <div className="flex items-center justify-between">
                          <h2 className="font-semibold text-lg text-foreground">
                            {chapterName}
                          </h2>
                          <p className="text-sm text-primary font-medium">
                            {ayahs.length} verses
                          </p>
                        </div>
                      </Card>

                      {/* Ayahs for this Surah */}
                      <Card className="p-8">
                        <div className="space-y-6">
                          {ayahs.map((ayah) => (
                            <AyahCard key={ayah.id} ayah={ayah} />
                          ))}
                        </div>
                      </Card>
                    </div>
                  ),
                );
              })()
            ) : (
              <Card className="p-8">
                <div className="text-center py-12 text-muted-foreground">
                  No ayahs found for this page.
                </div>
              </Card>
            )}
          </div>

          {/* Pagination Controls */}
          <QuranPagination
            currentPage={parseInt(pageId)}
            totalPages={totalPages}
          />
        </div>
      </main>
    </div>
  );
}
