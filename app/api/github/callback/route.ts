import { createClient } from "@/lib/supabase/server";
import { App } from "octokit";
import { NextResponse } from "next/server";
import { getURL } from "@/lib/utils";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const installationId = requestUrl.searchParams.get("installation_id");
  const setupAction = requestUrl.searchParams.get("setup_action");


  if (!installationId) {
    return NextResponse.redirect(`${origin}/onboard/connect?error=missing_installation_id`);
  }

  // Check for required environment variables
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;

  if (!appId || !privateKey || !clientId || !clientSecret) {
    console.error("Missing GitHub App credentials");
    return NextResponse.redirect(`${origin}/onboard/connect?error=server_configuration`);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login`);
    }

    // Authenticate as GitHub App using the helper class
    const app = new App({
      appId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      oauth: {
        clientId,
        clientSecret,
      },
    });

    // Get an authenticated octokit instance for this installation
    const installationOctokit = await app.getInstallationOctokit(Number(installationId));

    // List repositories accessible to this installation
    const { data: repositories } = await installationOctokit.rest.apps.listReposAccessibleToInstallation({
        per_page: 100 
    });

    if (repositories.total_count === 0 || repositories.repositories.length === 0) {
        return NextResponse.redirect(`${getURL()}onboard/connect?error=no_repositories_selected`);
    }

    const firstRepo = repositories.repositories[0];

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
           installation_id: Number(installationId)
         });
 
         if (insertError) {
            console.error("Error saving repository:", insertError);
         }
       }
    }

    // Redirect to the dashboard of the first repository
    return NextResponse.redirect(`${getURL()}dashboard/${firstRepo.owner.login}/${firstRepo.name}/traffic`);

  } catch (error) {
    console.error("GitHub App callback error:", error);
    return NextResponse.redirect(`${getURL()}onboard/connect?error=installation_failed`);
  }
}
