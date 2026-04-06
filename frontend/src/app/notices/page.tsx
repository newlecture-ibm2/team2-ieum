'use client';

import { Megaphone } from 'lucide-react';
import NoticeTable from './_components/NoticeTable/NoticeTable';
import Pagination from '@/_component/common/Pagination';
import SearchFilter from '@/_component/common/SearchFilter';
import { useNoticeList } from './_components/useNoticeList';
import styles from './page.module.css';

export default function NoticesPage() {
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
