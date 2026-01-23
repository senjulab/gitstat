"use client";

import { useParams } from "next/navigation";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, ChevronLeft, ChevronRight, Github } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  contributions: {
    label: "Contributions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const linesChartConfig = {
  inserted: {
    label: "Lines Inserted",
    color: "var(--chart-1)",
  },
  deleted: {
    label: "Lines Deleted",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id="contributors-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="dark:text-muted/40 text-muted"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};

const LinesPatternDots = () => {
  return (
    <pattern
      id="contributors-lines-pattern-dots"
      x="0"
      y="0"
      width="10"
      height="10"
      patternUnits="userSpaceOnUse"
    >
      <circle
        className="dark:text-muted/40 text-muted"
        cx="2"
        cy="2"
        r="1"
        fill="currentColor"
      />
    </pattern>
  );
};

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface ContributorStats {
  login: string;
  avatar_url: string;
  inserted: number;
  deleted: number;
}

export default function ContributorsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [contributorStats, setContributorStats] = useState<ContributorStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const supabase = createClient();

  // Cache for contributors data per page
  const cacheRef = useRef<{
    [page: number]: {
      data: Contributor[];
    };
    totalPages?: number;
    totalCount?: number;
    owner?: string;
    repo?: string;
  }>({});

  const fetchContributors = useCallback(async () => {
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
      setContributors(cached.data);
      // Always set totalPages and totalCount from cache if available
      if (cacheRef.current.totalPages !== undefined) {
        setTotalPages(cacheRef.current.totalPages);
      }
      if (cacheRef.current.totalCount !== undefined) {
        setTotalCount(cacheRef.current.totalCount);
      }
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
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10&page=${currentPage}`,
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
        throw new Error("Failed to fetch contributors");
      }

      const data = await res.json();
      setContributors(data);

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
          fetchedTotalCount = (lastPage - 1) * 10 + data.length;
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
      setError(err instanceof Error ? err.message : "Failed to fetch contributors");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, currentPage, supabase]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  const fetchContributorStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.provider_token;

      if (!token) {
        throw new Error("GitHub token not found.");
      }

      // Fetch stats - may return 202 if computing
      const fetchStats = async (retries = 3): Promise<any> => {
        const res = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (res.status === 202 && retries > 0) {
          // Data is being computed, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return fetchStats(retries - 1);
        }

        if (res.status === 422) {
          throw new Error("Repository has too many commits for stats.");
        }

        if (!res.ok) {
          throw new Error("Failed to fetch contributor stats");
        }

        return res.json();
      };

      const statsData = await fetchStats();

      if (!Array.isArray(statsData)) {
        setContributorStats([]);
        return;
      }

      // Aggregate additions and deletions for each contributor
      const processedStats: ContributorStats[] = statsData
        .map((stat: any) => {
          const totalInserted = stat.weeks.reduce(
            (sum: number, week: any) => sum + (week.a || 0),
            0
          );
          const totalDeleted = stat.weeks.reduce(
            (sum: number, week: any) => sum + (week.d || 0),
            0
          );

          return {
            login: stat.author?.login || "unknown",
            avatar_url: stat.author?.avatar_url || "",
            inserted: totalInserted,
            deleted: totalDeleted,
          };
        })
        .filter((s: ContributorStats) => s.login !== "unknown")
        .sort(
          (a: ContributorStats, b: ContributorStats) =>
            b.inserted + b.deleted - (a.inserted + a.deleted)
        )
        .slice(0, 10); // Top 10 contributors by lines changed

      setContributorStats(processedStats);
    } catch (err) {
      setStatsError(
        err instanceof Error ? err.message : "Failed to fetch stats"
      );
    } finally {
      setStatsLoading(false);
    }
  }, [owner, repo, supabase]);

  useEffect(() => {
    fetchContributorStats();
  }, [fetchContributorStats]);

  const handleReconnect = () => {
    window.location.href = "/onboard/connect";
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Contributors</h1>
        <p className="text-[#666] font-normal">
          See who's contributing to your project.
        </p>
      </div>

      <div className="flex gap-6">
        <DashboardSidebar />

        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-base font-medium text-[#181925]">
              Contributors
            </h2>
            {totalCount > 0 && (
              <p className="text-sm text-[#999]">
                <span className="font-mono text-[#181925] tabular-nums">
                  {totalCount.toLocaleString()}
                </span>{" "}
                total contributors
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-[#999]" />
              <span className="ml-2 text-sm text-[#999]">
                Loading contributors...
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
          ) : contributors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#999]">No contributors found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {contributors.map((contributor) => (
                  <Link
                    key={contributor.login}
                    href={`https://github.com/${contributor.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#fafafa] transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={contributor.avatar_url}
                        alt={contributor.login}
                      />
                      <AvatarFallback>
                        {contributor.login.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#181925] block truncate">
                        {contributor.login}
                      </span>
                      <span className="text-xs text-[#999]">
                        {contributor.contributions.toLocaleString()} contributions
                      </span>
                    </div>
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

              {/* Contributions Bar Chart */}
              <div className="mt-8">
                <div className="mb-4">
                  <h2 className="text-base font-medium text-[#181925]">
                    Contributions
                  </h2>
                  <p className="text-sm text-[#999]">
                    <span className="font-mono text-[#181925] tabular-nums">
                      {contributors.reduce((sum, c) => sum + c.contributions, 0).toLocaleString()}
                    </span>{" "}
                    total contributions from top {contributors.length} contributors
                  </p>
                </div>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <BarChart
                    accessibilityLayer
                    data={contributors}
                    margin={{ top: 10, right: 0, bottom: 40, left: 0 }}
                  >
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="85%"
                      fill="url(#contributors-pattern-dots)"
                    />
                    <defs>
                      <DottedBackgroundPattern />
                      <clipPath id="avatarClip">
                        <circle cx="12" cy="12" r="12" />
                      </clipPath>
                    </defs>
                    <XAxis
                      dataKey="login"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const contributor = contributors.find(
                          (c) => c.login === payload.value
                        );
                        if (!contributor) return <g />;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <defs>
                              <clipPath id={`clip-${contributor.login}`}>
                                <circle cx="0" cy="12" r="12" />
                              </clipPath>
                            </defs>
                            <image
                              href={contributor.avatar_url}
                              x={-12}
                              y={0}
                              width={24}
                              height={24}
                              clipPath={`url(#clip-${contributor.login})`}
                            />
                          </g>
                        );
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={50}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => {
                            const contributor = contributors.find(
                              (c) => c.login === value
                            );
                            return contributor?.login || value;
                          }}
                        />
                      }
                    />
                    <Bar
                      dataKey="contributions"
                      fill="var(--color-contributions)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Lines Changed Bar Chart */}
              <div className="mt-8">
                <div className="mb-4">
                  <h2 className="text-base font-medium text-[#181925]">
                    Lines Changed
                  </h2>
                  {contributorStats.length > 0 && (
                    <p className="text-sm text-[#999]">
                      <span className="font-mono text-[#181925] tabular-nums">
                        {contributorStats
                          .reduce((sum, c) => sum + c.inserted + c.deleted, 0)
                          .toLocaleString()}
                      </span>{" "}
                      total lines changed by top {contributorStats.length} contributors
                    </p>
                  )}
                </div>

                {statsLoading ? (
                  <div className="flex items-center justify-center py-12 h-[250px]">
                    <Loader2 className="h-5 w-5 animate-spin text-[#999]" />
                    <span className="ml-2 text-sm text-[#999]">
                      Loading stats...
                    </span>
                  </div>
                ) : statsError ? (
                  <div className="flex items-center justify-center py-12 h-[250px]">
                    <p className="text-sm text-[#999]">{statsError}</p>
                  </div>
                ) : contributorStats.length === 0 ? (
                  <div className="flex items-center justify-center py-12 h-[250px]">
                    <p className="text-sm text-[#999]">No stats available.</p>
                  </div>
                ) : (
                  <ChartContainer config={linesChartConfig} className="h-[250px] w-full">
                    <BarChart
                      accessibilityLayer
                      data={contributorStats}
                      margin={{ top: 10, right: 0, bottom: 40, left: 0 }}
                    >
                      <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="85%"
                        fill="url(#contributors-lines-pattern-dots)"
                      />
                      <defs>
                        <LinesPatternDots />
                      </defs>
                      <XAxis
                        dataKey="login"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={(props) => {
                          const { x, y, payload } = props;
                          const contributor = contributorStats.find(
                            (c) => c.login === payload.value
                          );
                          if (!contributor) return <g />;
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <defs>
                                <clipPath id={`clip-lines-${contributor.login}`}>
                                  <circle cx="0" cy="12" r="12" />
                                </clipPath>
                              </defs>
                              <image
                                href={contributor.avatar_url}
                                x={-12}
                                y={0}
                                width={24}
                                height={24}
                                clipPath={`url(#clip-lines-${contributor.login})`}
                              />
                            </g>
                          );
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={50}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="dashed"
                            labelFormatter={(value) => {
                              const contributor = contributorStats.find(
                                (c) => c.login === value
                              );
                              return contributor?.login || value;
                            }}
                          />
                        }
                      />
                      <Bar
                        dataKey="inserted"
                        fill="var(--color-inserted)"
                        radius={4}
                      />
                      <Bar
                        dataKey="deleted"
                        fill="var(--color-deleted)"
                        radius={4}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
