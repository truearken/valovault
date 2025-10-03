import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/valovault',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
