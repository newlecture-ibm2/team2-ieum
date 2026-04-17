import type { Metadata } from "next";
import "./globals.css";
import Header from "@/_component/common/Header";
import Footer from "@/_component/common/Footer";
import ScrollToTop from "@/_component/common/ScrollToTop";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "이음 — 지역 축제 통합 정보 플랫폼",
  description: "전국 축제 정보를 지도 기반으로 탐색하고, 커뮤니티에서 소통하는 통합 플랫폼",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicon/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <ScrollToTop />
          <Header />
          <main style={{ minHeight: "calc(100vh - var(--header-height) - 200px)" }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
