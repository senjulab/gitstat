import Link from "next/link";
import { Settings, BarChart3, Users, Zap } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-black mb-2">Dashboard</h1>
        <p className="text-[#666] font-normal">
          Welcome back. Here's an overview of your project.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#918df6]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-black">1,234</p>
          <p className="text-sm text-[#666]">Total views</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#22c55e]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-black">89</p>
          <p className="text-sm text-[#666]">Unique visitors</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#fef9c3] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#eab308]" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-black">42</p>
          <p className="text-sm text-[#666]">Stars this week</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#eaeaea] p-6">
        <h2 className="text-base font-semibold text-black mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/settings"
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
