"use client";

import { useState } from "react";
import { PuzzleIcon, ExternalLinkIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EXTENSION_STORE_URL = process.env.NEXT_PUBLIC_EXTENSION_STORE_URL ?? "#";

const INSTALL_STEPS = [
  {
    step: 1,
    title: "Download the extension",
    description: (
      <>
        Go to the{" "}
        <a
          href={EXTENSION_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
        >
          GitHub repository
        </a>{" "}
        and download the latest <strong>.zip</strong> file from the releases
        section.
      </>
    ),
  },
  {
    step: 2,
    title: "Extract the ZIP file",
    description:
      "Unzip the downloaded file to a permanent folder on your computer. Do not delete this folder after installation.",
  },
  {
    step: 3,
    title: "Open Chrome Extensions",
    description: (
      <>
        In Chrome, navigate to{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 text-xs font-mono dark:bg-amber-900/50">
          chrome://extensions
        </code>{" "}
        or open the Chrome menu → <strong>More tools</strong> →{" "}
        <strong>Extensions</strong>.
      </>
    ),
  },
  {
    step: 4,
    title: "Enable Developer Mode",
    description:
      "Toggle on the Developer mode switch located in the top-right corner of the Extensions page.",
  },
  {
    step: 5,
    title: "Load the unpacked extension",
    description:
      "Click the Load unpacked button and select the folder you extracted in step 2.",
  },
  {
    step: 6,
    title: "Copy your Extension ID",
    description:
      "After loading, Chrome will display your extension with a unique ID (a long string of letters). Copy that ID.",
  },
  {
    step: 7,
    title: "Paste the ID in Settings",
    description: (
      <>
        Open the{" "}
        <Link
          href="/settings"
          className="font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
        >
          Settings page
        </Link>{" "}
        and paste your Extension ID in the designated field to connect it with
        this dashboard.
      </>
    ),
  },
];

export function ExtensionRequiredBanner() {
  const [guideOpen, setGuideOpen] = useState(false);

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
              feature. It is currently pending review on the Chrome Web Store,
              so it is not yet available for one-click installation. In the
              meantime, you can install it manually in developer mode.{" "}
              <button
                onClick={() => setGuideOpen(true)}
                className="font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200"
              >
                View installation guide →
              </button>
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

            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
            >
              <Link
                href="/settings"
                className="inline-flex items-center gap-1.5"
              >
                <SettingsIcon className="h-3.5 w-3.5" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Installation guide dialog */}
      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="flex max-h-[90dvh] max-w-lg flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <PuzzleIcon className="h-5 w-5" />
              Manual Extension Installation Guide
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto pr-1">
            <p className="text-sm text-muted-foreground">
              The Quran Discipline extension is currently{" "}
              <strong>pending review</strong> on the Chrome Web Store. Follow
              these steps to install it manually via developer mode.
            </p>

            <ol className="mt-4 flex flex-col gap-4">
              {INSTALL_STEPS.map(({ step, title, description }) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                    {step}
                  </span>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="mt-0.5 text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <strong>Note:</strong> Keep the extracted extension folder in
                place — removing it will uninstall the extension. Once the
                extension is approved on the Chrome Web Store, you will be able
                to install it with a single click.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
