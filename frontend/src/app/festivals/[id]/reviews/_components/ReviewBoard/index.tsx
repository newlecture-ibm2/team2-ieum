'use client';

import { useState, useEffect } from 'react';
import { User, Trash2, Flag } from 'lucide-react';
import axios from 'axios';
import { Modal } from '@/_component/common/Modal';
import styles from './ReviewBoard.module.css';

interface ReviewBoardProps {
  reviews: any[];
  loading: boolean;
  onRefresh: () => void;
}

export default function ReviewBoard({ reviews, loading, onRefresh }: ReviewBoardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 신고 모달 상태
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

  const handleOpenReport = async (reviewId: number) => {
    if (!currentUser) return;
    try {
      // 신고 중복 여부 확인
      const res = await axios.get(`/api/reports/check?targetType=REVIEW&targetId=${reviewId}`);
      if (res.data?.data === true) {
        alert('이미 신고한 리뷰입니다.');
        return;
      }
    } catch (err) {}
    setReportingReviewId(reviewId);
  };

  const handleSubmitReport = async () => {
    if (!reportingReviewId || !reportReason) return;
    
    try {
      await axios.post('/api/reports', {
        targetType: 'REVIEW',
        targetId: reportingReviewId,
        reason: reportReason,
        description: reportReason === 'OTHER' ? reportDescription : null,
      });
      alert('신고가 접수되었습니다.');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) {
        alert('이미 신고한 리뷰입니다.');
      } else {
        alert(err?.response?.data?.message || '신고 접수에 실패했습니다.');
      }
    } finally {
      setReportingReviewId(null);
      setReportReason('');
      setReportDescription('');
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
              
              {/* 타인 리뷰: 신고 버튼 */}
              {(currentUser && currentUser.id !== review.userId) && (
                <button
                  onClick={() => handleOpenReport(review.id)}
                  title="신고하기"
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
                  <Flag size={16} color="#64748b" />
                </button>
              )}

              {/* 본인 또는 관리자: 리뷰 삭제 버튼 */}
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

      {/* 신고 모달 */}
      {reportingReviewId && (
        <Modal title="리뷰 신고" size="small" onClose={() => {
          setReportingReviewId(null);
          setReportReason('');
          setReportDescription('');
        }}>
          <div style={{ padding: '4px 0' }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>신고 사유를 선택해주세요.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {[
                { value: 'SPAM', label: '스팸/광고' },
                { value: 'ABUSE', label: '욕설/비방' },
                { value: 'INAPPROPRIATE', label: '부적절한 내용' },
                { value: 'FALSE_INFO', label: '허위 정보' },
                { value: 'OTHER', label: '기타' },
              ].map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.value}
                    checked={reportReason === opt.value}
                    onChange={e => setReportReason(e.target.value)}
                  />
                  <span style={{ fontSize: '14px', color: '#334155' }}>{opt.label}</span>
                </label>
              ))}
            </div>
            {reportReason === 'OTHER' && (
              <textarea
                style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'none', marginBottom: '20px', fontSize: '14px', outline: 'none' }}
                placeholder="상세 사유를 입력해주세요 (최대 500자)"
                maxLength={500}
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
              />
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
                onClick={() => {
                  setReportingReviewId(null);
                  setReportReason('');
                  setReportDescription('');
                }}
              >
                취소
              </button>
              <button
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: reportReason ? '#e74c3c' : '#cbd5e1', color: 'white', cursor: reportReason ? 'pointer' : 'not-allowed', fontSize: '14px' }}
                disabled={!reportReason}
                onClick={handleSubmitReport}
              >
                신고하기
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
