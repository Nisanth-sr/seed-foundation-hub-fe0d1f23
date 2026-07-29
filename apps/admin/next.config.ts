import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@seed/career-core"],
  serverExternalPackages: ["@react-pdf/renderer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
