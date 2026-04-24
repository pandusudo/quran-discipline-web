"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ShieldCheck,
  Clock,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useBlockHistory } from "@/hooks/use-block-history";
import { useBlockedSites } from "@/hooks/use-blocked-sites";
import { Skeleton } from "@/components/ui/skeleton";

const AYAH_OF_THE_DAY = {
  arabic:
    "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
  translation:
    "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.",
  surah: "Al-Baqarah",
  ayah: "2:153",
};

type TimeFilter = "today" | "week" | "month" | "all";

const chartConfig = {
  blocked: { label: "Sites Blocked", color: "var(--chart-2)" },
};

export default function DashboardPage() {
  const { history, loading, error } = useBlockHistory();
  const { sites, loading: sitesLoading } = useBlockedSites();
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

  const topBlockedSites = useMemo(() => {
    return Object.values(
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
      .slice(0, 5);
  }, [filteredHistory]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days: { day: string; blocked: number; date: Date }[] = [];

    const daysToShow =
      timeFilter === "today"
        ? 1
        : timeFilter === "week"
          ? 7
          : timeFilter === "month"
            ? 30
            : 14;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        blocked: 0,
        date,
      });
    }

    filteredHistory.forEach((entry) => {
      const entryDate = new Date(entry.timestamp);
      const dayIndex = days.findIndex(
        (d) =>
          d.date.getFullYear() === entryDate.getFullYear() &&
          d.date.getMonth() === entryDate.getMonth() &&
          d.date.getDate() === entryDate.getDate(),
      );
      if (dayIndex !== -1) {
        days[dayIndex].blocked += 1;
      }
    });

    return days.map(({ day, blocked }) => ({ day, blocked }));
  }, [filteredHistory, timeFilter]);

  const stats = useMemo(() => {
    const totalBlocked = filteredHistory.length;
    const uniqueDomains = new Set(filteredHistory.map((e) => e.domain)).size;
    const focusModeBlocks = filteredHistory.filter(
      (e) => e.context === "focus",
    ).length;

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
        trend:
          timeFilter === "today"
            ? "Today"
            : timeFilter === "week"
              ? "This week"
              : timeFilter === "month"
                ? "This month"
                : "All time",
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

  const filterLabel = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    all: "All Time",
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  if (loading || sitesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        {/* Ayah skeleton */}
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="rounded-2xl border border-border shadow-[0_1px_4px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1a1a1a]">
            {greeting} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s your focus & reflection summary.
          </p>
        </div>
        <Select
          value={timeFilter}
          onValueChange={(v) => setTimeFilter(v as TimeFilter)}
        >
          <SelectTrigger className="w-36 shrink-0 rounded-[10px] border-border text-sm">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10 rounded-2xl">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Ayah of the Day ──────────────────────────────────────────── */}
      <div
        className="relative rounded-2xl border border-border overflow-hidden"
        style={{
          background: "#faf8f4",
          borderLeft: "4px solid #b89b5e",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <div className="px-7 py-6">
          {/* Card label row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div
                className="flex size-7 items-center justify-center rounded-full text-sm"
                style={{ background: "#eef5f1", color: "#3d7a5c" }}
              >
                ✦
              </div>
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#6b6b6b" }}
              >
                Ayah of the Day
              </span>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "#f5f0e8", color: "#b89b5e" }}
            >
              {AYAH_OF_THE_DAY.surah} · {AYAH_OF_THE_DAY.ayah}
            </span>
          </div>

          {/* Arabic text */}
          <p
            className="font-arabic text-right leading-loose text-[1.75rem] text-[#2c2c2c] mb-5"
            dir="rtl"
            lang="ar"
          >
            {AYAH_OF_THE_DAY.arabic}
          </p>

          <Separator className="mb-5" style={{ background: "#e8e8e8" }} />

          {/* Translation */}
          <p className="text-[0.95rem] italic text-[#6b6b6b] leading-relaxed">
            &ldquo;{AYAH_OF_THE_DAY.translation}&rdquo;
          </p>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
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

      {/* ── Charts Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Block Activity Chart */}
        <Card
          className="lg:col-span-2 rounded-2xl border border-border"
          style={{
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <CardHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-[#1a1a1a]">
                  Block Activity
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  Attempts blocked {filterLabel[timeFilter].toLowerCase()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {chartData.length === 0 ||
            chartData.every((d) => d.blocked === 0) ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="size-8 opacity-20" />
                <span>No block activity for this period.</span>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="blockedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3d7a5c"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3d7a5c"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#a0a0a0" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#a0a0a0" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="blocked"
                      stroke="#3d7a5c"
                      fill="url(#blockedGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Block Mode Distribution */}
        <Card
          className="rounded-2xl border border-border"
          style={{
            boxShadow:
              "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          <CardHeader className="px-6 pt-6 pb-2">
            <CardTitle className="text-sm font-semibold text-[#1a1a1a]">
              Block Mode
            </CardTitle>
            <CardDescription className="text-xs">
              {filterLabel[timeFilter]}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-5">
            {filteredHistory.length === 0 ? (
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
                      {
                        filteredHistory.filter((e) => e.context === "focus")
                          .length
                      }{" "}
                      blocks
                    </span>
                  </div>
                  <Progress
                    value={
                      (filteredHistory.filter((e) => e.context === "focus")
                        .length /
                        filteredHistory.length) *
                      100
                    }
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
                  {topBlockedSites.slice(0, 4).map((site) => (
                    <div
                      key={site.domain}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="text-muted-foreground truncate max-w-28">
                        {site.domain}
                      </span>
                      <Progress
                        value={
                          (site.blockedCount / filteredHistory.length) * 100
                        }
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
      </div>

      {/* ── Most Attempted Sites ─────────────────────────────────────── */}
      <Card
        className="rounded-2xl border border-border"
        style={{
          boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-[#1a1a1a]">
              Most Attempted Sites
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Sites you tried to visit most{" "}
              {filterLabel[timeFilter].toLowerCase()}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs rounded-lg hover:bg-[#eef5f1] hover:text-[#3d7a5c] transition-colors"
            asChild
          >
            <Link href="/blocked-sites">
              Manage all <ChevronRight className="size-3 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="space-y-1">
            {topBlockedSites.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <BookOpen className="size-7 opacity-20" />
                <span>
                  No blocked attempts recorded{" "}
                  {filterLabel[timeFilter].toLowerCase()}.
                </span>
              </div>
            ) : (
              topBlockedSites.map((site, index) => (
                <div
                  key={site.domain}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-[#eef5f1]"
                >
                  <span className="text-xs text-muted-foreground w-4 shrink-0 text-center">
                    {index + 1}
                  </span>
                  <div
                    className="flex size-8 items-center justify-center rounded-lg shrink-0 border border-border"
                    style={{ background: "#faf8f4" }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#6ea88a" }}
                    >
                      {site.domain.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-[#1a1a1a]">
                      {site.domain}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {site.context}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      {site.blockedCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      attempts
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
