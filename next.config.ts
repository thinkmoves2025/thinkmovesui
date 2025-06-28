import type { NextConfig } from 'next';
import type { Configuration as WebpackConfiguration } from 'webpack';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // This disables TS error while preserving full config type
  experimental: {
    allowedDevOrigins: ['http://192.168.1.15:3000'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any, // 👈 this cast prevents structure type mismatch

  webpack: (config: WebpackConfiguration): WebpackConfiguration => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        os: false,
        url: false,
      },
    };
    return config;
  },
};

export default nextConfig;
