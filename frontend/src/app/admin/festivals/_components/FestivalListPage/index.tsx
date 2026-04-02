'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  FestivalListItem,
  FestivalStatusCounts,
  ApiResponse,
  AdminFestivalListData,
  FestivalSyncData,
  FestivalVisibilityData,
} from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';
import styles from './FestivalListPage.module.css';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '.');
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ongoing': return '진행중';
    case 'upcoming': return '진행예정';
    case 'ended': return '종료';
    default: return status;
  }
}

export default function FestivalListPage() {
  const [festivals, setFestivals] = useState<FestivalListItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<FestivalStatusCounts>({ total: 0, ongoing: 0, upcoming: 0, ended: 0 });
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('기록 없음');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // ── 데이터 페칭 함수 ──
  const fetchFestivals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.get<ApiResponse<AdminFestivalListData>>('/festivals', {
        params: {
          page: currentPage,
          size: 10,
          keyword: keyword || undefined,
          status: statusFilter || undefined,
        },
      });
      if (res.data.success && res.data.data) {
        setFestivals(res.data.data.content);
        setStatusCounts(res.data.data.statusCounts);
        setTotalPages(res.data.data.totalPages || 1);
        if (res.data.data.lastSyncTime) {
          setLastSyncTime(res.data.data.lastSyncTime);
        }
      }
    } catch (error) {
      console.error('Failed to fetch festivals:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, statusFilter]);

  // 페이지 마운트, 페이지/필터 변경 시 호출
  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  // ── E1: 수동 갱신 (API_ADM_0031) ──
  const handleSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await adminApi.post<ApiResponse<FestivalSyncData>>('/festivals/sync');
      if (res.data.success) {
        alert('동기화 완료!');
        fetchFestivals();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || '동기화 실패. 다시 시도해주세요.';
      alert(errorMsg);
    } finally {
      setSyncing(false);
    }
  }, [syncing, fetchFestivals]);

  const handleToggleVisibility = async (festivalId: number, currentVisible: boolean) => {
    if (!confirm(`해당 축제를 ${currentVisible ? '숨김' : '공개'} 처리하시겠습니까?`)) return;
    try {
      const res = await adminApi.patch(`/festivals/${festivalId}/visibility`, {
        isVisible: !currentVisible,
      });
      if (res.data.success) {
        setFestivals(prev =>
          prev.map(f => (f.id === festivalId ? { ...f, isVisible: !currentVisible } : f))
        );
      } else {
        alert(res.data.error?.message || '상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to update visibility:', error);
      alert('오류가 발생했습니다.');
    }
  };

  // 필터 초기화 시 페이지 1로 재설정
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── 페이지 헤더 ── */}
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>🌐 공공 축제 리스트</h1>
        <p className={styles.pageSubtitle}>공공 API로 수집된 축제 데이터를 관리합니다</p>
      </header>

      {/* ── 공공 API 데이터 갱신 카드 ── */}
      <section className={styles.syncCard}>
        <div className={styles.syncHeader}>
          <div>
            <div className={styles.syncTitle}>공공 API 데이터 갱신</div>
            <div className={styles.syncTimestamp}>최근 갱신: {lastSyncTime}</div>
          </div>
          <button
            type="button"
            className={styles.syncButton}
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <span className={styles.spinner} />
                동기화 중...
              </>
            ) : (
              '🔄 수동 갱신'
            )}
          </button>
        </div>

        {/* ── 상태 요약 카드 4종 ── */}
        <div className={styles.statGrid}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statLabel}>전체 축제</div>
            <div className={styles.statValue}>{statusCounts.total}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statOngoing}`}>
            <div className={styles.statLabel}>진행중</div>
            <div className={`${styles.statValue} ${styles.textGreen}`}>{statusCounts.ongoing}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statUpcoming}`}>
            <div className={styles.statLabel}>진행예정</div>
            <div className={`${styles.statValue} ${styles.textPurple}`}>{statusCounts.upcoming}</div>
          </div>
          <div className={`${styles.statCard} ${styles.statEnded}`}>
            <div className={styles.statLabel}>종료</div>
            <div className={`${styles.statValue} ${styles.textGray}`}>{statusCounts.ended}</div>
          </div>
        </div>
      </section>

      {/* ── 필터 바 ── */}
      <section className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="축제명 또는 지역 검색..."
          value={keyword}
          onChange={handleKeywordChange}
        />
        <div className={styles.statusButtonGroup}>
          <button 
            type="button" 
            className={`${styles.statusBtn} ${styles.statusBtnAll} ${statusFilter === '' ? styles.active : ''}`}
            onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
          >전체</button>
          <button 
            type="button" 
            className={`${styles.statusBtn} ${styles.statusBtnOngoing} ${statusFilter === 'ongoing' ? styles.active : ''}`}
            onClick={() => { setStatusFilter('ongoing'); setCurrentPage(1); }}
          >진행중</button>
          <button 
            type="button" 
            className={`${styles.statusBtn} ${styles.statusBtnUpcoming} ${statusFilter === 'upcoming' ? styles.active : ''}`}
            onClick={() => { setStatusFilter('upcoming'); setCurrentPage(1); }}
          >진행예정</button>
          <button 
            type="button" 
            className={`${styles.statusBtn} ${styles.statusBtnEnded} ${statusFilter === 'ended' ? styles.active : ''}`}
            onClick={() => { setStatusFilter('ended'); setCurrentPage(1); }}
          >종료</button>
        </div>
      </section>

      {/* ── 축제 목록 테이블 ── */}
      <section className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '22%' }}>축제명</th>
              <th style={{ width: '12%' }}>지역</th>
              <th style={{ width: '24%' }}>날짜</th>
              <th style={{ width: '12%' }}>카테고리</th>
              <th style={{ width: '10%' }}>상태</th>
              <th style={{ width: '20%', textAlign: 'center' }}>관리 (노출/숨김)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  로딩 중...
                </td>
              </tr>
            ) : festivals.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              festivals.map((festival) => (
                <tr key={festival.id} className={!festival.isVisible ? styles.hiddenRow : ''}>
                  <td className={styles.titleCell}>{festival.title}</td>
                  <td>{festival.region}</td>
                  <td>
                    {formatDate(festival.startDate)} - {formatDate(festival.endDate)}
                  </td>
                  <td>{festival.category}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge-${festival.status}`]}`}>
                      {festival.status === 'ongoing' ? '진행중' : festival.status === 'upcoming' ? '진행예정' : '종료'}
                    </span>
                  </td>
                  <td>
                    <div 
                      className={styles.toggleWrapper} 
                      onClick={() => handleToggleVisibility(festival.id, festival.isVisible)}
                      style={{ justifyContent: 'center' }}
                    >
                      <span className={`${styles.toggleLabel} ${festival.isVisible ? styles.public : styles.private}`}>
                        {festival.isVisible ? '공개' : '숨김'}
                      </span>
                      <div className={`${styles.toggleTrack} ${festival.isVisible ? styles.on : ''}`}>
                        <div className={`${styles.toggleThumb} ${festival.isVisible ? styles.on : ''}`} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── 페이지네이션 ── */}
        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ← 이전
          </button>
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages} 페이지
          </span>
          <button
            type="button"
            className={styles.pageBtn}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            다음 →
          </button>
        </div>
      </section>
    </div>
  );
}
