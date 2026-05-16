import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { TopBlockedSite } from "./types";

interface BlockModeCardProps {
  totalCount: number;
  focusCount: number;
  topSites: TopBlockedSite[];
  filterLabel: string;
}

export function BlockModeCard({
  totalCount,
  focusCount,
  topSites,
  filterLabel,
}: BlockModeCardProps) {
  const isEmpty = totalCount === 0;

  return (
    <Card
      className="rounded-2xl border border-border"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="text-sm font-semibold text-[#1a1a1a]">
          Block Mode
        </CardTitle>
        <CardDescription className="text-xs">{filterLabel}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-5">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Clock className="size-7 opacity-20" />
            <span>No data available.</span>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Focus Mode</span>
                <span className="font-semibold text-[#1a1a1a]">
                  {focusCount} blocks
                </span>
              </div>
              <Progress
                value={(focusCount / totalCount) * 100}
                className="h-2 rounded-full"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "#a0a0a0" }}
              >
                Top Blocked Domains
              </p>
              {topSites.slice(0, 4).map((site) => (
                <div
                  key={site.domain}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="text-muted-foreground truncate max-w-28">
                    {site.domain}
                  </span>
                  <Progress
                    value={(site.blockedCount / totalCount) * 100}
                    className="h-1.5 flex-1 rounded-full"
                  />
                  <span className="text-muted-foreground w-5 text-right shrink-0">
                    {site.blockedCount}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
