import { ShieldCheck } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartDataPoint } from "./types";

const chartConfig = {
  blocked: { label: "Sites Blocked", color: "var(--chart-2)" },
};

interface BlockActivityChartProps {
  chartData: ChartDataPoint[];
  filterLabel: string;
  isHourly?: boolean;
}

export function BlockActivityChart({
  chartData,
  filterLabel,
  isHourly = false,
}: BlockActivityChartProps) {
  const isEmpty =
    chartData.length === 0 || chartData.every((d) => d.blocked === 0);

  return (
    <Card
      className="lg:col-span-2 rounded-2xl border border-border"
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
      }}
    >
      <CardHeader className="px-6 pt-6 pb-2">
        <CardTitle className="text-sm font-semibold text-[#1a1a1a]">
          Block Activity
        </CardTitle>
        <CardDescription className="mt-0.5 text-xs">
          Attempts blocked {filterLabel.toLowerCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isEmpty ? (
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
                    <stop offset="5%" stopColor="#3d7a5c" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3d7a5c" stopOpacity={0.02} />
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
                  interval={isHourly ? 2 : "preserveStartEnd"}
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
  );
}
