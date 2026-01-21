import Link from "next/link";

export default function Navbar() {
  return (
    <header className="dark fixed top-8 left-1/2 -translate-x-1/2 z-[99] w-[400px] bg-[#14141f] backdrop-blur-lg rounded-[24px] overflow-hidden shadow-xl hidden md:block tracking-tight">
      <nav>
        <div className="flex items-center justify-between h-[52px] pl-4 pr-3">
          <div className="flex items-center gap-4">
            <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
              Features
            </span>
            <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
              Why
            </span>
            <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
              Blog
            </span>
            <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
              Docs
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <span className="text-[#bbbcc3] font-medium text-sm hover:text-[#eaeaeb] transition-colors duration-200 cursor-pointer">
                Login
              </span>
            </Link>
            <Link href="/register">
              <button className="bg-[#F81DE5] hover:opacity-90 transition-colors duration-200 cursor-pointer text-white text-sm px-4 py-1.5 rounded-full font-medium">
                Register
              </button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
