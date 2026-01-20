"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import OnboardingProgress from "@/components/onboarding-progress";
import { createClient } from "@/lib/supabase/client";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  default_branch: string;
}

export default function ConnectPage() {
  const [loading, setLoading] = useState(false);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [connected, setConnected] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user just came back from GitHub OAuth
    const checkGitHubConnection = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.provider_token) {
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
          redirectTo: `${window.location.origin}/onboard/connect`,
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

      // Save selected repository to database
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

      // Navigate to repository-specific dashboard
      router.push(`/${selectedRepo.full_name}/dashboard`);
    } catch (err: any) {
      console.error("Failed to save repository:", err);
      alert("Failed to save repository. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Badge */}
        <div className="flex items-center justify-center">
          <span className="text-sm text-[#0006] h-[24px] min-w-[24px] bg-[#00000008] px-3 py-1 rounded-sm font-medium flex items-center justify-center border border-[#00000008]">
            Connect
          </span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-medium text-black">
            Connect your GitHub
          </h1>
          <p className="text-[#666666] text-md">
            Authorize GitStat to access your repositories
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
                <label className="text-sm font-medium text-[#666666]">
                  Select a repository or organization
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {repositories.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`w-full p-3 rounded-xl text-left transition-all ${
                        selectedRepo?.id === repo.id
                          ? "bg-indigo-50 border-2 border-indigo-400"
                          : "bg-[#f3f3f3] border-2 border-transparent hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-neutral-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-black block truncate">
                            {repo.full_name}
                          </span>
                          {repo.owner.type === "Organization" && (
                            <span className="text-xs text-[#666666]">
                              Organization
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={!selectedRepo}
                className="w-full h-12 bg-indigo-200 hover:bg-indigo-300 text-white rounded-full text-base font-medium cursor-pointer disabled:opacity-50"
              >
                Continue
              </Button>
            </div>
          )}

          <OnboardingProgress currentStep={1} totalSteps={2} />

          {/* Skip option */}
          <p className="text-center text-[#666666] text-sm">
            Want to do this later?{" "}
            <button
              onClick={() => router.push("/dashboard")}
              className="text-black font-medium hover:text-neutral-700"
            >
              Skip for now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
