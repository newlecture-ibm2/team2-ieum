'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  FestivalListItem,
  FestivalStatusCounts,
  ApiResponse,
  AdminFestivalListData,
  FestivalSyncData,
} from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';
import { useAdminList } from '../../useAdminList';
import { useFestivalOptions } from '../../useFestivalOptions';
import { formatDateRange } from '../../format';
import c from '@/app/admin/_styles/admin-common.module.css';
import s from './FestivalListPage.module.css';
import AdminListSummary from '../AdminListSummary';
import { ConfirmModal } from '@/_component/common/Modal';
import { useToast } from '@/_component/common/Toast';

// ── 상태 배지 매핑 ──
const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  ongoing:  { label: '진행중',   badge: 'badgeOngoing' },
  upcoming: { label: '진행예정', badge: 'badgeUpcoming' },
  ended:    { label: '종료',     badge: 'badgeEnded' },
};

// ── 카테고리 뱃지 포맷팅 ──
const renderCategoryBadge = (categoryLabel?: string) => {
  if (!categoryLabel) return '-';
  const parts = categoryLabel.split(' > ');
  if (parts.length === 1) return <span title={categoryLabel}>{parts[0]}</span>;
  
  const parent = parts[0];
  const child = parts[1];
  const shortParent = parent.includes('행사') ? '공연' : parent.includes('축제') ? '축제' : '기타';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title={categoryLabel}>
      <span style={{ fontSize: '10px', padding: '2px 6px', background: '#e2e8f0', color: '#475569', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {shortParent}
      </span>
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px' }}>
        {child}
      </span>
    </div>
  );
};

// ── KPI 카드 정의 ──
const KPI_ITEMS = (counts: FestivalStatusCounts) => [
  { key: '',         label: '전체 축제', count: counts.total,    style: c.statTotal,    valueClass: '' },
  { key: 'ongoing',  label: '진행중',   count: counts.ongoing,  style: c.statOngoing,  valueClass: c.textGreen },
  { key: 'upcoming', label: '진행예정', count: counts.upcoming, style: c.statUpcoming, valueClass: c.textPurple },
  { key: 'ended',    label: '종료',     count: counts.ended,    style: c.statEnded,    valueClass: c.textGray },
];

export default function FestivalListPage() {
  // ── 공통 목록 hook ──
  const list = useAdminList({ extraFilterKeys: ['categoryCode', 'areaCode'] });
  const { regionOptions, categoryOptions } = useFestivalOptions();
  const { toast } = useToast();

  // ── 페이지 고유 상태 ──
  const [festivals, setFestivals] = useState<FestivalListItem[]>([]);
  const [statusCounts, setStatusCounts] = useState<FestivalStatusCounts>({ total: 0, ongoing: 0, upcoming: 0, ended: 0 });
  const [syncingAction, setSyncingAction] = useState<string | null>(null);
  const [syncMenuOpen, setSyncMenuOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('기록 없음');
  const menuRef = useRef<HTMLDivElement>(null);

  // ── 확인 모달 상태 ──
  const [confirmTarget, setConfirmTarget] = useState<{ id: number; visible: boolean } | null>(null);

  // ── Outside Click 감지 ──
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSyncMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const PUBLIC_SYNC_MENU = [
    { action: 'ALL',      label: '전체 갱신',       url: '/festivals/sync/all' },
    { action: 'PUBLIC',   label: '축제 데이터 갱신', url: '/festivals/sync/public' },
    { action: 'CATEGORY', label: '카테고리 갱신',    url: '/festivals/sync/categories' },
    { action: 'REGION',   label: '지역 갱신',       url: '/festivals/sync/regions' },
    { action: 'STATUS',   label: '상태 갱신',       url: '/festivals/sync/status' },
  ];

  // ── 데이터 페칭 ──
  const fetchFestivals = useCallback(async () => {
    list.setLoading(true);
    try {
      const res = await adminApi.get<ApiResponse<AdminFestivalListData>>('/festivals', {
        params: {
          page: list.currentPage, size: 10,
          keyword: list.keyword || undefined,
          status: list.statusFilter || undefined,
          categoryCode: list.extraFilters.categoryCode || undefined,
          areaCode: list.extraFilters.areaCode || undefined,
        },
      });
      if (res.data.success && res.data.data) {
        setFestivals(res.data.data.content);
        setStatusCounts(res.data.data.statusCounts);
        list.setTotalPages(res.data.data.totalPages || 1);
        list.setTotalElements(res.data.data.totalElements || 0);
        if (res.data.data.lastSyncTime) setLastSyncTime(res.data.data.lastSyncTime);
      }
    } catch (error) {
      console.error('Failed to fetch festivals:', error);
    } finally {
      list.setLoading(false);
    }
  }, [list.currentPage, list.keyword, list.statusFilter, list.extraFilters.categoryCode, list.extraFilters.areaCode]);

  useEffect(() => { fetchFestivals(); }, [fetchFestivals]);

  // ── 동기화 ──
  const handleSync = useCallback(async (url: string, actionName: string) => {
    if (syncingAction) return;
    setSyncMenuOpen(false);
    setSyncingAction(actionName);
    try {
      const res = await adminApi.post<ApiResponse<any>>(url);
      if (res.data.success) {
        const details = res.data.data?.details;
        let msg = `[${actionName}] 동기화 완료!`;
        if (details) {
          msg += `\n- 지역: ${details.region}건\n- 시군구: ${details.sigungu}건\n- 카테고리: ${details.category}건\n- 축제: ${details.festival}건\n- 상태: ${details.status}건`;
        }
        toast(msg, 'success');
        fetchFestivals();
        if (actionName === 'ALL' || actionName === 'REGION' || actionName === 'CATEGORY') {
            // Options refresh could be triggered here if we add that to hook
        }
      }
    } catch (error: any) {
      toast(error.response?.data?.error?.message || '동기화 실패. 다시 시도해주세요.', 'error');
    } finally {
      setSyncingAction(null);
    }
  }, [syncingAction, fetchFestivals]);

  // ── 노출 토글 ──
  const handleToggleVisibility = (festivalId: number, currentVisible: boolean) => {
    setConfirmTarget({ id: festivalId, visible: currentVisible });
  };

  const executeToggle = async () => {
    if (!confirmTarget) return;
    const { id, visible } = confirmTarget;
    setConfirmTarget(null);
    try {
      const res = await adminApi.patch(`/festivals/${id}/visibility`, { isVisible: !visible });
      if (res.data.success) {
        setFestivals(prev => prev.map(f => (f.id === id ? { ...f, isVisible: !visible } : f)));
        toast(`축제가 ${!visible ? '공개' : '숨김'} 처리되었습니다.`, 'success');
      } else {
        toast(res.data.error?.message || '상태 변경에 실패했습니다.', 'error');
      }
    } catch { toast('오류가 발생했습니다.', 'error'); }
  };

  return (
    <div className={c.container}>
      <header className={c.pageHeader}>
        <div>
          <h1 className={c.pageTitle}>🌐 공공 축제 리스트</h1>
          <p className={c.pageSubtitle}>공공 API로 수집된 축제 데이터를 관리합니다</p>
        </div>
      </header>

      {/* ── 동기화 + KPI ── */}
      <section className={c.card}>
        <div className={c.cardHeader}>
          <div>
            <div className={c.cardTitle}>공공 API 데이터 갱신</div>
            <div className={c.cardSubtitle}>최근 갱신: {lastSyncTime}</div>
          </div>
          <div className={c.dropdownContainer} ref={menuRef}>
            <button type="button" className={c.btnOutline} onClick={() => setSyncMenuOpen(!syncMenuOpen)} disabled={!!syncingAction}>
              {syncingAction ? (<><span className={c.spinner} /> 갱신 중...</>) : '🔄 데이터 갱신 ▼'}
            </button>
            {syncMenuOpen && (
              <div className={c.dropdownMenu}>
                {PUBLIC_SYNC_MENU.map(menu => (
                  <button key={menu.action} className={c.dropdownItem} onClick={() => handleSync(menu.url, menu.label)}>
                    {menu.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={c.statGrid}>
          {KPI_ITEMS(statusCounts).map(item => (
            <div key={item.key}
              className={`${c.statCard} ${item.style} ${c.statCardInteractive} ${list.statusFilter === item.key ? c.statActive : ''}`}
              onClick={() => list.setStatusFilterAndReset(item.key)}>
              <div className={c.statLabel}>{item.label}</div>
              <div className={`${c.statValue} ${item.valueClass}`}>{item.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 필터 바 ── */}
      <section className={c.filterBar}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select className={c.filterSelect} value={list.extraFilters.categoryCode} onChange={e => list.setExtraFilter('categoryCode', e.target.value)}>
            <option value="">전체 카테고리</option>
            <optgroup label="공공 분류">
              {categoryOptions.filter(o => o.type === 'STANDARD').map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </optgroup>
            <optgroup label="추가 분류">
              {categoryOptions.filter(o => o.type === 'CUSTOM').map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </optgroup>
          </select>
          <select className={c.filterSelect} value={list.extraFilters.areaCode} onChange={e => list.setExtraFilter('areaCode', e.target.value)}>
            <option value="">전체 지역</option>
            {regionOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" className={c.searchInput} placeholder="축제명 또는 장소(주소) 검색..."
            value={list.searchTerm} onChange={e => list.setSearchTerm(e.target.value)} onKeyDown={list.handleKeyDown} />
          <button type="button" className={c.searchBtn} onClick={list.submitSearch}>검색</button>
        </div>
      </section>

      {/* ── 테이블 ── */}
      <section className={c.tableCard}>
        <AdminListSummary totalCount={list.totalElements} label="검색된 축제" />
        <table className={c.table}>
          <colgroup>
            <col className={s.festivalNameCol} />
            <col className={s.categoryCol} />
            <col className={s.regionCol} />
            <col className={s.dateCol} />
            <col className={s.statusCol} />
            <col className={s.visibilityCol} />
          </colgroup>
          <thead>
            <tr className={c.tableHeaderRow}>
              <th className={`${c.tableHeaderCell} ${c.textLeft}`}>축제명</th>
              <th className={`${c.tableHeaderCell} ${c.textLeft}`}>카테고리</th>
              <th className={`${c.tableHeaderCell} ${c.textLeft}`}>지역</th>
              <th className={`${c.tableHeaderCell} ${c.textLeft}`}>날짜</th>
              <th className={`${c.tableHeaderCell} ${c.textLeft}`}>상태</th>
              <th className={`${c.tableHeaderCell} ${c.textRight}`}>관리 (노출/숨김)</th>
            </tr>
          </thead>
          <tbody>
            {list.loading ? (
              <tr><td colSpan={6} className={c.emptyRow}>로딩 중...</td></tr>
            ) : festivals.length === 0 ? (
              <tr><td colSpan={6} className={c.emptyRow}>검색 결과가 없습니다.</td></tr>
            ) : (
              festivals.map(festival => {
                const { label, badge } = STATUS_MAP[festival.status] || STATUS_MAP.ended;
                return (
                  <tr key={festival.id} className={`${c.tableRow} ${c.tableRowHover} ${!festival.isVisible ? c.hiddenRow : ''}`}>
                    <td className={`${c.tableCell} ${c.textLeft} ${c.cellPrimary}`}>
                      <div className={c.cellEllipsis}>{festival.title}</div>
                    </td>
                    <td className={`${c.tableCell} ${c.textLeft}`}>{renderCategoryBadge(festival.categoryLabel)}</td>
                    <td className={`${c.tableCell} ${c.textLeft}`}>{festival.region}</td>
                    <td className={`${c.tableCell} ${c.textLeft}`}>{formatDateRange(festival.startDate, festival.endDate)}</td>
                    <td className={`${c.tableCell} ${c.textLeft}`}>
                      <span className={`${c.statusBadge} ${(c as any)[badge]}`}>{label}</span>
                    </td>
                    <td className={`${c.tableCell} ${c.textRight}`}>
                      <div className={c.toggleWrapper} onClick={() => handleToggleVisibility(festival.id, festival.isVisible)}>
                        <span className={`${c.toggleLabel} ${festival.isVisible ? c.toggleLabelOn : c.toggleLabelOff}`}>
                          {festival.isVisible ? '공개' : '숨김'}
                        </span>
                        <div className={`${c.toggleTrack} ${festival.isVisible ? c.toggleTrackOn : ''}`}>
                          <div className={`${c.toggleThumb} ${festival.isVisible ? c.toggleThumbOn : ''}`} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className={c.pagination}>
          <button type="button" className={c.pageBtn} disabled={list.currentPage <= 1} onClick={() => list.setCurrentPage(p => p - 1)}>← 이전</button>
          <span className={c.pageInfo}>{list.currentPage} / {list.totalPages} 페이지</span>
          <button type="button" className={c.pageBtn} disabled={list.currentPage >= list.totalPages} onClick={() => list.setCurrentPage(p => p + 1)}>다음 →</button>
        </div>
      </section>

      {/* ── 확인 모달 ── */}
      {confirmTarget && (
        <ConfirmModal
          title="노출 상태 변경"
          message={`해당 축제를 ${confirmTarget.visible ? '숨김' : '공개'} 처리하시겠습니까?`}
          confirmText={confirmTarget.visible ? '숨김 처리' : '공개 처리'}
          onConfirm={executeToggle}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </div>
  );
}
