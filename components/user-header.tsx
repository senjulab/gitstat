"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  BookOpen,
  FileText,
  MessageCircle,
  Globe,
  LogOut,
  Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UserHeader() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [initials, setInitials] = useState("?");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);

        // Get display name
        const fullName = currentUser.user_metadata?.full_name;
        const emailUsername = currentUser.email?.split("@")[0] || "";
        const name = fullName || emailUsername;
        setDisplayName(name);

        // Get initials
        const firstLetter = name.charAt(0).toUpperCase();
        setInitials(firstLetter);

        // Get avatar URL
        const avatar = currentUser.user_metadata?.avatar_url;
        if (avatar) {
          setAvatarUrl(avatar);
        }
      }
    };

    fetchUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name;
        const emailUsername = session.user.email?.split("@")[0] || "";
        const name = fullName || emailUsername;
        setDisplayName(name);
        setInitials(name.charAt(0).toUpperCase());
        setAvatarUrl(session.user.user_metadata?.avatar_url || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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
    <header className="w-full">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo - Simple Circle */}
          <Link
            href="/"
            className="w-8 h-8 bg-black rounded-full flex items-center justify-center"
          >
            <div className="w-4 h-4 border-2 border-white rounded-full"></div>
          </Link>

          {/* User Avatar with Dropdown */}
          <div className="flex items-center gap-4 relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="cursor-pointer"
            >
              <Avatar className="w-[30px] h-[30px]">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback className="text-sm bg-[#f3f3f3] text-[#666]">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-lg shadow-sm border border-[#f0f0f0] tracking-tight p-2 z-50">
                {/* User Info */}
                <div className="flex items-center gap-2 mb-2 px-2 py-1">
                  <Avatar className="w-[30px] h-[30px]">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-sm bg-[#c8d96f] text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#181925] truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-[#999] truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Account */}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                >
                  Account
                  <Settings className="w-[16px] h-[16px] text-[#999]" />
                </Link>

                {/* Divider */}
                <div className="border-t border-[#f0f0f0] my-1 mx-1" />

                {/* Links */}
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

                {/* Divider */}
                <div className="border-t border-[#f0f0f0] my-1 mx-1" />

                {/* Bottom Links */}
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
      </div>
    </header>
  );
}
