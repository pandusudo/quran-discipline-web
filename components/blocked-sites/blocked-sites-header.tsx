import { AddSiteDialog } from "./add-site-dialog";
import type { BlockedSite } from "@/hooks/use-blocked-sites";

interface BlockedSitesHeaderProps {
  onAdd: (
    domain: string,
    category: string,
    blockMode: BlockedSite["blockMode"],
    timerSeconds: number,
    unlockDurationMinutes: number,
  ) => Promise<void>;
}

export function BlockedSitesHeader({ onAdd }: BlockedSitesHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Blocked Sites</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the websites blocked by your extension.
        </p>
      </div>
      <AddSiteDialog onAdd={onAdd} />
    </div>
  );
}
