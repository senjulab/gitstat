"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { HugeiconsIcon } from "@hugeicons/react";
import { QuillWrite01Icon } from "@hugeicons/core-free-icons";

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-32 md:pt-44 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-4xl font-medium  text-[#181925] mb-4 tracking-tight">
              Blog
            </h1>
            <p className="text-base text-[#666] font-normal">
              Latest news and updates from GitStat
            </p>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#f5f5f5] flex items-center justify-center mb-6">
              <HugeiconsIcon icon={QuillWrite01Icon} />
            </div>
            <h2 className="text-xl font-medium text-[#181925] mb-2">
              No posts yet
            </h2>
            <p className="text-sm text-[#666] max-w-md text-center">
              We're working on bringing you the latest updates and insights.
              Check back soon!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
