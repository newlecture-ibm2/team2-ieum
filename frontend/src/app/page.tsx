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

<<<<<<< HEAD
// Next.js 서버 컴포넌트 캐싱 비활성화 — 정렬/필터 URL이 바뀔 때마다 항상 최신 데이터 fetch
export const dynamic = 'force-dynamic';

// 백엔드 API 호출 함수 (서버 컴포넌트 환경)
async function getFestivals(status?: string, page: string = '1', keyword?: string, areaCode?: string, month?: string, sort?: string, lat?: string, lng?: string): Promise<{ list: Festival[], total: number, totalPages?: number, currentPage?: number }> {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (keyword) params.append('keyword', keyword);
    if (areaCode) params.append('areaCode', areaCode);
    if (month) params.append('month', month);
    if (sort && sort !== 'latest') params.append('sort', sort);
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    params.append('page', page);
    params.append('size', '12');

    const res = await api.get(`/api/festivals?${params.toString()}`);

    if (res.data && res.data.success) {
      return res.data.data; // { list: [...], total: ... }
    }
  } catch (error) {
    console.error('Festivals fetch error. Falling back to empty array.', error);
  }

  return { list: [], total: 0 };
}

export default async function MainPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // await searchParams (Next.js 15+ 방식 호환)
  const resolvedParams = await searchParams;
  const currentTab = resolvedParams.status || 'all';
  const currentPageParams = resolvedParams.page || '1';
  const currentKeyword = resolvedParams.keyword || '';
  const currentAreaCode = resolvedParams.areaCode || '';
  const currentMonth = resolvedParams.month || '';
  const currentSort = resolvedParams.sort || 'latest';
  const currentLat = resolvedParams.lat || '';
  const currentLng = resolvedParams.lng || '';
=======
interface FestivalData {
  list: Festival[];
  total: number;
  totalPages?: number;
  currentPage?: number;
}

function MainPageContent() {
  const searchParams = useSearchParams();
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97

  const currentTab = searchParams.get('status') || 'all';
  const currentPageParam = searchParams.get('page') || '1';
  const currentKeyword = searchParams.get('keyword') || '';
  const currentAreaCode = searchParams.get('areaCode') || '';
  const currentMonth = searchParams.get('month') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentLat = searchParams.get('lat') || '';
  const currentLng = searchParams.get('lng') || '';

<<<<<<< HEAD
  const festivalData = await getFestivals(statusQuery, currentPageParams, currentKeyword || undefined, currentAreaCode || undefined, currentMonth || undefined, currentSort, currentLat || undefined, currentLng || undefined);
=======
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
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97

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
          {!loading && (festivalData.totalPages ?? 0) > 1 && (
            <Pagination
              currentPage={Number(festivalData.currentPage) || 1}
              totalPages={festivalData.totalPages!}
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
