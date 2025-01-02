/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "resepichenom.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async redirects() {
    return [
      // Redirect old /resepi/:slug/show to /resepi/:slug
      {
        source: "/resepi/:slug/show",
        destination: "/resepi/:slug",
        permanent: true, // 301 redirect
      },
      // Redirect old /kategori/:slug/show to /kategori/:slug
      {
        source: "/kategori/:slug/show",
        destination: "/kategori/:slug",
        permanent: true, // 301 redirect
      },
      // Add any other custom redirects here if needed
    ];
  },
};

module.exports = config;
