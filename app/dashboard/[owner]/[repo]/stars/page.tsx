"use client";

import { useParams } from "next/navigation";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { useRef, useState, useEffect, useCallback } from "react";
import { useSpring, useMotionValueEvent } from "motion/react";
import { Download, ChevronDown, Image, Loader2, ChevronLeft, ChevronRight, Github } from "lucide-react";
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

const chartData = [
  { month: "January", stars: 245 },
  { month: "February", stars: 412 },
  { month: "March", stars: 587 },
  { month: "April", stars: 721 },
  { month: "May", stars: 892 },
  { month: "June", stars: 1098 },
  { month: "July", stars: 1312 },
  { month: "August", stars: 1543 },
  { month: "September", stars: 1789 },
  { month: "October", stars: 2076 },
  { month: "November", stars: 2387 },
  { month: "December", stars: 2698 },
];

const chartConfig = {
  stars: {
    label: "Stars",
    color: "#FCA070",
  },
} satisfies ChartConfig;

interface Stargazer {
  login: string;
  avatar_url: string;
}

export default function StarsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const chartRef = useRef<HTMLDivElement>(null);
  const [axis, setAxis] = useState(0);
  const [stargazers, setStargazers] = useState<Stargazer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = createClient();

  // Cache for stargazers data per page
  const cacheRef = useRef<{
    [page: number]: {
      data: Stargazer[];
    };
    totalPages?: number;
    totalCount?: number;
    owner?: string;
    repo?: string;
  }>({});

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

  const fetchStargazers = useCallback(async () => {
    // Clear page data cache if owner or repo changed
    if (cacheRef.current.owner !== owner || cacheRef.current.repo !== repo) {
      // Create new cache object for new repo
      cacheRef.current = {
        owner,
        repo,
      };
    }

    // Check cache first
    const cached = cacheRef.current[currentPage];
    if (cached) {
      setStargazers(cached.data);
      // Always set totalPages and totalCount from cache if available
      // These should be set after the first successful fetch
      // Use cached values if they exist, otherwise keep current state
      const cachedTotalPages = cacheRef.current.totalPages;
      const cachedTotalCount = cacheRef.current.totalCount;
      
      if (cachedTotalPages !== undefined) {
        setTotalPages(cachedTotalPages);
      }
      if (cachedTotalCount !== undefined) {
        setTotalCount(cachedTotalCount);
      }
      // If cache doesn't have these values, they should be set from a previous fetch
      // so current state should be fine
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.provider_token;

      if (!token) {
        throw new Error("GitHub token not found. Please reconnect.");
      }

      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=20&page=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            "GitHub token lacks required permissions. Please reconnect.",
          );
        }
        throw new Error("Failed to fetch stargazers");
      }

      const data = await res.json();
      setStargazers(data);

      // Get total count from Link header
      const linkHeader = res.headers.get("Link");
      let fetchedTotalPages = cacheRef.current.totalPages ?? 1;
      let fetchedTotalCount = cacheRef.current.totalCount ?? 0;

      if (linkHeader) {
        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (lastPageMatch) {
          fetchedTotalPages = parseInt(lastPageMatch[1], 10);
          // Calculate total count
          const lastPage = parseInt(lastPageMatch[1], 10);
          fetchedTotalCount = (lastPage - 1) * 20 + data.length;
        }
      } else {
        // No Link header means single page - use current data length
        if (!cacheRef.current.totalCount) {
          fetchedTotalCount = data.length;
          fetchedTotalPages = 1;
        }
      }

      // Always update state and cache
      setTotalPages(fetchedTotalPages);
      setTotalCount(fetchedTotalCount);

      // Store in cache
      cacheRef.current[currentPage] = {
        data,
      };
      // Store totalPages and totalCount at root level (shared across pages)
      cacheRef.current.totalPages = fetchedTotalPages;
      cacheRef.current.totalCount = fetchedTotalCount;
      cacheRef.current.owner = owner;
      cacheRef.current.repo = repo;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stargazers");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, currentPage, supabase]);

  useEffect(() => {
    fetchStargazers();
  }, [fetchStargazers]);

  const handleReconnect = () => {
    window.location.href = "/onboard/connect";
  };

  const exportStargazersToCSV = () => {
    // Collect all stargazers from cache
    const allStargazers: Stargazer[] = [];
    Object.keys(cacheRef.current).forEach((key) => {
      const pageNum = parseInt(key, 10);
      if (!isNaN(pageNum) && cacheRef.current[pageNum]) {
        allStargazers.push(...cacheRef.current[pageNum].data);
      }
    });

    if (allStargazers.length === 0) {
      // If no cached data, use current stargazers
      allStargazers.push(...stargazers);
    }

    const headers = ["Username", "Avatar URL"];
    const rows = allStargazers.map((s) => [s.login, s.avatar_url]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${owner}-${repo}-stargazers.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ["Month", "Stars"];
    const rows = chartData.map((d) => [d.month, d.stars]);
    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${owner}-${repo}-stars.csv`;
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
      a.download = `${owner}-${repo}-stars.png`;
      a.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Stars</h1>
        <p className="text-[#666] font-normal">Track your project stars.</p>
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
                  {springY.get().toFixed(0)}
                </span>{" "}
                total stars
              </p>
            </div>
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
                  chartRef.current?.getBoundingClientRect().width || 0
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
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={50}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Area
                dataKey="stars"
                type="monotone"
                fill="url(#gradient-clipped-area-stars)"
                fillOpacity={0.4}
                stroke="var(--color-stars)"
                clipPath={`inset(0 ${
                  Number(chartRef.current?.getBoundingClientRect().width) - axis
                } 0 0)`}
              />
              <line
                x1={axis}
                y1={0}
                x2={axis}
                y2={"85%"}
                stroke="var(--color-stars)"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeOpacity={0.2}
              />
              <rect
                x={axis - 50}
                y={0}
                width={50}
                height={18}
                fill="var(--color-stars)"
                rx={4}
              />
              <text
                x={axis - 25}
                fontWeight={600}
                y={13}
                textAnchor="middle"
                fill="white"
                fontSize={11}
              >
                {springY.get().toFixed(0)}
              </text>
              {/* Ghost line behind graph */}
              <Area
                dataKey="stars"
                type="monotone"
                fill="none"
                stroke="var(--color-stars)"
                strokeOpacity={0.1}
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
                  <DropdownMenuContent align="end" className="min-w-[80px] p-0.5">
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

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-[#999]" />
                <span className="ml-2 text-sm text-[#999]">
                  Loading stargazers...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-600 py-4 max-w-md mx-auto">
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <div className="flex gap-3 justify-center">
                  {(error.toLowerCase().includes("token") ||
                    error.toLowerCase().includes("permission") ||
                    error.toLowerCase().includes("reconnect")) && (
                    <Button
                      onClick={handleReconnect}
                      className="bg-black text-white hover:bg-black/90 px-8 py-2 cursor-pointer rounded-lg h-auto"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Reconnect GitHub
                    </Button>
                  )}
                </div>
              </div>
            ) : stargazers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-[#999]">No stargazers found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {stargazers.map((stargazer) => (
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
                          {stargazer.login.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-[#181925] truncate">
                        {stargazer.login}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="cursor-pointer text-[#999] hover:text-[#181925] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-[#999]">
                      page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
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
