"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Timer,
  Music2,
  Ban,
  Unlock,
  Volume2,
} from "lucide-react";
import Link from "next/link";
import {
  isExtensionRuntimeAvailable,
  unlockSiteViaExtension,
  getUnlockStateViaExtension,
  clearUnlockStateViaExtension,
  getSiteConfigViaExtension,
  getSettingsFromExtension,
  getFocusSessionViaExtension,
  type SiteConfig,
  type ExtensionSettings,
} from "@/lib/extension-bridge";

interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  text_transliteration?: string;
  chapter_name_simple: string;
  chapter_id: number;
  page_number: number;
  juz_number: number;
  audio: {
    url: string;
    segments: Array<[number, number, number, number]>;
  };
  translations: Array<{
    id: number;
    resource_id: number;
    text: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    verse: Verse;
  };
}

const DEFAULT_CONFIG: SiteConfig = {
  blockMode: "timer",
  timerSeconds: 30,
  unlockDurationMinutes: 5,
};

const DEFAULT_SETTINGS: ExtensionSettings = {
  showTranslation: true,
  showTransliteration: false,
  blockingEnabled: true,
};

const fetchRandomVerse = async (
  settings: ExtensionSettings,
): Promise<Verse> => {
  const params = new URLSearchParams();
  if (settings.showTranslation) {
    params.append("include_translation", "true");
  }
  if (settings.showTransliteration) {
    params.append("include_transliteration", "true");
  }
  const queryString = params.toString();
  const url = `${process.env.NEXT_PUBLIC_BACKEND_QURAN_URL}/api/verses/random${queryString ? `?${queryString}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch verse");
  const apiResponse: ApiResponse = await res.json();
  return apiResponse.data.verse;
};

