import type { Metadata } from "next";
import "./globals.css";
import Header from "@/_component/common/Header";
import Footer from "@/_component/common/Footer";

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
      <body>
        <Header />
        <main style={{ minHeight: "calc(100vh - var(--header-height) - 200px)" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
