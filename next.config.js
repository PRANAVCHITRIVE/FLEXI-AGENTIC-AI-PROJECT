/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Avoid corrupted chunk issues during static page data collection
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
