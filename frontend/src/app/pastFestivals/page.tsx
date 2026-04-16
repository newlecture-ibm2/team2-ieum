'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchFilter from '@/_component/common/SearchFilter';
import FestivalList from '@/app/festivals/_components/FestivalList';
import Pagination from '@/_component/common/Pagination';
import { Festival } from '@/types/festival';
import styles from './PastFestivals.module.css';

interface FestivalData {
  list: Festival[];
  total: number;
  totalPages?: number;
  currentPage?: number;
}

function PastFestivalsContent() {
  const searchParams = useSearchParams();

  const currentPageParam = searchParams.get('page') || '1';
  const currentKeyword = searchParams.get('keyword') || '';
  const currentAreaCode = searchParams.get('areaCode') || '';
  const currentMonth = searchParams.get('month') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentLat = searchParams.get('lat') || '';
  const currentLng = searchParams.get('lng') || '';

  const [festivalData, setFestivalData] = useState<FestivalData>({ list: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFestivals = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('status', 'ended');
        if (currentKeyword) params.append('keyword', currentKeyword);
        if (currentAreaCode) params.append('areaCode', currentAreaCode);
        if (currentMonth) params.append('month', currentMonth);
        if (currentSort) params.append('sort', currentSort);
        if (currentLat) params.append('lat', currentLat);
        if (currentLng) params.append('lng', currentLng);
        params.append('page', currentPageParam);
        params.append('size', '12');

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const res = await fetch(`${backendUrl}/api/festivals?${params.toString()}`);

        if (res.ok) {
          const data = await res.json();
          if (data && data.success) {
            setFestivalData(data.data);
          }
        }
      } catch (error) {
        console.error('지난축제 목록 조회 실패:', error);
        setFestivalData({ list: [], total: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [currentPageParam, currentKeyword, currentAreaCode, currentMonth, currentSort, currentLat, currentLng]);

  return (
    <main className={styles.mainContainer}>
      {/* 히어로 배너 */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>지난 축제</h1>
          <p className={styles.heroSub}>
            종료된 축제를 둘러보고 리뷰를 남겨보세요
          </p>
        </div>
      </section>

      {/* 검색 + 필터 + 카드 + 페이지네이션 */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <SearchFilter filterType="festival" />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: '15px' }}>
              축제 정보를 불러오는 중입니다...
            </div>
          ) : (
            <FestivalList festivals={festivalData.list} />
          )}

          {!loading && (festivalData.totalPages ?? 0) > 1 && (
            <Pagination
              currentPage={Number(festivalData.currentPage) || 1}
              totalPages={festivalData.totalPages!}
            />
          )}
        </div>
      </section>
    </main>
  );
}

export default function PastFestivalsPage() {
  return (
    <Suspense fallback={
      <main className={styles.mainContainer}>
        <div style={{ textAlign: 'center', padding: '120px 0', color: '#94a3b8', fontSize: '15px' }}>
          페이지를 불러오는 중입니다...
        </div>
      </main>
    }>
      <PastFestivalsContent />
    </Suspense>
  );
}
