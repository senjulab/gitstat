import Link from "next/link";

export default function CTA() {
  return (
    <div className="py-16 md:py-24 w-full max-w-5xl mx-auto px-4 sm:px-5 bg-background tracking-tight">
      <div className="w-full">
        <div className="bg-[#fafafa] rounded-3xl py-12 px-5 sm:py-16 sm:px-8 flex flex-col items-center text-center gap-4">
          <h2 className="text-3xl sm:text-4xl text-center font-medium tracking-tight text-foreground leading-tight sm:leading-11 text-balance max-w-md">
            A new era of
            <br />
            repo analytics
          </h2>
          <p className="text-[#666] text-center tracking-tight text-lg/6 w-full max-w-md font-medium">
            See your project's growth clearly and stay ahead of every change.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4 w-full sm:w-auto">
            <Link href="/register" className="bg-[#F81DE5] px-5 h-11 gap-2 hover:bg-[#e01ad1] transition-colors duration-200 text-white items-center justify-center cursor-pointer rounded-full font-medium inline-flex">
              Start now for free
            </Link>
            <button className="bg-[#00000010] px-5 h-11 gap-2 hover:opacity-90 transition-colors duration-200 text-[#666] items-center justify-center cursor-pointer rounded-full font-medium">
              See demo
            </button>
          </div>
          <span className="text-sm text-[#999]">No credit card required</span>
        </div>
      </div>
    </div>
  );
}
