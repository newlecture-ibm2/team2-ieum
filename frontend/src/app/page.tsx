import axios from 'axios';
import HeroBanner from './_components/HeroBanner'
import SearchFilter from './_components/SearchFilter';
import FestivalList from './_components/FestivalList';
import Pagination from './_components/Pagination';
import styles from './page.module.css';
import { Festival } from '@/types/festival';

// 백엔드 API 호출 함수 (서버 컴포넌트 환경)
async function getFestivals(status?: string, page: string = '1'): Promise<{ list: Festival[], total: number, totalPages?: number, currentPage?: number }> {
  try {
    // 실제 환경에서는 환경 변수를 활용 (Docker Compose의 경우 API_BASE_URL 사용)
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:8080';

    // axios를 사용하여 실제 엔드포인트 호출
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    // 프론트에서 넘어온 페이지 요청, 기본 12개 (3x4 페이징 그리드)
    params.append('page', page);
    params.append('size', '12');

    const res = await axios.get(`${baseUrl}/api/festivals?${params.toString()}`);

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
  const currentTab = resolvedParams.status || '전체';
  const currentPageParams = resolvedParams.page || '1';

  let statusQuery = '';
  if (currentTab === '진행중') statusQuery = 'ongoing';
  if (currentTab === '진행전') statusQuery = 'upcoming';

  const festivalData = await getFestivals(statusQuery, currentPageParams);

  return (
    <main className={styles.mainContainer}>
      {/* 
        팀원이 공통 헤더를 개발할 예정이므로 자리를 비워두지만,
        page Layout 측면에서 최상단 Nav는 /app/layout.tsx 에 들어갈 것입니다.
      */}

      {/* 1. 메인 다이내믹 히어로 캐러셀 배너 */}
      <HeroBanner currentTab={currentTab} />

      {/* 2. 퀵 필터/검색 바 */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <SearchFilter />

          {/* 3. 축제 목록 그리드 */}
          <FestivalList festivals={festivalData.list} />

          {/* 4. 페이지네이션 UI */}
          {festivalData.totalPages && festivalData.totalPages > 1 && (
            <Pagination 
              currentPage={Number(festivalData.currentPage) || 1} 
              totalPages={festivalData.totalPages} 
            />
          )}
        </div>
      </section>

      {/* 팀원이 공통 푸터를 개발할 예정 */}
    </main>
  );
}
