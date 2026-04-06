import type { Metadata } from 'next';
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          marginLeft: '220px',
          background: '#f1f5f9',
          minHeight: '100vh',
        }}
      >
        {children}
      </main>
    </div>
  );
}
