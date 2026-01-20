export default function Pricing() {
  const features = [
    { label: "Data retention", value: "Forever" },
    { label: "Repositories", value: "Unlimited" },
    { label: "Features", value: "Everything" },
  ];

  return (
    <div className="py-16 md:py-24 bg-background tracking-tight">
      <div className="w-full max-w-sm mx-auto px-5 flex flex-col items-center gap-6">
        <span className="text-sm text-[#0006] border-transparent h-[24px] min-w-[24px] bg-[#00000008] px-3 py-1 pl-2 pr-2 gap-1 rounded-sm font-medium flex items-center justify-center border border-[#00000008]">
          Pricing
        </span>
        
        <h2 className="text-4xl md:text-5xl font-medium text-[#181925] text-center tracking-tight leading-tight text-balance">
          Free forever
        </h2>
        
        <p className="text-[#666] text-center tracking-tight text-lg/6 w-full max-w-md font-medium">
          Our pricing is simple and transparent. No hidden fees, no credit card required.
        </p>

        {/* Price */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <span className="text-[#999] text-sm font-medium">Per month</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl text-[#999] line-through font-medium">$9</span>
            <span className="text-5xl text-[#181925] font-medium">$0</span>
          </div>
          <span className="text-[#666] text-sm font-medium">
            Free forever, no strings attached
          </span>
        </div>

        {/* Features */}
        <div className="w-full flex flex-col gap-1 mt-6">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="flex items-center justify-between px-4 py-3 bg-[#00000008] rounded-xl"
            >
              <span className="text-[#181925] text-sm font-medium">{feature.label}</span>
              <span className="text-[#666] text-sm font-medium">{feature.value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col items-center gap-2 mt-2">
          <button className="w-full bg-[#918df6] px-5 h-11 gap-2 hover:opacity-90 transition-colors duration-200 text-white items-center justify-center cursor-pointer rounded-full font-medium">
            Start 14 day free trial
          </button>
          <span className="text-sm text-[#999]">No credit card required</span>
        </div>
      </div>
    </div>
  );
}
