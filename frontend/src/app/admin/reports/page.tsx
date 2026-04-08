import { Suspense } from 'react';
import ReportListPage from './_components/ReportListPage';

/**
 * 관리자 > 신고 관리 페이지 (Server Component)
 * 라우트: /admin/reports
 */
export default function AdminReportsPage() {
  return (
    <Suspense>
      <ReportListPage />
    </Suspense>
  );
}
