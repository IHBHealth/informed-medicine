/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel handles optimization automatically — no need for output: 'export'
  // Next.js will use SSG for pages with generateStaticParams() and SSR where needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  trailingSlash: false,
};

module.exports = nextConfig;
