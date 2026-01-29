import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/s/:owner/:repo",
        destination: "/dashboard/:owner/:repo/traffic",
      },
      // Handle sub-paths too if needed, e.g. /s/owner/repo/stars
      {
        source: "/s/:owner/:repo/:path*",
        destination: "/dashboard/:owner/:repo/:path*",
      },
    ];
  },
};

export default nextConfig;
