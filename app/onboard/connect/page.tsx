"use client";

import { useState, useEffect } from "react";
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
  fork: boolean;
  private: boolean;
}

export default function ConnectPage() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check if user just came back from GitHub OAuth (or installation flow)
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
        // We can redirect automatically if needed, or show success state
        if (connectedRepos.length === 1) {
          const repo = connectedRepos[0];
          window.location.href = `/dashboard/${repo.repo_owner}/${repo.repo_name}/traffic`;
        }
      }
    };

    checkGitHubConnection();
  }, [supabase]);

  const handleConnectGitHub = () => {
    const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
    if (!slug) {
      alert("GitHub App configuration missing");
      return;
    }
    // Redirect to GitHub App Installation
    window.location.href = `https://github.com/apps/${slug}/installations/new`;
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
              ? "Repositories connected!"
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

          {/* Connected State */}
          {connected && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-xl text-green-700">
                Redirecting to your dashboard...
              </div>
              <Button
                onClick={handleConnectGitHub}
                variant="outline"
                className="w-full h-12 rounded-xl text-base font-medium"
              >
                Connect more repositories
              </Button>
            </div>
          )}

          <OnboardingProgress currentStep={1} totalSteps={2} />
        </div>
      </div>
    </div>
  );
}
