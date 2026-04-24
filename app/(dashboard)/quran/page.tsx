"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, AlertCircle, RefreshCw } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { SurahListCard, SurahListCardSkeleton } from "@/components/ui/quran";
import type {
  Surah,
  ChaptersResponse,
  QuranFilterOptions,
} from "@/interfaces/quran-interfaces";

export default function QuranPage() {
  const [filter, setFilter] = useState<QuranFilterOptions>({
    type: "surah",
    value: null,
    searchQuery: "",
  });

  const {
    data: chaptersData,
    isLoading,
    error,
    refetch,
  } = useApi<ChaptersResponse>("/chapters");
  const surahData = chaptersData?.chapters || [];

  const handleFilterChange = (newFilter: QuranFilterOptions) => {
    setFilter(newFilter);
  };

  const filteredSurahs = surahData.filter((surah: Surah) => {
    if (filter.searchQuery) {
      return (
        surah.name_simple
          .toLowerCase()
          .includes(filter.searchQuery.toLowerCase()) ||
        surah.name_simple.includes(filter.searchQuery) ||
        surah.id.toString().includes(filter.searchQuery)
      );
    }
    if (filter.value !== null && filter.type === "surah") {
      return surah.id === filter.value;
    }
    if (filter.value !== null && filter.type === "page") {
      return (
        filter.value >= surah.pages[0] &&
        filter.value <= surah.pages[surah.pages.length - 1]
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quran</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Read and reflect on the Quran. Select a surah to begin reading.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or number..."
          className="pl-9"
          value={filter.searchQuery}
          onChange={(e) =>
            handleFilterChange({ ...filter, searchQuery: e.target.value })
          }
        />
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-4 py-6">
            <AlertCircle className="size-8 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">
                Failed to load surahs
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {error || "An error occurred while fetching the Quran data."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="size-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-2">
                <SurahListCardSkeleton />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Surah Grid */}
      {!isLoading && !error && (
        <>
          {/* Results count */}
          {filter.searchQuery && (
            <p className="text-sm text-muted-foreground">
              {filteredSurahs.length}{" "}
              {filteredSurahs.length === 1 ? "surah" : "surahs"} found
            </p>
          )}

          {filteredSurahs.length === 0 && filter.searchQuery ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="size-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium">No surahs found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try a different search term
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    handleFilterChange({ ...filter, searchQuery: "" })
                  }
                >
                  Clear search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSurahs.map((surah) => (
                <Card
                  key={surah.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-2">
                    <SurahListCard surah={surah} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
