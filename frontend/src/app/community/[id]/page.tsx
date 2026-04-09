'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Heart, CornerDownRight, User, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { CATEGORY_OPTIONS, REGION_OPTIONS } from '@/constants/filterOptions';
import { useToast } from '@/_component/common/Toast';
import { ConfirmModal } from '@/_component/common/Modal';
import { Modal } from '@/_component/common/Modal';
import DOMPurify from 'isomorphic-dompurify';
import 'react-quill-new/dist/quill.snow.css';
import ReportModal from '../_components/ReportModal';
import styles from './detail.module.css';

import { usePostDetail } from './usePostDetail';

// 카테고리/지역 코드를 한글 라벨로 변환
const getCategoryLabel = (code: string) => CATEGORY_OPTIONS.find(c => c.value === code)?.label || code;
const getRegionLabel = (code: string) => REGION_OPTIONS.find(r => r.value === code)?.label || '전국';

// 본문 영역을 memo로 감싸서 댓글 변경 시 리렌더링(이미지 깜빡임) 방지
const PostBody = memo(function PostBody({ content, attachments }: { content: string; attachments: any[] }) {
  const sanitizedHtml = useMemo(() => {
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return DOMPurify.sanitize(content);
    }
    return null;
  }, [content]);

  return (
    <>
      {attachments && attachments.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '12px', marginBottom: '20px' }}>
          {attachments.map((attach: any) => (
            <img
              key={attach.id}
              src={`${process.env.NEXT_PUBLIC_API_URL || ''}/api/attachments/${attach.id}/download`}
              alt="첨부 이미지"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          ))}
        </div>
      )}
      {sanitizedHtml ? (
        <div
          className="ql-editor"
          style={{ padding: 0 }}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      ) : (
        content
      )}
    </>
  );
});
export default function CommunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { toast } = useToast();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);

  const { post, setPost, comments, loading, error, fetchDetail, attachments } = usePostDetail(postId, authChecked && isLoggedIn);

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'POST' | 'COMMENT', id: number | string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [reportedCommentIds, setReportedCommentIds] = useState<number[]>([]);

  // 대댓글(답글) 관련 상태
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // 댓글 수정 관련 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');


  // 로그인 상태 확인 및 신고 여부 확인
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setIsLoggedIn(data.isLoggedIn);
        if (data.isLoggedIn && data.user) {
          setCurrentUserId(data.user.userId);
          setIsSuspended(data.user.status === 'SUSPENDED');

          // 이미 신고했는지 확인
          api.get(`/api/reports/check?targetType=POST&targetId=${postId}`)
            .then(res => {
              if (res.data?.data === true) {
                setAlreadyReported(true);
              }
            })
            .catch(() => { });

          // 내가 신고한 댓글 목록 확인 (신고 완료 표시용)
          api.get(`/api/reports/my-targets?targetType=COMMENT`)
            .then(res => {
              if (Array.isArray(res.data?.data)) {
                setReportedCommentIds(res.data.data);
              }
            })
            .catch(() => { });
        }
        setAuthChecked(true);
      })
      .catch(() => {
        setAuthChecked(true);
      });
  }, [postId]);

  // 비회원 상세조회 차단 처리
  useEffect(() => {
    if (authChecked && !isLoggedIn) {
      setShowLoginModal(true);
    }
  }, [authChecked, isLoggedIn]);

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
    router.push(`/community/write?edit=${postId}`);
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
        fetchDetail(true, 'comments'); // 댓글 새로고침 (silent 모드로 전환, 댓글만)
      }
    } catch (err) {
      console.error(err);
      toast('댓글 등록에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 대댓글(답글) 등록
  const handleSubmitReply = async (parentId: number) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (submitting || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/community/posts/${postId}/comments`, {
        content: replyContent.trim(),
        parentId: parentId
      });
      if (res.data.success) {
        setReplyContent('');
        setReplyingTo(null);
        fetchDetail(true, 'comments'); // 댓글 새로고침 (silent, 댓글만)
      }
    } catch (err) {
      console.error(err);
      toast('답글 등록에 실패했습니다.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 댓글/대댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/api/community/comments/${commentId}`);
      toast('삭제되었습니다.', 'success');
      fetchDetail(true, 'comments');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast(errorObj?.response?.data?.message || '삭제에 실패했습니다.', 'error');
    }
  };

  // 댓글/대댓글 수정 저장
  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;
    try {
      await api.put(`/api/community/comments/${commentId}`, { content: editContent.trim() });
      toast('수정되었습니다.', 'success');
      setEditingCommentId(null);
      fetchDetail(true, 'comments');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      toast(errorObj?.response?.data?.message || '수정에 실패했습니다.', 'error');
    }
  };



  if (!authChecked) return <div className={styles.loading}>인증 확인 중...</div>;

  // 비로그인 시 화면 렌더링 방지 및 모달 노출
  if (!isLoggedIn) {
    return (
      <>
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#94a3b8' }}>로그인 확인 중...</div>
        {showLoginModal && (
          <ConfirmModal
            message={"로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"}
            confirmText="로그인"
            onConfirm={() => router.replace('/login')}
            onCancel={() => router.replace('/community')}
          />
        )}
      </>
    );
  }

  // 정지 회원 — 비회원처럼 상세 페이지 접근 차단 (READ 제한)
  if (isSuspended) {
    return (
      <main style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>활동 정지 안내</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          활동이 정지된 계정입니다.<br />정지 해제 후 이용할 수 있습니다.
        </p>
        <button
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
          onClick={() => router.replace('/community')}
        >
          커뮤니티로 돌아가기
        </button>
      </main>
    );
  }

  if (loading) return <div className={styles.loading}>불러오는 중...</div>;

  if (error || !post) return <div className={styles.error}>{error}</div>;

  const isAuthor = post.authorId === currentUserId;

  return (
    <main className={styles.detailContainer}>

      {/* 본문 헤더 */}
      <div className={styles.postHeader}>
        <div className={styles.titleWrapper}>
          <button className={styles.backBtn} onClick={() => router.push('/community')}>
            <ArrowLeft size={24} />
          </button>
          <h1 className={styles.postTitle}>{post.title}</h1>
        </div>

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
          {post.festivalName && (
            <div className={styles.pmItem}>
              <span className={styles.pmLabel}>연관 축제</span>
              <span className={styles.pmValue} style={{ color: 'var(--ieum-primary)', fontWeight: 600 }}>
                {post.festivalName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 글 내용 */}
      <div className={styles.postBody}>
        <PostBody content={post.content} attachments={attachments} />
      </div>

      {/* 하단 액션 (공감/상태) */}
      <div className={styles.postFooterActions}>
        <button 
          className={`${styles.actionLikeBtn} ${post.isLiked ? styles.liked : ''}`}
          onClick={async () => {
            if (!isLoggedIn) {
              setShowLoginModal(true);
              return;
            }
            try {
              const res = await api.post(`/api/community/posts/${postId}/likes`);
              if (res.data.success) {
                // 서버 재조회 대신 클라이언트 상태를 즉시 업데이트 (조회수 중복 증가 방지)
                const isNowLiked = res.data.data;
                setPost((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    isLiked: isNowLiked,
                    likeCount: isNowLiked ? prev.likeCount + 1 : Math.max(0, prev.likeCount - 1),
                  };
                });
              }
            } catch (err: unknown) {
              const errorResponse = (err as { response?: { data?: { message?: string } } }).response;
              const msg = errorResponse?.data?.message || '공감 처리에 실패했습니다.';
              toast(msg, 'error');
            }
          }}
        >
          <Heart size={16} fill={post.isLiked ? 'currentColor' : 'none'} /> 공감하기 {post.likeCount > 0 && post.likeCount}
        </button>
        <div className={styles.statsInfo}>
          <span
            className={styles.reportLink}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast('주소가 복사되었습니다.', 'info');
            }}
          >
            공유하기
          </span>
          <span
            className={`${styles.reportLink} ${alreadyReported ? styles.reportDisabled : ''}`}
            onClick={() => {
              if (alreadyReported) return;
              if (!isLoggedIn) {
                setShowLoginModal(true);
                return;
              }
              setReportTarget({ type: 'POST', id: postId });
            }}
          >{alreadyReported ? '신고 완료' : '신고'}</span>
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
                {comment.status === 'REMOVED' ? (
                  <div className={styles.deletedText}>삭제된 댓글입니다.</div>
                ) : (
                  <>
                    <div className={styles.commentTop}>
                      <span className={styles.commentName}>{comment.userName} {comment.userId === post.authorId && '(작성자)'}</span>
                      <span className={styles.commentTime}>{new Date(comment.createdAt).toLocaleString('ko-KR')}</span>
                    </div>

                    {editingCommentId === comment.id ? (
                      <>
                        <div className={styles.replyInputWrap} style={{ marginTop: '4px', marginBottom: '8px' }}>
                          <input
                            type="text"
                            className={styles.replyInput}
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                handleUpdateComment(comment.id);
                              }
                            }}
                            maxLength={500}
                            autoFocus
                          />
                          <button
                            className={styles.replySubmitBtn}
                            onClick={() => handleUpdateComment(comment.id)}
                            disabled={submitting || !editContent.trim()}
                          >
                            저장
                          </button>
                          <button
                            className={styles.replyCancelBtn}
                            onClick={() => { setEditingCommentId(null); setEditContent(''); }}
                          >
                            취소
                          </button>
                        </div>
                        <span className={styles.countLabel}>
                          {editContent.length} / 500
                        </span>
                      </>
                    ) : (
                      <div className={styles.commentText}>{comment.content}</div>
                    )}

                    <div className={styles.commentActions}>
                      <span onClick={() => {
                        if (!isLoggedIn) { setShowLoginModal(true); return; }
                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                        setReplyContent('');
                      }}>답글 달기</span>
                      {comment.userId === currentUserId && editingCommentId !== comment.id ? (
                        <>
                          <span> · </span>
                          <span onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditContent(comment.content);
                            setReplyingTo(null);
                          }}>수정</span>
                          <span> · </span>
                          <span onClick={() => handleDeleteComment(comment.id)}>삭제</span>
                        </>
                      ) : comment.userId !== currentUserId ? (
                        <>
                          <span> · </span>
                          {reportedCommentIds.includes(comment.id) ? (
                            <span className={styles.reportedText}>신고완료</span>
                          ) : (
                            <span onClick={() => {
                              if (!isLoggedIn) { setShowLoginModal(true); return; }
                              setReportTarget({ type: 'COMMENT', id: comment.id });
                            }}>신고</span>
                          )}
                        </>
                      ) : null}
                    </div>

                    {/* 답글 입력 폼 */}
                    {replyingTo === comment.id && (
                      <>
                        <div className={styles.replyInputWrap}>
                          <input
                            type="text"
                            className={styles.replyInput}
                            placeholder={`${comment.userName}님에게 답글 작성...`}
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                e.preventDefault();
                                handleSubmitReply(comment.id);
                              }
                            }}
                            maxLength={500}
                            autoFocus
                          />
                          <button
                            className={styles.replySubmitBtn}
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={submitting || !replyContent.trim()}
                          >
                            등록
                          </button>
                          <button
                            className={styles.replyCancelBtn}
                            onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                          >
                            취소
                          </button>
                        </div>
                        <span className={styles.countLabel}>
                          {replyContent.length} / 500
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 대댓글 */}
            {comment.children?.map(child => (
              <div key={child.id} className={styles.replyItem}>
                <div className={styles.replyIcon}><CornerDownRight size={16} /></div>
                <div className={styles.commentAvatar}><User size={18} /></div>
                <div className={styles.commentContent}>
                  {child.status === 'REMOVED' ? (
                    <div className={styles.deletedText}>삭제된 댓글입니다.</div>
                  ) : (
                    <>
                      <div className={styles.commentTop}>
                        <span className={styles.commentName}>{child.userName} {child.userId === post.authorId && '(작성자)'}</span>
                        <span className={styles.commentTime}>{new Date(child.createdAt).toLocaleString('ko-KR')}</span>
                      </div>

                      {editingCommentId === child.id ? (
                        <>
                          <div className={styles.replyInputWrap} style={{ marginTop: '4px', marginBottom: '8px' }}>
                            <input
                              type="text"
                              className={styles.replyInput}
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                  e.preventDefault();
                                  handleUpdateComment(child.id);
                                }
                              }}
                              maxLength={500}
                              autoFocus
                            />
                            <button
                              className={styles.replySubmitBtn}
                              onClick={() => handleUpdateComment(child.id)}
                              disabled={submitting || !editContent.trim()}
                            >
                              저장
                            </button>
                            <button
                              className={styles.replyCancelBtn}
                              onClick={() => { setEditingCommentId(null); setEditContent(''); }}
                            >
                              취소
                            </button>
                          </div>
                          <span className={styles.countLabel}>
                            {editContent.length} / 500
                          </span>
                        </>
                      ) : (
                        <div className={styles.commentText}>
                          {child.content.match(/^@(\S+)\s/) ? (
                            <>
                              <span className={styles.mentionTag}>@{child.content.match(/^@(\S+)\s/)![1]}</span>
                              {child.content.replace(/^@\S+\s/, '')}
                            </>
                          ) : child.content}
                        </div>
                      )}

                      <div className={styles.commentActions}>
                        <span onClick={() => {
                          if (!isLoggedIn) { setShowLoginModal(true); return; }
                          if (replyingTo === child.id) {
                            setReplyingTo(null);
                            setReplyContent('');
                          } else {
                            setReplyingTo(child.id);
                            setReplyContent(`@${child.userName} `);
                          }
                        }}>답글 달기</span>
                        {child.userId === currentUserId && editingCommentId !== child.id ? (
                          <>
                            <span> · </span>
                            <span onClick={() => {
                              setEditingCommentId(child.id);
                              setEditContent(child.content);
                              setReplyingTo(null);
                            }}>수정</span>
                            <span> · </span>
                            <span onClick={() => handleDeleteComment(child.id)}>삭제</span>
                          </>
                        ) : child.userId !== currentUserId ? (
                          <>
                            <span> · </span>
                            {reportedCommentIds.includes(child.id) ? (
                              <span className={styles.reportedText}>신고완료</span>
                            ) : (
                              <span onClick={() => {
                                if (!isLoggedIn) { setShowLoginModal(true); return; }
                                setReportTarget({ type: 'COMMENT', id: child.id });
                              }}>신고</span>
                            )}
                          </>
                        ) : null}
                      </div>

                      {/* 대댓글에 대한 답글 입력 폼 (parentId는 최상위 부모 댓글로 전달) */}
                      {replyingTo === child.id && (
                        <>
                          <div className={styles.replyInputWrap}>
                            <input
                              type="text"
                              className={styles.replyInput}
                              placeholder={`${child.userName}님에게 답글 작성...`}
                              value={replyContent}
                              onChange={e => setReplyContent(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                  e.preventDefault();
                                  handleSubmitReply(comment.id);
                                }
                              }}
                              maxLength={500}
                              autoFocus
                            />
                            <button
                              className={styles.replySubmitBtn}
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={submitting || !replyContent.trim()}
                            >
                              등록
                            </button>
                            <button
                              className={styles.replyCancelBtn}
                              onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                            >
                              취소
                            </button>
                          </div>
                          <span className={styles.countLabel}>
                            {replyContent.length} / 500
                          </span>
                        </>
                      )}
                    </>
                  )}
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
        <span className={styles.countLabel}>
          {newComment.length} / 500
        </span>
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
      {reportTarget && (
        <ReportModal 
          targetType={reportTarget.type}
          targetId={reportTarget.id} 
          onClose={() => setReportTarget(null)} 
          onSuccess={() => {
            if (reportTarget.type === 'POST') {
              setAlreadyReported(true);
            } else if (reportTarget.type === 'COMMENT') {
              setReportedCommentIds(prev => [...prev, Number(reportTarget.id)]);
            }
            setReportTarget(null);
          }} 
        />
      )}

      {/* 비로그인 사용자 작업 시도 안내 모달 */}
      {showLoginModal && (
        <ConfirmModal
          message={"로그인이 필요한 기능입니다.\n로그인 화면으로 이동하시겠습니까?"}
          confirmText="로그인"
          onConfirm={() => router.push('/login')}
          onCancel={() => setShowLoginModal(false)}
        />
      )}

    </main>
  );
}
