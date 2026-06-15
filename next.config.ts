import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/__/auth/action",
        destination: "/auth/action",
      },
    ];
  },
};

export default nextConfig;
