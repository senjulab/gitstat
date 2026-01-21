"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CursorMagicSelection04Icon, FallingStarIcon, User03Icon, Bug02Icon, Settings01Icon } from "@hugeicons/core-free-icons";

const sidebarItems = [
  { id: "traffic", label: "Traffic", icon: CursorMagicSelection04Icon, href: "/dashboard/traffic" },
  { id: "stars", label: "Stars", icon: FallingStarIcon, href: "/dashboard/stars" },
  { id: "contributors", label: "Contributors", icon: User03Icon, href: "/dashboard/contributors" },
  { id: "issues", label: "Issues & PRs", icon: Bug02Icon, href: "/dashboard/issues" },
  { id: "settings", label: "Settings", icon: Settings01Icon, href: "/dashboard/settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-40 shrink-0">
      <ul className="space-y-0">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`w-full flex items-center cursor-pointer gap-2 px-3 py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#181925]"
                    : "text-[#999] hover:text-[#666]"
                }`}
              >
                <HugeiconsIcon icon={item.icon} size={16} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
