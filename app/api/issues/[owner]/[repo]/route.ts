
import { createClient } from "@/lib/supabase/server";
import { App } from "octokit";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";
  const per_page = url.searchParams.get("per_page") || "100";
  const state = url.searchParams.get("state") || "all";
  
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
    return NextResponse.json({ error: "Repository not connected or missing permission" }, { status: 403 });
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

    const response = await installationOctokit.request("GET /repos/{owner}/{repo}/issues", {
      owner,
      repo,
      state: state as "all" | "open" | "closed",
      per_page: Number(per_page),
      page: Number(page),
    });

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error("Issues API Error:", error);
    // Return specific GitHub message if available (e.g. "Resource not accessible by integration")
    const message = error.response?.data?.message || error.message || "Failed to fetch issues";
    return NextResponse.json({ error: message }, { status: error.status || 500 });
  }
}
