'use client';

import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import styles from './FestivalCard.module.css';

import { Festival } from '@/types/festival';

interface FestivalCardProps {
  festival: Festival;
}

export default function FestivalCard({ festival }: FestivalCardProps) {
  const festId = festival.festivalId || festival.id;
  const imageSrc = festival.imageUrl || festival.thumbnailUrl || '/images/hero_spring.png'; // Fallback
  const rating = festival.avgStar || festival.avgRating || 0;
  const reviews = festival.reviewCount || 0;

  // 상태에 따른 뱃지 스타일 분기
  const isOngoing = festival.status === 'ONGOING';
  const badgeClass = isOngoing ? styles.badgeOngoing : styles.badgeUpcoming;
  const badgeText = isOngoing ? '진행예정' : (festival.status === 'UPCOMING' ? '진행전' : '종료');

  // 날짜 포맷 (2026-04-01 -> 2026.04.01)
  const formatDt = (dt: string) => dt ? dt.replace(/-/g, '.') : '';

  return (
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
            // TODO: Zustand 상태 및 Scrap 토글 API 호출
            alert('찜하기 토글 (로그인 필요)');
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
  );
}
