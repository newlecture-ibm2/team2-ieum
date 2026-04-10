"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ExternalLink, Trash2 } from 'lucide-react';
import Pagination from '@/_component/common/Pagination';
import { useToast } from '@/_component/common/Toast';
import { ConfirmModal } from '@/_component/common/Modal';
import { useMyPageActivity } from '../_hooks/useMyPageActivity';
import api from '@/lib/api';
import type { MyComment } from '@/types/mypage';
import styles from '../mypage.module.css';

export default function CommentList() {
  const router = useRouter();
  const { toast } = useToast();
  
  // 🚀 공통 훅 사용
  const { 
    items: comments, 
    currentPage, 
    totalPages, 
    totalElements, 
    isLoading,
    refetch
  } = useMyPageActivity('comments');

  const [confirmTarget, setConfirmTarget] = useState<number | string | null>(null);

  const handleDelete = async (id: number | string) => {
    try {
      // 🚀 표준 api 유틸리티 적용
      const res = await api.delete(`/api/community/comments/${id}`);
      
      if (res.data.success) {
        toast('댓글이 성공적으로 삭제되었습니다.', 'success');
        refetch(); // 🔄 목록 및 총 개수 최신화
      } else {
        toast(res.data.message || '삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast('댓글 삭제 도중 오류가 발생했습니다.', 'error');
    } finally {
      setConfirmTarget(null);
    }
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.listContainer}>
      <div className={styles.listSummary}>
        총 <strong>{totalElements}</strong>개의 댓글이 있습니다.
      </div>
      {comments.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} />
          <p>작성한 댓글이 없습니다. 커뮤니티에서 소통을 시작해보세요!</p>
        </div>
      ) : (
        comments.map((item) => {
          const comment = item as MyComment;
          return (
            <div key={comment.id} className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-primary-500)', fontWeight: 700 }}>원문: {comment.postTitle}</span>
                </div>
                <span className={styles.cardDate}>{comment.createdAt}</span>
              </div>
              
              <p className={styles.cardBody} style={{ marginBottom: '16px' }}>
                {comment.content}
              </p>
  
              <div className={styles.cardActions}>
                <button 
                  className={styles.btnAction}
                  style={{ border: '1px solid #e2e8f0', background: '#fff' }}
                  onClick={() => router.push(`/community/${comment.postId}`)}
                >
                  <ExternalLink size={14} style={{ marginRight: 4 }} /> 원문 보기
                </button>
                <button 
                  className={`${styles.btnAction} ${styles.btnDelete}`}
                  onClick={() => setConfirmTarget(comment.id)}
                >
                  <Trash2 size={14} style={{ marginRight: 4 }} /> 삭제
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* 댓글 삭제 확인 모달 */}
      {confirmTarget && (
        <ConfirmModal
          title="댓글 삭제"
          message="정말 이 댓글을 삭제하시겠습니까?"
          confirmText="삭제하기"
          danger={true}
          onConfirm={() => handleDelete(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      <div style={{ marginTop: '24px' }}>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
