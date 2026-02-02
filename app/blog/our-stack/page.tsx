import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "The GitStat Stack: What We Use & Why | GitStat Blog",
  description:
    "We like shipping fast. Here's the stack that helps us do it: Next.js 16, Tailwind v4, Supabase, and a few other secret weapons.",
  openGraph: {
    images: ["/tech-stack-for-the-post.png"],
  },
};

const p = "text-base text-[#666666] leading-snug tracking-tight mt-4 mb-5";
const h2 = "text-xl font-medium text-[#1a1a1a] tracking-tight mt-16 mb-4";
const h3 = "text-lg font-medium text-[#1a1a1a] tracking-tight mt-8 mb-3";

export default function OurStackAndWhy() {
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
              2026-02-02
            </time>
            <h1 className="text-3xl md:text-4xl font-medium text-[#1a1a1a] tracking-tight mt-2 mb-8">
              The GitStat Stack: What We Use & Why
            </h1>
            <div className="w-full aspect-[1200/630] bg-[#F5F5F7] rounded-xl overflow-hidden border border-[#00000008]">
              <img
                src="/tech-stack-for-the-post.png"
                alt="GitStat Tech Stack"
                className="w-full h-full object-cover scale-105"
              />
            </div>
          </header>

          <p className={p}>
            Building software is mostly about making decisions. And usually, you
            retain the right to regret those decisions six months later.
          </p>
          <p className={p}>
            With GitStat, we wanted to move fast. Like, "idea to production in a
            weekend" fast. But we also care about aesthetics and performance,
            which usually fight against speed.
          </p>
          <p className={p}>
            So here’s the stack we picked to keep us sane and shipping.
          </p>

          <h2 className={h2}>The Heavy Lifters</h2>

          <h3 className={h3}>Next.js 16 + React 19</h3>
          <p className={p}>
            We're living on the bleeding edge. Is it risky? Maybe. Is it fun?
            Absolutely.
          </p>
          <p className={p}>
            We use the App Router because organizing files by routes just makes
            sense to our brains. Server Components handle the heavy lifting of
            fetching data, keeping the client bundle small. React 19 brings the
            new exciting stuff, and honestly, we just like new shiny toys.
          </p>

          <h3 className={h3}>Bun</h3>
          <p className={p}>
            Waiting for <code>npm install</code> is so 2022. Bun is fast.
            Ridiculously fast. It handles our package management and local dev
            server without breaking a sweat. It just works, and it respects our
            time.
          </p>

          <h2 className={h2}>Making It Pretty</h2>

          <h3 className={h3}>Tailwind CSS v4</h3>
          <p className={p}>
            We upgraded to v4 alpha/beta because we hate configuration files.
            The new engine is instant, and defining variables in CSS instead of
            a <code>tailwind.config.js</code> feels like the way it should have
            always been.
          </p>
          <p className={p}>
            If you see us centering a div, know that we're doing it with utility
            classes and zero shame.
          </p>

          <h3 className={h3}>Radix UI + Motion</h3>
          <p className={p}>
            Building accessible components from scratch is a noble cause, but we
            have features to ship. Radix primitives handle the keyboard
            navigation and focus management so we don't have to.
          </p>
          <p className={p}>
            Then we sprinkle <code>motion</code> (formerly Framer Motion) on top
            because things that pop in and slide out just feel better. The human
            brain likes things that move nicely. We obey the brain.
          </p>

          <h2 className={h2}>The Data Stuff</h2>

          <h3 className={h3}>Supabase</h3>
          <p className={p}>
            Managing a Postgres instance ourselves? No thanks.
          </p>
          <p className={p}>
            Supabase handles our database and authentication. The "Sign in with
            GitHub" flow was basically free. It lets us focus on the app logic
            instead of wondering if our database backups are actually running.
          </p>

          <h3 className={h3}>Octokit + DataBuddy</h3>
          <p className={p}>
            Since we're analyzing GitHub repositories, we talk to the GitHub API{" "}
            <em>a lot</em>. Octokit is the standard for that.
          </p>
          <p className={p}>
            DataBuddy helps us manage some of the more complex data operations
            without reinventing the wheel.
          </p>

          <h2 className={h2}>Visualizing The Numbers</h2>

          <h3 className={h3}>Recharts</h3>
          <p className={p}>
            Charts are hard. Recharts makes them less hard. It's composable,
            React-native, and lets us customize the look until it fits our
            "clean aesthetic" requirements.
          </p>
          <p className={p}>
            We need those star history graphs to look smooth, not like a jagged
            mess from a 1998 Excel spreadsheet.
          </p>

          <h2 className={h2}>Why this stack?</h2>
          <p className={p}>
            We didn't pick these tools because they're trendy (okay, maybe a
            little bit). We picked them because they remove friction.
          </p>
          <p className={p}>
            We don't want to spend days configuring Webpack. We don't want to
            write boilerplate SQL. We want to write code that actually does
            something for you.
          </p>
          <p className={p}>
            This stack stays out of our way. And that's the best kind of stack.
          </p>
        </article>
      </main>

      <Footer />
    </div>
  );
}
