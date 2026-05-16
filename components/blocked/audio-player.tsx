import { Music2, Volume2 } from "lucide-react";
import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AudioPlayerProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  audioPlaying: boolean;
  audioDone: boolean;
  audioProgress: number;
  onPlay: () => void;
}

const AudioButtonLabel = ({
  audioPlaying,
  audioDone,
}: Pick<AudioPlayerProps, "audioPlaying" | "audioDone">) => {
  if (audioPlaying) {
    return (
      <>
        <Volume2 className="w-4 h-4 animate-pulse text-primary" />
        Listening…
      </>
    );
  }
  if (audioDone) {
    return (
      <>
        <Music2 className="w-4 h-4 text-green-600" />
        Listened
      </>
    );
  }
  return (
    <>
      <Music2 className="w-4 h-4" />
      Play Ayah
    </>
  );
};

export const AudioPlayer = ({
  audioRef,
  audioPlaying,
  audioDone,
  audioProgress,
  onPlay,
}: AudioPlayerProps) => (
  <div className="space-y-3">
    <audio ref={audioRef} preload="metadata" />

    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onPlay}
        disabled={audioDone}
        className="gap-2"
      >
        <AudioButtonLabel audioPlaying={audioPlaying} audioDone={audioDone} />
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
);
