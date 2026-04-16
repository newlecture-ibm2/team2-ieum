'use client';

import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft } from 'lucide-react';
import styles from './FestivalHero.module.css';

interface FestivalHeroProps {
  title: string;
  status: string;
  dateString: string;
  address?: string;
  imageSrc: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function FestivalHero({
  title,
  status,
  dateString,
  address,
  imageSrc,
  isBookmarked,
  onToggleBookmark,
}: FestivalHeroProps) {
  const router = useRouter();

  let badgeText = '진행예정';
  if (status === 'ONGOING') badgeText = '진행중';
  if (status === 'ENDED') badgeText = '종료';

  return (
    <section
      className={styles.hero}
      style={{ '--hero-bg': `url(${imageSrc})` } as React.CSSProperties}
    >
      {/* 백그라운드 블러 오버레이 */}
      <div className={styles.heroBgOverlay} />

      <div className={styles.topNav}>
        <div className={styles.topNavInner}>
          <button 
            className={styles.backButton} 
            onClick={() => router.push(status === 'ENDED' ? '/pastFestivals' : '/')} 
            aria-label="뒤로가기"
          >
            <ArrowLeft size={18} />
            <span>목록으로</span>
          </button>
        </div>
      </div>

      <div className={styles.heroInner}>
        <div className={styles.badgeWrap}>
          <span className={styles.badge}>{badgeText}</span>
        </div>
        <div className={styles.titleRow}>
          <div className={styles.titleBox}>
            <h1>{title}</h1>
            <p>
              <span>📅 {dateString}</span>{' '}
              <span>📍 {address ? address.split(' ')[0] : '지역 미상'}</span>
            </p>
          </div>
          <button
            className={`${styles.bookmark} ${isBookmarked ? styles.active : ''}`}
            onClick={onToggleBookmark}
            aria-label="찜하기"
          >
            <Heart fill={isBookmarked ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>
      </div>
    </section>
  );
}
