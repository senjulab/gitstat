"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Download, Image } from "lucide-react";
import React, { useRef, useCallback } from "react";

type TimeRange = "week" | "month" | "year";

const yearData = [
  { label: "January", unique: 142, total: 245 },
  { label: "February", unique: 276, total: 454 },
  { label: "March", unique: 312, total: 487 },
  { label: "April", unique: 329, total: 521 },
  { label: "May", unique: 258, total: 412 },
  { label: "June", unique: 381, total: 598 },
  { label: "July", unique: 294, total: 412 },
  { label: "August", unique: 425, total: 643 },
  { label: "September", unique: 347, total: 489 },
  { label: "October", unique: 332, total: 476 },
  { label: "November", unique: 403, total: 587 },
  { label: "December", unique: 271, total: 398 },
];

const monthData = [
  { label: "Week 1", unique: 45, total: 78 },
  { label: "Week 2", unique: 62, total: 94 },
  { label: "Week 3", unique: 38, total: 67 },
  { label: "Week 4", unique: 71, total: 112 },
];

const weekData = [
  { label: "Mon", unique: 12, total: 23 },
  { label: "Tue", unique: 18, total: 31 },
  { label: "Wed", unique: 15, total: 28 },
  { label: "Thu", unique: 22, total: 37 },
  { label: "Fri", unique: 19, total: 34 },
  { label: "Sat", unique: 8, total: 14 },
  { label: "Sun", unique: 6, total: 11 },
];

const dataByRange: Record<TimeRange, typeof yearData> = {
  year: yearData,
  month: monthData,
  week: weekData,
};

const chartConfig = {
  unique: {
    label: "Unique",
    color: "var(--chart-1)",
  },
  total: {
    label: "Total",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ActiveProperty = keyof typeof chartConfig;

const HatchedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.color])
  );
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          key={key}
          id={`hatched-background-pattern-${key}`}
          x="0"
          y="0"
          width="6.81"
          height="6.81"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
          overflow="visible"
        >
          <g overflow="visible" className="will-change-transform">
            <animateTransform
              attributeName="transform"
              type="translate"
              from="0 0"
              to="6 0"
              dur="1s"
              repeatCount="indefinite"
            />
            <rect width="10" height="10" opacity={0.05} fill={value} />
            <rect width="1" height="10" fill={value} />
          </g>
        </pattern>
      ))}
    </>
  );
};

export default function TrafficPage() {
  const [activeProperty, setActiveProperty] =
    React.useState<ActiveProperty | null>(null);
  const [timeRange, setTimeRange] = React.useState<TimeRange>("year");
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = dataByRange[timeRange];
  const totalClones = chartData.reduce((sum, item) => sum + item.total, 0);

  const rangeLabels: Record<TimeRange, string> = {
    year: "last 12 months",
    month: "last 4 weeks",
    week: "last 7 days",
  };

  const exportToCSV = useCallback(() => {
    const headers = ["Label", "Unique", "Total"];
    const rows = chartData.map((item) => [item.label, item.unique, item.total]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `git-clones-${timeRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [chartData, timeRange]);

  const exportToPNG = useCallback(async () => {
    if (!chartRef.current) return;
    
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(chartRef.current, { backgroundColor: "#ffffff" });
    
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `git-clones-${timeRange}.png`;
    link.click();
  }, [timeRange]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Traffic</h1>
        <p className="text-[#666] font-normal">Monitor your project traffic.</p>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1">
          {/* Chart Header */}
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium text-[#181925]">Git clones</h2>
                <Badge
                  variant="outline"
                  className="text-green-500 bg-green-500/10 border-none"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>12.4%</span>
                </Badge>
              </div>
              <p className="text-sm text-[#999]">
                {totalClones.toLocaleString()} clones in the {rangeLabels[timeRange]}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Export Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={exportToCSV}
                  className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#999] hover:text-[#666] hover:bg-[#fafafa] rounded-full transition-all duration-200"
                  title="Export as CSV"
                >
                  <Download className="h-3 w-3" />
                  CSV
                </button>
                <button
                  onClick={exportToPNG}
                  className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#999] hover:text-[#666] hover:bg-[#fafafa] rounded-full transition-all duration-200"
                  title="Export as PNG"
                >
                  <Image className="h-3 w-3" />
                  PNG
                </button>
              </div>

              {/* Time Range Toggle */}
              <div className="flex items-center gap-1 bg-[#fafafa] rounded-full p-1">
                {(["week", "month", "year"] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`cursor-pointer px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                      timeRange === range
                        ? "bg-white text-[#181925] shadow-sm"
                        : "text-[#999] hover:text-[#666]"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div ref={chartRef}>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart accessibilityLayer data={chartData} margin={{ left: 0, right: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  padding={{ left: 20, right: 20 }}
                  tickFormatter={(value) => timeRange === "year" ? value.slice(0, 3) : value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                  tickFormatter={(value) => value.toLocaleString()}
                />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <HatchedBackgroundPattern config={chartConfig} />
                <linearGradient
                  id="hatched-background-pattern-grad-unique"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-unique)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-unique)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="hatched-background-pattern-grad-total"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-total)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-total)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                onMouseEnter={() => setActiveProperty("total")}
                onMouseLeave={() => setActiveProperty(null)}
                dataKey="total"
                type="natural"
                fill={
                  activeProperty === "total"
                    ? "url(#hatched-background-pattern-total)"
                    : "url(#hatched-background-pattern-grad-total)"
                }
                fillOpacity={0.4}
                stroke="var(--color-total)"
                stackId="a"
                strokeWidth={0.8}
              />
              <Area
                onMouseEnter={() => setActiveProperty("unique")}
                onMouseLeave={() => setActiveProperty(null)}
                dataKey="unique"
                type="natural"
                fill={
                  activeProperty === "unique"
                    ? "url(#hatched-background-pattern-unique)"
                    : "url(#hatched-background-pattern-grad-unique)"
                }
                fillOpacity={0.4}
                stroke="var(--color-unique)"
                stackId="a"
                strokeWidth={0.8}
              />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
