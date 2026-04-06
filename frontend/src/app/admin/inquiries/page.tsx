import { Suspense } from 'react';
import InquiryListPage from './_components/InquiryListPage';

/**
 * 관리자 > 문의 관리 페이지 (Server Component)
 * 라우트: /admin/inquiries
 */
export default function AdminInquiriesPage() {
  return (
    <Suspense>
      <InquiryListPage />
    </Suspense>
  );
}
