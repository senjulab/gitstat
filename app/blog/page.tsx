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
    title: "Introducing GitStat",
    category: "News",
    author: {
      name: "Yassin",
      image: "/pfp.png",
    },
    date: "Jan 26, 2026",
    image: "/gitstatbutwhyblog.png",
    excerpt:
      "GitHub Insights is fine. But 14 days of traffic data and no star history wasn't cutting it. So we built something better with Bun, Next.js, and Supabase.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-32 md:pt-44 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-20 text-center">
            <h1 className="text-4xl md:text-5xl font-medium text-[#1a1a1a] mb-4 tracking-tight">
              Blog
            </h1>
            <p className="text-lg text-[#666666] font-normal">
              Latest news and updates from GitStat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#888888]">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.image}
                      alt={post.author.name}
                      className="w-5 h-5 rounded-full"
                    />
                    <time className="text-sm text-[#888888]">{post.date}</time>
                  </div>
                </div>

                <div className="mb-5 relative aspect-16/9 overflow-hidden rounded-lg bg-gray-100 border border-black/5">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="object-cover w-full h-full transition-transform duration-300 scale-105"
                  />
                </div>

                <h2 className="text-lg font-medium text-[#1a1a1a] mb-2 leading-snug group-hover:text-[#f81ee5] transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-[#666666] leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
