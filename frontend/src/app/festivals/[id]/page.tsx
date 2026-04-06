'use client';

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import styles from './FestivalDetail.module.css';

// 컴포넌트 임포트
import FestivalHero from './_components/FestivalHero';
import FestivalDetailInfo from './_components/FestivalDetailInfo';
import FestivalSidebar from './_components/FestivalSidebar';
import ReviewSection from './_components/ReviewSection';

export default function FestivalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const fid = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 팝업 상태
  const [popupMsg, setPopupMsg] = useState<string | null>(null);

  // 리뷰 데이터
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/reviews?festivalId=${fid}&page=1&size=10&sort=latest`);
      if (res.data && res.data.success) {
        setReviews(res.data.data.content);
        setReviewStats({
          totalPages: res.data.data.totalPages,
          totalElements: res.data.data.totalElements,
          averageRating: res.data.data.averageRating,
          ratingDistribution: res.data.data.ratingDistribution,
        });
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  useEffect(() => {
    const fetchFestival = async () => {
      try {
        const res = await api.get(`/api/festivals/${fid}`);
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch festival details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFestival();
    fetchReviews();
  }, [fid]);

  // --- 이벤트 핸들러 ---
  const toggleBookmark = () => {
    setIsBookmarked(prev => !prev);
    // TODO: API_FES_0040 연동
  };

  const showPopup = (msg: string) => setPopupMsg(msg);
  const closePopup = () => setPopupMsg(null);

  // --- 로딩 / 에러 상태 ---
  if (loading) {
    return <div className={styles.loadingContainer}>축제 정보를 불러오는 중입니다...</div>;
  }

  if (!data) {
    return (
      <div className={styles.errorContainer}>
        <p>축제 데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // --- 파생 데이터 ---
  const formatDt = (dt: string) => dt ? dt.toString().replace(/-/g, '.') : '';
  const dateString = data.startDate && data.endDate
    ? `${formatDt(data.startDate)} ~ ${formatDt(data.endDate)}`
    : '상시 진행 (미정)';
  const imageSrc = data.imageUrl || data.thumbnailUrl
    || '/images/hero_fallback.png'; // 기본 Fallback 이미지

  // --- 렌더링: 컴포넌트 조립만 담당 ---
  return (
    <main>
      {/* 1. 히어로 배너 */}
      <FestivalHero
        title={data.title}
        status={data.status}
        dateString={dateString}
        address={data.address}
        imageSrc={imageSrc}
        isBookmarked={isBookmarked}
        onToggleBookmark={toggleBookmark}
      />

      {/* 2. 콘텐츠 2단 레이아웃 */}
      <section className={styles.contentWrap}>
        <div className={styles.contentInner}>

          {/* 좌측: 상세정보 + 리뷰 */}
          <div className={styles.leftCol}>
            <FestivalDetailInfo
              overview={data.overview}
              description={data.description}
              imageSrc={imageSrc}
              images={data.images}
            />
            <ReviewSection
              festivalId={fid}
              reviews={reviews}
              reviewStats={reviewStats}
              onReviewSubmitted={fetchReviews}
              onPopup={showPopup}
            />
          </div>

          {/* 우측: 사이드바 */}
          <FestivalSidebar
            address={data.address}
            dateString={dateString}
            tel={data.tel}
            fee={data.fee}
            reviewStats={reviewStats}
          />

        </div>
      </section>

      {/* 팝업 모달 */}
      {popupMsg && (
        <div className={styles.modalOverlay}>
          <dialog open className={styles.modalBox} style={{ border: 'none' }}>
            <p className={styles.modalText}>{popupMsg}</p>
            <button className={styles.modalBtn} onClick={closePopup}>
              확인
            </button>
          </dialog>
        </div>
      )}
    </main>
  );
}
