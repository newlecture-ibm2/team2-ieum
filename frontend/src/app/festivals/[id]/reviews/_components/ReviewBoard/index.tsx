'use client';

import { useState, useEffect } from 'react';
import { User, Trash2, Siren } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmModal } from '@/_component/common/Modal';
import { useToast } from '@/_component/common/Toast';
import styles from './ReviewBoard.module.css';
import { REPORT_REASON, REPORT_REASON_OPTIONS } from '@/constants/reportOptions';
import { TARGET_TYPE } from '@/constants/targetType';

interface ReviewBoardProps {
  reviews: any[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ReviewBoard({ reviews, loading, onRefresh }: ReviewBoardProps) {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [reportingReviewId, setReportingReviewId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.isLoggedIn) setCurrentUser(data.user);
      })
      .catch(console.error);
  }, []);

  const handleDeleteClick = (reviewId: number) => {
    setConfirmDeleteId(reviewId);
  };

  const executeDeleteReview = async () => {
    if (confirmDeleteId === null) return;
    
    setDeletingId(confirmDeleteId);
    try {
      await api.delete(`/api/reviews/${confirmDeleteId}`);
      toast('리뷰가 삭제되었습니다.', 'success');
      onRefresh(); // 페이지 컴포넌트에 목록 갱신 요청
    } catch (err: any) {
      const apiErrorMsg = err.response?.data?.error?.message || err.response?.data?.message;
      toast(apiErrorMsg || '리뷰 삭제에 실패했습니다.', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleReportReview = (reviewId: number) => {
    if (!currentUser) { toast('로그인이 필요합니다.', 'warning'); return; }
    setReportingReviewId(reviewId);
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
              {/* 리뷰 작성자와 현재 세션 유저가 일치하거나 ADMIN 스태프인 경우 삭제 버튼 표출 */}
              {(currentUser && (String(currentUser.userId) === String(review.userId) || currentUser.role === 'ADMIN' || currentUser.role === 'ROLE_ADMIN')) && (
                <button
                  onClick={() => handleDeleteClick(review.id)}
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

              {/* 본인의 리뷰가 아닌 경우 신고 버튼 표출 */}
              {(currentUser && String(currentUser.userId) !== String(review.userId)) && (
                <button
                  onClick={() => handleReportReview(review.id)}
                  title="신고하기"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'all 0.2s',
                    color: '#a0aec0',
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = '#fff1f2';
                    e.currentTarget.style.color = '#ef4444'; 
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#a0aec0'; 
                  }}
                >
                  <Siren size={15} color="currentColor" strokeWidth={2.2} />
                </button>
              )}
            </div>
          </div>
          <div className={styles.cardBody}>
            {review.content}
          </div>
        </div>
      ))}

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
                    toast('신고가 성공적으로 접수되었습니다.', 'success');
                  } catch (err: any) {
                    const status = err?.response?.status;
                    if (status === 409) {
                      toast('이미 신고한 리뷰입니다.', 'warning');
                    } else {
                      const msg = err?.response?.data?.error?.message || err?.response?.data?.message || '신고 처리에 실패했습니다.';
                      toast(msg, 'error');
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
    </div>
  );
}
