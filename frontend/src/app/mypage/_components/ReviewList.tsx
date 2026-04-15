"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ExternalLink, Trash2, MessageSquare, MapPin } from 'lucide-react';
import Pagination from '@/_component/common/Pagination';
import { useToast } from '@/_component/common/Toast';
import { ConfirmModal } from '@/_component/common/Modal';
import { useMyPageActivity } from '../_hooks/useMyPageActivity';
import api from '@/lib/api';
import type { MyReview } from '@/types/mypage';
import styles from '../mypage.module.css';

export default function ReviewList() {
  const router = useRouter();
  const { toast } = useToast();
  
  // 🚀 공통 훅 사용
  const { 
    items: reviews, 
    currentPage, 
    totalPages, 
    totalElements, 
    isLoading,
    refetch
  } = useMyPageActivity('reviews');

  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        fill={i < rating ? "var(--color-primary-500)" : "transparent"} 
        color={i < rating ? "var(--color-primary-500)" : "#cbd5e1"} 
      />
    ));
  };

  const handleDelete = async (id: number) => {
    try {
      // 🚀 표준 api 유틸리티 적용 (인증 토큰 자동 포함)
      const res = await api.delete(`/api/reviews/${id}`);
      
      if (res.data.success) {
        toast('리뷰가 성공적으로 삭제되었습니다.', 'success');
        refetch(); // 🔄 목록 및 페이징 상태 최신화
      } else {
        toast(res.data.message || '삭제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast('리뷰 삭제 도중 오류가 발생했습니다.', 'error');
    } finally {
      setConfirmTarget(null);
    }
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.listContainer}>
      <div className={styles.listSummary}>
        총 <strong>{totalElements}</strong>개의 리뷰가 있습니다.
      </div>
      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageSquare size={48} />
          <p>아직 작성한 리뷰가 없습니다. 축제의 추억을 기록해보세요!</p>
        </div>
      ) : (
        reviews.map((item) => {
          const review = item as MyReview;
          return (
            <div key={review.id} className={styles.dataCard}>
              <div className={styles.cardHeader}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-primary-600)', fontWeight: 700, backgroundColor: '#f5f3ff', padding: '2px 8px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                    <MapPin size={10} /> {review.location ? `[${review.location}] ` : ""}{review.festivalName}
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                    {renderStars(review.rating || 0)}
                  </div>
                </div>
                <span className={styles.cardDate}>{review.createdAt}</span>
              </div>
              
              <p className={styles.cardBody} style={{ marginTop: '12px' }}>
                {review.content}
              </p>
  
              <div className={styles.cardActions}>
                <button 
                  className={`${styles.btnAction} ${styles.btnEdit}`}
                  onClick={() => router.push(`/festivals/${review.festivalId}`)}
                >
                  <ExternalLink size={14} style={{ marginRight: 4 }} /> 원문보기
                </button>
                <button 
                  className={`${styles.btnAction} ${styles.btnDelete}`}
                  onClick={() => setConfirmTarget(review.id)}
                >
                  <Trash2 size={14} style={{ marginRight: 4 }} /> 삭제
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* 리뷰 삭제 확인 모달 */}
      {confirmTarget && (
        <ConfirmModal
          title="리뷰 삭제"
          message="정말 이 리뷰를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
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
