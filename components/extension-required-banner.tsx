"use client";

import { PuzzleIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXTENSION_STORE_URL = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL ?? "#";

export function ExtensionRequiredBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-800 dark:bg-amber-950/30">
      {/* Main row */}
      <div className="flex items-start gap-3">
        <PuzzleIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Extension not detected
            </p>
            <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
              The Quran Discipline browser extension is required to use this
              feature. Install it from the Chrome Web Store to get started.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              asChild
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
            >
              <a
                href={EXTENSION_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                Download Extension
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
