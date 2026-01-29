"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CursorMagicSelection04Icon,
  FallingStarIcon,
  User03Icon,
  Bug02Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

export function DashboardSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [isOwner, setIsOwner] = useState(true); // Default to true to prevent flickering for owners, will correct quickly
  const supabase = createClient();

  useEffect(() => {
    const checkOwnership = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsOwner(false);
        return;
      }

      const { data } = await supabase
        .from("connected_repositories")
        .select("id")
        .eq("user_id", user.id)
        .eq("repo_owner", owner)
        .eq("repo_name", repo)
        .single();

      setIsOwner(!!data);
    };
    checkOwnership();
  }, [owner, repo, supabase]);

  const sidebarItems = [
    {
      id: "traffic",
      label: "Traffic",
      icon: CursorMagicSelection04Icon,
      href: `/dashboard/${owner}/${repo}/traffic`,
    },
    {
      id: "stars",
      label: "Stars",
      icon: FallingStarIcon,
      href: `/dashboard/${owner}/${repo}/stars`,
    },
    {
      id: "contributors",
      label: "Contributors",
      icon: User03Icon,
      href: `/dashboard/${owner}/${repo}/contributors`,
    },
    {
      id: "issues",
      label: "Issues & PRs",
      icon: Bug02Icon,
      href: `/dashboard/${owner}/${repo}/issues`,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings01Icon,
      href: `/dashboard/${owner}/${repo}/settings`,
    },
  ].filter((item) => isOwner || item.id !== "settings");

  const linkClass = (isActive: boolean) =>
    `flex items-center cursor-pointer gap-2 px-3 py-1 text-sm font-medium transition-colors ${
      isActive ? "text-[#181925]" : "text-[#999] hover:text-[#666]"
    }`;

  return (
    <>
      {/* Mobile: horizontal scrollable tabs */}
      <nav className="md:hidden shrink-0 overflow-x-auto scrollbar-hide pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#e5e5e5]">
        <div className="flex gap-1 min-w-min">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`${linkClass(isActive)} shrink-0 rounded-lg py-2 ${
                  isActive ? "bg-[#f5f5f5]" : "hover:bg-[#fafafa]"
                }`}
              >
                <HugeiconsIcon icon={item.icon} size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: vertical sidebar */}
      <nav className="hidden md:block w-40 shrink-0">
        <ul className="space-y-0">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.id}>
                <Link href={item.href} className={linkClass(isActive)}>
                  <HugeiconsIcon icon={item.icon} size={16} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
