"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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

export function DashboardHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
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

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white z-50">
      <div className="h-full max-w-3xl mx-auto px-6 flex items-center justify-between">
        {/* Left side - Logo and project selector */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Logo size={32} />
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-[#e5e5e5]" />

          {/* Project Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors"
            >
              <div className="w-5 h-5 rounded bg-[#f0f0f0]" />
              <span className="text-sm font-medium text-[#333]">salim</span>
              <ChevronDown
                className={`w-4 h-4 text-[#999] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-[220px] bg-white rounded-lg shadow-sm border border-[#f0f0f0] tracking-tight p-2">
                {/* Projects Section */}
                <div className="pb-1">
                  <p className="text-sm font-medium text-[#999] px-3 py-1">
                    Projects
                  </p>
                </div>
                <button
                  className="w-full flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#181925] hover:bg-[#f5f5f5] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  salim
                </button>

                {/* Divider */}
                <div className="border-t border-[#f0f0f0] my-2 mx-1" />

                {/* Create Project */}
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#181925] cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Plus className="w-[16px] h-[16px] text-[#999]" />
                  Create project
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
              <AvatarImage src="/avatars/01.png" alt="User avatar" />
              <AvatarFallback className="text-sm">JD</AvatarFallback>
            </Avatar>
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-[240px] bg-white rounded-lg shadow-sm border border-[#f0f0f0] tracking-tight p-2">
              {/* User Info */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-[30px] h-[30px] rounded-full bg-[#c8d96f] flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white rotate-45" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#181925]">
                    rsalimdev
                  </p>
                  <p className="text-xs text-[#999]">rsalim.pro@gmail.com</p>
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
              <div className="border-t border-[#f0f0f0] my-1 -mx-2" />

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
              <div className="border-t border-[#f0f0f0] my-1 -mx-2" />

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
                onClick={() => setIsUserMenuOpen(false)}
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
