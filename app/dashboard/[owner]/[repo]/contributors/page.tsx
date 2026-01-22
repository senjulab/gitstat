"use client";

import { useParams } from "next/navigation";
import { DashboardSidebar } from "@/app/components/DashboardSidebar";

export default function ContributorsPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 tracking-tight">
      <div className="text-center mb-12">
        <h1 className="text-2xl font-medium text-black mb-2">Contributors</h1>
        <p className="text-[#666] font-normal">
          See who's contributing to your project.
        </p>
      </div>

      <div className="flex gap-6">
        <DashboardSidebar />

        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-[#f7f7f7] overflow-hidden">
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-[#181925] mb-1">
                Top contributors
              </h2>
              <p className="text-sm text-[#999] mb-4">
                People who have contributed to your project.
              </p>
              <div className="h-48 bg-[#fafafa] rounded-xl flex items-center justify-center">
                <span className="text-[#999] text-sm">
                  Contributors list coming soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
