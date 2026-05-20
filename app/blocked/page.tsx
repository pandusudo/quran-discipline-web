"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import type { BlockedVerse, RandomVerseApiResponse } from "@/interfaces";
import { useQuranApi } from "@/hooks/use-quran-api";
import {
  BlockedHeader,
  UnlockedState,
  VerseCard,
  TimerIndicator,
  FooterActions,
} from "@/components/blocked";
import { formatTime } from "@/lib/utils";

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

const SKIP_OPTIONS = { skip: true } as const;

function BlockedPageContent() {
  const searchParams = useSearchParams();
  const domain = searchParams.get("blocked_site") ?? "";
  const isHaramSite = searchParams.get("is_haram_site") === "true";

  // Config & settings
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [focusSessionActive, setFocusSessionActive] = useState(false);

  // Verse
  const [verse, setVerse] = useState<BlockedVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { execute: fetchVerse } = useQuranApi<RandomVerseApiResponse>(
    "/random-verse",
    SKIP_OPTIONS,
  );

  // Timer mode
  const [timerLeft, setTimerLeft] = useState(DEFAULT_CONFIG.timerSeconds);
  const [timerDone, setTimerDone] = useState(false);

  // Audio mode
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDone, setAudioDone] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Unlock/re-block
  const [unlockedUntil, setUnlockedUntilState] = useState<number | null>(null);
  const [reblockLeft, setReblockLeft] = useState<number | null>(null);

  // Load extension config & settings
  useEffect(() => {
    if (!isExtensionRuntimeAvailable()) {
      setConfigLoaded(true);
      return;
    }

    const loadExtensionData = async () => {
      const settingsResponse = await getSettingsFromExtension();
      if (settingsResponse.ok && settingsResponse.data) {
        setSettings(settingsResponse.data);
      }

      const focusResponse = await getFocusSessionViaExtension();
      if (focusResponse.ok && focusResponse.data?.isActive) {
        setFocusSessionActive(true);
      }

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
      const params = new URLSearchParams();
      if (settings.showTranslation)
        params.append("include_translation", "true");
      if (settings.showTransliteration)
        params.append("include_transliteration", "true");
      const qs = params.toString();
      const endpoint = `/random-verse${qs ? `?${qs}` : ""}`;
      const json = await fetchVerse({ endpoint });
      if (!json) throw new Error("No data");
      setVerse(json.data.verse);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [
    config.timerSeconds,
    settings.showTranslation,
    settings.showTransliteration,
  ]);

  // Check existing unlock state
  useEffect(() => {
    if (!domain || !isExtensionRuntimeAvailable()) return;
    getUnlockStateViaExtension(domain).then((response) => {
      if (response.ok && response.data?.unlockedUntil) {
        const until = response.data.unlockedUntil;
        if (until > Date.now()) setUnlockedUntilState(until);
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
        if (domain && isExtensionRuntimeAvailable())
          clearUnlockStateViaExtension(domain);
      } else {
        setReblockLeft(left);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlockedUntil, domain]);

  // Fetch verse once config is ready
  useEffect(() => {
    if (configLoaded) loadVerse();
  }, [configLoaded, loadVerse]);

  // Countdown timer for 'timer' mode
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

  // Audio event wiring
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !verse?.audio?.url) return;
    const rawUrl = verse.audio.url;
    audio.src = rawUrl.startsWith("http")
      ? rawUrl
      : `https://audio.qurancdn.com/${rawUrl}`;
    audio.load();

    const handleTimeUpdate = () => {
      if (audio.duration)
        setAudioProgress((audio.currentTime / audio.duration) * 100);
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

  const handleUnlock = async () => {
    if (!domain) return;
    if (isExtensionRuntimeAvailable()) {
      await unlockSiteViaExtension(domain, config.unlockDurationMinutes);
    }
    if (domain) {
      window.location.href = domain;
    } else {
      setUnlockedUntilState(
        Date.now() + config.unlockDurationMinutes * 60 * 1000,
      );
    }
  };

  const effectiveBlockMode = focusSessionActive ? "hard" : config.blockMode;
  const isUnlockable = effectiveBlockMode !== "hard";
  const canUnlock =
    effectiveBlockMode === "timer"
      ? timerDone
      : effectiveBlockMode === "audio"
        ? audioDone
        : false;

  if (unlockedUntil && reblockLeft !== null) {
    return (
      <UnlockedState
        domain={domain}
        reblockLeft={reblockLeft}
        unlockDurationMinutes={config.unlockDurationMinutes}
        formatTime={formatTime}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <BlockedHeader
        effectiveBlockMode={effectiveBlockMode}
        isHaramSite={isHaramSite}
        focusSessionActive={focusSessionActive}
        timerSeconds={config.timerSeconds}
        domain={domain}
      />

      <VerseCard
        loading={loading}
        error={error}
        verse={verse}
        settings={settings}
        effectiveBlockMode={effectiveBlockMode}
        audioRef={audioRef}
        audioPlaying={audioPlaying}
        audioDone={audioDone}
        audioProgress={audioProgress}
        onPlayAudio={handlePlayAudio}
        onLoadVerse={loadVerse}
      />

      {effectiveBlockMode === "timer" && !loading && verse && !timerDone && (
        <TimerIndicator
          timerSeconds={config.timerSeconds}
          timerLeft={timerLeft}
        />
      )}

      <FooterActions
        isUnlockable={isUnlockable}
        canUnlock={canUnlock}
        effectiveBlockMode={effectiveBlockMode}
        timerLeft={timerLeft}
        unlockDurationMinutes={config.unlockDurationMinutes}
        onUnlock={handleUnlock}
      />
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
