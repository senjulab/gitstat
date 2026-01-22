"use client";

import { useParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Download, Image, ChevronDown } from "lucide-react";
import React, { useRef, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const clonesData = [
  { date: "01/08", unique: 42, total: 78 },
  { date: "01/09", unique: 35, total: 65 },
  { date: "01/10", unique: 58, total: 102 },
  { date: "01/11", unique: 72, total: 128 },
  { date: "01/12", unique: 95, total: 168 },
  { date: "01/13", unique: 112, total: 198 },
  { date: "01/14", unique: 134, total: 245 },
  { date: "01/15", unique: 88, total: 156 },
  { date: "01/16", unique: 62, total: 112 },
  { date: "01/17", unique: 48, total: 89 },
  { date: "01/18", unique: 45, total: 82 },
  { date: "01/19", unique: 38, total: 71 },
  { date: "01/20", unique: 42, total: 76 },
];

const visitorData = [
  { date: "01/08", views: 120, unique: 30 },
  { date: "01/09", views: 95, unique: 25 },
  { date: "01/10", views: 180, unique: 45 },
  { date: "01/11", views: 220, unique: 65 },
  { date: "01/12", views: 350, unique: 120 },
  { date: "01/13", views: 420, unique: 180 },
  { date: "01/14", views: 488, unique: 224 },
  { date: "01/15", views: 280, unique: 95 },
  { date: "01/16", views: 150, unique: 55 },
  { date: "01/17", views: 110, unique: 40 },
  { date: "01/18", views: 105, unique: 42 },
  { date: "01/19", views: 98, unique: 38 },
  { date: "01/20", views: 102, unique: 45 },
];

const totalViews = visitorData.reduce((sum, item) => sum + item.views, 0);
const totalUnique = visitorData.reduce((sum, item) => sum + item.unique, 0);

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

const visitorChartConfig = {
  views: {
    label: "Total views",
    color: "var(--chart-1)",
  },
  unique: {
    label: "Unique visitors",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const animationConfig = {
  glowWidth: 300,
};

export default function TrafficPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [clonesXAxis, setClonesXAxis] = React.useState<number | null>(null);
  const [visitorXAxis, setVisitorXAxis] = React.useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const visitorChartRef = useRef<HTMLDivElement>(null);

  const totalClones = clonesData.reduce((sum, item) => sum + item.total, 0);
  const totalUniqueClones = clonesData.reduce(
    (sum, item) => sum + item.unique,
    0,
  );

  const exportToCSV = useCallback(() => {
    const headers = ["Date", "Unique", "Total"];
    const rows = clonesData.map((item) => [item.date, item.unique, item.total]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `git-clones-last-14-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportToPNG = useCallback(async () => {
    if (!chartRef.current) return;

    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(chartRef.current, {
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `git-clones-last-14-days.png`;
    link.click();
  }, []);

  const exportVisitorsToCSV = useCallback(() => {
    const headers = ["Date", "Views", "Unique"];
    const rows = visitorData.map((item) => [
      item.date,
      item.views,
      item.unique,
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `visitors-last-14-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportVisitorsToPNG = useCallback(async () => {
    if (!visitorChartRef.current) return;

    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(visitorChartRef.current, {
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `visitors-last-14-days.png`;
    link.click();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Traffic</h1>
        <p className="text-[#666] font-normal">Monitor your project traffic.</p>
      </div>

      <div className="flex gap-6">
        <DashboardSidebar />

        <div className="flex-1">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium text-[#181925]">
                  Git clones
                </h2>
                <Badge
                  variant="outline"
                  className="text-green-500 bg-green-500/10 border-none"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>12.4%</span>
                </Badge>
              </div>
              <p className="text-sm text-[#999]">
                <span className="font-mono text-[#181925] tabular-nums">
                  {totalClones.toLocaleString()}
                </span>{" "}
                clones and{" "}
                <span className="font-mono text-[#181925] tabular-nums">
                  {totalUniqueClones.toLocaleString()}
                </span>{" "}
                unique clones in the last 14 days
              </p>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#999] hover:text-[#666] hover:bg-[#fafafa] rounded-full transition-all duration-200"
                    title="Export"
                  >
                    <Download className="h-3 w-3" />
                    Export
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[80px] p-0.5">
                  <DropdownMenuItem
                    onClick={exportToCSV}
                    className="cursor-pointer flex items-center gap-1.5 px-2 py-1 text-xs"
                  >
                    <Download className="h-3 w-3" />
                    CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={exportToPNG}
                    className="cursor-pointer flex items-center gap-1.5 px-2 py-1 text-xs"
                  >
                    <Image className="h-3 w-3" />
                    PNG
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div ref={chartRef}>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                accessibilityLayer
                data={clonesData}
                margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
                onMouseMove={(e) => setClonesXAxis(e.chartX as number)}
                onMouseLeave={() => setClonesXAxis(null)}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  padding={{ left: 20, right: 20 }}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <defs>
                  <linearGradient
                    id="clones-highlighted-mask-grad"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="white" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                  <linearGradient
                    id="clones-highlighted-grad-unique"
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
                    id="clones-highlighted-grad-total"
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
                  {clonesXAxis && (
                    <mask id="clones-highlighted-mask">
                      <rect
                        x={clonesXAxis - animationConfig.glowWidth / 2}
                        y={0}
                        width={animationConfig.glowWidth}
                        height="100%"
                        fill="url(#clones-highlighted-mask-grad)"
                      />
                    </mask>
                  )}
                </defs>
                <Area
                  dataKey="total"
                  type="natural"
                  fill="url(#clones-highlighted-grad-total)"
                  fillOpacity={0.4}
                  stroke="var(--color-total)"
                  stackId="a"
                  strokeWidth={0.8}
                  mask="url(#clones-highlighted-mask)"
                />
                <Area
                  dataKey="unique"
                  type="natural"
                  fill="url(#clones-highlighted-grad-unique)"
                  fillOpacity={0.4}
                  stroke="var(--color-unique)"
                  stackId="a"
                  strokeWidth={0.8}
                  mask="url(#clones-highlighted-mask)"
                />
              </AreaChart>
            </ChartContainer>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium text-[#181925]">
                    Visitors
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-green-500 bg-green-500/10 border-none"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>12.4%</span>
                  </Badge>
                </div>
                <p className="text-sm text-[#999]">
                  <span className="font-mono text-[#181925] tabular-nums">
                    {totalViews.toLocaleString()}
                  </span>{" "}
                  views and{" "}
                  <span className="font-mono text-[#181925] tabular-nums">
                    {totalUnique.toLocaleString()}
                  </span>{" "}
                  unique visitors in the last 14 days
                </p>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="cursor-pointer flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#999] hover:text-[#666] hover:bg-[#fafafa] rounded-full transition-all duration-200"
                      title="Export"
                    >
                      <Download className="h-3 w-3" />
                      Export
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-[80px] p-0.5"
                  >
                    <DropdownMenuItem
                      onClick={exportVisitorsToCSV}
                      className="cursor-pointer flex items-center gap-1.5 px-2 py-1 text-xs"
                    >
                      <Download className="h-3 w-3" />
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={exportVisitorsToPNG}
                      className="cursor-pointer flex items-center gap-1.5 px-2 py-1 text-xs"
                    >
                      <Image className="h-3 w-3" />
                      PNG
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div ref={visitorChartRef}>
              <ChartContainer
                config={visitorChartConfig}
                className="h-[300px] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={visitorData}
                  margin={{ top: 10, right: 0, bottom: 10, left: 0 }}
                  onMouseMove={(e) => setVisitorXAxis(e.chartX as number)}
                  onMouseLeave={() => setVisitorXAxis(null)}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    padding={{ left: 20, right: 20 }}
                    tickFormatter={(value) => value}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={40}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <defs>
                    <linearGradient
                      id="animated-highlighted-mask-grad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="50%" stopColor="white" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                    <linearGradient
                      id="animated-highlighted-grad-unique"
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
                      id="animated-highlighted-grad-views"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-views)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-views)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    {visitorXAxis && (
                      <mask id="animated-highlighted-mask">
                        <rect
                          x={visitorXAxis - animationConfig.glowWidth / 2}
                          y={0}
                          width={animationConfig.glowWidth}
                          height="100%"
                          fill="url(#animated-highlighted-mask-grad)"
                        />
                      </mask>
                    )}
                  </defs>
                  <Area
                    dataKey="unique"
                    type="natural"
                    fill="url(#animated-highlighted-grad-unique)"
                    fillOpacity={0.4}
                    stroke="var(--color-unique)"
                    stackId="a"
                    strokeWidth={0.8}
                    mask="url(#animated-highlighted-mask)"
                  />
                  <Area
                    dataKey="views"
                    type="natural"
                    fill="url(#animated-highlighted-grad-views)"
                    fillOpacity={0.4}
                    stroke="var(--color-views)"
                    stackId="a"
                    strokeWidth={0.8}
                    mask="url(#animated-highlighted-mask)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
