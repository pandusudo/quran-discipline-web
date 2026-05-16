import type { LucideIcon } from "lucide-react";

export type TimeFilter = "today" | "week" | "month" | "all";

export const FILTER_LABELS: Record<TimeFilter, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All Time",
};

export interface StatItem {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
}

export interface TopBlockedSite {
  domain: string;
  blockedCount: number;
  context: string;
}

export interface ChartDataPoint {
  day: string;
  blocked: number;
}
