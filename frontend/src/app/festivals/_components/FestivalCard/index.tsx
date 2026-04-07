'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star } from 'lucide-react';
import styles from './FestivalCard.module.css';

import { Festival } from '@/types/festival';
import ConfirmModal from '@/_component/common/Modal/ConfirmModal';

interface FestivalCardProps {
  festival: Festival;
}

export default function FestivalCard({ festival }: FestivalCardProps) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

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
            className={styles.heartBtn}
            onClick={(e) => {
              e.preventDefault();
              // TODO: Zustand/Auth 상태 체크 연동 후, 비회원일 때만 모달 띄우기
              setShowLoginModal(true);
            }}
          >
            <Heart size={20} className={styles.heartIcon} />
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
          </div>
        </div>
      </Link>

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
      )}
    </>
  );
}
