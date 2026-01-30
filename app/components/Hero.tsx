import Link from "next/link";

export default function Hero() {
  return (
    <div className="pt-24 md:pt-40 pb-16 md:pb-24 bg-background flex flex-col gap-16 relative overflow-hidden tracking-tight">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-5 flex flex-col items-center text-center gap-4">
        <span className="text-[#999]">
          An alternative to{" "}
          <span className="font-medium text-[#181925]">GitHub Insights</span>
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl md:leading-[1.1] tracking-tighter text-[#181925] font-medium md:text-balance">
          Understand how your git repos grow
        </h1>
        <p className="w-full max-w-md font-medium text-lg/6 tracking-tight text-[#666666]">
          Track traffic, commits, stars and contributors to understand how your
          repo evolves in realtime.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4 w-full sm:w-auto max-w-sm sm:max-w-none">
          <Link
            href="/register"
            className="bg-[#F81DE5] px-5 h-11 gap-2 hover:bg-[#e01ad1] transition-colors duration-200 text-white w-full sm:w-auto items-center justify-center cursor-pointer rounded-full font-medium inline-flex"
          >
            Start now for free
          </Link>
          <Link
            href="https://gitstat.dev/s/senjulab/gitstat"
            className="bg-[#00000008] px-5 h-11 gap-2 hover:opacity-90 transition-colors duration-200 text-[#666] w-full sm:w-auto items-center justify-center cursor-pointer rounded-full font-medium inline-flex"
          >
            See demo
          </Link>
        </div>

        <span className="text-sm max-w-[188px] text-[#999]">
          No credit card required
        </span>
      </div>
    </div>
  );
}
