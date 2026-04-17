'use client';

import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { User, Trash2, Flag } from 'lucide-react';
import axios from 'axios';
import { Modal } from '@/_component/common/Modal';
=======
import { User, Trash2, Pencil, Siren } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmModal } from '@/_component/common/Modal';
import { useToast } from '@/_component/common/Toast';
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
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
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

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

<<<<<<< HEAD
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

=======
  const handleReportReview = (reviewId: number) => {
    if (!currentUser) { toast('로그인이 필요합니다.', 'warning'); return; }
    setReportingReviewId(reviewId);
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review.id);
    setEditContent(review.content);
    setEditRating(review.rating);
    setEditHoverRating(0);
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
    setEditContent('');
    setEditRating(0);
    setEditHoverRating(0);
  };

  const handleEditSubmit = async () => {
    if (editingReviewId === null) return;
    if (editRating === 0) { toast('별점을 선택해주세요.', 'warning'); return; }
    if (editContent.trim().length < 10) { toast('리뷰를 최소 10자 이상 작성해주세요.', 'warning'); return; }

    setIsEditing(true);
    try {
      await api.put(`/api/reviews/${editingReviewId}`, {
        rating: editRating,
        content: editContent.trim(),
      });
      toast('리뷰가 수정되었습니다.', 'success');
      handleEditCancel();
      onRefresh();
    } catch (err: any) {
      const apiErrorMsg = err.response?.data?.error?.message || err.response?.data?.message;
      toast(apiErrorMsg || '리뷰 수정에 실패했습니다.', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const renderEditStars = () => {
    return [1, 2, 3, 4, 5].map(num => (
      <span
        key={num}
        onMouseEnter={() => setEditHoverRating(num)}
        onMouseLeave={() => setEditHoverRating(0)}
        onClick={() => setEditRating(num)}
        style={{
          color: num <= (editHoverRating || editRating) ? '#fbbf24' : '#e2e8f0',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        ★
      </span>
    ));
  };

>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
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
<<<<<<< HEAD
              
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
=======
              {/* 리뷰 작성자 본인인 경우 수정 버튼 표출 */}
              {(currentUser && String(currentUser.userId) === String(review.userId) && editingReviewId !== review.id) && (
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
                <button
                  onClick={() => handleEditClick(review)}
                  title="수정하기"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eef2ff' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <Pencil size={15} color="#6366f1" />
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

              {/* 리뷰 작성자와 현재 세션 유저가 일치하거나 ADMIN 스태프인 경우 삭제 버튼 표출 (항상 마지막) */}
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
            </div>
          </div>

          {/* 수정 모드 / 일반 보기 모드 */}
          {editingReviewId === review.id ? (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
              marginTop: '8px',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>별점 수정:</span>
                <span style={{ display: 'flex', gap: '2px' }}>{renderEditStars()}</span>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="리뷰를 수정해주세요 (최소 10자 이상)"
                maxLength={1000}
                style={{
                  width: '100%',
                  minHeight: '70px',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  resize: 'vertical' as const,
                  outline: 'none',
                  background: '#fff',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{editContent.length} / 1000</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleEditCancel}
                    disabled={isEditing}
                    style={{
                      padding: '6px 14px',
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    disabled={isEditing}
                    style={{
                      padding: '6px 14px',
                      border: 'none',
                      background: '#6366f1',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#fff',
                      cursor: 'pointer',
                      opacity: isEditing ? 0.6 : 1,
                    }}
                  >
                    {isEditing ? '저장 중...' : '수정 완료'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.cardBody}>
              {review.content}
            </div>
          )}
        </div>
      ))}

<<<<<<< HEAD
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
=======
      {reportingReviewId !== null && (
        <Modal title="리뷰 신고" size="small" onClose={() => setReportingReviewId(null)}>
          <div className={styles.reportModal}>
            <p className={styles.reportDesc}>신고 사유를 선택해주세요.</p>
            <div className={styles.reportOptions}>
              {REPORT_REASON_OPTIONS.map(opt => (
                <label key={opt.value} className={styles.reportOption}>
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
                  <input
                    type="radio"
                    name="reportReason"
                    value={opt.value}
                    checked={reportReason === opt.value}
                    onChange={e => setReportReason(e.target.value)}
                  />
<<<<<<< HEAD
                  <span style={{ fontSize: '14px', color: '#334155' }}>{opt.label}</span>
                </label>
              ))}
            </div>
            {reportReason === 'OTHER' && (
              <textarea
                style={{ width: '100%', height: '80px', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'none', marginBottom: '20px', fontSize: '14px', outline: 'none' }}
=======
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {reportReason === REPORT_REASON.OTHER && (
              <textarea
                className={styles.reportTextarea}
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
                placeholder="상세 사유를 입력해주세요 (최대 500자)"
                maxLength={500}
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
              />
            )}
<<<<<<< HEAD
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontSize: '14px' }}
=======
            <div className={styles.reportActions}>
              <button
                className={styles.btnCancel}
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
                onClick={() => {
                  setReportingReviewId(null);
                  setReportReason('');
                  setReportDescription('');
                }}
              >
                취소
              </button>
              <button
<<<<<<< HEAD
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: reportReason ? '#e74c3c' : '#cbd5e1', color: 'white', cursor: reportReason ? 'pointer' : 'not-allowed', fontSize: '14px' }}
                disabled={!reportReason}
                onClick={handleSubmitReport}
=======
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
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
              >
                신고하기
              </button>
            </div>
          </div>
        </Modal>
      )}
<<<<<<< HEAD
=======

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
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
    </div>
  );
}
