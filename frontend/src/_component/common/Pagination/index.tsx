'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={<div style={{ height: 40 }} />}>
      <PaginationInner {...props} />
    </Suspense>
  );
}

function PaginationInner({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', Math.max(1, Math.min(pageNumber, totalPages)).toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(pageNumber);
    }
  };

  // 한 화면에 최대 5개의 페이지 번호만 표시
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <div className={styles.paginationContainer}>
      {onPageChange ? (
        <button
          type="button"
          onClick={(e) => handlePageClick(e, currentPage - 1)}
          className={`${styles.navButton} ${currentPage === 1 ? styles.disabled : ''}`}
          disabled={currentPage === 1}
        >
          이전
        </button>
      ) : (
        <Link 
          href={createPageUrl(currentPage - 1)} 
          className={`${styles.navButton} ${currentPage === 1 ? styles.disabled : ''}`}
          aria-disabled={currentPage === 1}
        >
          이전
        </Link>
      )}
      
      {pages.map(p => (
        onPageChange ? (
          <button
            key={p}
            type="button"
            onClick={(e) => handlePageClick(e, p)}
            className={`${styles.pageButton} ${currentPage === p ? styles.active : ''}`}
          >
            {p}
          </button>
        ) : (
          <Link 
            key={p} 
            href={createPageUrl(p)}
            className={`${styles.pageButton} ${currentPage === p ? styles.active : ''}`}
          >
            {p}
          </Link>
        )
      ))}

      {onPageChange ? (
        <button
          type="button"
          onClick={(e) => handlePageClick(e, currentPage + 1)}
          className={`${styles.navButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          disabled={currentPage === totalPages}
        >
          다음
        </button>
      ) : (
        <Link 
          href={createPageUrl(currentPage + 1)} 
          className={`${styles.navButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          aria-disabled={currentPage === totalPages}
        >
          다음
        </Link>
      )}
    </div>
  );
}
