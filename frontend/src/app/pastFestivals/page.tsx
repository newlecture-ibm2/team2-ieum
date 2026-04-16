import api from '@/lib/api';
import SearchFilter from '@/_component/common/SearchFilter';
import FestivalList from '@/app/festivals/_components/FestivalList';
import Pagination from '@/_component/common/Pagination';
import { Festival } from '@/types/festival';
import styles from './PastFestivals.module.css';

async function getEndedFestivals(
  page: string = '1',
  keyword?: string,
  areaCode?: string,
  month?: string,
  sort?: string,
  lat?: string,
  lng?: string,
): Promise<{ list: Festival[]; total: number; totalPages?: number; currentPage?: number }> {
  try {
    const params = new URLSearchParams();
    params.append('status', 'ended');
    if (keyword) params.append('keyword', keyword);
    if (areaCode) params.append('areaCode', areaCode);
    if (month) params.append('month', month);
    if (sort) params.append('sort', sort);
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    params.append('page', page);
    params.append('size', '12');

    const res = await api.get(`/api/festivals?${params.toString()}`);

    if (res.data?.success) {
      return res.data.data;
    }
  } catch (error) {
    console.error('지난축제 목록 조회 실패:', error);
  }

  return { list: [], total: 0 };
}

export default async function PastFestivalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const currentPage = resolvedParams.page || '1';
  const currentKeyword = resolvedParams.keyword || '';
  const currentAreaCode = resolvedParams.areaCode || '';
  const currentMonth = resolvedParams.month || '';
  const currentSort = resolvedParams.sort || '';
  const currentLat = resolvedParams.lat || '';
  const currentLng = resolvedParams.lng || '';

  const festivalData = await getEndedFestivals(
    currentPage,
    currentKeyword || undefined,
    currentAreaCode || undefined,
    currentMonth || undefined,
    currentSort || undefined,
    currentLat || undefined,
    currentLng || undefined,
  );

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

          <FestivalList festivals={festivalData.list} />

          {festivalData.totalPages && festivalData.totalPages > 1 && (
            <Pagination
              currentPage={Number(festivalData.currentPage) || 1}
              totalPages={festivalData.totalPages}
            />
          )}
        </div>
      </section>
    </main>
  );
}
