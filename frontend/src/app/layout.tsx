import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "이음 — 지역 축제 통합 정보 플랫폼",
  description: "전국 축제 정보를 지도 기반으로 탐색하고, 커뮤니티에서 소통하는 통합 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
