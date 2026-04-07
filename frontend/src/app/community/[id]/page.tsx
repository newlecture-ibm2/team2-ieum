'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Heart, CornerDownRight, User } from 'lucide-react';
import api from '@/lib/api';
import { CATEGORY_OPTIONS, REGION_OPTIONS } from '@/constants/filterOptions';
import { useToast } from '@/_component/common/Toast';
import { ConfirmModal } from '@/_component/common/Modal';
import { Modal } from '@/_component/common/Modal';
import styles from './detail.module.css';

import { usePostDetail } from './usePostDetail';

// 카테고리/지역 코드를 한글 라벨로 변환
const getCategoryLabel = (code: string) => CATEGORY_OPTIONS.find(c => c.value === code)?.label || code;
const getRegionLabel = (code: string) => REGION_OPTIONS.find(r => r.value === code)?.label || '전국';

export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { toast } = useToast();

  const { post, comments, loading, error, fetchDetail } = usePostDetail(postId);
  
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 로그인 상태 확인
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(data.isLoggedIn);
        if (data.isLoggedIn && data.user) {
          setCurrentUserId(data.user.id);
        }
        if (!data.isLoggedIn) {
          setShowLoginModal(true);
        }
        setAuthChecked(true);
      })
      .catch(() => {
        setShowLoginModal(true);
        setAuthChecked(true);
      });
  }, []);

  const handleDeletePost = async () => {
    try {
      const res = await api.delete(`/api/community/posts/${postId}`);
      if (res.data.success) {
        toast('삭제되었습니다.', 'success');
        router.replace('/community');
      }
    } catch (err) {
      console.error(err);
      toast('삭제에 실패했습니다.', 'error');
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleEditPost = () => {
    // router.push(`/community/write?edit=${postId}`);
    toast('수정 페이지는 별도 화면으로 구현 예정입니다!', 'info');
  };

  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (submitting || !newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/community/posts/${postId}/comments`, {
        content: newComment.trim(),
        parentId: null
      });
      if (res.data.success) {
        setNewComment('');
        fetchDetail(); // 댓글 새로고침
      }
    } catch (err) {
      console.error(err);
      toast('댓글 등록에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 로그인 필요 모달 (비회원 상세 조회 차단 포함)
  if (showLoginModal && !isLoggedIn) {
    return (
      <>
        <div className={styles.loading}>로그인이 필요합니다.</div>
        <ConfirmModal
          message={"로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"}
          confirmText="로그인"
          onConfirm={() => router.replace('/login')}
          onCancel={() => router.replace('/community')}
        />
      </>
    );
  }

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;
  if (error || !post) return <div className={styles.error}>{error}</div>;

  const isAuthor = post.authorId === currentUserId;

  return (
    <main className={styles.detailContainer}>

      {/* 본문 헤더 */}
      <div className={styles.postHeader}>
        <h1 className={styles.postTitle}>{post.title}</h1>

        <div className={styles.metaWriter}>
          <div className={styles.writerLeft}>
            <div className={styles.writerAvatar}><User size={20} /></div>
            <div className={styles.writerInfo}>
              <span className={styles.writerName}>{post.authorName}</span>
              <span className={styles.writerDate}>
                {new Date(post.createdAt).toLocaleString('ko-KR')} · 조회 {post.viewCount}
              </span>
            </div>
          </div>

          {isAuthor && (
            <div className={styles.writerRight}>
              <button className={styles.btnActionSm} onClick={handleEditPost}>수정</button>
              <button className={`${styles.btnActionSm} ${styles.delete}`} onClick={() => setIsDeleteModalOpen(true)}>삭제</button>
            </div>
          )}
        </div>

        <div className={styles.metaTags}>
          <div className={styles.pmItem}>
            <span className={styles.pmLabel}>말머리</span>
            <span className={styles.badgePill}>{getCategoryLabel(post.category)}</span>
          </div>
          <div className={styles.pmItem}>
            <span className={styles.pmLabel}>지역</span>
            <span className={styles.pmValue}>{getRegionLabel(post.areaCode)}</span>
          </div>
        </div>
      </div>

      {/* 글 내용 */}
      <div className={styles.postBody}>
        {post.content}
      </div>

      {/* 하단 액션 (공감/상태) */}
      <div className={styles.postFooterActions}>
        <button className={styles.actionLikeBtn}>
          <Heart size={16} /> 공감하기
        </button>
        <div className={styles.statsInfo}>
          <span>공유하기</span>
          <span className={styles.reportLink} onClick={() => {
            if (!isLoggedIn) {
              setShowLoginModal(true);
              return;
            }
            setIsReportModalOpen(true);
          }}>신고</span>
        </div>
      </div>

      {/* 댓글 영역 */}
      <div className={styles.commentsSection}>
        <div className={styles.commentsTitle}>
          댓글 {comments.reduce((acc, c) => acc + 1 + (c.children?.length || 0), 0)}개
        </div>

        {comments.map((comment) => (
          <div key={comment.id}>
            {/* 부모 댓글 */}
            <div className={styles.commentItem}>
              <div className={styles.commentAvatar}><User size={18} /></div>
              <div className={styles.commentContent}>
                <div className={styles.commentTop}>
                  <span className={styles.commentName}>{comment.userName} {comment.userId === post.authorId && '(작성자)'}</span>
                  <span className={styles.commentTime}>{new Date(comment.createdAt).toLocaleString('ko-KR')}</span>
                </div>
                <div className={styles.commentText}>{comment.content}</div>
                <div className={styles.commentActions}>
                  <span>답글 달기</span>
                  {comment.userId === currentUserId && (
                    <>
                      <span> · </span>
                      <span>삭제</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 대댓글 */}
            {comment.children?.map(child => (
              <div key={child.id} className={styles.replyItem}>
                <div className={styles.replyIcon}><CornerDownRight size={16} /></div>
                <div className={styles.commentAvatar}><User size={18} /></div>
                <div className={styles.commentContent}>
                  <div className={styles.commentTop}>
                    <span className={styles.commentName}>{child.userName} {child.userId === post.authorId && '(작성자)'}</span>
                    <span className={styles.commentTime}>{new Date(child.createdAt).toLocaleString('ko-KR')}</span>
                  </div>
                  <div className={styles.commentText}>{child.content}</div>
                  <div className={styles.commentActions}>
                    {child.userId === currentUserId && (
                      <span>삭제</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* 댓글 입력 폼 */}
        <div className={styles.commentInputWrap}>
          <input
            type="text"
            className={styles.commentInput}
            placeholder="댓글을 남겨보세요."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          <button
            className={styles.commentSubmitBtn}
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
          >
            등록
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <ConfirmModal
          message="게시글을 정말 삭제하시겠습니까?"
          confirmText="삭제"
          danger={true}
          onConfirm={handleDeletePost}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}

      {/* 신고 모달 */}
      {isReportModalOpen && (
        <Modal title="게시글 신고" size="small" onClose={() => setIsReportModalOpen(false)}>
          <div className={styles.reportModal}>
            <p className={styles.reportDesc}>신고 사유를 선택해주세요.</p>
            <div className={styles.reportOptions}>
              {[
                { value: 'SPAM', label: '스팸/광고' },
                { value: 'ABUSE', label: '욕설/비방' },
                { value: 'INAPPROPRIATE', label: '부적절한 내용' },
                { value: 'FALSE_INFO', label: '허위 정보' },
                { value: 'OTHER', label: '기타' },
              ].map(opt => (
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
            {reportReason === 'OTHER' && (
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
                  setIsReportModalOpen(false);
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
                      targetType: 'POST',
                      targetId: Number(postId),
                      reason: reportReason,
                      description: reportReason === 'OTHER' ? reportDescription : null,
                    });
                    toast('신고가 접수되었습니다.', 'success');
                  } catch (err: any) {
                    const msg = err?.response?.data?.message || '신고 접수에 실패했습니다.';
                    toast(msg, 'error');
                  } finally {
                    setIsReportModalOpen(false);
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

    </main>
  );
}
