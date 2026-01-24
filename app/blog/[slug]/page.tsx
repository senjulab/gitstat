import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | GitStat Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 pt-32 md:pt-44 pb-16">
        <article className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center text-sm text-[#666] hover:text-[#181925] mb-8 transition-colors"
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
            <time className="text-sm text-[#666] font-normal">{post.date}</time>
            <h1 className="text-3xl md:text-4xl font-medium text-[#181925] mt-2">
              {post.title}
            </h1>
          </header>

          <div
            className="prose prose-neutral max-w-none
              prose-headings:font-medium prose-headings:text-[#181925]
              prose-h2:text-2xl prose-h2:mt-20 prose-h2:mb-8
              prose-h3:text-xl prose-h3:mt-16 prose-h3:mb-6
              prose-p:text-base prose-p:leading-loose prose-p:text-[#444] prose-p:mb-6
              prose-a:text-[#181925] prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-[#666]
              prose-strong:text-[#181925] prose-strong:font-medium
              prose-code:text-[#181925] prose-code:bg-[#f5f5f5] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-[#1a1a1a] prose-pre:text-[#e5e5e5] prose-pre:rounded-lg prose-pre:p-6
              prose-ul:text-base prose-ul:text-[#444] prose-ul:my-8 prose-ul:list-disc prose-ul:pl-6
              prose-li:my-3 prose-li:pl-2
              prose-blockquote:border-l-4 prose-blockquote:border-[#e5e5e5] prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:text-lg prose-blockquote:text-[#666] prose-blockquote:font-normal prose-blockquote:not-italic"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
