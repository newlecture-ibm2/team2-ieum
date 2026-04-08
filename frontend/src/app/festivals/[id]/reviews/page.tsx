'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import styles from './Reviews.module.css';

// 컴포넌트 임포트
import ReviewSortBar from './_components/ReviewSortBar';
import ReviewBoard from './_components/ReviewBoard';

export default function ReviewListPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const fid = resolvedParams.id;

  const [festivalData, setFestivalData] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchFestivalInfo = async () => {
      try {
        const res = await api.get(`/api/festivals/${fid}`);
        if (res.data && res.data.success) {
          setFestivalData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch festival data', err);
      }
    };
    fetchFestivalInfo();
  }, [fid]);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/reviews?festivalId=${fid}&page=${page}&size=10&sort=${sort}`);
        if (res.data && res.data.success) {
          setReviews(res.data.data.content);
          setTotalPages(res.data.data.totalPages);
          setTotalElements(res.data.data.totalElements);
        }
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [fid, page, sort, refreshTrigger]);

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const generatePageNumbers = () => {
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (page <= 3) end = Math.min(5, totalPages);
    if (page > totalPages - 2) start = Math.max(1, totalPages - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <main className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <Link href={`/festivals/${fid}`} className={styles.backBtn}>
            <ArrowLeft size={18} /> 축제 상세로 돌아가기
          </Link>
        </div>
        <h1 className={styles.title}>
          {festivalData?.title ? `"${festivalData.title}" ` : ''}리뷰 전체보기
        </h1>
      </header>

      {/* 리뷰 보드 */}
      <section className={styles.board}>
        <ReviewSortBar
          totalElements={totalElements}
          sort={sort}
          onSortChange={handleSortChange}
        />

        <ReviewBoard
          reviews={reviews}
          loading={loading}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />

        {/* 페이지네이션 */}
        {totalPages > 0 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ◀
            </button>
            {generatePageNumbers().map(p => (
              <button
                key={p}
                className={`${styles.pageBtn} ${page === p ? styles.activePage : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className={styles.pageBtn}
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
            >
              ▶
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