function BlockedPageContent() {
  const searchParams = useSearchParams();
  const domain = searchParams.get("blocked_site") ?? "";
  const isHaramSite = searchParams.get("is_haram_site") === "true";
  const originalUrl = domain;

  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [focusSessionActive, setFocusSessionActive] = useState(false);

  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Timer mode state
  const [timerLeft, setTimerLeft] = useState(DEFAULT_CONFIG.timerSeconds);
  const [timerDone, setTimerDone] = useState(false);

  // Audio mode state
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDone, setAudioDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Unlock/re-block state
  const [unlockedUntil, setUnlockedUntilState] = useState<number | null>(null);
  const [reblockLeft, setReblockLeft] = useState<number | null>(null);

  // Load site config and settings from extension
  useEffect(() => {
    if (!isExtensionRuntimeAvailable()) {
      setConfigLoaded(true);
      return;
    }

    const loadExtensionData = async () => {
      // Load settings
      const settingsResponse = await getSettingsFromExtension();
      if (settingsResponse.ok && settingsResponse.data) {
        setSettings(settingsResponse.data);
      }

      // Check if focus session is active
      const focusResponse = await getFocusSessionViaExtension();
      if (focusResponse.ok && focusResponse.data?.isActive) {
        setFocusSessionActive(true);
      }

      // Load site config if domain is available
      if (domain) {
        const configResponse = await getSiteConfigViaExtension(domain);
        if (configResponse.ok && configResponse.data) {
          setConfig(configResponse.data);
          setTimerLeft(configResponse.data.timerSeconds);
        }
      }

      setConfigLoaded(true);
    };

    loadExtensionData();
  }, [domain]);

  const loadVerse = useCallback(async () => {
    setLoading(true);
    setError(false);
    // Reset mode states when loading a new verse
    setTimerLeft(config.timerSeconds);
    setTimerDone(false);
    setAudioProgress(0);
    setAudioDone(false);
    setAudioPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    try {
      const data = await fetchRandomVerse(settings);
      setVerse(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [config.timerSeconds, settings]);

  // Check if already temporarily unlocked via extension
  useEffect(() => {
    if (!domain || !isExtensionRuntimeAvailable()) return;

    getUnlockStateViaExtension(domain).then((response) => {
      if (response.ok && response.data?.unlockedUntil) {
        const until = response.data.unlockedUntil;
        if (until > Date.now()) {
          setUnlockedUntilState(until);
        }
      }
    });
  }, [domain]);

  // Re-block countdown
  useEffect(() => {
    if (!unlockedUntil) return;
    const tick = () => {
      const left = Math.ceil((unlockedUntil - Date.now()) / 1000);
      if (left <= 0) {
        setUnlockedUntilState(null);
        setReblockLeft(null);
        if (domain && isExtensionRuntimeAvailable()) {
          clearUnlockStateViaExtension(domain);
        }
      } else {
        setReblockLeft(left);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlockedUntil, domain]);

  useEffect(() => {
    loadVerse();
  }, [loadVerse]);

  // Countdown timer for 'timer' mode (disabled during focus sessions)
  useEffect(() => {
    if (
      focusSessionActive ||
      config.blockMode !== "timer" ||
      timerDone ||
      loading ||
      unlockedUntil
    )
      return;
    if (timerLeft <= 0) {
      setTimerDone(true);
      return;
    }
    const id = setInterval(() => {
      setTimerLeft((prev) => {
        if (prev <= 1) {
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [
    focusSessionActive,
    config.blockMode,
    timerDone,
    loading,
    timerLeft,
    unlockedUntil,
  ]);

  // Audio handlers
  const handlePlayAudio = () => {
    if (!verse?.audio?.url || !audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !verse?.audio?.url) return;
    audio.src = verse.audio.url;
    audio.load();

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const handleEnded = () => {
      setAudioDone(true);
      setAudioPlaying(false);
      setAudioProgress(100);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [verse]);

  const handleUnlock = async () => {
    if (!domain) return;

    if (isExtensionRuntimeAvailable()) {
      await unlockSiteViaExtension(domain, config.unlockDurationMinutes);
    }

    if (originalUrl) {
      window.location.href = originalUrl;
    } else {
      setUnlockedUntilState(
        Date.now() + config.unlockDurationMinutes * 60 * 1000,
      );
    }
  };

  // When focus session is active, force hard block mode
  const effectiveBlockMode = focusSessionActive ? "hard" : config.blockMode;

  const isUnlockable = effectiveBlockMode !== "hard";
  const canUnlock =
    effectiveBlockMode === "timer"
      ? timerDone
      : effectiveBlockMode === "audio"
        ? audioDone
        : false;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // If currently unlocked show the "unlocked" state
  if (unlockedUntil && reblockLeft !== null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-3 mb-10 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-50">
            <Unlock className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Temporarily Unlocked
          </h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            {domain} is unlocked for now. It will be blocked again in{" "}
            <span className="font-semibold text-foreground">
              {formatTime(reblockLeft)}
            </span>
            .
          </p>
        </div>
        <div className="w-full max-w-xl">
          <Progress
            value={
              ((config.unlockDurationMinutes * 60 - reblockLeft) /
                (config.unlockDurationMinutes * 60)) *
              100
            }
            className="h-1.5"
          />
        </div>
        <div className="flex gap-3 mt-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 mb-10 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted">
          {effectiveBlockMode === "hard" ? (
            <Ban className="w-7 h-7 text-destructive" />
          ) : (
            <ShieldCheck className="w-7 h-7 text-muted-foreground" />
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Site Blocked</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          {isHaramSite
            ? `Gambling and porn may feel small in the moment, but they leave أثر (impact) on the heart.
Choose what you would be proud to meet Allah with.`
            : focusSessionActive
              ? "Focus session is active. This site is fully blocked until your session ends."
              : effectiveBlockMode === "hard"
                ? "This site is fully blocked. Take a moment to reflect on this verse."
                : effectiveBlockMode === "audio"
                  ? "Listen to the full ayah to unlock this site temporarily."
                  : `Wait ${config.timerSeconds} seconds to unlock this site temporarily.`}
        </p>
        {domain && (
          <Badge variant="outline" className="text-xs font-mono">
            {domain}
          </Badge>
        )}
      </div>

      {/* Verse Card */}
      <div className="w-full max-w-xl rounded-2xl border bg-card shadow-sm p-8">
        {loading && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Fetching a verse…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm text-destructive">
              Could not load a verse. Please check your connection.
            </p>
            <Button variant="outline" size="sm" onClick={loadVerse}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {verse && !loading && (
          <div className="flex flex-col gap-6">
            {/* Surah badge */}
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs font-medium">
                {verse.chapter_name_simple} &mdash; {verse.verse_key}
              </Badge>
            </div>

            {/* Arabic text */}
            <p
              className="text-right text-3xl leading-loose font-arabic text-foreground"
              dir="rtl"
              lang="ar"
            >
              {verse.text_uthmani}
            </p>

            {/* Transliteration */}
            {settings.showTransliteration && verse.text_transliteration && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {verse.text_transliteration}
                </p>
              </>
            )}

            {/* Translation */}
            {settings.showTranslation && (
              <>
                <Separator />
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;
                  {verse.translations[0]?.text || "Translation not available"}
                  &rdquo;
                </p>
              </>
            )}

            {/* Audio player — shown for audio mode */}
            {effectiveBlockMode === "audio" && verse.audio?.url && (
              <div className="space-y-3">
                <audio ref={audioRef} preload="metadata" />
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayAudio}
                    disabled={audioDone}
                    className="gap-2"
                  >
                    {audioPlaying ? (
                      <>
                        <Volume2 className="w-4 h-4 animate-pulse text-primary" />
                        Listening…
                      </>
                    ) : audioDone ? (
                      <>
                        <Music2 className="w-4 h-4 text-green-600" />
                        Listened
                      </>
                    ) : (
                      <>
                        <Music2 className="w-4 h-4" />
                        Play Ayah
                      </>
                    )}
                  </Button>
                  <div className="flex-1">
                    <Progress value={audioProgress} className="h-1.5" />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {Math.round(audioProgress)}%
                  </span>
                </div>
                {!audioDone && (
                  <p className="text-xs text-muted-foreground">
                    Listen to the full ayah to unlock the button below.
                  </p>
                )}
              </div>
            )}

            {/* Refresh */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadVerse}
                className="text-muted-foreground"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Another verse
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Timer countdown indicator */}
      {effectiveBlockMode === "timer" && !loading && verse && !timerDone && (
        <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-xl">
          <Progress
            value={
              ((config.timerSeconds - timerLeft) / config.timerSeconds) * 100
            }
            className="h-1.5"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5" />
            Unlock available in{" "}
            <span className="font-semibold tabular-nums">{timerLeft}s</span>
          </p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex flex-wrap gap-3 mt-8 justify-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href="/blocked-sites">Manage Block List</Link>
        </Button>
        {isUnlockable && (
          <Button
            size="sm"
            disabled={!canUnlock}
            onClick={handleUnlock}
            className="gap-2"
          >
            <Unlock className="w-4 h-4" />
            {canUnlock
              ? `Unlock for ${config.unlockDurationMinutes} min`
              : effectiveBlockMode === "timer"
                ? `Unlock in ${timerLeft}s`
                : "Listen to unlock"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function BlockedPage() {
  return (
    <Suspense>
      <BlockedPageContent />
    </Suspense>
  );
}
