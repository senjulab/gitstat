"use client";

import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { Logo } from "@/components/logo";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";

type FeatureStatus = "check" | "cross" | "coming" | "basic" | "limited";

interface Feature {
  name: string;
  description?: string;
  gitstat: FeatureStatus;
  github: FeatureStatus;
}

const features: Feature[] = [
  {
    name: "Multi-repo analytics",
    description: "Track multiple repositories in one dashboard.",
    gitstat: "check",
    github: "cross",
  },
  {
    name: "Realtime updates",
    description: "See changes as they happen.",
    gitstat: "check",
    github: "cross",
  },
  {
    name: "Stars growth tracking",
    description: "Monitor your repository's star history over time.",
    gitstat: "check",
    github: "check",
  },
  {
    name: "Traffic & clones data",
    description: "View traffic sources and clone statistics.",
    gitstat: "check",
    github: "check",
  },
  {
    name: "Referrers & popular content",
    description: "See where your traffic comes from.",
    gitstat: "coming",
    github: "cross",
  },
  {
    name: "Contributor analytics",
    description: "Detailed insights into contributor activity.",
    gitstat: "check",
    github: "basic",
  },
  {
    name: "PRs & Issues insights",
    description: "Track pull requests and issues trends.",
    gitstat: "check",
    github: "limited",
  },
  {
    name: "Public shareable dashboards",
    description: "Share your dashboard publicly with a single toggle.",
    gitstat: "check",
    github: "cross",
  },
  {
    name: "Export CSV",
    description: "Export your data in CSV format.",
    gitstat: "check",
    github: "check",
  },
  {
    name: "Team invites & roles",
    description: "Invite team members and manage roles.",
    gitstat: "coming",
    github: "cross",
  },
  {
    name: "Weekly email reports",
    description: "Get weekly summaries delivered to your inbox.",
    gitstat: "coming",
    github: "cross",
  },
];

function StatusCell({ status }: { status: FeatureStatus }) {
  switch (status) {
    case "check":
      return (
        <HugeiconsIcon
          icon={CheckmarkCircle01Icon}
          className="text-green-500 mx-auto"
          size={20}
        />
      );
    case "cross":
      return (
        <HugeiconsIcon
          icon={CancelCircleIcon}
          className="text-red-400 mx-auto"
          size={20}
        />
      );
    case "coming":
      return (
        <span className="text-[#181925] text-sm font-medium">Coming soon</span>
      );
    case "basic":
      return (
        <span className="text-[#999] text-sm">Basic only</span>
      );
    case "limited":
      return (
        <span className="text-[#999] text-sm">Limited</span>
      );
    default:
      return null;
  }
}

function GitHubLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 98 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
        fill="#24292f"
      />
    </svg>
  );
}

export default function GitHubInsightsComparisonPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white tracking-tight">
      <Navbar />

      <main className="flex-1 pt-32 md:pt-44 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-4xl font-medium text-[#181925] mb-4 tracking-tight">
              GitStat vs GitHub Insights
            </h1>
            <p className="text-base text-[#666] font-normal max-w-md mx-auto">
              Same respect for your data. GitStat adds realtime updates, multi-repo tracking, and shareable dashboards.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div className="min-w-[420px]">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_120px] border-b border-[#e5e5e5]">
              <div className="p-4"></div>
              <div className="p-4 flex items-center justify-center bg-[#fafafa]">
                <Logo size={32} variant="dark" />
              </div>
              <div className="p-4 flex items-center justify-center">
                <GitHubLogo size={32} />
              </div>
            </div>

            {/* Feature Rows */}
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className={`grid grid-cols-[1fr_120px_120px] ${
                  index !== features.length - 1 ? "border-b border-[#e5e5e5]" : ""
                }`}
              >
                <div className="p-4">
                  <p className="text-sm font-medium text-[#181925]">
                    {feature.name}
                  </p>
                  {feature.description && (
                    <p className="text-sm text-[#999] mt-0.5">
                      {feature.description}
                    </p>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center bg-[#fafafa]">
                  <StatusCell status={feature.gitstat} />
                </div>
                <div className="p-4 flex items-center justify-center">
                  <StatusCell status={feature.github} />
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
