"use client";

import React, { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, MessageSquare, MapPin } from 'lucide-react';
import styles from '../mypage.module.css';

interface Review {
  id: number;
  festivalName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export default function ReviewList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 설계서상 API: GET /api/users/me/reviews
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/users/me/activities/?type=reviews&_t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        
        if (data.success && data.data) {
          setReviews(data.data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < rating ? "var(--color-primary-500)" : "transparent"} 
        color={i < rating ? "var(--color-primary-500)" : "#cbd5e1"} 
      />
    ));
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.listContainer}>
      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} />
          <p>아직 작성한 리뷰가 없습니다. 축제의 추억을 기록해보세요!</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className={styles.dataCard}>
            <div className={styles.cardHeader}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-primary-600)', fontWeight: 700, backgroundColor: '#f5f3ff', padding: '2px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                  <MapPin size={10} /> {review.festivalName}
                </div>
                <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                  {renderStars(review.rating)}
                </div>
              </div>
              <span className={styles.cardDate}>{review.createdAt}</span>
            </div>
            
            <p className={styles.cardBody} style={{ marginTop: '12px' }}>
              {review.content}
            </p>

            <div className={styles.cardActions}>
              <button className={`${styles.btnAction} ${styles.btnEdit}`}>
                <Edit2 size={14} style={{ marginRight: 4 }} /> 수정
              </button>
              <button className={`${styles.btnAction} ${styles.btnDelete}`}>
                <Trash2 size={14} style={{ marginRight: 4 }} /> 삭제
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
