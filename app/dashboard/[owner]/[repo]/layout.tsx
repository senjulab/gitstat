"use client";

import { useParams } from "next/navigation";
import { DashboardHeader } from "@/app/components/DashboardHeader";

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
      <main className="pt-20">{children}</main>
    </div>
  );
}
