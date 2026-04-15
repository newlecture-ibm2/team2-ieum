"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 페이지 전환 시 스크롤을 최상단으로 초기화하는 컴포넌트
 * Next.js App Router에서 자동 scroll restoration이 동작하지 않는 경우를 보완합니다.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
