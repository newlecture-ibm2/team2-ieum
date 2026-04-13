'use client';

import { useState, useEffect } from 'react';
import { User, Trash2, Siren, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Modal, ConfirmModal } from '@/_component/common/Modal';
import styles from './ReviewSection.module.css';
import { USER_STATUS } from '@/constants/userStatus';
import { REPORT_REASON, REPORT_REASON_OPTIONS } from '@/constants/reportOptions';
import { TARGET_TYPE } from '@/constants/targetType';

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [reportingReviewId, setReportingReviewId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn) {
          setCurrentUser(data.user);
          if (data.user?.status === USER_STATUS.SUSPENDED) {
            setIsSuspended(true);
          }
        }
      })
      .catch(console.error);
  }, []);

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
      setReviewContent('');
      setRating(0);
      onReviewSubmitted();
    } catch (err: any) {
      const apiErrorMsg = err.response?.data?.error?.message || err.response?.data?.message;
      onPopup(apiErrorMsg || '리뷰 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (reviewId: number) => {
    setConfirmDeleteId(reviewId);
  };

  const executeDeleteReview = async () => {
    if (confirmDeleteId === null) return;
    
    setDeletingId(confirmDeleteId);
    try {
      await api.delete(`/api/reviews/${confirmDeleteId}`);
      onPopup('리뷰가 삭제되었습니다.');
      onReviewSubmitted(); // 목록 새로고침
    } catch (err: any) {
      const apiErrorMsg = err.response?.data?.error?.message || err.response?.data?.message;
      onPopup(apiErrorMsg || '리뷰 삭제에 실패했습니다.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleReportReview = (reviewId: number) => {
    if (!currentUser) return onPopup('로그인이 필요합니다.');
    setReportingReviewId(reviewId);
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
      {isSuspended ? (
        <div className={styles.suspendedNotice}>
          <ShieldAlert size={20} color="#ef4444" />
          <span>활동이 정지된 계정입니다. 정지 해제 후 리뷰를 작성할 수 있습니다.</span>
        </div>
      ) : (
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSubmitReview();
              }
            }}
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
      )}

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
                    {review.nickname || '익명 사용자'}
                    <span className={styles.rcStars}>{renderStars(review.rating)}</span>
                  </div>
                  <div className={styles.rcDateWrapper}>
                    <div className={styles.rcDate}>{new Date(review.createdAt).toLocaleDateString()}</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {/* 리뷰 작성자와 현재 세션 유저가 일치하거나 ADMIN 스태프인 경우 삭제 버튼 표출 */}
                      {(currentUser && (String(currentUser.userId) === String(review.userId) || currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN')) && (
                        <button 
                          className={styles.deleteReviewBtn} 
                          onClick={() => handleDeleteClick(review.id)}
                          disabled={deletingId === review.id}
                          title="리뷰 삭제"
                        >
                          <Trash2 size={16} color={deletingId === review.id ? "#cbd5e1" : "#e53e3e"} />
                        </button>
                      )}
                      
                      {/* 본인의 리뷰가 아닌 경우 신고 버튼 표출 */}
                      {(currentUser && String(currentUser.userId) !== String(review.userId)) && (
                        <button 
                          className={styles.reportBtn} 
                          onClick={() => handleReportReview(review.id)}
                          title="리뷰 신고"
                        >
                          <Siren size={15} color="currentColor" strokeWidth={2.2} />
                        </button>
                      )}
                    </div>
                  </div>
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

      {reportingReviewId !== null && (
        <Modal title="리뷰 신고" size="small" onClose={() => setReportingReviewId(null)}>
          <div className={styles.reportModal}>
            <p className={styles.reportDesc}>신고 사유를 선택해주세요.</p>
            <div className={styles.reportOptions}>
              {REPORT_REASON_OPTIONS.map(opt => (
                <label key={opt.value} className={styles.reportOption}>
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.value}
                    checked={reportReason === opt.value}
                    onChange={e => setReportReason(e.target.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {reportReason === REPORT_REASON.OTHER && (
              <textarea
                className={styles.reportTextarea}
                placeholder="상세 사유를 입력해주세요 (최대 500자)"
                maxLength={500}
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
              />
            )}
            <div className={styles.reportActions}>
              <button
                className={styles.btnCancel}
                onClick={() => {
                  setReportingReviewId(null);
                  setReportReason('');
                  setReportDescription('');
                }}
              >
                취소
              </button>
              <button
                className={styles.btnReport}
                disabled={!reportReason}
                onClick={async () => {
                  try {
                    await api.post('/api/reports', {
                      targetType: TARGET_TYPE.REVIEW,
                      targetId: reportingReviewId,
                      reason: reportReason,
                      description: reportReason === REPORT_REASON.OTHER ? reportDescription : null,
                    });
                    onPopup('신고가 접수되었습니다.');
                  } catch (err: any) {
                    const status = err?.response?.status;
                    if (status === 409) {
                      onPopup('이미 신고한 리뷰입니다.');
                    } else {
                      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || '신고 접수에 실패했습니다.';
                      onPopup(msg);
                    }
                  } finally {
                    setReportingReviewId(null);
                    setReportReason('');
                    setReportDescription('');
                  }
                }}
              >
                신고하기
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 리뷰 삭제 확인 모달 */}
      {confirmDeleteId !== null && (
        <ConfirmModal
          title="리뷰 삭제"
          message="정말로 이 리뷰를 삭제하시겠습니까?"
          confirmText="삭제하기"
          cancelText="취소"
          danger={true}
          onConfirm={executeDeleteReview}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </section>
  );
}
