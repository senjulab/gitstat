import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const metadata = {
  title: "Blog | GitStat",
  description: "Latest news and updates from GitStat",
};

const POSTS = [
  {
    slug: "why-we-built-gitstat",
    title: "Why We Built GitStat",
    date: "2026-01-26",
    image: "/gitstatbutwhyblog.png",
    excerpt:
      "GitHub Insights is fine. But 14 days of traffic data and no star history wasn't cutting it. So we built something better with Bun, Next.js, Supabase, and the GitHub API.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-32 md:pt-44 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-14 text-center">
            <h1 className="text-3xl md:text-4xl font-medium text-[#1a1a1a] mb-3">
              Blog
            </h1>
            <p className="text-base text-[#666666] font-normal">
              Latest news and updates from GitStat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {POSTS.map((post) => (
              <article
                key={post.slug}
                className="group cursor-pointer flex flex-col h-full"
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  {/* Metadata Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#666]">
                      News
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-neutral-200 overflow-hidden">
                        <img
                          src="/pfp.png"
                          alt="Author"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <time className="text-sm text-[#666] font-normal">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </div>

                  {/* Image Placeholder - minimalist, no border, no scale, no rounded, no overflow hidden */}
                  <div className="w-full mb-4">
                    <AspectRatio ratio={1200 / 630}>
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </AspectRatio>
                  </div>

                  {/* Content */}
                  <h2 className="text-base font-medium text-[#1a1a1a] mb-2 group-hover:text-[#666666] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[#666666] text-sm leading-relaxed line-clamp-3">
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
