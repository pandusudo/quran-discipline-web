import { RefObject } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AudioPlayer } from "./audio-player";
import type { ExtensionSettings } from "@/lib/extension-bridge";
import type { BlockedVerse } from "@/interfaces";

interface VerseCardProps {
  loading: boolean;
  error: boolean;
  verse: BlockedVerse | null;
  settings: ExtensionSettings;
  effectiveBlockMode: string;
  audioRef: RefObject<HTMLAudioElement | null>;
  audioPlaying: boolean;
  audioDone: boolean;
  audioProgress: number;
  onPlayAudio: () => void;
  onLoadVerse: () => void;
}

const LoadingState = () => (
  <div className="flex flex-col items-center gap-4 py-6">
    <div className="w-8 h-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
    <p className="text-sm text-muted-foreground">Fetching a verse…</p>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center gap-4 py-6 text-center">
    <p className="text-sm text-destructive">
      Could not load a verse. Please check your connection.
    </p>
    <Button variant="outline" size="sm" onClick={onRetry}>
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </Button>
  </div>
);

const VerseContent = ({
  verse,
  settings,
  effectiveBlockMode,
  audioRef,
  audioPlaying,
  audioDone,
  audioProgress,
  onPlayAudio,
  onLoadVerse,
}: Omit<VerseCardProps, "loading" | "error"> & { verse: BlockedVerse }) => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-2">
      <BookOpen className="w-4 h-4 text-muted-foreground" />
      <Badge variant="secondary" className="text-xs font-medium">
        {verse.chapter_name_simple} &mdash; {verse.verse_key}
      </Badge>
    </div>

    <p
      className="text-right text-3xl leading-loose font-arabic text-foreground"
      dir="rtl"
      lang="ar"
    >
      {verse.text_uthmani}
    </p>

    {settings.showTransliteration && verse.text_transliteration && (
      <>
        <Separator />
        <p className="text-sm text-muted-foreground leading-relaxed font-medium">
          {verse.text_transliteration}
        </p>
      </>
    )}

    {settings.showTranslation && (
      <>
        <Separator />
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          &ldquo;{verse.translations[0]?.text || "Translation not available"}
          &rdquo;
        </p>
      </>
    )}

    {effectiveBlockMode === "audio" && verse.audio?.url && (
      <AudioPlayer
        audioRef={audioRef}
        audioPlaying={audioPlaying}
        audioDone={audioDone}
        audioProgress={audioProgress}
        onPlay={onPlayAudio}
      />
    )}

    <div className="flex justify-end">
      <Button
        variant="ghost"
        size="sm"
        onClick={onLoadVerse}
        className="text-muted-foreground"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Another verse
      </Button>
    </div>
  </div>
);

export const VerseCard = ({
  loading,
  error,
  verse,
  ...rest
}: VerseCardProps) => (
  <div className="w-full max-w-xl rounded-2xl border bg-card shadow-sm p-8">
    {loading && <LoadingState />}
    {error && !loading && <ErrorState onRetry={rest.onLoadVerse} />}
    {verse && !loading && <VerseContent verse={verse} {...rest} />}
  </div>
);
