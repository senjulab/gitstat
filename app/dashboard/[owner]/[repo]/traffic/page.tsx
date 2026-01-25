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
import { Github } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, Download, Image, ChevronDown } from "lucide-react";
import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface TrafficData {
  date: string;
  unique: number;
  total: number;
}

interface VisitorData {
  date: string;
  views: number;
  unique: number;
}

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

import { useDashboardCache } from "@/app/components/DashboardCacheProvider";

export default function TrafficPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { cache, setCache } = useDashboardCache();

  const [clonesData, setClonesData] = useState<TrafficData[]>([]);
  const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clonesXAxis, setClonesXAxis] = useState<number | null>(null);
  const [visitorXAxis, setVisitorXAxis] = useState<number | null>(null);
  const [totals, setTotals] = useState({
    clones: 0,
    uniqueClones: 0,
    views: 0,
    uniqueVisitors: 0,
  });
  const chartRef = useRef<HTMLDivElement>(null);
  const visitorChartRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const fetchTrafficData = useCallback(async () => {
    // Check cache first
    if (cache.traffic) {
      setClonesData(cache.traffic.clonesData);
      setVisitorData(cache.traffic.visitorData);
      setTotals(cache.traffic.totals);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Authentication required");
      }

      // Fetch from our internal proxy API
      const response = await fetch(`/api/traffic/${owner}/${repo}`);

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new Error("Access denied or repository not connected.");
        }
        throw new Error(`Failed to fetch traffic data`);
      }

      const data = await response.json();
      const clonesJson = data.clones;
      const viewsJson = data.views;

      const formattedClones = clonesJson.clones.map((item: any) => ({
        date: new Date(item.timestamp).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
        }),
        unique: item.uniques,
        total: item.count,
      }));

      const formattedViews = viewsJson.views.map((item: any) => ({
        date: new Date(item.timestamp).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
        }),
        views: item.count,
        unique: item.uniques,
      }));

      const newTotals = {
        clones: clonesJson.count,
        uniqueClones: clonesJson.uniques,
        views: viewsJson.count,
        uniqueVisitors: viewsJson.uniques,
      };

      setClonesData(formattedClones);
      setVisitorData(formattedViews);
      setTotals(newTotals);

      // Save to cache
      setCache("traffic", {
        clonesData: formattedClones,
        visitorData: formattedViews,
        totals: newTotals,
      });
    } catch (err: any) {
      console.error("Traffic fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, supabase, cache.traffic, setCache]);

  const handleReconnect = useCallback(async () => {
    const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
    if (slug) {
      window.location.href = `https://github.com/apps/${slug}/installations/new`;
    } else {
      alert("Configuration missing");
    }
  }, []);

  useEffect(() => {
    fetchTrafficData();
  }, [fetchTrafficData]);

  const totalClones = totals.clones;
  const totalUniqueClones = totals.uniqueClones;
  const totalViews = totals.views;
  const totalUnique = totals.uniqueVisitors;

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
    link.download = `git-clones-${owner}-${repo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [clonesData, owner, repo]);

  const exportToPNG = useCallback(async () => {
    if (!chartRef.current) return;

    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(chartRef.current, {
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `git-clones-${owner}-${repo}.png`;
    link.click();
  }, [owner, repo]);

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
    link.download = `visitors-${owner}-${repo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [visitorData, owner, repo]);

  const exportVisitorsToPNG = useCallback(async () => {
    if (!visitorChartRef.current) return;

    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(visitorChartRef.current, {
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `visitors-${owner}-${repo}.png`;
    link.click();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    const needsReconnect =
      error.toLowerCase().includes("token") ||
      error.toLowerCase().includes("permission") ||
      error.toLowerCase().includes("reconnect");

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center min-h-[400px] flex flex-col items-center justify-center">
        <div className=" text-red-600  py-4 max-w-md">
          <p className="text-sm font-medium">{error}</p>
        </div>
        <div className="flex gap-3">
          {needsReconnect ? (
            <Button
              onClick={handleReconnect}
              className="bg-black text-white hover:bg-black/90 px-8 py-2 cursor-pointer rounded-lg h-auto"
            >
              Reconnect GitHub
            </Button>
          ) : (
            <Button
              onClick={fetchTrafficData}
              variant="outline"
              className="px-8 py-2 rounded-full h-auto"
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 tracking-tight">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Traffic</h1>
        <p className="text-[#666] font-normal">Monitor your project traffic.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium text-[#181925]">
                  Git clones
                </h2>
                {/* <Badge
                  variant="outline"
                  className="text-green-500 bg-green-500/10 border-none"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>12.4%</span>
                </Badge> */}
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
                  domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
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
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-medium text-[#181925]">
                    Visitors
                  </h2>
                  {/* <Badge
                    variant="outline"
                    className="text-green-500 bg-green-500/10 border-none"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>12.4%</span>
                  </Badge> */}
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
                    domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]}
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
