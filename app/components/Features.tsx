import { HugeiconsIcon } from "@hugeicons/react";
import { ChartLineData01Icon, UserGroupIcon, GridViewIcon } from "@hugeicons/core-free-icons";

export default function Features() {
  const features = [
    {
      icon: ChartLineData01Icon,
      highlight: "Track traffic, commits, stars and contributors",
      rest: " as they happen.",
    },
    {
      icon: UserGroupIcon,
      highlight: "See who's pushing code, opening pull requests",
      rest: " and keeping your project alive.",
    },
    {
      icon: GridViewIcon,
      highlight: "Track all your projects",
      rest: " from one place.",
    },
  ];

  return (
    <>
      <div
        className="w-full py-8 md:py-20 relative"
        style={{
          backgroundImage: "url('/background.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-5">
          <div className="rounded-sm md:rounded-md overflow-hidden w-full shadow-lg">
            <img
              src="/demo.png"
              alt="Dashboard"
              className="w-full"
              width="2880"
              height="1800"
            />
          </div>
        </div>
      </div>
      <div id="features" className="py-16 md:py-24 tracking-tight">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-3">
                <div className="w-10 h-9 rounded-full corner-superellipse/1.125 border border-[#2c78fc29] flex items-center justify-center">
                  <HugeiconsIcon icon={feature.icon} size={20} strokeWidth={2} className="text-[#2c78fc]" />
                </div>
                <p className="text-center text-lg/7 max-w-xs">
                  <span className="text-[#181925] font-medium">{feature.highlight}</span>
                  <span className="text-[#666]">{feature.rest}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
