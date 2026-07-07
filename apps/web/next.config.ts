import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile shared workspace packages — they ship raw TS, not pre-built JS.
  transpilePackages: ['@kaam25/ui', '@kaam25/utils', '@kaam25/shared', '@kaam25/types'],
};

export default nextConfig;
