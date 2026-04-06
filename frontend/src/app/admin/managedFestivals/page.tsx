import { Suspense } from 'react';
import CustomFestivalListPage from './_components/CustomFestivalListPage';

/**
 * 관리자 > 축제 관리 리스트/등록/수정 페이지 (Server Component)
 * 라우트: /admin/managedFestivals
 */
export default function CustomFestivalsPage() {
  return (
    <Suspense>
      <CustomFestivalListPage />
    </Suspense>
  );
}
