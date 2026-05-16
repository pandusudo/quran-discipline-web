"use client";

import { PuzzleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXTENSION_STORE_URL = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL ?? "#";

export function ExtensionRequiredBanner() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-800 dark:bg-amber-950/30">
      <PuzzleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Extension not detected
          </p>
          <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
            The Quran Discipline browser extension is required to use this
            feature. Install it and reload the page to get started.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
        >
          <a
            href={EXTENSION_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Install Extension
          </a>
        </Button>
      </div>
    </div>
  );
}
