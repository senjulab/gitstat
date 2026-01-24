
import { createClient } from "@/lib/supabase/server";
import { App } from "octokit";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; path: string[] }> }
) {
  const { owner, repo, path } = await params;
  
  if (!owner || !repo || !path) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Verify access and get installation_id
  const { data: connectedRepo } = await supabase
    .from("connected_repositories")
    .select("installation_id")
    .eq("user_id", user.id)
    .eq("repo_owner", owner)
    .eq("repo_name", repo)
    .single();

  if (!connectedRepo || !connectedRepo.installation_id) {
    return NextResponse.json({ error: "Repository not connected or access denied" }, { status: 403 });
  }

  // 2. Setup GitHub App
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

    // 3. Construct the GitHub API URL
    const apiPath = path.join("/");
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const endpoint = `/repos/${owner}/${repo}/${apiPath}${searchParams ? `?${searchParams}` : ""}`;

    // 4. Proxy the request
    // We use octokit.request to handle auth headers automatically
    const response = await installationOctokit.request(`GET ${endpoint}`);

    return NextResponse.json(response.data, { 
        status: response.status,
        headers: {
            // Forward pagination headers if they exist
            "link": response.headers.link || "",
        } 
    });

  } catch (error: any) {
    console.error(`Proxy Error [${owner}/${repo}/${path.join("/")}]:`, error.status);
    return NextResponse.json(
        { error: error.message || "Upstream error" }, 
        { status: error.status || 500 }
    );
  }
}
