import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'tong.visitkorea.or.kr', // TourAPI image domain for later use
      }
    ],
  },
};
export default nextConfig;
