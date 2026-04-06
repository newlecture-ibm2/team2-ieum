'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import styles from './ReviewBoard.module.css';

interface ReviewBoardProps {
  reviews: any[];
  loading: boolean;
}

export default function ReviewBoard({ reviews, loading }: ReviewBoardProps) {
  const renderStars = (score: number) => {
    return [1, 2, 3, 4, 5].map(num => (
      <span key={num} style={{ color: num <= score ? '#fbbf24' : '#e2e8f0', fontSize: '16px' }}>★</span>
    ));
  };

  if (loading) {
    return <div className={styles.loading}>리뷰를 불러오는 중입니다...</div>;
  }

  if (reviews.length === 0) {
    return <div className={styles.empty}>아직 작성된 리뷰가 없거나 마지막 페이지입니다.</div>;
  }

  return (
    <div className={styles.list}>
      {reviews.map((review) => (
        <div key={review.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.authorGroup}>
              <div className={styles.avatar}>
                <User size={20} color="#64748b" strokeWidth={2.5} />
              </div>
              <div className={styles.meta}>
                <span className={styles.authorName}>익명 사용자</span>
                <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className={styles.ratingBox}>
              {renderStars(review.rating)}
            </div>
          </div>
          <div className={styles.cardBody}>
            {review.content}
          </div>
        </div>
      ))}
    </div>
  );
}
