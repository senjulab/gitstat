import { createClient } from "@/lib/supabase/server";
import { App, Octokit } from "octokit";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const userToken = request.headers.get("X-GitHub-Token");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: repos } = await supabase
    .from("connected_repositories")
    .select("installation_id, is_public, user_id")
    .eq("repo_owner", owner)
    .eq("repo_name", repo);

  let connectedRepo = null;
  if (repos) {
    connectedRepo =
      repos.find((r) => r.is_public) ||
      (user ? repos.find((r) => r.user_id === user.id) : null);
  }

  if (!connectedRepo || !connectedRepo.installation_id) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Repository not connected" },
      { status: 403 },
    );
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

    const installationOctokit = await app.getInstallationOctokit(Number(connectedRepo.installation_id));
    
    const commits = await installationOctokit.request("GET /repos/{owner}/{repo}/commits", {
        owner,
        repo,
        per_page: 1,
    });
    
    return NextResponse.json(commits.data);

  } catch (error: any) {
    if (error.status === 403 && userToken) {
        console.warn("App permission failed for Commits, using User Token fallback");
        try {
            const userOctokit = new Octokit({ auth: userToken });
            const commits = await userOctokit.request("GET /repos/{owner}/{repo}/commits", {
                owner,
                repo,
                per_page: 1,
            });
            return NextResponse.json(commits.data);
        } catch (fallbackErr) {
            console.error("Fallback User Token failed:", fallbackErr);
        }
    }

    console.error("Commits API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch commits" },
      { status: error.status || 500 }
    );
  }
}
