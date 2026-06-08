"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, User, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import {
  isExtensionRuntimeAvailable,
  getSettingsFromExtension,
  updateSettingsViaExtension,
  type ExtensionSettings,
} from "@/lib/extension-bridge";

interface SettingToggle {
  id: keyof ExtensionSettings;
  label: string;
  description: string;
}

const quranSettingsConfig: SettingToggle[] = [
  {
    id: "showTranslation",
    label: "Show translation",
    description: "Display English translation alongside Arabic text.",
  },
  {
    id: "showTransliteration",
    label: "Show transliteration",
    description: "Show romanized Arabic text below each verse.",
  },
];

const blockingSettingsConfig: SettingToggle[] = [
  {
    id: "blockingEnabled",
    label: "Enable blocking",
    description:
      "Redirect to Quran when visiting blocked sites. If enabled, it will automatically blocks all haram websites including NSFW, gambling, and other harmful sites.",
  },
];

export default function SettingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile(isAuthenticated);

  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [updatingKeys, setUpdatingKeys] = useState<
    Set<keyof ExtensionSettings>
  >(new Set());
  const [extensionAvailable, setExtensionAvailable] = useState<boolean | null>(
    null,
  );

  const loadSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    const available = isExtensionRuntimeAvailable();
    setExtensionAvailable(available);

    if (!available) {
      // Use default settings when extension is not available
      setSettings({
        showTranslation: true,
        showTransliteration: false,
        blockingEnabled: true,
      });
      setIsLoadingSettings(false);
      return;
    }

    const response = await getSettingsFromExtension();
    if (response.ok) {
      setSettings(response.data);
    } else {
      // Fallback to defaults
      setSettings({
        showTranslation: true,
        showTransliteration: false,
        blockingEnabled: true,
      });
    }
    setIsLoadingSettings(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleToggle = async (key: keyof ExtensionSettings) => {
    if (!settings) return;

    const newValue = !settings[key];

    // Optimistic update
    setSettings((prev) => (prev ? { ...prev, [key]: newValue } : prev));
    setUpdatingKeys((prev) => new Set(prev).add(key));

    if (extensionAvailable) {
      const response = await updateSettingsViaExtension({ [key]: newValue });
      if (!response.ok) {
        // Revert on failure
        setSettings((prev) => (prev ? { ...prev, [key]: !newValue } : prev));
      }
    }

    setUpdatingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const SettingRow = ({
    setting,
    value,
    isUpdating,
    onToggle,
  }: {
    setting: SettingToggle;
    value: boolean;
    isUpdating: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{setting.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {setting.description}
        </p>
      </div>
      <div className="relative shrink-0 mt-0.5">
        {isUpdating && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <Switch
          checked={value}
          onCheckedChange={onToggle}
          disabled={isUpdating}
          className={isUpdating ? "opacity-50" : ""}
        />
      </div>
    </div>
  );

  const isProfileLoading = authLoading || profileLoading;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your extension behaviour and preferences.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProfileLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ) : isAuthenticated && profile ? (
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                {profile.avatarUrls?.small && (
                  <AvatarImage
                    src={profile.avatarUrls.small}
                    alt={profile.username ?? "User avatar"}
                  />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {(
                    profile.firstName?.[0] ??
                    profile.username?.[0] ??
                    "U"
                  ).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : (profile.username ?? "User")}
                </p>
                {profile.username && (
                  <p className="text-sm text-muted-foreground">
                    @{profile.username}
                  </p>
                )}
                <Badge variant="outline" className="text-xs mt-1">
                  {profile.verified ? "Verified" : "Free Plan"}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                  U
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-muted-foreground">
                  Not logged in
                </p>
                <p className="text-sm text-muted-foreground">
                  Log in to sync your data across devices
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blocking Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" />
            Blocking
          </CardTitle>
          <CardDescription>Control site blocking behaviour.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {isLoadingSettings ? (
            <div className="space-y-4 py-2">
              {blockingSettingsConfig.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-5 w-9 rounded-full" />
                </div>
              ))}
            </div>
          ) : settings ? (
            blockingSettingsConfig.map((setting) => (
              <SettingRow
                key={setting.id}
                setting={setting}
                value={settings[setting.id]}
                isUpdating={updatingKeys.has(setting.id)}
                onToggle={() => handleToggle(setting.id)}
              />
            ))
          ) : null}
          {!extensionAvailable && !isLoadingSettings && (
            <p className="text-xs text-muted-foreground pt-3">
              Extension not detected. Settings will be stored locally.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quran Display Settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            Quran Display
          </CardTitle>
          <CardDescription>Customise your reading experience.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {isLoadingSettings ? (
            <div className="space-y-4 py-2">
              {quranSettingsConfig.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-5 w-9 rounded-full" />
                </div>
              ))}
            </div>
          ) : settings ? (
            quranSettingsConfig.map((setting) => (
              <SettingRow
                key={setting.id}
                setting={setting}
                value={settings[setting.id]}
                isUpdating={updatingKeys.has(setting.id)}
                onToggle={() => handleToggle(setting.id)}
              />
            ))
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
