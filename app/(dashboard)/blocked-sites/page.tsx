"use client";

import { useBlockedSites, type BlockedSite } from "@/hooks/use-blocked-sites";
import { ExtensionRequiredBanner } from "@/components/extension-required-banner";
import {
  BlockedSitesSkeleton,
  BlockedSitesHeader,
  BlockedStatCards,
  BlockedSitesTable,
} from "@/components/blocked-sites";

export default function BlockedSitesPage() {
  const {
    sites,
    loading,
    error,
    extensionAvailable,
    toggleSite,
    deleteSite,
    addSite,
    updateSiteConfig,
  } = useBlockedSites();

  const enabledCount = sites.filter((s) => s.enabled).length;

  const handleSaveConfig = async (
    id: string,
    updates: Pick<
      BlockedSite,
      "blockMode" | "timerSeconds" | "unlockDurationMinutes"
    >,
  ) => {
    await updateSiteConfig(id, updates);
  };

  if (loading) return <BlockedSitesSkeleton />;

  return (
    <div className="space-y-6">
      {!extensionAvailable && <ExtensionRequiredBanner />}

      {error && extensionAvailable && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <BlockedSitesHeader onAdd={addSite} />

      <BlockedStatCards total={sites.length} enabled={enabledCount} />

      <BlockedSitesTable
        sites={sites}
        onToggle={toggleSite}
        onDelete={deleteSite}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
}
