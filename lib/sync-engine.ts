import type { BlockedSite } from "@/hooks/use-blocked-sites";

export const CONFLICT_THRESHOLD_MS = 60_000;

export interface SyncConflict {
  local: BlockedSite;
  remote: BlockedSite;
}

export interface SyncResult {
  merged: BlockedSite[];
  conflicts: SyncConflict[];
}

function getLastModified(site: BlockedSite): number {
  const raw = site.lastModified ?? site.addedAt;
  return raw ? new Date(raw).getTime() : 0;
}

export function mergeBlockedSites(
  local: BlockedSite[],
  remote: BlockedSite[],
): SyncResult {
  const remoteMap = new Map(remote.map((s) => [s.id, s]));
  const localMap = new Map(local.map((s) => [s.id, s]));

  const merged: BlockedSite[] = [];
  const conflicts: SyncConflict[] = [];
  const visited = new Set<string>();

  for (const localSite of local) {
    const remoteSite = remoteMap.get(localSite.id);
    visited.add(localSite.id);

    if (!remoteSite) {
      merged.push(localSite);
      continue;
    }

    const localTs = getLastModified(localSite);
    const remoteTs = getLastModified(remoteSite);
    const diff = Math.abs(localTs - remoteTs);

    if (diff <= CONFLICT_THRESHOLD_MS && localTs !== remoteTs) {
      conflicts.push({ local: localSite, remote: remoteSite });
    } else {
      merged.push(remoteTs > localTs ? remoteSite : localSite);
    }
  }

  // Records only in remote
  for (const remoteSite of remote) {
    if (!visited.has(remoteSite.id) && !localMap.has(remoteSite.id)) {
      merged.push(remoteSite);
    }
  }

  return { merged, conflicts };
}

export type SyncStrategy = "pull-from-remote" | "push-to-remote" | "merge";

export function determineSyncStrategy(
  local: BlockedSite[],
  remote: BlockedSite[],
): SyncStrategy {
  if (local.length === 0 && remote.length > 0) return "pull-from-remote";
  if (remote.length === 0 && local.length > 0) return "push-to-remote";
  return "merge";
}
