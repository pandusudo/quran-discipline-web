"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BlockedSite } from "@/hooks/use-blocked-sites";
import {
  fetchBlockedSitesFromExtension,
  fetchBlockHistoryFromExtension,
  getSettingsFromExtension,
  updateSettingsViaExtension,
  isExtensionRuntimeAvailable,
  addSiteViaExtension,
  updateSiteViaExtension,
  type BlockHistoryEntry,
  type ExtensionSettings,
} from "@/lib/extension-bridge";
import {
  determineSyncStrategy,
  mergeBlockedSites,
  type SyncConflict,
} from "@/lib/sync-engine";
import type { DbExtensionSettings } from "@/app/api/extension-settings/route";
import { CONFLICT_THRESHOLD_MS } from "@/lib/sync-engine";

export type SyncStatus = "idle" | "syncing" | "conflict" | "done" | "error";

export interface SettingsConflict {
  local: ExtensionSettings;
  remote: DbExtensionSettings;
}

export interface UseSyncReturn {
  syncStatus: SyncStatus;
  conflicts: SyncConflict[];
  settingsConflict: SettingsConflict | null;
  resolveConflict: (id: string, winner: BlockedSite) => Promise<void>;
  resolveAllWithRemote: () => Promise<void>;
  resolveAllWithLocal: () => Promise<void>;
  resolveSettingsConflict: (winner: "local" | "remote") => Promise<void>;
  triggerSync: () => Promise<void>;
  syncError: string | null;
}

// ─── Blocked sites helpers ────────────────────────────────────────────────────

async function fetchRemoteSites(): Promise<BlockedSite[]> {
  const res = await fetch("/api/blocked-sites");
  if (!res.ok) return [];
  return res.json() as Promise<BlockedSite[]>;
}

async function pushSitesToDb(sites: BlockedSite[]): Promise<void> {
  if (sites.length === 0) return;
  await fetch("/api/blocked-sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sites),
  });
}

export async function dbUpsertSite(site: BlockedSite): Promise<void> {
  await fetch("/api/blocked-sites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(site),
  });
}

