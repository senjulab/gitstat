import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Blog | GitStat",
  description: "Latest news and updates from GitStat",
};

const POSTS = [
  {
    slug: "why-we-built-gitstat",
    title: "Why We Built GitStat",
    date: "2026-01-24",
    excerpt:
      "GitHub Insights is fine. But 14 days of traffic data and no star history wasn't cutting it. So we built something better with Bun, Next.js, Supabase, and the GitHub API.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
  
      <main className="flex-1 pt-32 md:pt-44 pb-16">
        <div className="max-w-[40rem] mx-auto px-4 sm:px-6">
          <div className="mb-14">
            <h1 className="text-3xl md:text-4xl font-medium text-[#1a1a1a] mb-3">
              Blog
            </h1>
            <p className="text-base text-[#666666] font-normal">
              Latest news and updates from GitStat
            </p>
          </div>

          <div className="space-y-12">
            {POSTS.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/blog/${post.slug}`} className="block">
                  <time className="text-sm text-[#666666] font-normal">
                    {post.date}
                  </time>
                  <h2 className="text-xl font-medium text-[#1a1a1a] mt-2 mb-3 group-hover:text-[#666666] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#666666] text-[16px] leading-[1.7]">
                    {post.excerpt}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
