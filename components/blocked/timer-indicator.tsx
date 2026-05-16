import { Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TimerIndicatorProps {
  timerSeconds: number;
  timerLeft: number;
}

export const TimerIndicator = ({
  timerSeconds,
  timerLeft,
}: TimerIndicatorProps) => {
  const progressValue = ((timerSeconds - timerLeft) / timerSeconds) * 100;

  return (
    <div className="mt-6 flex flex-col items-center gap-2 w-full max-w-xl">
      <Progress value={progressValue} className="h-1.5" />
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Timer className="w-3.5 h-3.5" />
        Unlock available in{" "}
        <span className="font-semibold tabular-nums">{timerLeft}s</span>
      </p>
    </div>
  );
};
