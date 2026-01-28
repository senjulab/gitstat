"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import UserHeader from "@/components/user-header";

export default function ContactPage() {
  const [countdown, setCountdown] = useState(3);
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
  }, [supabase]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      window.location.href = "https://x.com/gitstatdev";
    }, 3000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, []);

  return (
    <>
      <div className="absolute top-0 w-full">
        <UserHeader />
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 tracking-tight bg-[#fafafa]">
        <div className="w-full max-w-sm space-y-8 text-center">
          {/* Logo or Icon */}
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-black/10">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-current"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-medium text-[#181925]">
              Contact Support
            </h1>
            <p className="text-[#666] text-sm leading-relaxed">
              We provide support via X (formerly Twitter).
              <br />
              Redirecting you in {countdown} seconds...
            </p>
          </div>

          <div className="pt-2">
            <Button
              className="w-full h-12 bg-black hover:bg-[#F81DE5] text-white rounded-xl text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#F81DE5]/20 flex items-center justify-center gap-2 group"
              onClick={() =>
                (window.location.href = "https://x.com/gitstatdev")
              }
            >
              Open @gitstatdev
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-xs text-[#999]">Questions? DMs are open.</p>
        </div>
      </div>
    </>
  );
}
