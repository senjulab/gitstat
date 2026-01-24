
import { createClient } from "@/lib/supabase/server";
import { App } from "octokit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const token = session?.provider_token;

  if (!user || !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;

  if (!appId || !privateKey || !clientId || !clientSecret) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  try {
    // 1. Check user's installations using their OAuth token
    const installationsRes = await fetch("https://api.github.com/user/installations", {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
        },
    });

    if (!installationsRes.ok) {
        throw new Error(`Failed to fetch installations: ${installationsRes.statusText}`);
    }

    const installationsData = await installationsRes.json();
    const installations = installationsData.installations || [];

    // Filter for our App
    const myInstallation = installations.find((inst: any) => inst.app_id.toString() === appId.toString());

    if (!myInstallation) {
        return NextResponse.json({ found: false });
    }

    // 2. Found installation! Sync Repositories.
    // Use App credentials to get valid access
    const app = new App({
      appId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      oauth: { clientId, clientSecret },
    });

    const installationOctokit = await app.getInstallationOctokit(myInstallation.id);

    // List repositories accessible to this installation
    const { data: repositories } = await installationOctokit.rest.apps.listReposAccessibleToInstallation({
        per_page: 100 
    });

    let savedRepos = [];

    // Save all accessible repositories
    for (const repo of repositories.repositories) {
         // Check if already exists
         const { data: existing } = await supabase
         .from("connected_repositories")
         .select("id")
         .eq("user_id", user.id)
         .eq("github_repo_id", repo.id)
         .single();
 
       if (!existing) {
         const { error: insertError } = await supabase.from("connected_repositories").insert({
           user_id: user.id,
           github_repo_id: repo.id,
           repo_name: repo.name,
           repo_full_name: repo.full_name,
           repo_owner: repo.owner.login,
           is_organization: repo.owner.type === "Organization",
           default_branch: repo.default_branch || "main",
           installation_id: myInstallation.id
         });
 
         if (insertError) {
            console.error("Error saving repository:", insertError);
         } else {
            savedRepos.push(repo.full_name);
         }
       } else {
            // Update installation_id if missing
            await supabase
                .from("connected_repositories")
                .update({ installation_id: myInstallation.id })
                .eq("id", existing.id);
            savedRepos.push(repo.full_name);
       }
    }

    return NextResponse.json({ 
        found: true, 
        count: savedRepos.length, 
        installation_id: myInstallation.id,
        repos: savedRepos,
        first_repo: repositories.repositories[0] ? {
            owner: repositories.repositories[0].owner.login,
            name: repositories.repositories[0].name
        } : null
    });

  } catch (error: any) {
    console.error("Installations Check Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