export async function dbDeleteSite(id: string): Promise<void> {
  await fetch(`/api/blocked-sites?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

async function writeAllToExtension(sites: BlockedSite[]): Promise<void> {
  if (!isExtensionRuntimeAvailable()) return;
  for (const site of sites) {
    await updateSiteViaExtension(site.id, site).catch(() => {
      addSiteViaExtension(
        site.domain,
        site.category,
        site.blockMode,
        site.timerSeconds,
        site.unlockDurationMinutes,
      );
    });
  }
}

// ─── Settings helpers ────────────────────────────────────────────────────────

async function fetchRemoteSettings(): Promise<DbExtensionSettings | null> {
  const res = await fetch("/api/extension-settings");
  if (!res.ok) return null;
  return res.json() as Promise<DbExtensionSettings | null>;
}

async function pushSettingsToDb(
  settings: ExtensionSettings,
  lastModified: string,
): Promise<void> {
  await fetch("/api/extension-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...settings, lastModified }),
  });
}

async function syncSettings(): Promise<SettingsConflict | null> {
  const [localRes, remote] = await Promise.all([
    getSettingsFromExtension(),
    fetchRemoteSettings(),
  ]);

  const local = localRes.ok ? localRes.data : null;

  if (!local && remote) {
    await updateSettingsViaExtension(remote);
    return null;
  }
  if (local && !remote) {
    await pushSettingsToDb(local, new Date().toISOString());
    return null;
  }
  if (!local || !remote) return null;

  const remoteTs = new Date(remote.lastModified).getTime();
  const now = Date.now();
  const diff = Math.abs(now - remoteTs);

  // If DB was modified recently and differs → potential conflict
  const differs =
    local.showTranslation !== remote.showTranslation ||
    local.showTransliteration !== remote.showTransliteration ||
    local.blockingEnabled !== remote.blockingEnabled;

  if (!differs) return null;

  if (diff <= CONFLICT_THRESHOLD_MS) {
    return { local, remote };
  }

  // Auto-resolve: DB (remote) is the source of truth when it was modified long ago
  await updateSettingsViaExtension(remote);
  return null;
}

// ─── Block history helpers ────────────────────────────────────────────────────

async function fetchRemoteHistory(): Promise<BlockHistoryEntry[]> {
  const res = await fetch("/api/block-history");
  if (!res.ok) return [];
  return res.json() as Promise<BlockHistoryEntry[]>;
}

async function syncBlockHistory(): Promise<void> {
  const [localRes, remote] = await Promise.all([
    fetchBlockHistoryFromExtension(),
    fetchRemoteHistory(),
  ]);

  const local = localRes.ok ? localRes.data : [];

  const remoteIds = new Set(remote.map((e) => e.id));
  const localIds = new Set(local.map((e) => e.id));

  // Push local-only entries to DB
  const missingInDb = local.filter((e) => !remoteIds.has(e.id));
  if (missingInDb.length > 0) {
    await fetch("/api/block-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(missingInDb),
    });
  }

  void localIds;
}

// ─── useSync hook ─────────────────────────────────────────────────────────────

export function useSync(isAuthenticated: boolean | null): UseSyncReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [settingsConflict, setSettingsConflict] =
    useState<SettingsConflict | null>(null);
  const [pendingMerged, setPendingMerged] = useState<BlockedSite[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const hasSynced = useRef(false);

  const commitMerged = useCallback(async (merged: BlockedSite[]) => {
    await Promise.all([pushSitesToDb(merged), writeAllToExtension(merged)]);
    setSettingsConflict((prev) => {
      if (!prev) setSyncStatus("done");
      return prev;
    });
  }, []);

  const triggerSync = useCallback(async () => {
    if (!isAuthenticated) return;

    setSyncStatus("syncing");
    setSyncError(null);

    try {
      // Run all three syncs in parallel
      const [localRes, remote, detectedSettingsConflict] = await Promise.all([
        fetchBlockedSitesFromExtension(),
        fetchRemoteSites(),
        syncSettings(),
        syncBlockHistory(),
      ]);

      if (detectedSettingsConflict) {
        setSettingsConflict(detectedSettingsConflict);
        setSyncStatus("conflict");
      }

      const local = localRes.ok ? localRes.data : [];
      const strategy = determineSyncStrategy(local, remote);

      if (strategy === "pull-from-remote") {
        await writeAllToExtension(remote);
        if (!detectedSettingsConflict) setSyncStatus("done");
        return;
      }

      if (strategy === "push-to-remote") {
        await pushSitesToDb(local);
        if (!detectedSettingsConflict) setSyncStatus("done");
        return;
      }

      const { merged, conflicts: detected } = mergeBlockedSites(local, remote);

      if (detected.length > 0) {
        setPendingMerged(merged);
        setConflicts(detected);
        setSyncStatus("conflict");
      } else {
        await commitMerged(merged);
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Sync failed.");
      setSyncStatus("error");
    }
  }, [isAuthenticated, commitMerged]);

  // Auto-sync once when the user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !hasSynced.current) {
      hasSynced.current = true;
      void triggerSync();
    }
  }, [isAuthenticated, triggerSync]);

  const resolveConflict = useCallback(
    async (id: string, winner: BlockedSite) => {
      const remaining = conflicts.filter((c) => c.local.id !== id);
      const merged = [...pendingMerged, winner];

      if (remaining.length === 0) {
        setConflicts([]);
        setPendingMerged([]);
        await commitMerged(merged);
      } else {
        setConflicts(remaining);
        setPendingMerged(merged);
      }
    },
    [conflicts, pendingMerged, commitMerged],
  );

  const resolveAllWithRemote = useCallback(async () => {
    const resolved = conflicts.map((c) => c.remote);
    setConflicts([]);
    await commitMerged([...pendingMerged, ...resolved]);
    setPendingMerged([]);
  }, [conflicts, pendingMerged, commitMerged]);

  const resolveAllWithLocal = useCallback(async () => {
    const resolved = conflicts.map((c) => c.local);
    setConflicts([]);
    await commitMerged([...pendingMerged, ...resolved]);
    setPendingMerged([]);
  }, [conflicts, pendingMerged, commitMerged]);

  const resolveSettingsConflict = useCallback(
    async (winner: "local" | "remote") => {
      if (!settingsConflict) return;

      if (winner === "local") {
        await pushSettingsToDb(
          settingsConflict.local,
          new Date().toISOString(),
        );
      } else {
        await updateSettingsViaExtension(settingsConflict.remote);
      }

      setSettingsConflict(null);
      // If no blocked-site conflicts remain, mark done
      setConflicts((prev) => {
        if (prev.length === 0) setSyncStatus("done");
        return prev;
      });
    },
    [settingsConflict],
  );

  return {
    syncStatus,
    conflicts,
    settingsConflict,
    resolveConflict,
    resolveAllWithRemote,
    resolveAllWithLocal,
    resolveSettingsConflict,
    triggerSync,
    syncError,
  };
}
