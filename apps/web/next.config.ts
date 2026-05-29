import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@ai-edu/shared', '@ai-edu/ui'],
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: [],
};

export default nextConfig;
