"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Heart, ExternalLink } from 'lucide-react';
import styles from '../../mypage.module.css';

interface Favorite {
  id: number;
  festivalId: number;
  name: string;
  location: string;
  date: string;
  thumbnail: string;
}

export default function FavoriteList() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // 🛡️ 안전하게 favorite API로 원복
        const res = await fetch('/api/favorites');
        const data = await res.json();
        
        if (data.success && data.activities) {
          setFavorites(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleUnfavorite = (id: number) => {
    if (confirm('찜 목록에서 삭제하시겠습니까?')) {
      setFavorites(favorites.filter(f => f.id !== id));
    }
  };

  if (isLoading) return <div className={styles.loading}>불러오는 중...</div>;

  return (
    <div className={styles.favoriteWrapper}>
      <div className={styles.listHeader} style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#64748b' }}>
        총 <strong>{favorites.length}</strong>개의 축제를 찜했습니다.
      </div>

      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <Heart size={48} color="#e2e8f0" />
          <p>찜한 축제가 없습니다. 멋진 축제를 찾아보세요!</p>
          <button className={styles.btnAction} style={{ backgroundColor: 'var(--color-primary-500)', color: '#fff' }}>
            축제 둘러보기
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {favorites.map((item: Favorite) => (
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
                [이미지: {item.name}]
                <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '4px', borderRadius: '50%', cursor: 'pointer' }}>
                   <ExternalLink size={14} color="#64748b" />
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '8px', color: '#1e293b' }}>{item.name}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                    <MapPin size={12} color="var(--color-primary-500)" /> {item.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
                    <Calendar size={12} color="var(--color-primary-500)" /> {item.date}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button 
                  className={styles.btnDelete} 
                  style={{ padding: '6px 12px', border: 'none', background: '#fef2f2', color: '#ef4444', fontWeight: 700, borderRadius: '6px', cursor: 'pointer' }}
                  onClick={() => handleUnfavorite(item.id)}
                >
                  ❤️ 해제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
