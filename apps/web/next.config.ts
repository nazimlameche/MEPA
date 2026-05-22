import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@ai-edu/shared', '@ai-edu/ui'],
  images: {
    remotePatterns: [],
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
