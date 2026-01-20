"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UserHeader from "@/components/user-header";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [repository, setRepository] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      // Fetch connected repository
      const { data: repos } = await supabase
        .from("connected_repositories")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (repos) {
        setRepository(repos);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <UserHeader />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-black">
              Welcome to GitStat! 🎉
            </h1>
            <p className="text-[#666666] mt-2">
              Your repository analytics dashboard
            </p>
          </div>

          {/* Connected Repository */}
          {repository ? (
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h2 className="text-lg font-semibold text-black mb-4">
                Connected Repository
              </h2>
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-neutral-600"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z" />
                </svg>
                <div>
                  <p className="font-medium text-black">
                    {repository.repo_full_name}
                  </p>
                  {repository.is_organization && (
                    <span className="text-xs text-[#666666]">Organization</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
              <p className="text-[#666666] mb-4">No repository connected yet</p>
              <button
                onClick={() => router.push("/onboard/connect")}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Connect a repository
              </button>
            </div>
          )}

          {/* Coming Soon */}
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <h2 className="text-lg font-semibold text-black mb-2">
              Analytics Coming Soon
            </h2>
            <p className="text-[#666666]">
              Repository statistics, commit history, and contributor insights
              will be available here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
