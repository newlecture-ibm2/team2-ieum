'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HeroBanner from './festivals/_components/HeroBanner'
import SearchFilter from '@/_component/common/SearchFilter';
import FestivalList from './festivals/_components/FestivalList';
import Pagination from '@/_component/common/Pagination';
import styles from './page.module.css';
import { Festival } from '@/types/festival';
import NoticePopup from './notices/_components/NoticePopup';

interface FestivalData {
  list: Festival[];
  total: number;
  totalPages?: number;
  currentPage?: number;
}

function MainPageContent() {
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('status') || 'all';
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
        const statusQuery = currentTab === 'all' ? '' : currentTab;
        if (statusQuery) params.append('status', statusQuery);
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
        console.error('Festivals fetch error:', error);
        setFestivalData({ list: [], total: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchFestivals();
  }, [currentTab, currentPageParam, currentKeyword, currentAreaCode, currentMonth, currentSort, currentLat, currentLng]);

  return (
    <main className={styles.mainContainer}>
      {/* 1. 메인 다이내믹 히어로 캐러셀 배너 */}
      <HeroBanner currentTab={currentTab} />

      {/* 2. 퀵 필터/검색 바 */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <SearchFilter />

          {/* 3. 축제 목록 그리드 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: '15px' }}>
              축제 정보를 불러오는 중입니다...
            </div>
          ) : (
            <FestivalList festivals={festivalData.list} />
          )}

          {/* 4. 페이지네이션 UI */}
          {!loading && festivalData.totalPages && festivalData.totalPages > 1 && (
            <Pagination
              currentPage={Number(festivalData.currentPage) || 1}
              totalPages={festivalData.totalPages}
            />
          )}
        </div>
      </section>

      {/* 5. 팝업 공지사항 */}
      <NoticePopup />
    </main>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={
      <main className={styles.mainContainer}>
        <div style={{ textAlign: 'center', padding: '120px 0', color: '#94a3b8', fontSize: '15px' }}>
          페이지를 불러오는 중입니다...
        </div>
      </main>
    }>
      <MainPageContent />
    </Suspense>
  );
}
