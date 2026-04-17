"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Trash2, FileText } from 'lucide-react';
import Pagination from '@/_component/common/Pagination';
import { useToast } from '@/_component/common/Toast';
import { ConfirmModal } from '@/_component/common/Modal';
import { useMyPageActivity } from '../_hooks/useMyPageActivity';
import api from '@/lib/api';
import type { MyPost } from '@/types/mypage';
import styles from '../mypage.module.css';

export default function PostList() {
  const router = useRouter();
  const { toast } = useToast();
  
  // 🚀 공통 훅 사용: fetch 로직, 상태 관리 자동화
  const { 
    items: posts, 
    currentPage, 
    totalPages, 
    totalElements, 
    isLoading,
    refetch 
  } = useMyPageActivity('posts');

  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      // 🚀 표준 api 유틸리티 적용
      const res = await api.delete(`/api/community/posts/${id}`);
      
      if (res.data.success) {
        toast('게시글이 성공적으로 삭제되었습니다.', 'success');
        refetch(); // 🔄 목록 및 페이징 정보 새로고침
      } else {
        toast(res.data.message || '삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast('게시글 삭제 도중 오류가 발생했습니다.', 'error');
    } finally {
      setConfirmTarget(null);
    }
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.listSection}>
      <div className={styles.listSummary}>
        총 <strong>{totalElements}</strong>개의 게시글이 있습니다.
      </div>

      <div className={styles.listContainer}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} />
            <p>아직 작성한 게시글이 없어요. 첫 글을 작성해보세요!</p>
          </div>
        ) : (
          posts.map((item) => {
            const post = item as MyPost;
            return (
              <div key={post.id} className={styles.dataCard}>
                <div className={styles.cardHeader}>
                  <h4 className={styles.cardTitle}>{post.title}</h4>
                  <span className={styles.cardDate}>{post.createdAt}</span>
                </div>
                <p className={styles.cardBody}>{post.summary}</p>
                <div className={styles.cardActions}>
                  <button 
                    className={`${styles.btnAction} ${styles.btnEdit}`}
                    onClick={() => router.push(`/community/${post.id}`)}
                  >
                    <ExternalLink size={14} style={{ marginRight: 4 }} /> 원문보기
                  </button>
                  <button 
                    className={`${styles.btnAction} ${styles.btnDelete}`}
                    onClick={() => setConfirmTarget(post.id)}
                  >
                    <Trash2 size={14} style={{ marginRight: 4 }} /> 삭제
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {confirmTarget && (
        <ConfirmModal
          title="게시글 삭제"
          message="정말 이 게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
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
