/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // experimental optimizeCss disabled — causes EISDIR on Windows
  // experimental: {
  //   optimizeCss: true,
  // },
}

module.exports = nextConfig
