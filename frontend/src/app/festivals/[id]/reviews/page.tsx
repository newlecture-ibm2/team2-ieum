'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import styles from './Reviews.module.css';

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

  useEffect(() => {
    const fetchFestivalInfo = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';
        const res = await axios.get(`${baseUrl}/api/festivals/${fid}`);
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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090';
        let apiSort = sort; // 'latest' or 'rating'

        const res = await axios.get(`${baseUrl}/api/reviews?festivalId=${fid}&page=${page}&size=10&sort=${apiSort}`);
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
  }, [fid, page, sort]);

  const renderStars = (score: number) => {
    return [1, 2, 3, 4, 5].map(num => (
      <span key={num} style={{ color: num <= score ? '#fbbf24' : '#e2e8f0', fontSize: '16px' }}>★</span>
    ));
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

      <section className={styles.board}>
        <div className={styles.toolbar}>
          <span className={styles.totalCount}>총 <b>{totalElements}</b>개의 소중한 리뷰</span>
          <div className={styles.sortOptions}>
            <button className={`${styles.sortBtn} ${sort === 'latest' ? styles.active : ''}`} onClick={() => { setSort('latest'); setPage(1); }}>
              최신순
            </button>
            <span className={styles.divider}>|</span>
            <button className={`${styles.sortBtn} ${sort === 'rating' ? styles.active : ''}`} onClick={() => { setSort('rating'); setPage(1); }}>
              별점 높은 순
            </button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>리뷰를 불러오는 중입니다...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.empty}>아직 작성된 리뷰가 없거나 마지막 페이지입니다.</div>
        ) : (
          <div className={styles.list}>
            {reviews.map((review) => (
              <div key={review.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.authorGroup}>
                    <div className={styles.avatar}>익명</div>
                    <div className={styles.meta}>
                      <span className={styles.authorName}>익명 사용자</span>
                      <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={styles.ratingBox}>
                    {renderStars(review.rating)}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  {review.content}
                </div>
              </div>
            ))}
          </div>
        )}

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
