/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Allow external images
  images: {
    domains: ['ipfs.io', 'gateway.ipfs.io'],
  },
  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;