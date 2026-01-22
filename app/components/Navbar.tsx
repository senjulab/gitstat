"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <header className="dark fixed top-8 left-1/2 -translate-x-1/2 z-[99] w-[400px] bg-[#14141f] backdrop-blur-lg rounded-[24px] overflow-hidden shadow-xl hidden md:block tracking-tight">
      <nav>
        <div className="flex items-center justify-between h-[52px] pl-4 pr-3">
          <div className="flex items-center gap-4">
            {/* Logo for dark navbar */}
            <Link href="/" className="mr-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 500 500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="250" cy="250" r="250" fill="#EAEAEB" />
                <path
                  d="M357.544 347.827C284.649 428.558 177.299 450.429 117.77 396.678C58.2411 342.927 69.0762 233.909 141.971 153.178C214.865 72.4477 322.216 50.5762 381.745 104.327C441.273 158.078 430.438 267.096 357.544 347.827Z"
                  fill="#191A26"
                />
              </svg>
            </Link>
            <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
              Features
            </span>
            <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
              Why
            </span>
            <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
              Blog
            </span>
            <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
              Docs
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <button className="bg-[#9580ff] hover:opacity-90 transition-colors duration-200 cursor-pointer text-white text-sm px-4 py-1.5 rounded-full font-medium">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
                    Login
                  </span>
                </Link>
                <Link href="/register">
                  <button className="bg-[#9580ff] hover:opacity-90 transition-colors duration-200 cursor-pointer text-white text-sm px-4 py-1.5 rounded-full font-medium">
                    Register
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
