"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Settings, BarChart3, Users, Star, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    stars: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.provider_token;

      if (!token) {
        throw new Error("GitHub token not found");
      }

      // Fetch Views
      const viewsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/traffic/views`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      // Fetch Repository Info (for stars)
      const repoRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!viewsRes.ok || !repoRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const viewsJson = await viewsRes.json();
      const repoJson = await repoRes.json();

      setStats({
        totalViews: viewsJson.count || 0,
        uniqueVisitors: viewsJson.uniques || 0,
        stars: repoJson.stargazers_count || 0,
      });
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#999] mb-4" />
        <p className="text-[#666]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-black mb-2">Dashboard</h1>
        <p className="text-[#666] font-normal">
          Welcome back. Here's an overview of {owner}/{repo}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#918df6]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-black tabular-nums">
            {stats.totalViews.toLocaleString()}
          </p>
          <p className="text-sm text-[#666]">Total views</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#22c55e]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-black tabular-nums">
            {stats.uniqueVisitors.toLocaleString()}
          </p>
          <p className="text-sm text-[#666]">Unique visitors</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#fef9c3] flex items-center justify-center">
              <Star className="w-5 h-5 text-[#eab308]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-black tabular-nums">
            {stats.stars.toLocaleString()}
          </p>
          <p className="text-sm text-[#666]">Total stars</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h2 className="text-base font-semibold text-black mb-4">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/${owner}/${repo}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#fafafa] hover:bg-[#f0f0f0] border border-[#eaeaea] rounded-xl text-sm font-medium text-[#666] transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
