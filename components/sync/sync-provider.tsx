"use client";

import { useAuth } from "@/hooks/use-auth";
import { useSync } from "@/hooks/use-sync";
import {
  ConflictResolver,
  SettingsConflictResolver,
} from "@/components/sync/conflict-resolver";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const {
    conflicts,
    settingsConflict,
    resolveConflict,
    resolveAllWithRemote,
    resolveAllWithLocal,
    resolveSettingsConflict,
  } = useSync(isAuthenticated);

  return (
    <>
      {children}
      <ConflictResolver
        conflicts={conflicts}
        onResolve={resolveConflict}
        onResolveAllRemote={resolveAllWithRemote}
        onResolveAllLocal={resolveAllWithLocal}
      />
      <SettingsConflictResolver
        conflict={settingsConflict}
        onResolve={resolveSettingsConflict}
      />
    </>
  );
}
