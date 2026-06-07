import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["mongoose"],
  },
};

export default nextConfig;
