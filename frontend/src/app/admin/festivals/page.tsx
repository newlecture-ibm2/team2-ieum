import { Suspense } from 'react';
import FestivalListPage from './_components/FestivalListPage';

/**
 * 관리자 > 공공 축제 리스트 페이지 (Server Component)
 * 라우트: /admin/festivals
 */
export default function AdminFestivalsPage() {
  return (
    <Suspense>
      <FestivalListPage />
    </Suspense>
  );
}
