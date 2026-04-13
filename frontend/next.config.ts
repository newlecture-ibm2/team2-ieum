import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tong.visitkorea.or.kr',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'tong.visitkorea.or.kr',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'festa-ieum.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/oauth2/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8080'}/oauth2/:path*`,
      },
      {
        source: '/login/oauth2/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8080'}/login/oauth2/:path*`,
      },
      {
        // [로컬 개발 환경 전용 설정]
        // Nginx가 없는 로컬 개발 환경에서 Next.js가 백엔드의 이미지 파일을 프록시하여 가져오기 위함입니다.
        // 실서버(Production)에서는 Nginx가 해당 경로를 가로채어 직접 서비스하므로 이 규칙은 무시됩니다.
        source: '/uploads/:path*',
        destination: `${process.env.BACKEND_URL || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8080'}/uploads/:path*`,
      },
    ];
  },
};
export default nextConfig;
// Force next.js hard-reload to clear CSS modules cache
