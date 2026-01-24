import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getAllPosts } from "@/lib/blog";
import Link from "next/link";

export const metadata = {
  title: "Blog | GitStat",
  description: "Latest news and updates from GitStat",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-32 md:pt-44 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-medium text-[#181925] mb-3">
              Blog
            </h1>
            <p className="text-base text-[#666] font-normal">
              Latest news and updates from GitStat
            </p>
          </div>

          {/* Posts List */}
          {posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <time className="text-sm text-[#999] font-normal">
                      {post.date}
                    </time>
                    <h2 className="text-xl font-medium text-[#181925] mt-1 mb-2 group-hover:text-[#666] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-[#666] text-base leading-relaxed">
                      {post.excerpt}
                    </p>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[#666]">No posts yet. Check back soon.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
