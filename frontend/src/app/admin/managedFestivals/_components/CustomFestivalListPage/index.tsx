'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { CustomFestivalItem, CustomFestivalListResult, ApiResponse } from '@/types/admin-festival';
import adminApi from '@/lib/adminApi';
import { useAdminList } from '@/app/admin/festivals/useAdminList';
import { useFestivalOptions } from '@/app/admin/festivals/useFestivalOptions';
import { formatDateRange } from '@/app/admin/festivals/format';
import c from '@/app/admin/_styles/admin-common.module.css';
import s from './CustomFestivalListPage.module.css';
import CustomFestivalFormModal from '../CustomFestivalFormModal';
import AdminListSummary from '@/app/admin/festivals/_components/AdminListSummary';
import { ConfirmModal } from '@/_component/common/Modal';
import { useToast } from '@/_component/common/Toast';
import { FESTIVAL_STATUS } from '@/constants/filterOptions';
import Pagination from '@/_component/common/Pagination';

// ── 상태 배지 매핑 ──
const STATUS_MAP: Record<string, { label: string; badge: string }> = {
  [FESTIVAL_STATUS.ONGOING]: { label: '진행중', badge: 'badgeOngoing' },
  [FESTIVAL_STATUS.UPCOMING]: { label: '진행예정', badge: 'badgeUpcoming' },
  [FESTIVAL_STATUS.ENDED]: { label: '종료', badge: 'badgeEnded' },
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
const KPI_ITEMS = (counts: Record<string, number>) => [
  { key: '', label: '전체 축제', count: counts.total, style: c.statTotal, valueClass: '' },
  { key: FESTIVAL_STATUS.ONGOING, label: '진행중', count: counts.ongoing, style: c.statOngoing, valueClass: c.textGreen },
  { key: FESTIVAL_STATUS.UPCOMING, label: '진행예정', count: counts.upcoming, style: c.statUpcoming, valueClass: c.textPurple },
  { key: FESTIVAL_STATUS.ENDED, label: '종료', count: counts.ended, style: c.statEnded, valueClass: c.textGray },
];

export default function CustomFestivalListPage() {
  // ── 공통 목록 hook ──
  const list = useAdminList({ extraFilterKeys: ['categoryCode', 'areaCode', 'excludeHidden'] });
  const { regionOptions, categoryOptions, refreshRegionOptions } = useFestivalOptions();
  const { toast } = useToast();

  // ── 페이지 고유 상태 ──
  const [festivals, setFestivals] = useState<CustomFestivalItem[]>([]);
  const [statusCounts, setStatusCounts] = useState({ total: 0, ongoing: 0, upcoming: 0, ended: 0 });

  // ── 폼 모달 상태 ──
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomFestivalItem | null>(null);

  // ── 동기화 상태 ──
  const [syncingAction, setSyncingAction] = useState<string | null>(null);
  const [syncMenuOpen, setSyncMenuOpen] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('-');
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

  const CUSTOM_SYNC_MENU = [
    { action: 'ALL', label: '전체 갱신', url: '/managedFestivals/sync/all' },
    { action: 'CATEGORY', label: '카테고리 갱신', url: '/festivals/sync/categories' },
    { action: 'REGION', label: '지역 갱신', url: '/festivals/sync/regions' },
    { action: 'STATUS', label: '상태 갱신', url: '/festivals/sync/status' },
  ];

  // ── 데이터 페칭 ──
  const fetchFestivals = useCallback(async () => {
    list.setLoading(true);
    try {
      const res = await adminApi.get<ApiResponse<CustomFestivalListResult>>('/managedFestivals', {
        params: {
          page: list.currentPage, size: 10,
          keyword: list.keyword || undefined,
          status: list.statusFilter || undefined,
          categoryCode: list.extraFilters.categoryCode || undefined,
          areaCode: list.extraFilters.areaCode || undefined,
          excludeHidden: list.extraFilters.excludeHidden || undefined,
        },
      });
      if (res.data.success && res.data.data) {
        setFestivals(res.data.data.festivals);
        if (res.data.data.statusCounts) setStatusCounts(res.data.data.statusCounts);
        list.setTotalPages(Math.ceil(res.data.data.totalElements / 10) || 1);
        list.setTotalElements(res.data.data.totalElements || 0);

        // 로컬 갱신 시간 기록
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const hh = String(now.getHours()).padStart(2, '0');
        const min = String(now.getMinutes()).padStart(2, '0');
        setLastRefreshTime(`${yyyy}.${mm}.${dd} ${hh}:${min}`);
      }
    } catch (error) {
      console.error('Failed to fetch custom festivals:', error);
    } finally {
      list.setLoading(false);
    }
  }, [list.currentPage, list.keyword, list.statusFilter, list.extraFilters.categoryCode, list.extraFilters.areaCode, list.extraFilters.excludeHidden]);

  useEffect(() => { fetchFestivals(); }, [fetchFestivals]);

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
        setFestivals(prev => prev.map(f => (f.festivalId === id ? { ...f, isVisible: !visible } : f)));
        toast(`축제가 ${!visible ? '공개' : '숨김'} 처리되었습니다.`, 'success');
      } else {
        toast(res.data.error?.message || '상태 변경에 실패했습니다.', 'error');
      }
    } catch { toast('오류가 발생했습니다.', 'error'); }
  };

  // ── 동기화 ──
  const handleSync = useCallback(async (url: string, actionName: string) => {
    if (syncingAction) return;
    setSyncMenuOpen(false);
    setSyncingAction(actionName);
    try {
      const res = await adminApi.post<ApiResponse<{ details?: Record<string, number> }>>(url);
      if (res.data.success) {
        const details = res.data.data?.details;
        let msg = `[${actionName}] 동기화 완료!`;
        if (details) {
          msg += `\n- 지역: ${details.region}건\n- 시군구: ${details.sigungu}건\n- 카테고리: ${details.category}건\n- 상태: ${details.status}건`;
        }
        toast(msg, 'success');
        fetchFestivals();
        if (actionName === 'ALL' || actionName === 'REGION' || actionName === 'CATEGORY') {
          refreshRegionOptions();
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } } };
      toast(err.response?.data?.error?.message || '동기화 실패. 다시 시도해주세요.', 'error');
    } finally {
      setSyncingAction(null);
    }
  }, [syncingAction, fetchFestivals, refreshRegionOptions]);

  // ── 폼 모달 핸들러 ──
  const handleOpenCreate = () => { setEditingItem(null); setShowForm(true); };
  const handleOpenEdit = (item: CustomFestivalItem) => { setEditingItem(item); setShowForm(true); };
  const handleFormClose = () => { setShowForm(false); setEditingItem(null); };
  const handleFormSaved = () => { setShowForm(false); setEditingItem(null); fetchFestivals(); };

  return (
    <div className={c.container}>
      <header className={c.pageHeader}>
        <div>
          <h1 className={c.pageTitle}>🎪 축제 관리</h1>
          <p className={c.pageSubtitle}>등록 축제를 관리합니다. (최근 갱신: {lastRefreshTime})</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className={c.dropdownContainer} ref={menuRef}>
            <button type="button" className={c.btnOutline} onClick={() => setSyncMenuOpen(!syncMenuOpen)} disabled={!!syncingAction}>
              {syncingAction ? (<><span className={c.spinner} /> 갱신 중...</>) : '🔄 데이터 갱신 ▼'}
            </button>
            {syncMenuOpen && (
              <div className={c.dropdownMenu}>
                {CUSTOM_SYNC_MENU.map(menu => (
                  <button key={menu.action} className={c.dropdownItem} onClick={() => handleSync(menu.url, menu.label)}>
                    {menu.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleOpenCreate} className={c.btnPrimary}><span>+</span> 축제 등록</button>
        </div>
      </header>

      {/* ── KPI 카드 ── */}
      <section className={c.card}>

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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select className={c.filterSelect} value={list.extraFilters.categoryCode} onChange={e => list.setExtraFilter('categoryCode', e.target.value)}>
            <option value="">전체 카테고리</option>
            <optgroup label="공공 분류">
              {categoryOptions.filter(o => o.type === 'STANDARD').map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </optgroup>
            <optgroup label="추가 분류">
              {categoryOptions.filter(o => o.type === 'CUSTOM').map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </optgroup>
          </select>
          <div className={s.filterRowWrap}>
            <select className={`${c.filterSelect} ${s.filterSelectHalf}`} value={list.extraFilters.areaCode} onChange={e => list.setExtraFilter('areaCode', e.target.value)}>
              <option value="">전체 지역</option>
              {regionOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
            <label className={s.filterCheckboxLabel}>
              <input type="checkbox" checked={list.extraFilters.excludeHidden === 'true'}
                onChange={e => list.setExtraFilter('excludeHidden', e.target.checked ? 'true' : '')} />
              숨김 축제 제외
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input type="text" className={c.searchInput} placeholder="축제명 또는 지역으로 검색하세요"
            value={list.searchTerm} onChange={e => list.setSearchTerm(e.target.value)} onKeyDown={list.handleKeyDown} />
          <button type="button" className={c.searchBtn} onClick={list.submitSearch}>검색</button>
        </div>
      </section>

      <section className={c.card}>
        <AdminListSummary totalCount={list.totalElements} label="검색된 관리 축제" />
        <div className={c.desktopOnly}>
        <table className={c.table} style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 'auto' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '190px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '140px' }} />
          </colgroup>
          <thead>
            <tr className={c.tableHeaderRow}>
              <th className={`${c.tableHeaderCell} ${c.textLeft}`}>축제명</th>
              <th className={`${c.tableHeaderCell} ${c.textLeft}`}>카테고리</th>
              <th className={`${c.tableHeaderCell} ${c.textLeft}`}>지역</th>
              <th className={`${c.tableHeaderCell} ${c.textCenter}`}>날짜</th>
              <th className={`${c.tableHeaderCell} ${c.textCenter}`}>상태</th>
              <th className={`${c.tableHeaderCell} ${c.textCenter}`}>관리 (노출/동작)</th>
            </tr>
          </thead>
          <tbody>
            {list.loading ? (
              <tr><td colSpan={6} className={c.emptyRow}>로딩 중...</td></tr>
            ) : festivals.length === 0 ? (
              <tr><td colSpan={6} className={c.emptyRow}>조회된 축제가 없습니다.</td></tr>
            ) : (
              festivals.map(f => {
                const { label, badge } = STATUS_MAP[f.status] || STATUS_MAP.ENDED;
                return (
                  <tr key={f.festivalId} className={`${c.tableRow} ${c.tableRowHover} ${!f.isVisible ? c.hiddenRow : ''}`}>
                    <td className={`${c.tableCell} ${c.textLeft} ${c.cellPrimary} ${s.festivalNameCell}`}>
                      <div className={c.cellEllipsis} onClick={() => handleOpenEdit(f)} style={{ cursor: 'pointer' }} title="클릭하여 수정">
                        {f.title}
                      </div>
                    </td>
                    <td className={`${c.tableCell} ${c.textLeft}`}>{renderCategoryBadge(f.categoryLabel)}</td>
                    <td className={`${c.tableCell} ${c.textLeft}`}>{f.areaLabel || f.areaCode}</td>
                    <td className={`${c.tableCell} ${c.textCenter}`}>{formatDateRange(f.startDate, f.endDate)}</td>
                    <td className={`${c.tableCell} ${c.textCenter}`}>
                      <span className={`${c.statusBadge} ${c[badge as keyof typeof c]}`}>{label}</span>
                    </td>
                    <td className={`${c.tableCell} ${c.textCenter}`}>
                      <div className={c.actionGroup}>
                        <div className={c.toggleWrapper} onClick={() => handleToggleVisibility(f.festivalId, f.isVisible)} title="클릭하여 노출 상태 변경">
                          <span className={`${c.toggleLabel} ${f.isVisible ? c.toggleLabelOn : c.toggleLabelOff}`}>
                            {f.isVisible ? '공개' : '숨김'}
                          </span>
                          <div className={`${c.toggleTrack} ${f.isVisible ? c.toggleTrackOn : ''}`}>
                            <div className={`${c.toggleThumb} ${f.isVisible ? c.toggleThumbOn : ''}`} />
                          </div>
                        </div>
                        <button className={c.actionBtn} onClick={() => handleOpenEdit(f)} title="수정">✏️</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

        <div className={`${c.listGrid} ${c.mobileOnly}`}>
          {list.loading ? (
            <div className={c.emptyRow} style={{ gridColumn: '1 / -1' }}>로딩 중...</div>
          ) : festivals.length === 0 ? (
            <div className={c.emptyRow} style={{ gridColumn: '1 / -1' }}>조회된 축제가 없습니다.</div>
          ) : (
            festivals.map(f => {
              const { label, badge } = STATUS_MAP[f.status] || STATUS_MAP.ENDED;
              return (
                <div key={f.festivalId} className={`${c.listCard} ${!f.isVisible ? c.hiddenRow : ''}`}>
                  <div className={c.listCardTop}>
                    {renderCategoryBadge(f.categoryLabel)}
                    <span className={`${c.statusBadge} ${c[badge as keyof typeof c]}`}>{label}</span>
                  </div>

                  <div className={c.listCardTitle} onClick={() => handleOpenEdit(f)} style={{ cursor: 'pointer' }} title="클릭하여 수정">
                    {f.title}
                  </div>

                  <div className={c.listCardInfo}>
                    <div className={c.listCardInfoRow}>
                      <span className={c.listCardIcon}>📍</span>
                      <span className={c.listCardValue}>{f.areaLabel || f.areaCode}</span>
                    </div>
                    <div className={c.listCardInfoRow}>
                      <span className={c.listCardIcon}>📅</span>
                      <span className={c.listCardValue}>{formatDateRange(f.startDate, f.endDate)}</span>
                    </div>
                  </div>

                  <div className={c.listCardActions} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={c.toggleWrapper} onClick={() => handleToggleVisibility(f.festivalId, f.isVisible)} title="클릭하여 노출 상태 변경">
                      <span className={`${c.toggleLabel} ${f.isVisible ? c.toggleLabelOn : c.toggleLabelOff}`}>
                        {f.isVisible ? '공개' : '숨김'}
                      </span>
                      <div className={`${c.toggleTrack} ${f.isVisible ? c.toggleTrackOn : ''}`}>
                        <div className={`${c.toggleThumb} ${f.isVisible ? c.toggleThumbOn : ''}`} />
                      </div>
                    </div>
                    <button className={c.listCardActionBtn} onClick={() => handleOpenEdit(f)} title="수정">
                      수정
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <Pagination 
            currentPage={list.currentPage} 
            totalPages={list.totalPages} 
            onPageChange={list.setCurrentPage} 
          />
        </div>
      </section>

      {showForm && (
        <CustomFestivalFormModal
          editingItem={editingItem}
          regionOptions={regionOptions}
          categoryOptions={categoryOptions}
          onClose={handleFormClose}
          onSaved={handleFormSaved}
        />
      )}

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
