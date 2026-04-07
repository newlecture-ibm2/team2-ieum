'use client';

import { Suspense } from 'react';
import { Megaphone } from 'lucide-react';
import NoticeTable from './_components/NoticeTable/NoticeTable';
import Pagination from '@/_component/common/Pagination';
import SearchFilter from '@/_component/common/SearchFilter';
import { useNoticeList } from './_components/useNoticeList';
import styles from './page.module.css';

function NoticesContent() {
  const {
    notices, totalPages, totalElements, loading,
    currentPage
  } = useNoticeList();

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>
        <Megaphone size={22} />
        공지사항
      </h1>

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
    </div>
  );
}

export default function NoticesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}>공지사항을 불러오는 중...</div>}>
      <NoticesContent />
    </Suspense>
  );
}
