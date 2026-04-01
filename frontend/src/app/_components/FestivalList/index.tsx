'use client';

import FestivalCard from '../FestivalCard';
import styles from './FestivalList.module.css';
import { Festival } from '@/types/festival';
import { Ghost } from 'lucide-react';

interface FestivalListProps {
  festivals: Festival[];
}

export default function FestivalList({ festivals }: FestivalListProps) {
  // Skeleton 또는 Empty State 처리
  if (!festivals || festivals.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconWrap}>
          <Ghost size={48} className={styles.emptyIcon} />
        </div>
        <h3>앗, 아직 등록된 축제가 없어요!</h3>
        <p>백엔드 서버와 연결되어 있는지 확인하거나, 검색 조건을 변경해보세요.</p>
        <button className={styles.refreshBtn} onClick={() => window.location.reload()}>새로고침</button>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {festivals.map(fest => (
        <FestivalCard key={fest.id || fest.festivalId} festival={fest} />
      ))}
    </div>
  );
}
