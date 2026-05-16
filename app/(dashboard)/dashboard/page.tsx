"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useBlockHistory } from "@/hooks/use-block-history";
import { useBlockedSites } from "@/hooks/use-blocked-sites";
import { ExtensionRequiredBanner } from "@/components/extension-required-banner";
import {
  DashboardSkeleton,
  DashboardHeader,
  AyahOfTheDay,
  StatsGrid,
  BlockActivityChart,
  BlockModeCard,
  TopAttemptedSites,
  FILTER_LABELS,
  type TimeFilter,
} from "@/components/dashboard";

export default function DashboardPage() {
  const {
    history,
    loading,
    error,
    extensionAvailable: historyExtensionAvailable,
  } = useBlockHistory();
  const {
    sites,
    loading: sitesLoading,
    extensionAvailable: sitesExtensionAvailable,
  } = useBlockedSites();
  const extensionAvailable =
    historyExtensionAvailable && sitesExtensionAvailable;
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");

  const filteredHistory = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    return history.filter((entry) => {
      const entryDate = new Date(entry.timestamp);

      switch (timeFilter) {
        case "today":
          return entryDate >= startOfToday;
        case "week": {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return entryDate >= weekAgo;
        }
        case "month": {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return entryDate >= monthAgo;
        }
        case "all":
        default:
          return true;
      }
    });
  }, [history, timeFilter]);

  const topBlockedSites = useMemo(
    () =>
      Object.values(
        filteredHistory.reduce<
          Record<
            string,
            { domain: string; blockedCount: number; context: string }
          >
        >((acc, entry) => {
          if (!acc[entry.domain]) {
            acc[entry.domain] = {
              domain: entry.domain,
              blockedCount: 0,
              context: entry.context === "focus" ? "Focus Mode" : "Standard",
            };
          }
          acc[entry.domain].blockedCount += 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b.blockedCount - a.blockedCount)
        .slice(0, 5),
    [filteredHistory],
  );

  const chartData = useMemo(() => {
    const now = new Date();

    if (timeFilter === "today") {
      const currentHour = now.getHours();
      const hours = Array.from({ length: currentHour + 1 }, (_, h) => ({
        day: `${h.toString().padStart(2, "0")}:00`,
        blocked: 0,
      }));

      filteredHistory.forEach((entry) => {
        const h = new Date(entry.timestamp).getHours();
        if (hours[h]) hours[h].blocked += 1;
      });

      return hours;
    }

    const daysToShow =
      timeFilter === "week" ? 7 : timeFilter === "month" ? 30 : 14;

    const formatDay = (date: Date): string => {
      if (timeFilter === "week")
        return date.toLocaleDateString("en-US", { weekday: "short" });
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    const days: { day: string; blocked: number; date: Date }[] = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({ day: formatDay(date), blocked: 0, date });
    }

    filteredHistory.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      const dayIndex = days.findIndex(
        (d) =>
          d.date.getFullYear() === entryDate.getFullYear() &&
          d.date.getMonth() === entryDate.getMonth() &&
          d.date.getDate() === entryDate.getDate(),
      );
      if (dayIndex !== -1) days[dayIndex].blocked += 1;
    });

    return days.map(({ day, blocked }) => ({ day, blocked }));
  }, [filteredHistory, timeFilter]);

  const stats = useMemo(() => {
    const totalBlocked = filteredHistory.length;
    const uniqueDomains = new Set(filteredHistory.map((e) => e.domain)).size;
    const focusModeBlocks = filteredHistory.filter(
      (e) => e.context === "focus",
    ).length;
    const filterPeriodLabel =
      timeFilter === "today"
        ? "Today"
        : timeFilter === "week"
          ? "This week"
          : timeFilter === "month"
            ? "This month"
            : "All time";

    return [
      {
        title: "Blocked Sites",
        value: sites.length.toString(),
        description: "Sites in your block list",
        icon: ShieldCheck,
        trend: `${sites.filter((s) => s.enabled).length} active`,
        trendUp: true,
      },
      {
        title: "Block Attempts",
        value: totalBlocked.toString(),
        description: `${uniqueDomains} unique sites`,
        icon: AlertCircle,
        trend: filterPeriodLabel,
        trendUp: totalBlocked > 0,
      },
      {
        title: "Focus Mode Blocks",
        value: focusModeBlocks.toString(),
        description: "Blocked during focus",
        icon: Clock,
        trend: `${totalBlocked > 0 ? Math.round((focusModeBlocks / totalBlocked) * 100) : 0}% of total`,
        trendUp: focusModeBlocks > 0,
      },
    ];
  }, [filteredHistory, sites, timeFilter]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const focusCount = filteredHistory.filter(
    (e) => e.context === "focus",
  ).length;

  if (loading || sitesLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-7">
      <DashboardHeader
        greeting={greeting}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
      />

      {!extensionAvailable && <ExtensionRequiredBanner />}

      {error && extensionAvailable && (
        <Card className="border-destructive bg-destructive/10 rounded-2xl">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <AyahOfTheDay />

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <BlockActivityChart
          chartData={chartData}
          filterLabel={FILTER_LABELS[timeFilter]}
          isHourly={timeFilter === "today"}
        />
        <BlockModeCard
          totalCount={filteredHistory.length}
          focusCount={focusCount}
          topSites={topBlockedSites}
          filterLabel={FILTER_LABELS[timeFilter]}
        />
      </div>

      <TopAttemptedSites
        sites={topBlockedSites}
        filterLabel={FILTER_LABELS[timeFilter]}
      />
    </div>
  );
}
