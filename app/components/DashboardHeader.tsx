"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ChevronDown,
  Plus,
  Settings,
  BookOpen,
  FileText,
  MessageCircle,
  Globe,
  LogOut,
  X,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

interface DashboardHeaderProps {
  owner: string;
  repo: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  default_branch: string;
  private: boolean;
}

export function DashboardHeader({ owner, repo }: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [connectedRepos, setConnectedRepos] = useState<
    { owner: string; name: string }[]
  >([]);
  const [availableRepos, setAvailableRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [addingRepo, setAddingRepo] = useState(false);
  const [hasGitHubToken, setHasGitHubToken] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const supabase = createClient();

  const getCurrentSubRoute = () => {
    const parts = pathname.split("/");
    if (parts.length > 4) {
      return "/" + parts.slice(4).join("/");
    }
    return "";
  };

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

  useEffect(() => {
    if (searchParams.get("openAddModal") === "true") {
      openAddModal();
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const openAddModal = async () => {
    setIsDropdownOpen(false);
    setIsAddModalOpen(true);
    setSelectedRepo(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.provider_token) {
      setHasGitHubToken(true);
      fetchRepositories(session.provider_token);
    } else {
      setHasGitHubToken(false);
    }
  };

  const handleConnectGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(window.location.pathname)}`,
        scopes: "read:user user:email read:org repo",
      },
    });

    if (error) {
      console.error("GitHub OAuth error:", error);
    }
  };

  const fetchRepositories = async (accessToken: string) => {
    setFetchingRepos(true);

    try {
      const response = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch repositories");

      const repos: Repository[] = await response.json();
      const connectedIds = new Set(
        connectedRepos.map((r) => `${r.owner}/${r.name}`),
      );
      const filtered = repos.filter(
        (r) => !connectedIds.has(`${r.owner.login}/${r.name}`),
      );
      setAvailableRepos(filtered);
    } catch (err) {
      console.error("Failed to fetch repositories:", err);
    } finally {
      setFetchingRepos(false);
    }
  };

  const handleAddProject = async () => {
    if (!selectedRepo) return;

    setAddingRepo(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("connected_repositories").insert({
        user_id: user.id,
        github_repo_id: selectedRepo.id,
        repo_name: selectedRepo.name,
        repo_full_name: selectedRepo.full_name,
        repo_owner: selectedRepo.owner.login,
        is_organization: selectedRepo.owner.type === "Organization",
        default_branch: selectedRepo.default_branch || "main",
      });

      if (error) throw error;

      setConnectedRepos([
        ...connectedRepos,
        { owner: selectedRepo.owner.login, name: selectedRepo.name },
      ]);
      setIsAddModalOpen(false);
      router.push(
        `/dashboard/${selectedRepo.owner.login}/${selectedRepo.name}`,
      );
    } catch (err: any) {
      console.error("Failed to add repository:", err);
    } finally {
      setAddingRepo(false);
    }
  };

  return (
    <>
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
                      href={`/dashboard/${r.owner}/${r.name}${getCurrentSubRoute()}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className={`w-full flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        r.owner === owner && r.name === repo
                          ? "text-[#181925] bg-[#f5f5f5]"
                          : "text-[#181925] hover:bg-[#f5f5f5]"
                      }`}
                    >
                      <img
                        src={`https://github.com/${r.owner}.png?size=40`}
                        alt={r.owner}
                        className="w-4 h-4 rounded"
                      />
                      {r.name}
                    </Link>
                  ))}

                  <div className="border-t border-[#f0f0f0] my-2 mx-1" />

                  <button
                    onClick={openAddModal}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#181925] cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                  >
                    <Plus className="w-[16px] h-[16px] text-[#999]" />
                    Add project
                  </button>
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
                {userAvatar && (
                  <AvatarImage src={userAvatar} alt="User avatar" />
                )}
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

                {/* we dont need it for now */}

                {/* <Link
                  href="/docs"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                >
                  Docs
                  <BookOpen className="w-[16px] h-[16px] text-[#999]" />
                </Link> */}
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

      {isAddModalOpen && (
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent
            className="sm:max-w-md tracking-tight rounded-lg"
            showCloseButton={false}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-medium text-[#181925]">
                Add project
              </DialogTitle>
              <DialogDescription className="text-sm text-[#666]">
                Select a repository to add to your dashboard.
              </DialogDescription>
            </DialogHeader>

            {!hasGitHubToken ? (
              <div className="text-center py-6">
                <p className="text-sm text-[#666] mb-4">
                  Connect your GitHub account to see your repositories.
                </p>
                <Button
                  onClick={handleConnectGitHub}
                  className="cursor-pointer select-none h-10 px-6 text-sm rounded-full font-medium bg-[#181925] hover:bg-[#2a2b3a] text-white transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Connect GitHub
                </Button>
              </div>
            ) : fetchingRepos ? (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 animate-spin text-[#999] mx-auto mb-4" />
                <p className="text-sm text-[#666]">Loading repositories...</p>
              </div>
            ) : availableRepos.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-[#666] mb-4">
                  No new repositories available to add.
                </p>
                <Button
                  onClick={handleConnectGitHub}
                  className="cursor-pointer select-none h-10 px-4 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200"
                >
                  Refresh repositories
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                  {availableRepos.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRepo(r)}
                      className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer ${
                        selectedRepo?.id === r.id
                          ? "bg-[#f5f3ff] border-2 border-[#918df6]"
                          : "bg-[#fafafa] border-2 border-transparent hover:border-[#e0e0e0]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://github.com/${r.owner.login}.png?size=40`}
                          alt={r.owner.login}
                          className="w-6 h-6 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-[#181925] block truncate">
                            {r.full_name}
                          </span>
                          <div className="flex gap-1.5 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#f0f0f0] text-[#666]">
                              {r.private ? "Private" : "Public"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    onClick={() => setIsAddModalOpen(false)}
                    className="cursor-pointer select-none h-10 px-4 text-sm rounded-full font-medium bg-white hover:bg-white text-[#181925] border border-[#e0e0e0] hover:border-[#b3b3b3] active:bg-[#f5f5f5] active:scale-[0.99] transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProject}
                    disabled={!selectedRepo || addingRepo}
                    className="cursor-pointer select-none h-10 px-6 text-sm rounded-full font-medium bg-[#181925] hover:bg-[#2a2b3a] text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingRepo ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add project"
                    )}
                  </Button>
                </div>

                <button
                  onClick={handleConnectGitHub}
                  className="w-full text-center text-xs text-[#999] hover:text-[#666] transition-colors cursor-pointer pt-1"
                >
                  Refresh repositories
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
