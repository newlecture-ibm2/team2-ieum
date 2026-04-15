'use client';

import dynamic from 'next/dynamic';

// SSR 없이 클라이언트에서만 로드하여 hydration 에러 방지
const Header = dynamic(
  () => import('@/_component/common/Header'),
  { ssr: false }
);

export default function AdminHeader() {
  return <Header forceRender />;
}
