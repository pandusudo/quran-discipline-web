import { ArrowLeft, Unlock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UnlockedStateProps {
  domain: string;
  reblockLeft: number;
  unlockDurationMinutes: number;
  formatTime: (seconds: number) => string;
}

export const UnlockedState = ({
  domain,
  reblockLeft,
  unlockDurationMinutes,
  formatTime,
}: UnlockedStateProps) => {
  const totalSeconds = unlockDurationMinutes * 60;
  const elapsed = totalSeconds - reblockLeft;
  const progressValue = (elapsed / totalSeconds) * 100;

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
        <Progress value={progressValue} className="h-1.5" />
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
};
