import type { Metadata } from 'next';
import AdminBottomNav from './_components/AdminBottomNav';
import AdminFAB from './_components/AdminFAB';
import AdminHeader from './_components/AdminHeader';

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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminHeader />
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '5px',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>
      <AdminFAB />
      <AdminBottomNav />
    </div>
  );
}
