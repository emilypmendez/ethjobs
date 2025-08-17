/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors due to viem library type issues
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
