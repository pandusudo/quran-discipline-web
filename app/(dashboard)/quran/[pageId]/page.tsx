"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { PageDetailSkeleton } from "@/components/quran/loading-skeletons";
import { AyahCard } from "@/components/quran/ayah-card";
import { QuranPagination } from "@/components/quran/quran-pagination";
import { useQuranApi } from "@/hooks/use-quran-api";
import type { Ayah, VersesByPageResponse } from "@/interfaces";

export default function PageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.pageId as string;

  const {
    data: versesData,
    isLoading,
    error,
  } = useQuranApi<VersesByPageResponse>(`/verses/page/${pageId}`);
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
          <PageDetailSkeleton />
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
