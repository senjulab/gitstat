"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Logo = () => (
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
);

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navLinks = (
    <>
      <Link href="#features" onClick={() => setMobileMenuOpen(false)}>
        <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
          Features
        </span>
      </Link>
      <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>
        <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
          Pricing
        </span>
      </Link>
      <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
        <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
          Blog
        </span>
      </Link>
      <Link
        href="https://bags.fm/CBEPWiQ35jiuW1jZEYH1U98c39ixRz2qD3dQT41WBAGS"
        target="_blank"
        onClick={() => setMobileMenuOpen(false)}
      >
        <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
          Support Dev
        </span>
      </Link>
    </>
  );

  const authLinks = isLoggedIn ? (
    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
      <button className="bg-[#F81DE5] hover:bg-[#e01ad1] transition-colors duration-200 cursor-pointer text-white text-sm px-4 py-1.5 rounded-full font-medium">
        Dashboard
      </button>
    </Link>
  ) : (
    <>
      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
        <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
          Login
        </span>
      </Link>
      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
        <button className="bg-[#F81DE5] hover:bg-[#e01ad1] transition-colors duration-200 cursor-pointer text-white text-sm px-4 py-1.5 rounded-full font-medium">
          Register
        </button>
      </Link>
    </>
  );

  return (
    <>
      {/* Mobile: top bar + hamburger */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#14141f] z-[99] flex items-center justify-between px-4 md:hidden tracking-tight">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -mr-2 text-[#eaeaeb] hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile: slide-in drawer */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent
          showCloseButton={true}
          className="fixed top-0 right-0 left-auto bottom-0 h-full w-full max-w-[min(280px,100vw-2rem)] rounded-l-2xl rounded-r-none border-0 border-l border-[#2a2a35] shadow-xl flex flex-col pt-14 pb-6 px-6 bg-[#14141f] [&_[data-slot=dialog-close]]:text-[#eaeaeb] !top-0 !left-auto !translate-x-0 !translate-y-0 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right"
        >
          <nav className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">{navLinks}</div>
            <div className="flex flex-col gap-4 pt-2 border-t border-[#2a2a35]">
              {authLinks}
            </div>
          </nav>
        </DialogContent>
      </Dialog>

      {/* Desktop: floating pill */}
      <header
        className={`dark fixed top-8 left-1/2 -translate-x-1/2 z-[99] ${
          isLoggedIn ? "w-[440px]" : "w-[480px]"
        } bg-[#14141f] backdrop-blur-lg rounded-[24px] overflow-hidden shadow-xl hidden md:block tracking-tight`}
      >
        <nav>
          <div className="flex items-center justify-between h-[52px] pl-3 pr-2 gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="mr-2">
                <Logo />
              </Link>
              {navLinks}
            </div>
            <div className="flex items-center gap-2">{authLinks}</div>
          </div>
        </nav>
      </header>
    </>
  );
}
