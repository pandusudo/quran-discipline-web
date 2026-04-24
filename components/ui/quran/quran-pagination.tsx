"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface QuranPaginationProps {
  currentPage: number;
  totalPages?: number;
}

export function QuranPagination({
  currentPage,
  totalPages = 604,
}: QuranPaginationProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={!hasPrevious}
        className={!hasPrevious ? "pointer-events-none opacity-50" : ""}
      >
        <Link href={`/quran/${currentPage - 1}`}>
          <ChevronLeft className="size-4" />
          <span>Previous</span>
        </Link>
      </Button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Page</span>
        <span className="font-medium text-foreground tabular-nums">
          {currentPage}
        </span>
        <span>of</span>
        <span className="tabular-nums">{totalPages}</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={!hasNext}
        className={!hasNext ? "pointer-events-none opacity-50" : ""}
      >
        <Link href={`/quran/${currentPage + 1}`}>
          <span>Next</span>
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
