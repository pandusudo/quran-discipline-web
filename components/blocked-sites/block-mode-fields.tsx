"use client";

import { Input } from "@/components/ui/input";
import { Timer, Music2, Ban } from "lucide-react";
import type { BlockedSite } from "@/hooks/use-blocked-sites";

export const blockModeOptions: {
  value: BlockedSite["blockMode"];
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "timer",
    label: "Wait Timer",
    description:
      "Must wait N seconds before the unlock button becomes clickable.",
    icon: <Timer className="size-4" />,
  },
  {
    value: "audio",
    label: "Listen to Ayah",
    description: "Must listen to the full ayah audio before unlocking.",
    icon: <Music2 className="size-4" />,
  },
  {
    value: "hard",
    label: "Fully Blocked",
    description: "Page cannot be unlocked at all.",
    icon: <Ban className="size-4" />,
  },
];

interface BlockModeFieldsProps {
  mode: BlockedSite["blockMode"];
  timerSeconds: number;
  unlockMinutes: number;
  onModeChange: (mode: BlockedSite["blockMode"]) => void;
  onTimerSecondsChange: (value: number) => void;
  onUnlockMinutesChange: (value: number) => void;
}

export function BlockModeFields({
  mode,
  timerSeconds,
  unlockMinutes,
  onModeChange,
  onTimerSecondsChange,
  onUnlockMinutesChange,
}: BlockModeFieldsProps) {
  return (
    <div className="space-y-5">
      {/* Mode selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Block Mode</label>
        <div className="space-y-2">
          {blockModeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onModeChange(opt.value)}
              className={`w-full flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                mode === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50"
              }`}
            >
              <span
                className={`mt-0.5 ${mode === opt.value ? "text-primary" : "text-muted-foreground"}`}
              >
                {opt.icon}
              </span>
              <span>
                <span className="block text-sm font-medium leading-none mb-1">
                  {opt.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {opt.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Timer seconds — only for 'timer' mode */}
      {mode === "timer" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Wait duration (seconds)</label>
          <Input
            type="number"
            min={5}
            max={300}
            value={timerSeconds}
            onChange={(e) => onTimerSecondsChange(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            How long you must wait before the unlock button appears.
          </p>
        </div>
      )}

      {/* Unlock duration — for timer & audio modes */}
      {mode !== "hard" && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Re-block after (minutes)
          </label>
          <Input
            type="number"
            min={1}
            max={120}
            value={unlockMinutes}
            onChange={(e) => onUnlockMinutesChange(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            After unlocking, the site will be blocked again after this many
            minutes.
          </p>
        </div>
      )}
    </div>
  );
}
