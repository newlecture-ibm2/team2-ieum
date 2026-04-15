import type { Metadata } from 'next';
import AdminBottomNav from './_components/AdminBottomNav';
import AdminFAB from './_components/AdminFAB';
import AdminHeader from './_components/AdminHeader';

import styles from './AdminLayout.module.css';
import AdminSidebar from './_components/AdminSidebar';

export const metadata: Metadata = {
  title: '이음 관리자',
  description: '이음 축제 플랫폼 관리자 대시보드',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.layoutContainer}>
      {/* ── 데스크탑 전용 좌측 사이드바 ── */}
      <div className={styles.sidebarWrapper}>
        <AdminSidebar />
      </div>

      {/* ── 모바일 전용 헤더 ── */}
      <div className={styles.mobileNavWrapper}>
        <AdminHeader />
      </div>

      {/* ── 메인 콘텐츠 영역 ── */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* ── 모바일 전용 하단 탭 및 FAB ── */}
      <div className={styles.mobileNavWrapper}>
        <AdminFAB />
        <AdminBottomNav />
      </div>
    </div>
  );
}
