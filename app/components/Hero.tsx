export default function Hero() {
  return (
    <div className="pt-40 pb-16 md:pb-24 bg-background flex flex-col gap-16 relative overflow-hidden tracking-tight">
      <div className="w-full max-w-3xl mx-auto px-5 flex flex-col items-center text-center gap-4">
        <span className="text-[#999]">
          The #1 GitHub Analytics tool
          {/* <span className="font-medium text-[#181925]">Tracking</span> */}
        </span>

        <h1 className="text-6xl/17 tracking-tighter text-[#181925] font-medium md:text-balance">
          Understand how your git repos grow
        </h1>
        <p className="w-full max-w-md font-medium text-lg/6 tracking-tight text-[#666666]">
          Track traffic, commits, stars and contributors to understand how your
          repo evolves in realtime.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <button className="bg-[#9580ff] px-5 h-11 gap-2 hover:opacity-90 transition-colors duration-200 text-white w-[320px] md:w-auto items-center justify-center cursor-pointer rounded-full font-medium">
            Start now for free
          </button>
          <button className="bg-[#00000008] px-5 h-11 gap-2 hover:opacity-90 transition-colors duration-200 text-[#666] w-[320px] md:w-auto items-center justify-center cursor-pointer rounded-full font-medium">
            See demo
          </button>
        </div>

        <span className="text-sm max-w-[188px] text-[#999]">
          No credit card required
        </span>
      </div>
    </div>
  );
}
