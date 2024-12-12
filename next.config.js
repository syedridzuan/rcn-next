/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resepichenom.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
}

module.exports = config