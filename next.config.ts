import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    localPatterns: [
      {
        pathname: "/artwork/**",
      },
      {
        pathname: "/seals/**",
      },
    ],
  },
};

export default nextConfig;
