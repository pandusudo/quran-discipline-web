"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearBlockHistoryViaExtension,
  fetchBlockHistoryFromExtension,
  isExtensionRuntimeAvailable,
  type BlockHistoryEntry,
} from "@/lib/extension-bridge";

export function useBlockHistory() {
  const [history, setHistory] = useState<BlockHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!isExtensionRuntimeAvailable()) {
      setError("Extension is not available. Please install the extension.");
      return;
    }

    const response = await fetchBlockHistoryFromExtension();
    if (response.ok) {
      setHistory(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } else {
      setError(response.error ?? "Failed to reach extension.");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadHistory()
      .catch(() => setError("Failed to load block history."))
      .finally(() => setLoading(false));
  }, [loadHistory]);

  const clearHistory = useCallback(async () => {
    if (!isExtensionRuntimeAvailable()) {
      setError("Extension is not available.");
      return;
    }

    const response = await clearBlockHistoryViaExtension();
    if (response.ok) {
      setHistory([]);
    } else {
      setError(response.error ?? "Failed to clear history.");
    }
  }, []);

  return { history, loading, error, clearHistory };
}
