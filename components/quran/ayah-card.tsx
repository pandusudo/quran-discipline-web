"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2 } from "lucide-react";
import type { Ayah } from "@/interfaces";

interface AyahCardProps {
  ayah: Ayah;
  showAudio?: boolean;
  reciterId?: number;
}

export function AyahCard({
  ayah,
  showAudio = true,
  reciterId = 7,
}: AyahCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = `https://api.quran.com/api/v4/recitations/${reciterId}/by_ayah/${ayah.verse_key}`;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch audio URL from API
      const response = await fetch(audioUrl);
      const data = await response.json();

      if (data.audio_files && data.audio_files.length > 0) {
        const audioFileUrl = `https://audio.qurancdn.com/${data.audio_files[0].url}`;

        if (audioRef.current) {
          audioRef.current.pause();
        }

        audioRef.current = new Audio(audioFileUrl);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
        };

        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove HTML tags from translation text
  const cleanTranslation = (text: string) => {
    return text.replace(/<[^>]*>/g, "");
  };

  const translation = ayah.translations?.[0];

  return (
    <div className="group py-6 px-1">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold shrink-0 text-primary">
          {ayah.verse_number}
        </div>
        {showAudio && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-primary"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <Volume2 className="size-4 animate-pulse" />
            ) : isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
          </Button>
        )}
      </div>

      {/* Arabic Text */}
      <p
        className="text-2xl md:text-3xl leading-[2.5] text-right mb-5 font-arabic"
        dir="rtl"
        lang="ar"
      >
        {ayah.text_uthmani}
      </p>

      {/* Translation */}
      {translation && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {cleanTranslation(translation.text)}
        </p>
      )}
    </div>
  );
}

export function AyahCardSkeleton() {
  return (
    <div className="py-6 px-1">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="size-8 rounded-full bg-muted animate-pulse" />
        <div className="size-8 rounded bg-muted animate-pulse" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-8 w-full bg-muted rounded animate-pulse" />
        <div className="h-8 w-3/4 bg-muted rounded animate-pulse ml-auto" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
