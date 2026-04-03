'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type {
  FestivalListItem,
  FestivalStatusCounts,
  ApiResponse,
  AdminFestivalListData,
  FestivalSyncData,
  FestivalVisibilityData,
} from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';
import type { RegionOptionDto, CategoryOptionDto } from '@/types/admin-festival';
import styles from './FestivalListPage.module.css';

function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return '';
  const start = startDateStr.replace(/-/g, '.');
  const end = endDateStr.replace(/-/g, '.');
  
  if (start.substring(0, 4) === end.substring(0, 4)) {
    return `${start} ~ ${end.substring(5)}`;
  }
  return `${start} ~ ${end}`;
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [festivals, setFestivals] = useState<FestivalListItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<FestivalStatusCounts>({ total: 0, ongoing: 0, upcoming: 0, ended: 0 });
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('기록 없음');
  
  // URL에서 초기값 읽기
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialKeyword = searchParams.get('keyword') || '';
  const initialStatus = searchParams.get('status') || '';

  const [keyword, setKeyword] = useState(initialKeyword);
  const [searchTerm, setSearchTerm] = useState(initialKeyword);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const [regionOptions, setRegionOptions] = useState<RegionOptionDto[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOptionDto[]>([]);
  
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // URL 동기화 (상태가 변할 때 URL을 업데이트)
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (keyword) params.set('keyword', keyword);
    if (statusFilter) params.set('status', statusFilter);
    if (categoryFilter) params.set('categoryCode', categoryFilter);
    if (regionFilter) params.set('areaCode', regionFilter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [currentPage, keyword, statusFilter, categoryFilter, regionFilter, pathname, router]);

  // 삭제: 검색어 자동 Debounce 처리 제거 (버튼 클릭/엔터로만 검색하도록 변경)

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
          categoryCode: categoryFilter || undefined,
          areaCode: regionFilter || undefined,
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

  useEffect(() => {
    adminApi.get<ApiResponse<RegionOptionDto[]>>('/festivals/regions/options').then(res => {
      if (res.data.success && res.data.data) setRegionOptions(res.data.data);
    });
    adminApi.get<ApiResponse<CategoryOptionDto[]>>('/festivals/categories/options').then(res => {
      if (res.data.success && res.data.data) setCategoryOptions(res.data.data);
    });
  }, []);

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

  // 검색어 onChange (debounced)
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setKeyword(searchTerm);
      setCurrentPage(1);
    }
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
          <div 
            className={`${styles.statCard} ${styles.statTotal} ${styles.kpiCardInteractive} ${statusFilter === '' ? styles.statActive : ''}`}
            onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
          >
            <div className={styles.statLabel}>전체 축제</div>
            <div className={styles.statValue}>{statusCounts.total}</div>
          </div>
          <div 
            className={`${styles.statCard} ${styles.statOngoing} ${styles.kpiCardInteractive} ${statusFilter === 'ongoing' ? styles.statActive : ''}`}
            onClick={() => { setStatusFilter('ongoing'); setCurrentPage(1); }}
          >
            <div className={styles.statLabel}>진행중</div>
            <div className={`${styles.statValue} ${styles.textGreen}`}>{statusCounts.ongoing}</div>
          </div>
          <div 
            className={`${styles.statCard} ${styles.statUpcoming} ${styles.kpiCardInteractive} ${statusFilter === 'upcoming' ? styles.statActive : ''}`}
            onClick={() => { setStatusFilter('upcoming'); setCurrentPage(1); }}
          >
            <div className={styles.statLabel}>진행예정</div>
            <div className={`${styles.statValue} ${styles.textPurple}`}>{statusCounts.upcoming}</div>
          </div>
          <div 
            className={`${styles.statCard} ${styles.statEnded} ${styles.kpiCardInteractive} ${statusFilter === 'ended' ? styles.statActive : ''}`}
            onClick={() => { setStatusFilter('ended'); setCurrentPage(1); }}
          >
            <div className={styles.statLabel}>종료</div>
            <div className={`${styles.statValue} ${styles.textGray}`}>{statusCounts.ended}</div>
          </div>
        </div>
      </section>

      {/* ── 필터 바 ── */}
      <section className={styles.filterBar}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">전체 카테고리</option>
            {categoryOptions.filter(o => o.type !== 'STANDARD').map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
            <optgroup label="표준(공공) 분류">
              {categoryOptions.filter(o => o.type === 'STANDARD').map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </optgroup>
          </select>

          <select 
            className={styles.filterSelect}
            value={regionFilter}
            onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">전체 지역</option>
            {regionOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="축제명 또는 장소(주소) 검색..."
            value={searchTerm}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyDown}
          />
          <button 
            type="button" 
            className={styles.filterBtn}
            onClick={() => { setKeyword(searchTerm); setCurrentPage(1); }}
          >
            검색
          </button>
        </div>
      </section>

      {/* ── 축제 목록 테이블 ── */}
      <section className={styles.tableCard}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.festivalNameCol} />
            <col className={styles.categoryCol} />
            <col className={styles.regionCol} />
            <col className={styles.dateCol} />
            <col className={styles.statusCol} />
            <col className={styles.visibilityCol} />
          </colgroup>
          <thead>
            <tr className={styles.tableHeaderRow}>
              {/* 인라인 스타일 폭 대신 CSS Module(colgroup)로 너비 위임 */}
              <th className={`${styles.tableHeaderCell} ${styles.textLeft}`}>축제명</th>
              <th className={`${styles.tableHeaderCell} ${styles.textLeft}`}>카테고리</th>
              <th className={`${styles.tableHeaderCell} ${styles.textLeft}`}>지역</th>
              <th className={`${styles.tableHeaderCell} ${styles.textCenter}`}>날짜</th>
              <th className={`${styles.tableHeaderCell} ${styles.textCenter}`}>상태</th>
              <th className={`${styles.tableHeaderCell} ${styles.textRight}`}>관리 (노출/숨김)</th>
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
                <tr 
                  key={festival.id} 
                  className={`${styles.tableRow} ${styles.tableRowHover} ${!festival.isVisible ? styles.hiddenRow : ''}`}
                >
                  <td className={`${styles.tableCell} ${styles.textLeft} ${styles.festivalNameCell}`}>
                    <div className={styles.festivalNameText}>
                      {festival.title}
                    </div>
                  </td>
                  <td className={`${styles.tableCell} ${styles.textLeft}`}>{festival.categoryLabel}</td>
                  <td className={`${styles.tableCell} ${styles.textLeft}`}>{festival.region}</td>
                  <td className={`${styles.tableCell} ${styles.textCenter}`}>
                    {formatDateRange(festival.startDate, festival.endDate)}
                  </td>
                  <td className={`${styles.tableCell} ${styles.textCenter}`}>
                    <span className={`${styles.statusBadge} ${festival.status === 'ongoing' ? styles.statusOngoing : festival.status === 'upcoming' ? styles.statusUpcoming : styles.statusEnded}`}>
                      {festival.status === 'ongoing' ? '진행중' : festival.status === 'upcoming' ? '진행예정' : '종료'}
                    </span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.textRight}`}>
                    <div 
                      className={styles.toggleWrapper} 
                      onClick={() => handleToggleVisibility(festival.id, festival.isVisible)}
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
