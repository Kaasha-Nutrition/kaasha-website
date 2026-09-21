/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Local /public images only for now — add remotePatterns here if you
    // later serve images from a CMS or external host.
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
