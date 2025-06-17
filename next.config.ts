import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Отключить ошибки ESLint при билде Next.js (они больше не будут блокировать build)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
