import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-8 left-1/2 -translate-x-1/2 z-99 w-[460px] bg-[#14141F] rounded-[24px] overflow-hidden shadow-xl corner-superellipse/1.125 hidden md:block">
      <div>
        <div className="flex items-center gap-2 h-13 pl-4 pr-3.25">
          <Link
            href="/features"
            className="text-sm font-medium transition-colors px-2 text-[#bbbcc3] hover:text-[#eaeaeb]"
          >
            Features
          </Link>
          <Link
            href="/why"
            className="text-sm font-medium transition-colors px-2 text-[#bbbcc3] hover:text-[#eaeaeb]"
          >
            Why
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium transition-colors px-2 text-[#bbbcc3] hover:text-[#eaeaeb]"
          >
            Blog
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium transition-colors px-2 text-[#bbbcc3] hover:text-[#eaeaeb]"
          >
            Docs
          </Link>
          <Link
            href="/login"
            className="ml-4 text-sm font-medium transition-colors px-2 text-[#bbbcc3] hover:text-[#eaeaeb]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-3 py-2 text-sm font-medium text-white hover:text-white/80 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
