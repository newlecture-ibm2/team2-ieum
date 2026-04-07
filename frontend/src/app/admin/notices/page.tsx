import { Suspense } from 'react';
import NoticeListPage from './_components/NoticeListPage';

/**
 * 관리자 > 공지사항 관리 페이지 (Server Component)
 * 라우트: /admin/notices
 */
export default function AdminNoticesPage() {
  return (
    <Suspense>
      <NoticeListPage />
    </Suspense>
  );
}
