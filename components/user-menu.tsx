"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Settings,
  BookOpen,
  FileText,
  MessageCircle,
  Globe,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  avatarUrl?: string;
  userName?: string;
  userEmail?: string;
  avatarFallback?: string;
}

export function UserMenu({
  avatarUrl,
  userName = "User",
  userEmail = "",
  avatarFallback = "U",
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        <Avatar className="w-[30px] h-[30px]">
          <AvatarImage src={avatarUrl} alt="User avatar" />
          <AvatarFallback className="text-sm bg-[#f3f3f3] text-[#666]">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </button>

      {/* User Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-lg shadow-sm border border-[#f0f0f0] tracking-tight p-2 z-50">
          {/* User Info */}
          <div className="flex items-center gap-2 mb-2 px-2 py-1">
            <Avatar className="w-[30px] h-[30px]">
              <AvatarImage src={avatarUrl} alt="User avatar" />
              <AvatarFallback className="text-sm bg-[#c8d96f] text-white">
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#181925] truncate">
                {userName}
              </p>
              <p className="text-xs text-[#999] truncate">{userEmail}</p>
            </div>
          </div>

          {/* Account */}
          <Link
            href="/dashboard/settings"
            onClick={() => setIsOpen(false)}
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
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
          >
            Docs
            <BookOpen className="w-[16px] h-[16px] text-[#999]" />
          </Link>
          <Link
            href="/blog"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
          >
            Blog
            <FileText className="w-[16px] h-[16px] text-[#999]" />
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
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
            onClick={() => setIsOpen(false)}
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
  );
}
