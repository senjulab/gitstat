"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import OnboardingProgress from "@/components/onboarding-progress";
import { createClient } from "@/lib/supabase/client";
import { getAppUrl } from "@/lib/utils/app-url";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  default_branch: string;
  fork: boolean;
  private: boolean;
}

export default function ConnectPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [connected, setConnected] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check if user just came back from GitHub OAuth
    const checkGitHubConnection = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: connectedRepos } = await supabase
        .from("connected_repositories")
        .select("*")
        .eq("user_id", user.id);

      if (connectedRepos && connectedRepos.length > 0) {
        setConnected(true);
        setRepositories(
          connectedRepos.map((repo) => ({
            id: repo.github_repo_id,
            name: repo.repo_name,
            full_name: repo.repo_full_name,
            owner: {
              login: repo.repo_owner,
              type: repo.is_organization ? "Organization" : "User",
            },
            default_branch: repo.default_branch,
            fork: false,
            private: false,
          })),
        );
        return;
      }

      // Only fetch repos if user authenticated with GitHub provider
      // Google OAuth users will have provider === 'google', not 'github'
      const isGitHubUser = user?.app_metadata?.provider === "github";

      if (session?.provider_token && isGitHubUser) {
        // User is connected to GitHub
        setConnected(true);
        fetchRepositories(session.provider_token);
      }
    };

    checkGitHubConnection();
  }, []);

  const handleConnectGitHub = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${getAppUrl()}/auth/callback`,
          scopes: "read:user user:email read:org repo",
        },
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("GitHub OAuth error:", err);
      alert("Failed to connect to GitHub. Please try again.");
      setLoading(false);
    }
  };

  const fetchRepositories = async (accessToken: string) => {
    setFetchingRepos(true);

    try {
      // Fetch user's repositories from GitHub API
      const response = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch repositories");

      const repos: Repository[] = await response.json();
      setRepositories(repos);
    } catch (err) {
      console.error("Failed to fetch repositories:", err);
      alert("Failed to load repositories. Please try again.");
    } finally {
      setFetchingRepos(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedRepo) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("connected_repositories")
        .select("id")
        .eq("user_id", user.id)
        .eq("github_repo_id", selectedRepo.id)
        .single();

      if (!existing) {
        const { error } = await supabase.from("connected_repositories").insert({
          user_id: user.id,
          github_repo_id: selectedRepo.id,
          repo_name: selectedRepo.name,
          repo_full_name: selectedRepo.full_name,
          repo_owner: selectedRepo.owner.login,
          is_organization: selectedRepo.owner.type === "Organization",
          default_branch: selectedRepo.default_branch || "main",
        });

        if (error) throw error;
      }

      window.location.href = `/dashboard/${selectedRepo.owner.login}/${selectedRepo.name}/traffic`;
    } catch (err: any) {
      console.error("Failed to save repository:", err);
      alert("Failed to save repository. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 tracking-tight">
      <div className="w-full max-w-sm space-y-6">
        {/* Badge */}
        <div className="flex items-center justify-center">
          <span className="text-sm text-[#0006] h-[24px] min-w-[24px] bg-[#00000008] px-3 py-1 rounded-sm font-medium flex items-center justify-center border border-[#00000008]">
            Connect
          </span>
        </div>

        {/* Header */}
        <div className="text-center ">
          <h1 className="text-2xl font-medium text-black">
            Connect your GitHub
          </h1>
          <p className="text-[#666666] text-md">
            {connected
              ? "Select a repository or organization"
              : "Authorize GitStat to access your repositories"}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* GitHub Connect Button */}
          {!connected && (
            <Button
              onClick={handleConnectGitHub}
              disabled={loading}
              className="w-full h-12 bg-black hover:bg-neutral-800 text-white rounded-xl text-base font-medium cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {loading ? "Connecting..." : "Connect with GitHub"}
            </Button>
          )}

          {/* Loading Repositories */}
          {fetchingRepos && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <p className="mt-4 text-sm text-[#666666]">
                Loading repositories...
              </p>
            </div>
          )}

          {/* Repository Selection */}
          {connected && repositories.length > 0 && !fetchingRepos && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                  {repositories.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer ${
                        selectedRepo?.id === repo.id
                          ? "bg-indigo-50 border-2 border-indigo-400"
                          : "bg-[#f3f3f3] border-2 border-transparent hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-black block truncate">
                            {repo.full_name}
                          </span>
                          <div className="flex gap-1.5 mt-1 flex-wrap">
                            {repo.owner.type === "Organization" && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                                Organization
                              </span>
                            )}
                            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                              {repo.private ? "Private" : "Public"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!selectedRepo}
                className="w-full h-12 bg-[#14141F] hover:bg-[#14141F] text-white rounded-full text-base font-medium cursor-pointer disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          )}

          <OnboardingProgress currentStep={1} totalSteps={2} />
        </div>
      </div>
    </div>
  );
}
