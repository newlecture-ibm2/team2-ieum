'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import styles from './ReviewSection.module.css';

interface ReviewSectionProps {
  festivalId: string;
  reviews: any[];
  reviewStats: any;
  onReviewSubmitted: () => void;
  onPopup: (msg: string) => void;
}

export default function ReviewSection({
  festivalId,
  reviews,
  reviewStats,
  onReviewSubmitted,
  onPopup,
}: ReviewSectionProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewContent, setReviewContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (rating === 0) return onPopup('별점을 먼저 선택해주세요.');
    if (reviewContent.trim().length < 10) return onPopup('리뷰를 최소 10자 이상 작성해주세요.');

    setIsSubmitting(true);
    try {
      await api.post(`/api/reviews`, {
        festivalId,
        rating,
        content: reviewContent,
      });
      onPopup('리뷰가 성공적으로 등록되었습니다.');
      setReviewContent('');
      setRating(0);
      onReviewSubmitted();
    } catch (err: any) {
      onPopup(err.response?.data?.message || '리뷰 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (score: number) => {
    return [1, 2, 3, 4, 5].map(num => (
      <span key={num} className={styles.starDisplay} style={{ color: num <= score ? '#fbbf24' : '#e2e8f0' }}>★</span>
    ));
  };

  const renderFormStars = () => {
    return [1, 2, 3, 4, 5].map(num => (
      <span
        key={num}
        onMouseEnter={() => setHoverRating(num)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(num)}
        className={styles.starForm}
        style={{ color: num <= (hoverRating || rating) ? '#fbbf24' : '#e2e8f0' }}
      >
        ★
      </span>
    ));
  };

  return (
    <section className={styles.section}>
      <header className={styles.sectionTitle}>
        <h2>축제 후기 ({reviewStats?.totalElements || 0})</h2>
      </header>

      {/* 리뷰 작성 폼 */}
      <div className={styles.reviewForm}>
        <div className={styles.reviewAvatar}>
          <User size={20} color="#a0aec0" strokeWidth={2.5} />
        </div>
        <div className={styles.reviewInputBox}>
          <input
            type="text"
            placeholder="이 축제에 대한 솔직한 리뷰를 남겨주세요 (최소 10자 이상)"
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
          />
          <div className={styles.reviewActions}>
            <span className={styles.reviewStars}>{renderFormStars()}</span>
            <button
              className={`${styles.reviewBtn} ${isSubmitting ? styles.submitDisabled : ''}`}
              onClick={handleSubmitReview}
              disabled={isSubmitting}
            >
              {isSubmitting ? '진행중...' : '리뷰 등록'}
            </button>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 (최근 3개) */}
      <div className={styles.reviewList}>
        {reviews.length === 0 ? (
          <div className={styles.emptyReviews}>
            아직 등록된 리뷰가 없습니다. 첫 리뷰를 남겨보세요!
          </div>
        ) : (
          reviews.slice(0, 3).map(review => (
            <article key={review.id} className={styles.reviewCard}>
              <div className={styles.rcAvatar}>
                <User size={18} color="#ffffff" strokeWidth={2.5} />
              </div>
              <div className={styles.rcContent}>
                <div className={styles.rcTop}>
                  <div className={styles.rcName}>
                    익명 사용자
                    <span className={styles.rcStars}>{renderStars(review.rating)}</span>
                  </div>
                  <div className={styles.rcDate}>{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                <div className={styles.rcText}>{review.content}</div>
              </div>
            </article>
          ))
        )}
      </div>

      <Link href={`/festivals/${festivalId}/reviews`} style={{ textDecoration: 'none' }}>
        <button className={styles.reviewMoreBtn}>
          + 후기 전체보기 (총 {reviewStats?.totalElements || 0}개)
        </button>
      </Link>
    </section>
  );
}
