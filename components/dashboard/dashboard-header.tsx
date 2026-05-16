import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeFilter } from "./types";

interface DashboardHeaderProps {
  greeting: string;
  timeFilter: TimeFilter;
  onTimeFilterChange: (value: TimeFilter) => void;
}

export function DashboardHeader({
  greeting,
  timeFilter,
  onTimeFilterChange,
}: DashboardHeaderProps) {
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {dateLabel}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1a1a1a]">
          {greeting} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your focus &amp; reflection summary.
        </p>
      </div>
      <Select
        value={timeFilter}
        onValueChange={(v) => onTimeFilterChange(v as TimeFilter)}
      >
        <SelectTrigger className="w-36 shrink-0 rounded-[10px] border-border text-sm">
          <SelectValue placeholder="Filter" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">Past 30 Days</SelectItem>
          <SelectItem value="all">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
