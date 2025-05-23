import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      zlib: false,
      http: false,
      https: false,
      os: false,
      url: false,
    };
    return config;
  },
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
