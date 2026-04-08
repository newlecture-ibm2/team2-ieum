'use client';

import { useEffect, useState, useCallback } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import { useAdminList } from '@/app/admin/festivals/useAdminList';
import adminApi from '@/lib/adminApi';
import type { AdminNoticeItem, AdminNoticeListResponse } from '@/types/admin-notice';
import { Modal } from '@/_component/common/Modal';
import ConfirmModal from '@/_component/common/Modal/ConfirmModal';
import NoticeFormModal from '../NoticeFormModal';
import NoticeDetailModal from '../NoticeDetailModal';
import { useToast } from '@/_component/common/Toast';
import s from './NoticeListPage.module.css';

export default function NoticeListPage() {
  const list = useAdminList({ extraFilterKeys: ['searchType'] });
  const {
    currentPage, setCurrentPage, totalPages, setTotalPages,
    totalElements, setTotalElements,
    extraFilters, setExtraFilter,
    loading, setLoading,
    keyword, searchTerm, setSearchTerm, submitSearch
  } = list;

  const { toast } = useToast();

  const [notices, setNotices] = useState<AdminNoticeItem[]>([]);
  const [allCount, setAllCount] = useState(0);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [popupCount, setPopupCount] = useState(0);
  const [pushedCount, setPushedCount] = useState(0);
  const [filterType, setFilterType] = useState<'all' | 'pinned' | 'popup' | 'pushed' | 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'ENDED'>('all');
  const [localSearchType, setLocalSearchType] = useState(extraFilters.searchType || 'ALL');

  const onSearchSubmit = () => {
    setExtraFilter('searchType', localSearchType);
    submitSearch();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  /* ── 모달 상태 ── */
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<AdminNoticeItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminNoticeItem | null>(null);
  const [detailTarget, setDetailTarget] = useState<AdminNoticeItem | null>(null);

  /* ── 데이터 로드 ── */
  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        size: 10,
      };
      if (keyword) params.keyword = keyword;
      if (extraFilters.searchType && extraFilters.searchType !== 'ALL') params.searchType = extraFilters.searchType;

      if (filterType === 'pinned') params.isPinned = true;
      else if (filterType === 'popup') params.isPopup = true;
      else if (filterType === 'pushed') params.isPushed = true;
      else if (filterType !== 'all') params.status = filterType;

      const { data } = await adminApi.get<{ data: AdminNoticeListResponse }>('/notices', { params });
      const result = data.data;

      setNotices(result.content);
      setTotalPages(result.totalPages || 1);
      setTotalElements(result.totalElements);

      // 전체 카운트는 검색이나 필터가 없을 때만 정확하므로 별도 API에서 가져오는 것이 이상적이지만, 
      // 임시로 현재 데이터 내에서 계산 (백엔드 지원 필요)
      const pinned = result.content.filter(n => n.isPinned).length;
      const popup = result.content.filter(n => n.isPopup).length;
      const pushed = result.content.filter(n => n.isPushed).length;
      if (filterType === 'all') {
        setAllCount(result.totalElements);
        setPinnedCount(pinned);
        setPopupCount(popup);
        setPushedCount(pushed);
      }
    } catch (err) {
      console.error('공지사항 목록 조회 실패:', err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, keyword, extraFilters.searchType, filterType, setLoading, setTotalPages, setTotalElements]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  /* ── 삭제 처리 ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.delete(`/notices/${deleteTarget.id}`);
      toast('공지사항이 삭제되었습니다.', 'success');
      setDeleteTarget(null);
      fetchNotices();
    } catch (err) {
      console.error('공지사항 삭제 실패:', err);
      toast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  /* ── 날짜 포맷 ── */
  const formatDate = (dt: string) => dt?.slice(0, 10) || '-';

  return (
    <div className={common.container}>
      {/* ── 페이지 헤더 ── */}
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>📢 공지사항 관리</h1>
          <p className={common.pageSubtitle}>공지사항을 작성, 수정, 삭제합니다</p>
        </div>
        <button
          className={common.btnPrimary}
          onClick={() => { setFormMode('create'); setEditTarget(null); }}
        >
          + 공지 작성
        </button>
      </div>

      {/* ── KPI 카드 ── */}
      <div className={common.card}>
        <div className={common.statGrid}>
          <div
            className={`${common.statCard} ${common.statTotal} ${common.statCardInteractive} ${filterType === 'all' ? common.statActive : ''}`}
            onClick={() => { setFilterType('all'); setCurrentPage(1); }}
          >
            <div className={common.statLabel}>전체</div>
            <div className={common.statValue}>{allCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statUpcoming} ${common.statCardInteractive} ${filterType === 'pinned' ? common.statActive : ''}`}
            onClick={() => { setFilterType('pinned'); setCurrentPage(1); }}
          >
            <div className={common.statLabel}>상단고정</div>
            <div className={`${common.statValue} ${common.textPurple}`}>{pinnedCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statOngoing} ${common.statCardInteractive} ${filterType === 'popup' ? common.statActive : ''}`}
            onClick={() => { setFilterType('popup'); setCurrentPage(1); }}
          >
            <div className={common.statLabel}>팝업</div>
            <div className={`${common.statValue} ${common.textGreen}`}>{popupCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statEnded} ${common.statCardInteractive} ${filterType === 'pushed' ? common.statActive : ''}`}
            onClick={() => { setFilterType('pushed'); setCurrentPage(1); }}
          >
            <div className={common.statLabel}>푸시알림</div>
            <div className={`${common.statValue}`}>{pushedCount}</div>
          </div>
        </div>
      </div>

      {/* ── 필터 바 ── */}
      <div className={common.filterBar}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            className={common.filterSelect}
            style={{ minWidth: 130 }}
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as any);
              setCurrentPage(1);
            }}
          >
            <option value="all">전체 상태</option>
            <option value="ACTIVE">활성</option>
            <option value="RESERVED">예약</option>
            <option value="ENDED">종료</option>
            <option value="INACTIVE">비활성</option>

          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            className={common.filterSelect}
            style={{ minWidth: 130 }}
            value={localSearchType}
            onChange={(e) => setLocalSearchType(e.target.value)}
          >
            <option value="ALL">전체 검색</option>
            <option value="TITLE">제목</option>
            <option value="CONTENT">내용</option>
          </select>
          <input
            type="text"
            className={common.searchInput}
            style={{ width: 280 }}
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button type="button" className={common.searchBtn} onClick={onSearchSubmit}>
            검색
          </button>
        </div>
      </div>

      {/* ── 테이블 ── */}
      <div className={common.tableCard}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className={common.spinner} /> 불러오는 중...
          </div>
        ) : (
          <table className={common.table} style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '130px' }} />
            </colgroup>
            <thead>
              <tr className={common.tableHeaderRow}>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>No</th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>제목</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>조회수</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>상태</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>고정</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>팝업</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>푸시알림</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>작성일</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>관리</th>
              </tr>
            </thead>
            <tbody>
              {notices.length === 0 ? (
                <tr>
                  <td colSpan={7} className={common.emptyRow}>
                    등록된 공지사항이 없습니다.
                  </td>
                </tr>
              ) : (
                notices.map((notice, idx) => (
                  <tr
                    key={notice.id}
                    className={`${common.tableRow} ${common.tableRowHover} ${notice.isPinned ? s.pinnedRow : ''}`}
                  >
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {totalElements - ((currentPage - 1) * 10 + idx)}
                    </td>
                    <td
                      className={`${common.tableCell} ${common.cellPrimary} ${s.ellipsisCell} ${s.clickableTitle}`}
                      onClick={() => setDetailTarget(notice)}
                    >
                      {notice.isPinned && <span className={s.pinIcon}>📌</span>}
                      {notice.title}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {notice.viewCount?.toLocaleString()}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {(() => {
                        if (notice.isActive === false) return <span className={`${common.statusBadge} ${common.badgeEnded}`}>비활성</span>;
                        const now = new Date();
                        if (notice.startDate && new Date(notice.startDate) > now) return <span className={`${common.statusBadge} ${common.badgeUpcoming}`}>예약</span>;
                        if (notice.endDate && new Date(notice.endDate) < now) return <span className={`${common.statusBadge} ${common.badgeEnded}`}>종료</span>;
                        if (notice.isPopup) return <span className={`${common.statusBadge} ${common.badgeOngoing}`}>팝업</span>;
                        return <span className={`${common.statusBadge} ${common.badgeOngoing}`} style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>활성</span>;
                      })()}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {notice.isPinned ? (
                        <span className={`${common.statusBadge} ${common.badgeUpcoming}`}>Y</span>
                      ) : (
                        <span className={`${common.statusBadge} ${common.badgeEnded}`}>N</span>
                      )}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {notice.isPopup ? (
                        <span className={`${common.statusBadge} ${common.badgeOngoing}`}>Y</span>
                      ) : (
                        <span className={`${common.statusBadge} ${common.badgeEnded}`}>N</span>
                      )}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {notice.isPushed ? (
                        <span className={`${common.statusBadge} ${common.badgeUpcoming}`}>Y</span>
                      ) : (
                        <span className={`${common.statusBadge} ${common.badgeEnded}`}>N</span>
                      )}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {formatDate(notice.createdAt)}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          className={common.btnPrimary}
                          style={{ padding: '4px 12px', fontSize: 11 }}
                          onClick={() => { setFormMode('edit'); setEditTarget(notice); }}
                        >
                          수정
                        </button>
                        <button
                          className={common.btnCancel}
                          style={{ padding: '4px 12px', fontSize: 11, color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => setDeleteTarget(notice)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ── 페이지네이션 ── */}
        {!loading && (
          <div className={common.pagination}>
            <button
              className={common.pageBtn}
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
            >
              ← 이전
            </button>
            <span className={common.pageInfo}>{currentPage} / {totalPages}</span>
            <button
              className={common.pageBtn}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
            >
              다음 →
            </button>
          </div>
        )}
      </div>

      {/* ── 작성/수정 모달 ── */}
      {formMode && (
        <NoticeFormModal
          mode={formMode}
          notice={editTarget}
          onClose={() => { setFormMode(null); setEditTarget(null); }}
          onSaved={() => {
            setFormMode(null);
            setEditTarget(null);
            fetchNotices();
          }}
        />
      )}

      {/* ── 삭제 확인 모달 ── */}
      {deleteTarget && (
        <ConfirmModal
          title="공지사항 삭제"
          message={`"${deleteTarget.title}" 공지사항을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`}
          confirmText="삭제"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── 상세보기 모달 ── */}
      {detailTarget && (
        <NoticeDetailModal
          notice={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => {
            setDetailTarget(null);
            setFormMode('edit');
            setEditTarget(detailTarget);
          }}
        />
      )}
    </div>
  );
}
