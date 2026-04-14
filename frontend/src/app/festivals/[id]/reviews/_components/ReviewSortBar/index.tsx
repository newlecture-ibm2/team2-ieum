'use client';

import styles from './ReviewSortBar.module.css';

interface ReviewSortBarProps {
  totalElements: number;
  sort: string;
  onSortChange: (sort: string) => void;
}

export default function ReviewSortBar({ totalElements, sort, onSortChange }: ReviewSortBarProps) {
  return (
    <div className={styles.toolbar}>
      <span className={styles.totalCount}>총 <b>{totalElements}</b>개의 소중한 리뷰</span>
      <div className={styles.sortOptions}>
        <button
          className={`${styles.sortBtn} ${sort === 'latest' ? styles.active : ''}`}
          onClick={() => onSortChange('latest')}
        >
          최신순
        </button>
        <span className={styles.divider}>|</span>
        <button
          className={`${styles.sortBtn} ${sort === 'rating' ? styles.active : ''}`}
          onClick={() => onSortChange('rating')}
        >
          별점 높은 순
        </button>
      </div>
    </div>
  );
}
