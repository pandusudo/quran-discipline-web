import { ArrowLeft, Unlock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FooterActionsProps {
  isUnlockable: boolean;
  canUnlock: boolean;
  effectiveBlockMode: string;
  timerLeft: number;
  unlockDurationMinutes: number;
  onUnlock: () => void;
}

const UnlockButtonLabel = ({
  canUnlock,
  effectiveBlockMode,
  timerLeft,
  unlockDurationMinutes,
}: Pick<
  FooterActionsProps,
  "canUnlock" | "effectiveBlockMode" | "timerLeft" | "unlockDurationMinutes"
>) => {
  if (canUnlock) return <>Unlock for {unlockDurationMinutes} min</>;
  if (effectiveBlockMode === "timer") return <>Unlock in {timerLeft}s</>;
  return <>Listen to unlock</>;
};

export const FooterActions = ({
  isUnlockable,
  canUnlock,
  effectiveBlockMode,
  timerLeft,
  unlockDurationMinutes,
  onUnlock,
}: FooterActionsProps) => (
  <div className="flex flex-wrap gap-3 mt-8 justify-center">
    <Button variant="outline" size="sm" asChild>
      <Link href="/dashboard">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>
    </Button>

    <Button variant="outline" size="sm" asChild>
      <Link href="/blocked-sites">Manage Block List</Link>
    </Button>

    {isUnlockable && (
      <Button
        size="sm"
        disabled={!canUnlock}
        onClick={onUnlock}
        className="gap-2"
      >
        <Unlock className="w-4 h-4" />
        <UnlockButtonLabel
          canUnlock={canUnlock}
          effectiveBlockMode={effectiveBlockMode}
          timerLeft={timerLeft}
          unlockDurationMinutes={unlockDurationMinutes}
        />
      </Button>
    )}
  </div>
);
