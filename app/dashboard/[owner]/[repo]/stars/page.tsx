"use client";

import { useParams } from "next/navigation";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useRef, useState, useEffect, useCallback } from "react";
import { useSpring, useMotionValueEvent } from "motion/react";
import {
  Download,
  ChevronDown,
  Image,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Github,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toPng } from "html-to-image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const chartConfig = {
  stars: {
    label: "Stars",
    color: "#FCA070",
  },
} satisfies ChartConfig;

interface Stargazer {
  login: string;
  avatar_url: string;
  starred_at: string;
}

interface ChartDataPoint {
  date: string;
  stars: number;
  fullDate: string;
}

export default function StarsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);
  const [stargazers, setStargazers] = useState<Stargazer[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = createClient();

  const springX = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });
  const springY = useSpring(0, {
    damping: 30,
    stiffness: 100,
  });

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  const fetchAllStargazers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setStargazers([]);
    setChartData([]);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.provider_token;

      if (!token) {
        throw new Error("GitHub token not found. Please reconnect.");
      }

      // Helper to transform API response to flat Stargazer object
      const mapStargazers = (data: any[]): Stargazer[] => {
        return data
          .map((item) => {
            if (item.user && item.starred_at) {
              return {
                login: item.user.login,
                avatar_url: item.user.avatar_url,
                starred_at: item.starred_at,
              };
            }
            return {
              login: item.login,
              avatar_url: item.avatar_url,
              starred_at: item.starred_at || new Date().toISOString(),
            };
          })
          .filter((s) => s.login);
      };

      // Step 1: Fetch first page to get total count
      const firstPageRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=100&page=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3.star+json",
          },
        },
      );

      if (!firstPageRes.ok) {
        if (firstPageRes.status === 403) {
          throw new Error(
            "GitHub token lacks required permissions. Please reconnect.",
          );
        }
        throw new Error("Failed to fetch stargazers");
      }

      const firstPageRawData = await firstPageRes.json();
      const firstPageData = mapStargazers(
        Array.isArray(firstPageRawData) ? firstPageRawData : [],
      );

      const linkHeader = firstPageRes.headers.get("Link");
      let totalPagesToFetch = 1;

      if (linkHeader) {
        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (lastPageMatch) {
          totalPagesToFetch = parseInt(lastPageMatch[1], 10);
        }
      }

      // Initialize Map with mapped first page data
      const uniqueStargazersMap = new Map<string, Stargazer>();
      firstPageData.forEach((s) => {
        uniqueStargazersMap.set(s.login, s);
      });

      const lastPage = totalPagesToFetch;
      const totalEstimated =
        lastPage === 1
          ? uniqueStargazersMap.size
          : (lastPage - 1) * 100 + uniqueStargazersMap.size;
      setTotalCount(totalEstimated);

      setProgress((1 / totalPagesToFetch) * 100);

      // Fetch remaining pages in batches
      const batchSize = 5;
      for (let i = 2; i <= totalPagesToFetch; i += batchSize) {
        const batchPromises = [];
        for (let j = i; j < i + batchSize && j <= totalPagesToFetch; j++) {
          batchPromises.push(
            fetch(
              `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=100&page=${j}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/vnd.github.v3.star+json",
                },
              },
            ).then((res) => res.json()),
          );
        }

        const batchResults = await Promise.all(batchPromises);
        batchResults.forEach((rawData) => {
          if (Array.isArray(rawData)) {
            const mappedData = mapStargazers(rawData);
            mappedData.forEach((s) => {
              uniqueStargazersMap.set(s.login, s);
            });
          }
        });

        setProgress(
          (Math.min(i + batchSize - 1, totalPagesToFetch) / totalPagesToFetch) *
            100,
        );
      }

      // Convert Map to Array
      let allStargazers = Array.from(uniqueStargazersMap.values());

      // Sort by date for the chart
      allStargazers.sort(
        (a, b) =>
          new Date(a.starred_at).getTime() - new Date(b.starred_at).getTime(),
      );

      // Process data for chart
      const processedData: ChartDataPoint[] = [];
      const groupedByDay: { [key: string]: number } = {};

      allStargazers.forEach((stargazer) => {
        const date = new Date(stargazer.starred_at).toISOString().split("T")[0];
        groupedByDay[date] = (groupedByDay[date] || 0) + 1;
      });

      const sortedDates = Object.keys(groupedByDay).sort();
      let cumulative = 0;

      if (sortedDates.length > 0) {
        const firstDate = new Date(sortedDates[0]);
        firstDate.setDate(firstDate.getDate() - 1);
        processedData.push({
          date: firstDate.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          fullDate: firstDate.toLocaleDateString(),
          stars: 0,
        });
      }

      sortedDates.forEach((date) => {
        cumulative += groupedByDay[date];
        const dateObj = new Date(date);
        processedData.push({
          date: dateObj.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          fullDate: dateObj.toLocaleDateString(),
          stars: cumulative,
        });
      });

      setStargazers(allStargazers);
      setTotalCount(allStargazers.length);
      setChartData(processedData);
    } catch (err: any) {
      console.error("Failed to fetch star history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, supabase]);

  useEffect(() => {
    fetchAllStargazers();
  }, [fetchAllStargazers]);

  const handleReconnect = () => {
    window.location.href = "/onboard/connect";
  };

  const exportStargazersToCSV = () => {
    const headers = ["Username", "Avatar URL", "Starred At"];
    const rows = stargazers.map((s) => [s.login, s.avatar_url, s.starred_at]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${owner}-${repo}-stargazers.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ["Date", "Total Stars"];
    const rows = chartData.map((d) => [d.fullDate, d.stars]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${owner}-${repo}-star-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPNG = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${owner}-${repo}-star-history.png`;
      a.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
    }
  };

  // Client-side pagination
  const itemsPerPage = 21;
  const paginatedStargazers = stargazers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const listTotalPages = Math.ceil(stargazers.length / itemsPerPage);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Stars</h1>
        <p className="text-[#666] font-normal">
          Track your project stars over time.
        </p>
      </div>

      <div className="flex gap-6">
        <DashboardSidebar />

        <div className="flex-1">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-medium text-[#181925]">
                Star history
              </h2>
              <p className="text-sm text-[#999]">
                <span className="font-mono text-[#181925] tabular-nums">
                  {loading ? "..." : totalCount.toLocaleString()}
                </span>{" "}
                total stars
              </p>
            </div>
            {!loading && chartData.length > 0 && (
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
            )}
          </div>

          <div className="relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#999] mb-4" />
                <p className="text-sm text-[#666]">
                  Fetching star history... {Math.round(progress)}%
                </p>
                <div className="w-48 h-1 bg-[#f0f0f0] rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                <p className="text-red-500 text-sm mb-4 max-w-sm text-center">
                  {error}
                </p>
                {(error.toLowerCase().includes("token") ||
                  error.toLowerCase().includes("permission") ||
                  error.toLowerCase().includes("reconnect")) && (
                  <Button onClick={handleReconnect} variant="outline">
                    Reconnect GitHub
                  </Button>
                )}
              </div>
            )}

            {chartData.length > 0 ? (
              <ChartContainer
                ref={chartRef}
                className="h-[300px] w-full"
                config={chartConfig}
              >
                <AreaChart
                  className="overflow-visible"
                  accessibilityLayer
                  data={chartData}
                  onMouseMove={(state) => {
                    const x = state.activeCoordinate?.x;
                    const dataValue = state.activePayload?.[0]?.value;
                    if (x && dataValue !== undefined) {
                      springX.set(x);
                      springY.set(dataValue as number);
                    }
                  }}
                  onMouseLeave={() => {
                    springX.set(
                      chartRef.current?.getBoundingClientRect().width || 0,
                    );
                    springY.jump(chartData[chartData.length - 1].stars);
                  }}
                  margin={{
                    top: 10,
                    right: 0,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={30}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={50}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white border border-[#eaeaea] p-2 rounded-lg shadow-sm text-xs">
                            <p className="font-medium">{data.fullDate}</p>
                            <p className="text-[#666]">
                              {data.stars.toLocaleString()} stars
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    dataKey="stars"
                    type="monotone"
                    fill="url(#gradient-clipped-area-stars)"
                    fillOpacity={0.4}
                    stroke="var(--color-stars)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient
                      id="gradient-clipped-area-stars"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-stars)"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-stars)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ChartContainer>
            ) : (
              !loading &&
              !error && (
                <div className="flex items-center justify-center h-[300px] text-[#999]">
                  No stars yet
                </div>
              )
            )}
          </div>

          {/* Stargazers List */}
          <div className="mt-8">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-medium text-[#181925]">
                  Stargazers
                </h2>
                {totalCount > 0 && (
                  <p className="text-sm text-[#999]">
                    <span className="font-mono text-[#181925] tabular-nums">
                      {totalCount.toLocaleString()}
                    </span>{" "}
                    total stargazers
                  </p>
                )}
              </div>
              {!loading && !error && stargazers.length > 0 && (
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
                      onClick={exportStargazersToCSV}
                      className="cursor-pointer flex items-center gap-1.5 px-2 py-1 text-xs"
                    >
                      <Download className="h-3 w-3" />
                      CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {!loading && !error && stargazers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-[#999]">No stargazers found.</p>
              </div>
            )}

            {!loading && !error && stargazers.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {paginatedStargazers.map((stargazer) => (
                    <Link
                      key={stargazer.login}
                      href={`https://github.com/${stargazer.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#fafafa] transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={stargazer.avatar_url}
                          alt={stargazer.login}
                        />
                        <AvatarFallback>
                          {(stargazer.login?.charAt(0) || "?").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium text-[#181925] truncate">
                          {stargazer.login}
                        </span>
                        <span className="text-xs text-[#999]">
                          {new Date(stargazer.starred_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {stargazers.length > 0 && listTotalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer text-[#999] hover:text-[#181925] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-[#999]">
                      page {currentPage} of {listTotalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(listTotalPages, p + 1))
                      }
                      disabled={currentPage === listTotalPages}
                      className="cursor-pointer text-[#999] hover:text-[#181925] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
