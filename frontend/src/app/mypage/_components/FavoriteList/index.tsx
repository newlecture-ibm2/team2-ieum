"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Heart, ExternalLink } from 'lucide-react';
import { useToast } from '@/_component/common/Toast';
import { ConfirmModal } from '@/_component/common/Modal';
import api from '@/lib/api';
import type { MyFavorite, ApiResponse } from '@/types/mypage';
import styles from '../../mypage.module.css';

export default function FavoriteList() {
  const router = useRouter();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<MyFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        // 🚀 표준 api 유틸리티 적용 (인증 가드 포함)
        const res = await api.get<ApiResponse<{ content: MyFavorite[] }>>('/api/favorites');
        
        if (res.data.success && res.data.data) {
          setFavorites(res.data.data.content || []);
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
  }, [toast]);

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
        총 <strong>{favorites.length}</strong>개의 찜한 축제가 있습니다.
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
            <div key={item.id} className={styles.dataCard} style={{ padding: '12px', display: 'flex', flexDirection: 'column' }}>
              <div 
                style={{ 
                  height: '140px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '10px', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.05))' }} />
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  `[이미지: ${item.title}]`
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px', borderRadius: '50%', cursor: 'pointer' }}>
                   <ExternalLink size={14} color="#64748b" />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: '#1e293b' }}>{item.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                    <MapPin size={12} color="var(--color-primary-500)" /> {item.address}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                    <Calendar size={12} color="var(--color-primary-500)" /> {item.startDate} ~ {item.endDate}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button 
                  className={styles.btnDelete} 
                  style={{ padding: '6px 12px', border: 'none', background: '#fef2f2', color: '#ef4444', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => setConfirmTarget(item.festivalId)}
                >
                  ❤️ 해제
                </button>
              </div>
            </div>
          ))}
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
