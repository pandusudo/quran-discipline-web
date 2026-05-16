import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatItem } from "./types";

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="rounded-2xl border border-border"
          style={{
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <CardHeader className="flex flex-row items-start justify-between pb-3 space-y-0 pt-5 px-5">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: "#eef5f1" }}
            >
              <stat.icon
                className="size-4.5"
                style={{ color: "#6ea88a", strokeWidth: 1.75 }}
              />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[2rem] font-bold leading-none text-[#1a1a1a]">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stat.description}
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <TrendingUp className="size-3" style={{ color: "#3d7a5c" }} />
              <span
                className="text-xs font-medium"
                style={{ color: "#3d7a5c" }}
              >
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
