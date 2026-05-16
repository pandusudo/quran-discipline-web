import { Ban, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SiteConfig } from "@/lib/extension-bridge";

interface BlockedHeaderProps {
  effectiveBlockMode: SiteConfig["blockMode"] | "hard";
  isHaramSite: boolean;
  focusSessionActive: boolean;
  timerSeconds: number;
  domain: string;
}

const getDescription = (
  isHaramSite: boolean,
  focusSessionActive: boolean,
  effectiveBlockMode: BlockedHeaderProps["effectiveBlockMode"],
  timerSeconds: number,
): string => {
  if (isHaramSite) {
    return "Gambling and porn may feel small in the moment, but they leave أثر (impact) on the heart. Choose what you would be proud to meet Allah with.";
  }
  if (focusSessionActive) {
    return "Focus session is active. This site is fully blocked until your session ends.";
  }
  if (effectiveBlockMode === "hard") {
    return "This site is fully blocked. Take a moment to reflect on this verse.";
  }
  if (effectiveBlockMode === "audio") {
    return "Listen to the full ayah to unlock this site temporarily.";
  }
  return `Wait ${timerSeconds} seconds to unlock this site temporarily.`;
};

export const BlockedHeader = ({
  effectiveBlockMode,
  isHaramSite,
  focusSessionActive,
  timerSeconds,
  domain,
}: BlockedHeaderProps) => (
  <div className="flex flex-col items-center gap-3 mb-10 text-center">
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted">
      {effectiveBlockMode === "hard" ? (
        <Ban className="w-7 h-7 text-destructive" />
      ) : (
        <ShieldCheck className="w-7 h-7 text-muted-foreground" />
      )}
    </div>

    <h1 className="text-2xl font-semibold tracking-tight">Site Blocked</h1>

    <p className="text-muted-foreground text-sm max-w-sm">
      {getDescription(
        isHaramSite,
        focusSessionActive,
        effectiveBlockMode,
        timerSeconds,
      )}
    </p>

    {domain && (
      <Badge variant="outline" className="text-xs font-mono">
        {domain}
      </Badge>
    )}
  </div>
);
