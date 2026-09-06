/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/seema',
          destination: '/seema/index.html',
        },
        {
          source: '/seema/',
          destination: '/seema/index.html',
        },
        {
          source: '/seema/:path((?!assets/|.*\\..*).*)',
          destination: '/seema/index.html',
        },
      ],
    };
  },
}

module.exports = nextConfig

