"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Calendar, Heart, ExternalLink } from 'lucide-react';
import { useToast } from '@/_component/common/Toast';
import { ConfirmModal } from '@/_component/common/Modal';
import Pagination from '@/_component/common/Pagination';
import api from '@/lib/api';
import type { MyFavorite, MyFavoriteResponse, ApiResponse } from '@/types/mypage';
import styles from '../../mypage.module.css';

export default function FavoriteList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<MyFavorite[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);

  // 🚀 URL 파라미터에서 현재 페이지 번호 추출 (기본값 1)
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        // 🚀 페이징 파라미터 적용 (한 페이지에 4개씩)
        const res = await api.get<ApiResponse<MyFavoriteResponse>>(`/api/favorites?page=${currentPage}&size=4`);
        
        if (res.data.success && res.data.data) {
          setFavorites(res.data.data.content || []);
          setTotalPages(res.data.data.totalPages || 0);
          setTotalElements(res.data.data.totalElements || 0);
        } else {
          toast(res.data.message || '찜 목록을 불러오는데 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        toast('찜 목록을 불러오는 도중 오류가 발생했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [toast, currentPage]);

  const handleUnfavorite = async (festivalId: number) => {
    try {
      const res = await api.delete(`/api/favorites/${festivalId}`);
      if (res.data.success) {
        setFavorites(favorites.filter(f => f.festivalId !== festivalId));
        toast('찜 목록에서 해제되었습니다.', 'success');
      } else {
        toast(res.data.message || '해제에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('Failed to unfavorite:', error);
      toast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
    } finally {
      setConfirmTarget(null);
    }
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.favoriteWrapper}>
      <div className={styles.listSummary}>
        총 <strong>{totalElements}</strong>개의 찜한 축제가 있습니다.
      </div>

      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <Heart size={48} color="#e2e8f0" />
          <p>찜한 축제가 없습니다. 멋진 축제를 찾아보세요!</p>
          <button 
            className={styles.btnAction} 
            style={{ backgroundColor: 'var(--color-primary-500)', color: '#fff', cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            축제 둘러보기
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {favorites.map((item: MyFavorite) => (
            <div 
              key={item.id} 
              className={styles.dataCard} 
              style={{ 
                padding: '0', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
              onClick={() => router.push(`/festivals/${item.festivalId}`)}
            >
              <div 
                style={{ 
                  height: '200px', 
                  backgroundColor: '#f1f5f9', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }} 
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                ) : (
                  `[이미지: ${item.title}]`
                )}
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    right: '12px', 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    padding: '6px', 
                    borderRadius: '50%', 
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/festivals/${item.festivalId}`);
                  }}
                >
                   <ExternalLink size={14} color="#64748b" />
                </div>
              </div>

              <div style={{ padding: '16px', flex: 1 }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '10px', color: '#1e293b', letterSpacing: '-0.02em' }}>{item.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                    <MapPin size={13} color="var(--color-primary-500)" /> {item.address}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                    <Calendar size={13} color="var(--color-primary-500)" /> {item.startDate} ~ {item.endDate}
                  </div>
                </div>
              </div>

              <div style={{ padding: '0 16px 16px', textAlign: 'right' }}>
                <button 
                  className={styles.btnDelete} 
                  style={{ 
                    padding: '8px 16px', 
                    border: 'none', 
                    background: '#fff1f2', 
                    color: '#f43f5e', 
                    fontWeight: 700, 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmTarget(item.festivalId);
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#ffe4e6')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#fff1f2')}
                >
                  ❤️ 해제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. 페이지네이션 (Pager) 추가 */}
      {!isLoading && favorites.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
          />
        </div>
      )}

      {/* 찜 해제 확인 모달 */}
      {confirmTarget && (
        <ConfirmModal
          title="찜 해제"
          message="해당 축제를 찜 목록에서 삭제하시겠습니까?"
          confirmText="해제하기"
          danger={true}
          onConfirm={() => handleUnfavorite(confirmTarget)}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
