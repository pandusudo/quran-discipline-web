"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings2 } from "lucide-react";
import type { BlockedSite } from "@/hooks/use-blocked-sites";
import { BlockModeFields } from "./block-mode-fields";

interface BlockConfigDialogProps {
  site: BlockedSite;
  onSave: (
    id: string,
    updates: Pick<
      BlockedSite,
      "blockMode" | "timerSeconds" | "unlockDurationMinutes"
    >,
  ) => Promise<void>;
}

export function BlockConfigDialog({ site, onSave }: BlockConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<BlockedSite["blockMode"]>(site.blockMode);
  const [timerSeconds, setTimerSeconds] = useState(site.timerSeconds);
  const [unlockMinutes, setUnlockMinutes] = useState(
    site.unlockDurationMinutes,
  );

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Reset to current site values each time dialog opens
      setMode(site.blockMode);
      setTimerSeconds(site.timerSeconds);
      setUnlockMinutes(site.unlockDurationMinutes);
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    await onSave(site.id, {
      blockMode: mode,
      timerSeconds,
      unlockDurationMinutes: unlockMinutes,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md flex flex-col max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>Block Settings — {site.domain}</DialogTitle>
          <DialogDescription>
            Choose how this site is blocked and how long it stays unlocked.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 overflow-y-auto flex-1">
          <BlockModeFields
            mode={mode}
            timerSeconds={timerSeconds}
            unlockMinutes={unlockMinutes}
            onModeChange={setMode}
            onTimerSecondsChange={setTimerSeconds}
            onUnlockMinutesChange={setUnlockMinutes}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
