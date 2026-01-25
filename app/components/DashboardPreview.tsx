import Image from "next/image";

export default function DashboardPreview() {
  return (
    <section className="relative w-full flex justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-24 overflow-hidden">
      {/* Background Gradient */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] aspect-square bg-[radial-gradient(circle_farthest-side,rgba(248,29,229,0.08),transparent)] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Image
        src="/dashboard-demo.png"
        alt="GitStat Dashboard Preview"
        width={1200}
        height={800}
        className="rounded-xl w-full h-auto max-w-5xl "
        priority
      />
    </section>
  );
}
