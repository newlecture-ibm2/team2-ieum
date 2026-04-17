import { Suspense } from 'react';
import MemberListPage from './_components/MemberListPage';

/**
 * 관리자 > 회원 관리 페이지 (Server Component)
 * 라우트: /admin/members
 */
export default function AdminMembersPage() {
  return (
    <Suspense>
      <MemberListPage />
    </Suspense>
  );
}
