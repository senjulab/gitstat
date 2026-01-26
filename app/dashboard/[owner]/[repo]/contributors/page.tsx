"use client";

import { useParams } from "next/navigation";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, Github } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
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

interface RecentCommit {
  sha: string;
  message: string;
  author: {
    login: string;
    avatar_url: string;
  } | null;
  commit: {
    author: {
      date: string;
      name: string;
    };
    message: string;
  };
  html_url: string;
}

import { useDashboardCache } from "@/app/components/DashboardCacheProvider";

export default function ContributorsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const { cache, setCache } = useDashboardCache();

  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [leaderboardPage, setLeaderboardPage] = useState(1);

  const [contributorStats, setContributorStats] = useState<ContributorStats[]>(
    [],
  );
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [recentCommit, setRecentCommit] = useState<RecentCommit | null>(null);
  const [commitLoading, setCommitLoading] = useState(true);
  const [commitError, setCommitError] = useState<string | null>(null);

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
    // 1. Level 1 Cache: Context Cache (Persistent across tabs)
    if (
      currentPage === 1 &&
      cache.contributors?.data &&
      cache.contributors.data.length > 0
    ) {
      setContributors(cache.contributors.data);
      setTotalPages(cache.contributors.totalPages);
      setTotalCount(cache.contributors.totalCount);
      setLoading(false);

      // Also sync local cacheRef
      cacheRef.current[1] = { data: cache.contributors.data };
      cacheRef.current.totalPages = cache.contributors.totalPages;
      cacheRef.current.totalCount = cache.contributors.totalCount;
      return;
    }

    // 2. Level 2 Cache: Local Ref Cache (Persistent within component lifecycle)
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
      const res = await fetch(
        `/api/contributors/${owner}/${repo}?per_page=10&page=${currentPage}`,
      );

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            "Access denied. Please ensure the repository is connected.",
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
        const lastPageMatch = linkHeader.match(
          /[?&]page=(\d+)[^>]*>; rel="last"/,
        );
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

      // Update global cache if on first page
      if (currentPage === 1) {
        setCache("contributors", {
          ...cache.contributors,
          data: data,
          totalPages: fetchedTotalPages,
          totalCount: fetchedTotalCount,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch contributors",
      );
    } finally {
      setLoading(false);
    }
  }, [owner, repo, currentPage, cache.contributors, setCache]);

  useEffect(() => {
    fetchContributors();
  }, [fetchContributors]);

  useEffect(() => {
    setLeaderboardPage(1);
  }, [contributors]);

  const fetchContributorStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);

    // Check cache first
    if (cache.contributors?.stats && cache.contributors.stats.length > 0) {
      setContributorStats(cache.contributors.stats);
      setStatsLoading(false);
      return;
    }

    try {
      // Fetch stats - may return 202 if computing
      // Poll for up to 20 seconds (10 attempts * 2s)
      const fetchStats = async (retries = 10): Promise<any> => {
        const res = await fetch(`/api/stats/contributors/${owner}/${repo}`);

        if (res.status === 202) {
          if (retries <= 0) {
            throw new Error(
              "Stats computation timed out. Please try again later.",
            );
          }
          // Data is being computed, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return fetchStats(retries - 1);
        }

        if (res.status === 422) {
          throw new Error("Repository has too many commits for stats.");
        }

        if (!res.ok) {
          if (res.status === 403) {
            throw new Error(
              "Access denied. Please ensure the repository is connected.",
            );
          }
          throw new Error("Failed to fetch contributor stats");
        }

        const data = await res.json();
        // GitHub API sometimes returns empty object or unexpected structure when still processing
        if (!data || (Array.isArray(data) && data.length === 0)) {
          // Treating empty array as potentially still processing or just empty.
          // But if it's 200 OK and empty, it might likely be empty.
          return data;
        }
        return data;
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
            0,
          );
          const totalDeleted = stat.weeks.reduce(
            (sum: number, week: any) => sum + (week.d || 0),
            0,
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
            b.inserted + b.deleted - (a.inserted + a.deleted),
        )
        .slice(0, 10); // Top 10 contributors by lines changed

      setContributorStats(processedStats);

      // Save to cache
      setCache("contributors", {
        ...cache.contributors,
        stats: processedStats,
      });
    } catch (err) {
      setStatsError(
        err instanceof Error ? err.message : "Failed to fetch stats",
      );
    } finally {
      setStatsLoading(false);
    }
  }, [owner, repo, cache.contributors, setCache]);

  useEffect(() => {
    fetchContributorStats();
  }, [fetchContributorStats]);

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
    if (diffInSeconds < 2592000) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const fetchRecentCommit = useCallback(async () => {
    setCommitLoading(true);
    setCommitError(null);

    try {
      const res = await fetch(`/api/commits/${owner}/${repo}`);

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(
            "Access denied. Please ensure the repository is connected.",
          );
        }
        throw new Error("Failed to fetch recent commit");
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRecentCommit(data[0]);
      } else {
        setRecentCommit(null);
      }
    } catch (err) {
      setCommitError(
        err instanceof Error ? err.message : "Failed to fetch commit",
      );
    } finally {
      setCommitLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchRecentCommit();
  }, [fetchRecentCommit]);

  const handleReconnect = () => {
    window.location.href = "/onboard/connect";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 tracking-tight">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Contributors</h1>
        <p className="text-[#666] font-normal">
          See who's contributing to your project.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0">
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
              <Spinner />
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
              {contributors.length >= 3 ? (
                <>
                  {/* Sort contributors by contributions descending */}
                  {(() => {
                    const sortedContributors = [...contributors].sort(
                      (a, b) => b.contributions - a.contributions,
                    );
                    const top3Contributors = sortedContributors.slice(0, 3);
                    const remainingContributors = sortedContributors.slice(3);
                    const perPage = 10;
                    const remainderPages = Math.ceil(
                      remainingContributors.length / perPage,
                    );
                    const leaderboardTotalPages = 1 + remainderPages;
                    const isLeaderboardPage = leaderboardPage === 1;
                    const paginatedRemaining = remainingContributors.slice(
                      (leaderboardPage - 2) * perPage,
                      (leaderboardPage - 1) * perPage,
                    );

                    return (
                      <>
                        {isLeaderboardPage ? (
                          <>
                            {/* Page 1: Top 3 only */}
                            <div className="grid grid-cols-1 gap-3 mb-6">
                              {top3Contributors.map((contributor, index) => {
                                const getMedal = () => {
                                  if (index === 0)
                                    return <span className="text-2xl">🥇</span>;
                                  if (index === 1)
                                    return <span className="text-2xl">🥈</span>;
                                  if (index === 2)
                                    return <span className="text-2xl">🥉</span>;
                                  return null;
                                };

                                return (
                                  <Link
                                    key={contributor.login}
                                    href={`https://github.com/${contributor.login}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#fafafa] transition-colors"
                                  >
                                    {getMedal()}
                                    <Avatar className="h-10 w-10">
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
                                        {contributor.contributions.toLocaleString()}{" "}
                                        contributions
                                      </span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Page 2+: Others only, 2 per row */}
                            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 mb-6">
                              {paginatedRemaining.map((contributor) => (
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
                                      {contributor.login
                                        .charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-[#181925] block truncate">
                                      {contributor.login}
                                    </span>
                                    <span className="text-xs text-[#999]">
                                      {contributor.contributions.toLocaleString()}{" "}
                                      contributions
                                    </span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Pagination: page 1 = top 3, page 2+ = others */}
                        {leaderboardTotalPages > 1 && (
                          <div className="mt-6 flex items-center justify-center gap-4">
                            <button
                              onClick={() =>
                                setLeaderboardPage((p) =>
                                  Math.max(1, p - 1),
                                )
                              }
                              disabled={leaderboardPage === 1}
                              className="cursor-pointer text-[#999] hover:text-[#181925] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-sm text-[#999]">
                              page {leaderboardPage} of{" "}
                              {leaderboardTotalPages}
                            </span>
                            <button
                              onClick={() =>
                                setLeaderboardPage((p) =>
                                  Math.min(leaderboardTotalPages, p + 1),
                                )
                              }
                              disabled={
                                leaderboardPage === leaderboardTotalPages
                              }
                              className="cursor-pointer text-[#999] hover:text-[#181925] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
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
                          {contributor.contributions.toLocaleString()}{" "}
                          contributions
                        </span>
                      </div>
                    </Link>
                  ))}
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
                      {contributors
                        .reduce((sum, c) => sum + c.contributions, 0)
                        .toLocaleString()}
                    </span>{" "}
                    total contributions from top {contributors.length}{" "}
                    contributors
                  </p>
                </div>
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] w-full"
                >
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
                    </defs>
                    <XAxis
                      dataKey="login"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={(props) => {
                        const { x, y, payload, index } = props;
                        if (!payload?.value) return <g />;
                        const login = String(payload.value);
                        // Use index from Recharts directly, fallback to findIndex
                        const dataIndex = typeof index === 'number' ? index : contributors.findIndex(
                          (c) => c.login?.toLowerCase() === login.toLowerCase(),
                        );
                        const contributor = dataIndex >= 0 ? contributors[dataIndex] : null;
                        if (!contributor || !contributor.avatar_url) {
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <circle
                                cx="0"
                                cy="12"
                                r="12"
                                fill="#e5e5e5"
                              />
                              <text
                                x="0"
                                y="16"
                                textAnchor="middle"
                                fontSize="10"
                                fill="#999"
                              >
                                {login.charAt(0)?.toUpperCase() || "?"}
                              </text>
                            </g>
                          );
                        }
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <foreignObject x={-12} y={0} width={24} height={24}>
                              <img
                                src={contributor.avatar_url}
                                alt={contributor.login}
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                }}
                              />
                            </foreignObject>
                          </g>
                        );
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={70}
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => {
                            const contributor = contributors.find(
                              (c) => c.login === value,
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
                      total lines changed by top {contributorStats.length}{" "}
                      contributors
                    </p>
                  )}
                </div>

                {statsLoading ? (
                  <div className="flex items-center justify-center py-12 h-[250px]">
                    <Spinner />
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
                  <ChartContainer
                    config={linesChartConfig}
                    className="h-[250px] w-full"
                  >
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
                          const { x, y, payload, index } = props;
                          if (!payload?.value) return <g />;
                          const login = String(payload.value);
                          // Use index from Recharts directly, fallback to findIndex
                          const dataIndex = typeof index === 'number' ? index : contributorStats.findIndex(
                            (c) => c.login?.toLowerCase() === login.toLowerCase(),
                          );
                          const contributor = dataIndex >= 0 ? contributorStats[dataIndex] : null;
                          if (!contributor || !contributor.avatar_url) {
                            return (
                              <g transform={`translate(${x},${y})`}>
                                <circle
                                  cx="0"
                                  cy="12"
                                  r="12"
                                  fill="#e5e5e5"
                                />
                                <text
                                  x="0"
                                  y="16"
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#999"
                                >
                                  {login.charAt(0)?.toUpperCase() || "?"}
                                </text>
                              </g>
                            );
                          }
                          return (
                            <g transform={`translate(${x},${y})`}>
                              <foreignObject x={-12} y={0} width={24} height={24}>
                                <img
                                  src={contributor.avatar_url}
                                  alt={contributor.login}
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                  }}
                                />
                              </foreignObject>
                            </g>
                          );
                        }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={70}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            indicator="dashed"
                            labelFormatter={(value) => {
                              const contributor = contributorStats.find(
                                (c) => c.login === value,
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

              {/* Recent Contributions */}
              <div className="mt-8">
                <div className="mb-4">
                  <h2 className="text-base font-medium text-[#181925]">
                    Recent Contributions
                  </h2>
                  <p className="text-sm text-[#999]">
                    Latest commit message by a contributor
                  </p>
                </div>

                {commitLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                  </div>
                ) : commitError ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-[#999]">{commitError}</p>
                  </div>
                ) : !recentCommit ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-[#999]">
                      No recent commits found.
                    </p>
                  </div>
                ) : (
                  <Link
                    href={recentCommit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-[#fafafa] transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          recentCommit.author?.avatar_url ||
                          `https://github.com/${recentCommit.commit.author.name}.png?size=40`
                        }
                        alt={
                          recentCommit.author?.login ||
                          recentCommit.commit.author.name
                        }
                      />
                      <AvatarFallback>
                        {(
                          recentCommit.author?.login ||
                          recentCommit.commit.author.name
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#181925]">
                          {recentCommit.author?.login ||
                            recentCommit.commit.author.name}
                        </span>
                        <span className="text-xs text-[#999]">
                          committed{" "}
                          {formatRelativeTime(recentCommit.commit.author.date)}
                        </span>
                      </div>
                      <p className="text-sm text-[#666] mb-2 line-clamp-2">
                        {recentCommit.commit.message.split("\n")[0]}
                      </p>
                      <span className="text-xs text-[#999]">
                        {formatDate(recentCommit.commit.author.date)}
                      </span>
                    </div>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
