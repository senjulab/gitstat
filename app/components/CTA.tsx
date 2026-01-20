export default function CTA() {
  return (
    <div className="py-16 md:py-24 w-full max-w-5xl mx-auto px-5 bg-background tracking-tight">
      <div className="w-full">
        <div className="bg-[#fafafa] rounded-3xl py-16 px-8 flex flex-col items-center text-center gap-4">
          <h2 className="text-4xl text-center font-medium tracking-tight text-foreground-4 leading-11 text-balance max-w-md">
            A new age of<br />repo analytics
          </h2>
          <p className="text-[#666] text-center tracking-tight text-lg/6 w-full max-w-md font-medium">
            Start your 14 day free trial today and track your repositories in minutes.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <button className="bg-[#918df6] px-5 h-11 gap-2 hover:opacity-90 transition-colors duration-200 text-white items-center justify-center cursor-pointer rounded-full font-medium">
              Start 14 day free trial
            </button>
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
