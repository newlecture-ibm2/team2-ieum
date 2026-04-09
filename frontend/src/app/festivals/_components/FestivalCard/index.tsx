'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import api from '@/lib/api';
import { ConfirmModal } from '@/_component/common/Modal';
import styles from './FestivalCard.module.css';

import { Festival } from '@/types/festival';

interface FestivalCardProps {
  festival: Festival;
}

export default function FestivalCard({ festival }: FestivalCardProps) {
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
      setIsFavorited(prev => !prev);
      setFavCount(prev => isFavorited ? Math.max(0, prev - 1) : prev + 1);
    } catch (err) {
      console.error('찜하기 실패:', err);
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

            <div className={styles.favInfo}>
              <Heart size={13} className={styles.favIcon} />
              <span>{favCount}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 비로그인 유저 안내 모달 */}
      {showLoginModal && (
        <ConfirmModal
          message="회원만 이용 가능한 기능입니다."
          confirmText="확인"
          onConfirm={() => setShowLoginModal(false)}
          onCancel={() => setShowLoginModal(false)}
        />
      )}
    </>
  );
}
