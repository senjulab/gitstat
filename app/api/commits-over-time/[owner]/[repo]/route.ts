import { createClient } from "@/lib/supabase/server";
import { App, Octokit } from "octokit";
import { NextResponse } from "next/server";

interface CommitData {
  week: string;
  commits: number;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

function formatWeekLabel(date: Date): string {
  // Format as "MMM DD" (e.g., "Jan 26") for better readability
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return `${month} ${day}`;
}

function aggregateCommitsByWeek(commits: any[]): CommitData[] {
  const weekMap = new Map<string, number>();

  commits.forEach((commit) => {
    const commitDate = new Date(commit.commit.author.date);
    const weekStart = getStartOfWeek(commitDate);
    const weekKey = weekStart.toISOString().split("T")[0]; // Use ISO date as key

    weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
  });

  // Convert to array and format
  const result: CommitData[] = Array.from(weekMap.entries())
    .map(([weekKey, count]) => ({
      week: formatWeekLabel(new Date(weekKey)),
      commits: count,
      weekKey, // Keep for sorting
    }))
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey))
    .map(({ week, commits }) => ({ week, commits }));

  return result;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const userToken = request.headers.get("X-GitHub-Token");
  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since"); // Optional: ISO date string

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connectedRepo } = await supabase
    .from("connected_repositories")
    .select("installation_id")
    .eq("user_id", user.id)
    .eq("repo_owner", owner)
    .eq("repo_name", repo)
    .single();

  if (!connectedRepo || !connectedRepo.installation_id) {
    return NextResponse.json({ error: "Repository not connected" }, { status: 403 });
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;

  if (!appId || !privateKey || !clientId || !clientSecret) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    const app = new App({
      appId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      oauth: { clientId, clientSecret },
    });

    const installationOctokit = await app.getInstallationOctokit(
      Number(connectedRepo.installation_id)
    );

    // Calculate date range (default to 1 year ago)
    const until = new Date();
    const sinceDate = since ? new Date(since) : new Date(until.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Fetch commits with pagination
    let allCommits: any[] = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore && page <= 10) {
      // Limit to 10 pages (1000 commits max) to avoid timeout
      const commits = await installationOctokit.request(
        "GET /repos/{owner}/{repo}/commits",
        {
          owner,
          repo,
          per_page: perPage,
          page,
          since: sinceDate.toISOString(),
          until: until.toISOString(),
        }
      );

      if (commits.data.length === 0) {
        hasMore = false;
      } else {
        allCommits = allCommits.concat(commits.data);
        if (commits.data.length < perPage) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    const aggregatedData = aggregateCommitsByWeek(allCommits);

    return NextResponse.json(aggregatedData);
  } catch (error: any) {
    if (error.status === 403 && userToken) {
      console.warn("App permission failed for Commits Over Time, using User Token fallback");
      try {
        const userOctokit = new Octokit({ auth: userToken });
        const until = new Date();
        const sinceDate = since ? new Date(since) : new Date(until.getTime() - 365 * 24 * 60 * 60 * 1000);

        let allCommits: any[] = [];
        let page = 1;
        const perPage = 100;
        let hasMore = true;

        while (hasMore && page <= 10) {
          const commits = await userOctokit.request("GET /repos/{owner}/{repo}/commits", {
            owner,
            repo,
            per_page: perPage,
            page,
            since: sinceDate.toISOString(),
            until: until.toISOString(),
          });

          if (commits.data.length === 0) {
            hasMore = false;
          } else {
            allCommits = allCommits.concat(commits.data);
            if (commits.data.length < perPage) {
              hasMore = false;
            } else {
              page++;
            }
          }
        }

        const aggregatedData = aggregateCommitsByWeek(allCommits);
        return NextResponse.json(aggregatedData);
      } catch (fallbackErr) {
        console.error("Fallback User Token failed:", fallbackErr);
      }
    }

    console.error("Commits Over Time API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch commits over time" },
      { status: error.status || 500 }
    );
  }
}
