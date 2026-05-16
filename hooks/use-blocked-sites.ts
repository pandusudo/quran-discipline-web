"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addSiteViaExtension,
  deleteSiteViaExtension,
  fetchBlockedSitesFromExtension,
  isExtensionRuntimeAvailable,
  toggleSiteViaExtension,
  updateSiteViaExtension,
} from "@/lib/extension-bridge";

export interface BlockedSite {
  id: string;
  domain: string;
  category: string;
  enabled: boolean;
  addedAt: string;
  blockedCount: number;
  blockMode: "timer" | "audio" | "hard";
  timerSeconds: number;
  unlockDurationMinutes: number;
}

export function useBlockedSites() {
  const [sites, setSites] = useState<BlockedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extensionAvailable, setExtensionAvailable] = useState(true);

  const loadSites = useCallback(async () => {
    if (!isExtensionRuntimeAvailable()) {
      setExtensionAvailable(false);
      setLoading(false);
      return;
    }
    setExtensionAvailable(true);

    const response = await fetchBlockedSitesFromExtension();
    if (response.ok) {
      setSites(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } else {
      setError(response.error ?? "Failed to reach extension.");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadSites()
      .catch(() => setError("Failed to load blocked sites."))
      .finally(() => setLoading(false));
  }, [loadSites]);

  const toggleSite = useCallback(
    async (id: string) => {
      if (!isExtensionRuntimeAvailable()) {
        setError("Extension is not available.");
        return;
      }

      const response = await toggleSiteViaExtension(id);
      if (response.ok) {
        if (Array.isArray(response.data)) {
          setSites(response.data);
        } else {
          await loadSites();
        }
      } else {
        setError(response.error ?? "Failed to toggle site.");
      }
    },
    [loadSites],
  );

  const deleteSite = useCallback(
    async (id: string) => {
      if (!isExtensionRuntimeAvailable()) {
        setError("Extension is not available.");
        return;
      }

      const response = await deleteSiteViaExtension(id);
      if (response.ok) {
        if (Array.isArray(response.data)) {
          setSites(response.data);
        } else {
          await loadSites();
        }
      } else {
        setError(response.error ?? "Failed to delete site.");
      }
    },
    [loadSites],
  );

  const addSite = useCallback(
    async (
      domain: string,
      category: string,
      blockMode: BlockedSite["blockMode"] = "timer",
      timerSeconds = 30,
      unlockDurationMinutes = 5,
    ) => {
      if (!isExtensionRuntimeAvailable()) {
        setError("Extension is not available.");
        return;
      }

      const normalized = domain
        .trim()
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

      const response = await addSiteViaExtension(
        normalized,
        category,
        blockMode,
        timerSeconds,
        unlockDurationMinutes,
      );
      if (response.ok) {
        if (Array.isArray(response.data)) {
          setSites(response.data);
        } else {
          await loadSites();
        }
      } else {
        setError(response.error ?? "Failed to add site.");
      }
    },
    [loadSites],
  );

  const updateSiteConfig = useCallback(
    async (
      id: string,
      updates: Partial<
        Pick<
          BlockedSite,
          "blockMode" | "timerSeconds" | "unlockDurationMinutes" | "category"
        >
      >,
    ) => {
      if (!isExtensionRuntimeAvailable()) {
        setError("Extension is not available.");
        return;
      }

      const response = await updateSiteViaExtension(id, updates);
      if (response.ok) {
        if (Array.isArray(response.data)) {
          setSites(response.data);
        } else {
          await loadSites();
        }
      } else {
        setError(response.error ?? "Failed to update site.");
      }
    },
    [loadSites],
  );

  return {
    sites,
    loading,
    error,
    extensionAvailable,
    toggleSite,
    deleteSite,
    addSite,
    updateSiteConfig,
  };
}
