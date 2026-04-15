'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import SearchFilter from '@/_component/common/SearchFilter';
import Pagination from '@/_component/common/Pagination';
import NoticeTable from './NoticeTable';
import { useNoticeList } from './useNoticeList';

const CATEGORY_TABS = [
  { value: '', label: '전체' },
  { value: 'GENERAL', label: '일반' },
  { value: 'EVENT', label: '행사' },
  { value: 'UPDATE', label: '업데이트' },
  { value: 'URGENT', label: '긴급' },
] as const;

/**
 * 공지사항 목록 클라이언트 컴포넌트
 * - page.tsx(Server Component)에서 Suspense로 감싸서 사용
 * - hook 호출 + 컴포넌트 조립 담당
 */
export default function NoticeListContent() {
  const {
    notices, totalPages, totalElements, loading,
    currentPage, currentCategory
  } = useNoticeList();

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    router.push(`/notices?${params.toString()}`);
  };

  return (
    <>
      <SearchFilter variant="search-only" filterType="notice" />

      {/* 카테고리 탭 */}
      <div style={{
        display: 'flex', gap: '8px', margin: '16px 0', flexWrap: 'wrap'
      }}>
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleCategoryChange(tab.value)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: currentCategory === tab.value ? '2px solid #6366f1' : '1px solid #d1d5db',
              background: currentCategory === tab.value ? '#6366f1' : '#fff',
              color: currentCategory === tab.value ? '#fff' : '#374151',
              fontWeight: currentCategory === tab.value ? 600 : 400,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
