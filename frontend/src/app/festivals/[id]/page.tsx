'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/_component/common/Toast';
import styles from './FestivalDetail.module.css';
import Modal from '@/_component/common/Modal/Modal';
import modalStyles from '@/_component/common/Modal/Modal.module.css';

// 컴포넌트 임포트
import FestivalHero from './_components/FestivalHero';
import FestivalDetailInfo from './_components/FestivalDetailInfo';
import FestivalSidebar from './_components/FestivalSidebar';
import ReviewSection from './_components/ReviewSection';

export default function FestivalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const fid = resolvedParams.id;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 유도 모달 상태
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 범용 팝업 메시지 상태
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

    const checkFavoriteStatus = async () => {
      try {
        // 로그인 상태 확인 후, 로그인된 경우에만 즐겨찾기 상태 체크
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) return;
        
        const authData = await authRes.json();
        if (!authData.isLoggedIn) return; // 비로그인 시 skip

        setIsLoggedIn(true);

        const res = await api.get(`/api/favorites/check?festivalId=${fid}`);
        if (res.data?.success) {
          setIsBookmarked(res.data.data.isFavorite);
        }
      } catch (error) {
        // 인증 실패(401)는 무시 — 비로그인 사용자는 즐겨찾기 미표시
        if ((error as any)?.response?.status !== 401) {
          console.error('Failed to check favorite status', error);
        }
      }
    };

    fetchFestival();
    fetchReviews();
    checkFavoriteStatus();
  }, [fid]);

  // --- 이벤트 핸들러 ---
  const { toast } = useToast();

  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    try {
      const wasBookmarked = isBookmarked;
      await api.post('/api/favorites', { festivalId: Number(fid) });
      setIsBookmarked(prev => !prev);
      toast(wasBookmarked ? '찜 목록에서 삭제했습니다.' : '찜 목록에 추가했습니다.', wasBookmarked ? 'info' : 'success');
    } catch (err: any) {
      console.error('Failed to toggle bookmark', err);
      toast('찜하기에 실패했습니다.', 'error');
    }
  };

  // ReviewSection 등에서 사용하는 범용 메시지 팝업
  const showPopup = (msg: string) => setPopupMsg(msg);

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

          {/* 좌측: 상세정보 + 리뷰 (모바일에서는 display: contents 로 해제됨) */}
          <div className={styles.leftCol}>
            <div className={styles.orderDetail}>
              <FestivalDetailInfo
                overview={data.overview}
                description={data.description}
                imageSrc={imageSrc}
                images={data.images}
              />
            </div>
            <div className={styles.orderReview}>
              <ReviewSection
                festivalId={fid}
                reviews={reviews}
                reviewStats={reviewStats}
                onReviewSubmitted={fetchReviews}
                onPopup={showPopup}
              />
            </div>
          </div>

          {/* 우측: 사이드바 */}
          <div className={styles.orderSidebar}>
            <FestivalSidebar
              address={data.address}
              dateString={dateString}
              tel={data.tel}
              fee={data.fee}
              reviewStats={reviewStats}
            />
          </div>

        </div>
      </section>

      {/* 범용 팝업 모달 (리뷰 등록/삭제 성공/실패 등) */}
      {popupMsg && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ border: 'none' }}>
            <p className={styles.modalText}>{popupMsg}</p>
            <button className={styles.modalBtn} onClick={() => setPopupMsg(null)}>
              확인
            </button>
          </div>
        </div>
      )}

      {/* 비로그인 유저 로그인 유도 모달 */}
      {showLoginModal && (
        <Modal
          title="로그인이 필요합니다"
          size="small"
          onClose={() => setShowLoginModal(false)}
        >
          <p className={modalStyles.confirmMessage}>
            찜하기는 로그인 후 이용할 수 있습니다.{'\n'}로그인하시겠습니까?
          </p>
          <div className={modalStyles.footer}>
            <button
              type="button"
              className={modalStyles.btnCancel}
              onClick={() => setShowLoginModal(false)}
            >
              취소
            </button>
            <button
              type="button"
              className={modalStyles.btnConfirm}
              onClick={() => router.push('/login')}
            >
              로그인
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

