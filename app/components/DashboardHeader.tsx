"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Plus,
  Settings,
  BookOpen,
  FileText,
  MessageCircle,
  Globe,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

interface DashboardHeaderProps {
  owner: string;
  repo: string;
}

export function DashboardHeader({ owner, repo }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [connectedRepos, setConnectedRepos] = useState<
    { owner: string; name: string }[]
  >([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setUserName(
          user.user_metadata?.user_name || user.email?.split("@")[0] || "User",
        );
        setUserAvatar(user.user_metadata?.avatar_url || "");

        const { data: repos } = await supabase
          .from("connected_repositories")
          .select("repo_owner, repo_name")
          .eq("user_id", user.id);

        if (repos) {
          setConnectedRepos(
            repos.map((r) => ({ owner: r.repo_owner, name: r.repo_name })),
          );
        }
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white z-50">
      <div className="h-full max-w-3xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${owner}/${repo}`}
            className="flex items-center"
          >
            <Logo size={32} />
          </Link>

          <div className="w-px h-6 bg-[#e5e5e5]" />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors"
            >
              <img
                src={`https://github.com/${owner}.png?size=40`}
                alt={owner}
                className="w-5 h-5 rounded"
              />
              <span className="text-sm font-medium text-[#333]">{repo}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#999] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-[220px] bg-white rounded-lg shadow-sm border border-[#f0f0f0] tracking-tight p-2">
                <div className="pb-1">
                  <p className="text-sm font-medium text-[#999] px-3 py-1">
                    Projects
                  </p>
                </div>
                {connectedRepos.map((r) => (
                  <Link
                    key={`${r.owner}/${r.name}`}
                    href={`/dashboard/${r.owner}/${r.name}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className={`w-full flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      r.owner === owner && r.name === repo
                        ? "text-[#181925] bg-[#f5f5f5]"
                        : "text-[#181925] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {r.name}
                  </Link>
                ))}

                <div className="border-t border-[#f0f0f0] my-2 mx-1" />

                <Link
                  href="/onboard/connect"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#181925] cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                >
                  <Plus className="w-[16px] h-[16px] text-[#999]" />
                  Add project
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="cursor-pointer"
          >
            <Avatar className="w-[30px] h-[30px]">
              {userAvatar && <AvatarImage src={userAvatar} alt="User avatar" />}
              <AvatarFallback className="text-sm bg-[#f0f0f0] text-[#666]">
                {userName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-lg shadow-sm border border-[#f0f0f0] tracking-tight p-2">
              <div className="flex items-center gap-2 mb-2 px-2">
                <Avatar className="w-[30px] h-[30px]">
                  {userAvatar && (
                    <AvatarImage src={userAvatar} alt="User avatar" />
                  )}
                  <AvatarFallback className="text-sm bg-[#c8d96f] text-white">
                    {userName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#181925]">
                    {userName}
                  </p>
                  <p className="text-xs text-[#999]">{userEmail}</p>
                </div>
              </div>

              <Link
                href={`/dashboard/${owner}/${repo}/settings`}
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                Account
                <Settings className="w-[16px] h-[16px] text-[#999]" />
              </Link>

              <div className="border-t border-[#f0f0f0] my-1 -mx-2" />

              <Link
                href="/docs"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                Docs
                <BookOpen className="w-[16px] h-[16px] text-[#999]" />
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                Blog
                <FileText className="w-[16px] h-[16px] text-[#999]" />
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                Contact
                <MessageCircle className="w-[16px] h-[16px] text-[#999]" />
              </Link>

              <div className="border-t border-[#f0f0f0] my-1 -mx-2" />

              <Link
                href="/"
                onClick={() => setIsUserMenuOpen(false)}
                className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-md text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                Homepage
                <Globe className="w-[16px] h-[16px] text-[#999]" />
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-md text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
              >
                Log out
                <LogOut className="w-[16px] h-[16px] text-[#999]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
