
import { createClient } from "@/lib/supabase/server";
import { App } from "octokit";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const { owner, repo } = await params;
  
  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get installation_id for this repo
  const { data: connectedRepo } = await supabase
    .from("connected_repositories")
    .select("installation_id, github_repo_id")
    .eq("user_id", user.id)
    .eq("repo_owner", owner)
    .eq("repo_name", repo)
    .single();

  if (!connectedRepo || !connectedRepo.installation_id) {
    return NextResponse.json({ error: "Repository not connected or missing permission" }, { status: 403 });
  }

  // 2. Authenticate as GitHub App
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

    // 3. Fetch data parallel
    const [clonesRes, viewsRes] = await Promise.all([
      installationOctokit.request("GET /repos/{owner}/{repo}/traffic/clones", {
        owner,
        repo,
      }),
      installationOctokit.request("GET /repos/{owner}/{repo}/traffic/views", {
        owner,
        repo,
      }),
    ]);

    return NextResponse.json({
      clones: clonesRes.data,
      views: viewsRes.data,
    });

  } catch (error: any) {
    console.error("Traffic API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch traffic data" }, { status: 500 });
  }
}
