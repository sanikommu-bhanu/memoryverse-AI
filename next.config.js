/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ["pdf-parse","mammoth","formidable"] },
  images: { domains: ["images.unsplash.com"] }
};
module.exports = nextConfig;
