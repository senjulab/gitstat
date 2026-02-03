import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { CopyableCA } from "@/app/components/CopyableCA";

export const metadata = {
  title:
    "GitStat Roadmap: The Path to Decentralized Intelligence | GitStat Blog",
  description:
    "We're building the ultimate developer analytics platform. Here's what we've shipped, what's coming, and how $GT holders get exclusive access to the future.",
  openGraph: {
    images: ["/roadmap.png"],
  },
};

const p = "text-base text-[#666666] leading-snug tracking-tight mt-4 mb-5";
const h2 = "text-xl font-medium text-[#1a1a1a] tracking-tight mt-16 mb-4";
const h3 = "text-lg font-medium text-[#1a1a1a] tracking-tight mt-8 mb-3";
const status_built =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2";
const status_progress =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2";
const status_future =
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-2";

export default function RoadmapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-32 md:pt-44 pb-16">
        <article className="max-w-[40rem] mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-[#666666] hover:text-[#181925] mb-8 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to blog
          </Link>

          <header className="mb-10">
            <time className="text-sm text-[#666666] font-normal">
              2026-02-03
            </time>
            <h1 className="text-3xl md:text-4xl font-medium text-[#1a1a1a] tracking-tight mt-2 mb-8">
              Protocol Roadmap: Building the Future of Git Analytics
            </h1>
            <div className="w-full aspect-[1200/630] bg-[#F5F5F7] rounded-xl overflow-hidden border border-[#00000008]">
              <img
                src="/roadmap.png"
                alt="GitStat Roadmap"
                className="w-full h-full object-cover scale-105"
              />
            </div>
          </header>

          <p className={p}>
            We don't build in the dark. We ship code, we iterate, and we deliver
            value.
          </p>
          <p className={p}>
            GitStat isn't just a dashboard; it's becoming a protocol for
            understanding open-source growth. Our mission is to give every
            maintainer and developer the "God Mode" view of their ecosystem.
          </p>
          <p className={p}>Here is the state of the protocol.</p>

          <h2 className={h2}>Phase 1: The Foundation</h2>
          <p className={p}>
            <span className={status_built}>DEPLOYED</span>
            The core infrastructure is live. We've built the "God Mode"
            dashboard that GitHub should have given you.
          </p>

          <ul className="space-y-4 mt-6 mb-8">
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <div>
                <strong className="block text-[#1a1a1a] font-medium">
                  Traffic Intelligence
                </strong>
                <p className="text-[#666666] text-sm leading-relaxed">
                  Real-time view of clones, unique visitors, and total views.
                  aggregated and visualized.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <div>
                <strong className="block text-[#1a1a1a] font-medium">
                  Deep Star Analytics
                </strong>
                <p className="text-[#666666] text-sm leading-relaxed">
                  Not just a count. See your full star history visualized.
                  Identify viral moments instantly.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <div>
                <strong className="block text-[#1a1a1a] font-medium">
                  Contributor X-Ray
                </strong>
                <p className="text-[#666666] text-sm leading-relaxed">
                  See exactly who is shipping. We visualize additions/deletions
                  per user and track the latest commit activity. No more
                  guessing who the MVPs are.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <div>
                <strong className="block text-[#1a1a1a] font-medium">
                  Issues & PRs Command Center
                </strong>
                <p className="text-[#666666] text-sm leading-relaxed">
                  Clean, filterable lists with clear labels. Visualized activity
                  charts to track velocity and bottlenecks.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <div>
                <strong className="block text-[#1a1a1a] font-medium">
                  Custom Repo Identity
                </strong>
                <p className="text-[#666666] text-sm leading-relaxed">
                  Rename your repositories within GitStat. Your dashboard, your
                  organization.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <div>
                <strong className="block text-[#1a1a1a] font-medium">
                  Viral Social Sharing
                </strong>
                <p className="text-[#666666] text-sm leading-relaxed">
                  Generate beautiful, Twitter-ready images of your stats.
                  One-click flex.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-3 mt-1 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <div>
                <strong className="block text-[#1a1a1a] font-medium">
                  Unlimited Multi-Project
                </strong>
                <p className="text-[#666666] text-sm leading-relaxed">
                  Add as many projects as you want. Aggregated stats for your
                  entire portfolio.
                </p>
              </div>
            </li>
          </ul>

          <h2 className={h2}>Phase 2: Expansion</h2>
          <p className={p}>
            <span className={status_progress}>IN PROGRESS</span>
            We are currently building the referral and long-term data layers.
          </p>

          <h3 className={h3}>Referring Sites Intelligence</h3>
          <p className={p}>
            Know exactly where your traffic is coming from. Twitter? Hacker
            News? Reddit? distinct breakdowns to optimize your growth sources.
          </p>

          <h3 className={h3}>Extended Data Retention (90 Days+)</h3>
          <p className={p}>
            We're breaking the 14-day GitHub limit. We are building the storage
            layer to retain your traffic and star data for 90 days and beyond.
          </p>

          <h2 className={h2}>Phase 3: The Ecosystem & $GT</h2>

          <p className={p}>
            <span className={status_future}>UPCOMING</span>
            This is where things get interesting. We are significantly upgrading
            the utility for <strong>$GT</strong> holders.
          </p>

          <CopyableCA ca="9eQztaT2F3fs3R8m4V9dYgG4BNDuAj7h9d5Die97pump" />

          <p className={p}>
            Holding $GT is not just about governance; it's a pass to an
            exclusive tier of service.
          </p>

          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-6 mt-6">
            <h4 className="text-[#1a1a1a] font-medium mb-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
              Token Utility
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start">
                <div className="flex-1">
                  <strong className="text-[#1a1a1a] text-sm font-medium">
                    24/7 Developer Concierge
                  </strong>
                  <p className="text-[#666666] text-sm mt-1 leading-relaxed">
                    Holders of{" "}
                    <code className="text-purple-600 bg-purple-50 px-1 rounded">
                      100,000 $GT
                    </code>{" "}
                    gain access to a private, token-gated support channel.
                    Direct line to the founders. 24/7 instant response. No
                    tickets, just solutions.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-1">
                  <strong className="text-[#1a1a1a] text-sm font-medium">
                    Priority Feature Requests
                  </strong>
                  <p className="text-[#666666] text-sm mt-1 leading-relaxed">
                    Don't wait for the roadmap. Influence it. Token holders can
                    propose and vote on new integrations. If you hold, you build
                    with us.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-1">
                  <strong className="text-[#1a1a1a] text-sm font-medium">
                    Private Alpha Access
                  </strong>
                  <p className="text-[#666666] text-sm mt-1 leading-relaxed">
                    Be the first to use new tools before they go public. Test
                    our predictive AI models and market sentiment analysis tools
                    before anyone else.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <p className={p}>
            The future of analytics is decentralized, owned by the users, and
            powered by $GT.
          </p>
          <p className={p}>Join us.</p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
