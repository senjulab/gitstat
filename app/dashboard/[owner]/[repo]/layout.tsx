"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "@/app/components/DashboardHeader";
import { DashboardCacheProvider } from "@/app/components/DashboardCacheProvider";

export default function DashboardRepoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader owner={owner} repo={repo} />
      <DashboardCacheProvider>
        <main className="pt-16 md:pt-20">{children}</main>
      </DashboardCacheProvider>
    </div>
  );
}
