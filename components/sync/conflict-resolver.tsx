"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { SyncConflict } from "@/lib/sync-engine";
import type { UseSyncReturn, SettingsConflict } from "@/hooks/use-sync";

interface ConflictResolverProps {
  conflicts: SyncConflict[];
  onResolve: UseSyncReturn["resolveConflict"];
  onResolveAllRemote: UseSyncReturn["resolveAllWithRemote"];
  onResolveAllLocal: UseSyncReturn["resolveAllWithLocal"];
}

interface SettingsConflictResolverProps {
  conflict: SettingsConflict | null;
  onResolve: UseSyncReturn["resolveSettingsConflict"];
}

function formatTs(ts: string | undefined): string {
  if (!ts) return "unknown";
  try {
    const date = new Date(ts);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.round(diffMs / 60_000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.round(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.round(diffHrs / 24)}d ago`;
  } catch {
    return ts;
  }
}

export function ConflictResolver({
  conflicts,
  onResolve,
  onResolveAllRemote,
  onResolveAllLocal,
}: ConflictResolverProps) {
  const open = conflicts.length > 0;
  const current = conflicts[0];

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sync Conflict</DialogTitle>
          <DialogDescription>
            {conflicts.length} record
            {conflicts.length !== 1 ? "s were" : " was"} modified on both
            devices at nearly the same time. Choose which version to keep.
          </DialogDescription>
        </DialogHeader>

        {current && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Conflict {conflicts.length > 1 ? `1 of ${conflicts.length}` : ""}:
              &nbsp;
              <span className="font-semibold text-foreground">
                {current.local.domain}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Local version */}
              <div className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    This device
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {formatTs(
                      current.local.lastModified ?? current.local.addedAt,
                    )}
                  </Badge>
                </div>
                <SitePreview site={current.local} />
                <Button
                  size="sm"
                  className="w-full mt-2"
                  variant="outline"
                  onClick={() =>
                    void onResolve(current.local.id, current.local)
                  }
                >
                  Keep this
                </Button>
              </div>

              {/* Remote version */}
              <div className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cloud (DB)
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {formatTs(
                      current.remote.lastModified ?? current.remote.addedAt,
                    )}
                  </Badge>
                </div>
                <SitePreview site={current.remote} />
                <Button
                  size="sm"
                  className="w-full mt-2"
                  variant="outline"
                  onClick={() =>
                    void onResolve(current.local.id, current.remote)
                  }
                >
                  Keep this
                </Button>
              </div>
            </div>

            {conflicts.length > 1 && (
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => void onResolveAllLocal()}
                >
                  Keep all local
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => void onResolveAllRemote()}
                >
                  Keep all cloud
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SitePreview({
  site,
}: {
  site: import("@/hooks/use-blocked-sites").BlockedSite;
}) {
  return (
    <ul className="text-xs text-muted-foreground space-y-0.5">
      <li>
        <span className="text-foreground font-medium">Mode:</span>{" "}
        {site.blockMode}
      </li>
      <li>
        <span className="text-foreground font-medium">Category:</span>{" "}
        {site.category}
      </li>
      <li>
        <span className="text-foreground font-medium">Timer:</span>{" "}
        {site.timerSeconds}s
      </li>
      <li>
        <span className="text-foreground font-medium">Enabled:</span>{" "}
        {site.enabled ? "Yes" : "No"}
      </li>
    </ul>
  );
}

export function SettingsConflictResolver({
  conflict,
  onResolve,
}: SettingsConflictResolverProps) {
  if (!conflict) return null;

  const { local, remote } = conflict;

  const rows: { label: string; local: string; remote: string }[] = [
    {
      label: "Show Translation",
      local: local.showTranslation ? "On" : "Off",
      remote: remote.showTranslation ? "On" : "Off",
    },
    {
      label: "Show Transliteration",
      local: local.showTransliteration ? "On" : "Off",
      remote: remote.showTransliteration ? "On" : "Off",
    },
    {
      label: "Blocking Enabled",
      local: local.blockingEnabled ? "On" : "Off",
      remote: remote.blockingEnabled ? "On" : "Off",
    },
  ];

  return (
    <Dialog open>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings Sync Conflict</DialogTitle>
          <DialogDescription>
            Your extension settings differ between this device and the cloud.
            Choose which version to keep.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Setting</span>
            <span className="text-center">This device</span>
            <span className="text-center">Cloud</span>
          </div>

          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-3 gap-2 text-sm items-center"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="text-center font-medium">{row.local}</span>
              <span className="text-center font-medium">{row.remote}</span>
            </div>
          ))}

          <div className="flex gap-3 pt-3 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => void onResolve("local")}
            >
              Keep device
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => void onResolve("remote")}
            >
              Keep cloud
              <Badge variant="secondary" className="ml-1.5 text-[10px]">
                {formatTs(remote.lastModified)}
              </Badge>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
