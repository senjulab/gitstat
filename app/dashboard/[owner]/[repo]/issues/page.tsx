"use client";

import { useParams } from "next/navigation";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";
import { useState, useEffect, useCallback } from "react";
import { Github, ExternalLink } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const chartConfig = {
  opened: {
    label: "Opened",
    color: "var(--chart-1)",
  },
  closed: {
    label: "Closed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const DottedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.color]),
  );
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          key={key}
          id={`dotted-background-pattern-${key}`}
          x="0"
          y="0"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="5" cy="5" r="1.5" fill={value} opacity={0.5}></circle>
        </pattern>
      ))}
    </>
  );
};

interface Issue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  closed_at: string | null;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: {
    name: string;
    color: string;
  }[];
  pull_request?: {
    merged_at: string | null;
  };
}

interface Stats {
  openIssues: number;
  closedIssues: number;
  openPRs: number;
  mergedPRs: number;
  closedPRs: number;
}

interface ChartDataPoint {
  month: string;
  opened: number;
  closed: number;
}

type FilterType = "all" | "issues" | "prs" | "open" | "closed" | "merged";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

export default function IssuesPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    openIssues: 0,
    closedIssues: 0,
    openPRs: 0,
    mergedPRs: 0,
    closedPRs: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const supabase = createClient();

  const fetchIssuesAndPRs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Authentication required");
      }

      // Fetch all issues (includes PRs) with pagination
      const allIssues: Issue[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 10) {
        // Limit to 10 pages (1000 items)
        const res = await fetch(
          `/api/gh/${owner}/${repo}/issues?state=all&per_page=100&page=${page}`,
          {
            headers: {
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
          throw new Error("Failed to fetch issues");
        }

        const data = await res.json();
        if (data.length === 0) {
          hasMore = false;
        } else {
          allIssues.push(...data);
          page++;
        }
      }

      setIssues(allIssues);

      // Calculate stats
      const pureIssues = allIssues.filter((i) => !i.pull_request);
      const prs = allIssues.filter((i) => i.pull_request);

      const newStats: Stats = {
        openIssues: pureIssues.filter((i) => i.state === "open").length,
        closedIssues: pureIssues.filter((i) => i.state === "closed").length,
        openPRs: prs.filter((p) => p.state === "open").length,
        mergedPRs: prs.filter((p) => p.pull_request?.merged_at).length,
        closedPRs: prs.filter(
          (p) => p.state === "closed" && !p.pull_request?.merged_at,
        ).length,
      };
      setStats(newStats);

      // Generate chart data (issues opened vs closed by month)
      const monthlyData: { [key: string]: { opened: number; closed: number } } =
        {};

      // Get last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthlyData[key] = { opened: 0, closed: 0 };
      }

      // Count issues by month (only pure issues, not PRs)
      pureIssues.forEach((issue) => {
        const createdDate = new Date(issue.created_at);
        const createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[createdKey]) {
          monthlyData[createdKey].opened++;
        }

        if (issue.closed_at) {
          const closedDate = new Date(issue.closed_at);
          const closedKey = `${closedDate.getFullYear()}-${String(closedDate.getMonth() + 1).padStart(2, "0")}`;
          if (monthlyData[closedKey]) {
            monthlyData[closedKey].closed++;
          }
        }
      });

      const chartDataArray: ChartDataPoint[] = Object.entries(monthlyData).map(
        ([key, value]) => ({
          month: new Date(key + "-01").toLocaleDateString("en-US", {
            month: "short",
          }),
          opened: value.opened,
          closed: value.closed,
        }),
      );

      setChartData(chartDataArray);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [owner, repo, supabase.auth]);

  useEffect(() => {
    fetchIssuesAndPRs();
  }, [fetchIssuesAndPRs]);

  // Filter items based on active filter
  const getFilteredItems = () => {
    switch (activeFilter) {
      case "issues":
        return issues.filter((i) => !i.pull_request);
      case "prs":
        return issues.filter((i) => i.pull_request);
      case "open":
        return issues.filter((i) => i.state === "open");
      case "closed":
        return issues.filter(
          (i) =>
            i.state === "closed" &&
            (!i.pull_request || !i.pull_request.merged_at),
        );
      case "merged":
        return issues.filter((i) => i.pull_request?.merged_at);
      default:
        return issues;
    }
  };

  const filteredItems = getFilteredItems();

  const getStatusBadge = (item: Issue) => {
    if (item.pull_request?.merged_at) {
      return (
        <Badge className="bg-[#fde8fc] text-[#b812a8] border-none text-xs">
          Merged
        </Badge>
      );
    }
    if (item.state === "open") {
      return (
        <Badge className="bg-green-100 text-green-700 border-none text-xs">
          Open
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-700 border-none text-xs">
        Closed
      </Badge>
    );
  };

  const getTypeBadge = (item: Issue) => {
    if (item.pull_request) {
      return (
        <Badge
          variant="outline"
          className="text-xs border-blue-200 text-blue-600"
        >
          PR
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="text-xs border-orange-200 text-orange-600"
      >
        Issue
      </Badge>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 tracking-tight">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Issues & PRs</h1>
        <p className="text-[#666] font-normal">
          Track issues and pull requests
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <DashboardSidebar />

        <div className="flex-1 min-w-0 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
              <div className="px-6 py-8 text-center">
                <p className="text-[#666] mb-4">{error}</p>
                {error.includes("token") && (
                  <Link href="/connect">
                    <Button className="gap-2">
                      <Github className="h-4 w-4" />
                      Reconnect GitHub
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Section 1: Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div>
                  <p className="text-sm text-[#999] mb-1">Open Issues</p>
                  <p className="text-2xl font-semibold text-[#181925] font-mono">
                    {stats.openIssues.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#999] mb-1">Closed Issues</p>
                  <p className="text-2xl font-semibold text-[#181925] font-mono">
                    {stats.closedIssues.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#999] mb-1">Open PRs</p>
                  <p className="text-2xl font-semibold text-[#181925] font-mono">
                    {stats.openPRs.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#999] mb-1">Merged PRs</p>
                  <p className="text-2xl font-semibold text-[#181925] font-mono">
                    {stats.mergedPRs.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Section 2: Area Chart */}
              <div>
                <h2 className="text-base font-medium text-[#181925] mb-1">
                  Issues Over Time
                </h2>
                <p className="text-sm text-[#999] mb-4">
                  Opened vs closed issues in the last 12 months
                </p>
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] w-full"
                >
                  <AreaChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <defs>
                      <DottedBackgroundPattern config={chartConfig} />
                    </defs>
                    <Area
                      dataKey="closed"
                      type="natural"
                      fill="url(#dotted-background-pattern-closed)"
                      fillOpacity={0.4}
                      stroke="var(--color-closed)"
                      stackId="a"
                      strokeWidth={1.5}
                    />
                    <Area
                      dataKey="opened"
                      type="natural"
                      fill="url(#dotted-background-pattern-opened)"
                      fillOpacity={0.4}
                      stroke="var(--color-opened)"
                      stackId="a"
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>

              {/* Section 3: Tables with Filters */}
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h2 className="text-base font-medium text-[#181925] mb-1">
                      All Items
                    </h2>
                    <p className="text-sm text-[#999]">
                      {filteredItems.length} items
                    </p>
                  </div>
                  <Tabs
                    value={activeFilter}
                    onValueChange={(v) => setActiveFilter(v as FilterType)}
                  >
                    <TabsList className="flex overflow-x-auto scrollbar-hide w-full sm:w-auto">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="issues">Issues</TabsTrigger>
                      <TabsTrigger value="prs">PRs</TabsTrigger>
                      <TabsTrigger value="open">Open</TabsTrigger>
                      <TabsTrigger value="closed">Closed</TabsTrigger>
                      <TabsTrigger value="merged">Merged</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-[#999]">No items found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Opened</TableHead>
                        <TableHead>Closed</TableHead>
                        <TableHead>Labels</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.slice(0, 50).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={item.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[#181925] hover:text-blue-600 hover:underline"
                            >
                              <span className="truncate max-w-[200px] sm:max-w-[300px]">
                                {item.title}
                              </span>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={item.user.avatar_url}
                                  alt={item.user.login}
                                />
                                <AvatarFallback>
                                  {item.user.login.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-[#666]">
                                {item.user.login}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(item)}</TableCell>
                          <TableCell>{getStatusBadge(item)}</TableCell>
                          <TableCell className="text-sm text-[#666]">
                            {formatRelativeTime(item.created_at)}
                          </TableCell>
                          <TableCell className="text-sm text-[#666]">
                            {item.closed_at
                              ? formatRelativeTime(item.closed_at)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap max-w-[150px]">
                              {item.labels.slice(0, 2).map((label) => (
                                <Badge
                                  key={label.name}
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    backgroundColor: `#${label.color}20`,
                                    borderColor: `#${label.color}`,
                                    color: `#${label.color}`,
                                  }}
                                >
                                  {label.name}
                                </Badge>
                              ))}
                              {item.labels.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-[#999]"
                                >
                                  +{item.labels.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {filteredItems.length > 50 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-[#999]">
                      Showing 50 of {filteredItems.length} items
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
