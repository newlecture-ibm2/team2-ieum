'use client';

import { useState, useEffect } from 'react';
import { User, Trash2 } from 'lucide-react';
import axios from 'axios';
import styles from './ReviewBoard.module.css';

interface ReviewBoardProps {
  reviews: any[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ReviewBoard({ reviews, loading, onRefresh }: ReviewBoardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn) setCurrentUser(data.user);
      })
      .catch(console.error);
  }, []);

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;
    
    setDeletingId(reviewId);
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      alert('리뷰가 삭제되었습니다.');
      onRefresh(); // 페이지 컴포넌트에 목록 갱신 요청
    } catch (err: any) {
      alert(err.response?.data?.message || '리뷰 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

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
                <span className={styles.authorName}>{review.nickname || '익명 사용자'}</span>
                <span className={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className={styles.ratingBox} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div>{renderStars(review.rating)}</div>
              {(currentUser && (currentUser.id === review.userId || currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN')) && (
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  disabled={deletingId === review.id}
                  title="삭제하기"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Trash2 size={16} color={deletingId === review.id ? "#cbd5e1" : "#e53e3e"} />
                </button>
              )}
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
