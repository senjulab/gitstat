import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Why We Built GitStat | GitStat Blog",
  description:
    "GitHub Insights is fine. But 14 days of traffic data and no star history wasn't cutting it. So we built something better with Bun, Next.js, Supabase, and the GitHub API.",
};

const p = "text-base text-[#666666] leading-snug mt-4 mb-5";
const h2 = "text-xl font-medium text-[#1a1a1a] mt-16 mb-4";
const h3 = "text-lg font-medium text-[#1a1a1a] mt-8 mb-3";

export default function WhyWeBuiltGitStat() {
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
            <time className="text-sm text-[#666666] font-normal">2026-01-24</time>
            <h1 className="text-3xl md:text-4xl font-medium text-[#1a1a1a] mt-2">
              Why We Built GitStat
            </h1>
          </header>

          <p className={p}>
            If you maintain open source projects, you've probably clicked on the
            "Insights" tab more times than you can count.
          </p>
          <p className={p}>And every time, you hit the same walls.</p>
          <p className={p}>
            Traffic data disappears after 14 days. Star history is just a number,
            not a graph. Viewing multiple repos means opening multiple tabs.
            Exporting data usually means copy-pasting from a table.
          </p>
          <p className={p}>
            GitHub Insights works, but it's not built for people who want to
            seriously track their project's growth.
          </p>
          <p className={p}>So we built GitStat.</p>

          <h2 className={h2}>What we wanted</h2>
          <p className={p}>We wanted something simple but powerful.</p>
          <p className={p}>
            We needed to see star growth over time, not just a total count. We
            wanted to keep traffic data longer than two weeks. We wanted to
            compare multiple repos side-by-side without browser tab chaos.
          </p>
          <p className={p}>
            And we wanted to export charts for tweets and READMEs, or get raw
            CSV data for our own analysis.
          </p>
          <p className={p}>
            None of this should require an enterprise plan or a sales call.
          </p>

          <h2 className={h2}>The Stack</h2>
          <p className={p}>
            We chose a stack that lets us move fast and avoid configuration
            hell.
          </p>

          <h3 className={h3}>Bun for speed</h3>
          <p className={p}>
            We use Bun for package management and our dev server. It turned "go
            make a coffee" install times into "already done."
          </p>
          <p className={p}>
            Native TypeScript support means no transpilation steps during
            development. It just works.
          </p>

          <h3 className={h3}>Next.js 16 for the frontend</h3>
          <p className={p}>We're using the App Router with React 19.</p>
          <p className={p}>
            Server components handle static pages like this blog. Client
            components handle the interactive dashboard charts.
          </p>
          <p className={p}>
            File-based routing makes adding new pages as simple as creating a
            folder. No webpack config, no babel plugins. The defaults are solid.
          </p>

          <h3 className={h3}>Supabase for auth</h3>
          <p className={p}>
            We didn't want to build auth from scratch. Supabase gave us GitHub
            OAuth out of the box.
          </p>
          <p className={p}>
            Users sign in with GitHub, we get an access token, and that's it. We
            use a simple Postgres table to store your connected repositories. No
            complex schema, no ORM headaches.
          </p>

          <h3 className={h3}>GitHub API for data</h3>
          <p className={p}>
            Everything else comes straight from GitHub's REST API via Octokit.
          </p>
          <p className={p}>
            Stars, traffic, contributors, issues, and PRs—we fetch it all
            directly using your GitHub token.
          </p>
          <p className={p}>
            This means we don't hit rate limits on our end. Your token, your
            limits. And you aren't trusting us with cached data that might be
            stale.
          </p>

          <h2 className={h2}>Technical decisions</h2>

          <h3 className={h3}>Client-side fetching</h3>
          <p className={p}>Most data fetching happens right in your browser.</p>
          <p className={p}>
            When you load the stars page, your browser hits GitHub's API
            directly. We don't proxy it through our servers.
          </p>
          <p className={p}>
            This keeps our infrastructure light and ensures we never see your
            private repo stats. We literally can't see them because we never
            receive them.
          </p>

          <h3 className={h3}>Batch requests</h3>
          <p className={p}>
            Fetching every stargazer for a popular repo requires thousands of
            API calls.
          </p>
          <p className={p}>
            We batch these requests 5 pages at a time. It's not instant, but we
            show a progress indicator so you know exactly what's happening.
          </p>

          <h3 className={h3}>Visualization</h3>
          <p className={p}>
            We use Recharts for visualization. It handles responsive sizing well
            and the area charts look clean.
          </p>
          <p className={p}>
            We added custom tooltips and hover states so you can see exact
            numbers, not just vague trends.
          </p>

          <h3 className={h3}>Exports</h3>
          <p className={p}>
            For PNG exports, we use{" "}
            <code className="bg-[#f0f0f0] px-1.5 py-0.5 rounded text-sm font-normal text-[#181925]">
              html-to-image
            </code>{" "}
            to capture the chart element directly.
          </p>
          <p className={p}>
            No server-side rendering or canvas manipulation required. The chart
            you see is exactly what you get in the image.
          </p>

          <h2 className={h2}>Better than Insights</h2>
          <p className={p}>
            Here's how we compare to the default GitHub experience:
          </p>
          <p className={p}>
            <strong className="font-medium text-[#181925]">Star History:</strong>{" "}
            GitHub gives you a number. We give you a full timeline with avatars
            for every stargazer.
          </p>
          <p className={p}>
            <strong className="font-medium text-[#181925]">Traffic:</strong>{" "}
            GitHub deletes data after 14 days. We show you everything available
            now, and we're working on long-term storage.
          </p>
          <p className={p}>
            <strong className="font-medium text-[#181925]">Multi-repo:</strong>{" "}
            GitHub forces you to click between repos. We put all your connected
            repos in one sidebar.
          </p>
          <p className={p}>
            <strong className="font-medium text-[#181925]">Exports:</strong>{" "}
            GitHub has none. We offer CSV for analysis and PNG for sharing.
          </p>

          <h2 className={h2}>Free forever</h2>
          <p className={p}>No trial periods. No credit cards.</p>
          <p className={p}>
            We built GitStat because we needed it to understand our own
            projects. If you've ever wondered when your repo hit 1,000 stars or
            who your top contributors really are, this is for you.
          </p>
          <p className={p}>Hopefully, you find it useful too.</p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
