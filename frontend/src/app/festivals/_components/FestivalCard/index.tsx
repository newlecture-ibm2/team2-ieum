'use client';

<<<<<<< HEAD
import { useState } from 'react';
=======
import { useState, useEffect } from 'react';
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/_component/common/Toast';
import Modal from '@/_component/common/Modal/Modal';
import modalStyles from '@/_component/common/Modal/Modal.module.css';
import styles from './FestivalCard.module.css';

import { Festival } from '@/types/festival';
import ConfirmModal from '@/_component/common/Modal/ConfirmModal';

interface FestivalCardProps {
  festival: Festival;
}

export default function FestivalCard({ festival }: FestivalCardProps) {
  const router = useRouter();
<<<<<<< HEAD
  const [showLoginModal, setShowLoginModal] = useState(false);

=======
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
  const festId = festival.festivalId || festival.id;
  const imageSrc = festival.imageUrl || festival.thumbnailUrl || '/images/hero_fallback.png'; // Fallback
  const rating = festival.avgStar || festival.avgRating || 0;
  const reviews = festival.reviewCount || 0;

  // 상태에 따른 뱃지 스타일 분기
  const isOngoing = festival.status === 'ONGOING';
  const badgeClass = isOngoing ? styles.badgeOngoing : styles.badgeUpcoming;
  const badgeText = isOngoing ? '진행중' : (festival.status === 'UPCOMING' ? '진행예정' : '종료');

  // 날짜 포맷 (2026-04-01 -> 2026.04.01)
  const formatDt = (dt: string) => dt ? dt.replace(/-/g, '.') : '';

  // 찜하기 상태
  const [isFavorited, setIsFavorited] = useState(false);
  const [favCount, setFavCount] = useState(festival.favoriteCount ?? 0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // 로그인 여부 + 찜 여부 확인
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          // 로그인 상태면 찜 여부 확인
          api.get(`/api/favorites/check?festivalId=${festId}`)
            .then(res => {
              if (res.data?.data?.isFavorite) {
                setIsFavorited(true);
              }
            })
            .catch(() => {}); // 실패 시 무시
        }
      })
      .catch(() => {});
  }, [festId]);

  const { toast } = useToast();

  // 찜하기 토글 핸들러
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (isToggling) return;
    setIsToggling(true);

    try {
      await api.post('/api/favorites', { festivalId: Number(festId) });
      const wasBookmarked = isFavorited;
      setIsFavorited(prev => !prev);
      setFavCount(prev => isFavorited ? Math.max(0, prev - 1) : prev + 1);
      toast(wasBookmarked ? '찜 목록에서 삭제했습니다.' : '찜 목록에 추가했습니다.', wasBookmarked ? 'info' : 'success');
    } catch (err) {
      console.error('찜하기 실패:', err);
      toast('찜하기에 실패했습니다.', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <>
      <Link href={`/festivals/${festId}`} className={styles.card}>
        <div className={styles.imageWrap}>
          {/* Next.js Image를 쓸 수 있지만 외부 도메인 설정이 복잡할 수 있어 
              배경 이미지로 프리미엄하게 처리했습니다 */}
          <div
            className={styles.image}
            style={{ backgroundImage: `url(${imageSrc})` }}
          />

          {/* 오버레이 마스크 */}
          <div className={styles.overlay} />

          {/* 뱃지 & 찜하기 */}
          <span className={`${styles.badge} ${badgeClass}`}>
            {badgeText}
          </span>

          <button
<<<<<<< HEAD
            className={styles.heartBtn}
            onClick={(e) => {
              e.preventDefault();
              // TODO: Zustand/Auth 상태 체크 연동 후, 비회원일 때만 모달 띄우기
              setShowLoginModal(true);
            }}
          >
            <Heart size={20} className={styles.heartIcon} />
=======
            className={`${styles.heartBtn} ${isFavorited ? styles.heartActive : ''}`}
            onClick={handleFavoriteToggle}
            disabled={isToggling}
          >
            <Heart
              size={20}
              className={styles.heartIcon}
              fill={isFavorited ? '#e74c3c' : 'none'}
              color={isFavorited ? '#e74c3c' : 'white'}
            />
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
          </button>
        </div>

        <div className={styles.content}>
          <h3 className={styles.title} title={festival.title}>{festival.title}</h3>
          <p className={styles.date}>
            {formatDt(festival.startDate)} ~ {formatDt(festival.endDate)}
          </p>

          <div className={styles.ratingInfo}>
            <div className={styles.stars}>
              {/* 고정 5개 별점 + 색상 채우기 (간단 버전) */}
              <Star size={14} className={styles.starFill} />
              <span className={styles.score}>{rating.toFixed(1)}</span>
            </div>
            <span className={styles.reviewCnt}>({reviews.toLocaleString()})</span>
<<<<<<< HEAD
=======

            <div className={styles.favInfo}>
              <Heart size={13} className={styles.favIcon} />
              <span>{favCount}</span>
            </div>
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
          </div>
        </div>
      </Link>

<<<<<<< HEAD
      {/* 비회원 찜하기 로그인 유도 모달 */}
      {showLoginModal && (
        <ConfirmModal
          title="로그인 안내"
          message="로그인 후 이용 가능합니다. 로그인 화면으로 이동하시겠습니까?"
          confirmText="이동하기"
          cancelText="닫기"
          onConfirm={() => router.push('/auth/login')}
          onCancel={() => setShowLoginModal(false)}
        />
=======
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
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
      )}
    </>
  );
}
