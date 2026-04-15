'use client';

import SearchFilter from '@/_component/common/SearchFilter';
import Pagination from '@/_component/common/Pagination';
import NoticeTable from './NoticeTable';
import { useNoticeList } from './useNoticeList';

/**
 * 공지사항 목록 클라이언트 컴포넌트
 * - page.tsx(Server Component)에서 Suspense로 감싸서 사용
 * - hook 호출 + 컴포넌트 조립 담당
 */
export default function NoticeListContent() {
  const {
    notices, totalPages, totalElements, loading,
    currentPage,
  } = useNoticeList();

  return (
    <>
      <SearchFilter variant="search-only" filterType="notice" />

      <NoticeTable
        notices={notices}
        totalElements={totalElements}
        currentPage={currentPage}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  );
}

