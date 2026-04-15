'use client';

import { useEffect, useState, useCallback } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import { useAdminList } from '@/app/admin/festivals/useAdminList';
import adminApi from '@/lib/adminApi';
import type { ReportItem, ReportListResponse } from '@/types/admin-report';
import ReportDetailModal from '../ReportDetailModal';
import s from './ReportListPage.module.css';
import { REPORT_REASON_LABELS } from '@/constants/reportOptions';
import { REPORT_STATUS, REPORT_STATUS_LABELS } from '@/constants/statusLabels';
import { TARGET_TYPE } from '@/constants/targetType';

/* ── 대상 타입 ── */
const TARGET_TYPE_MAP: Record<string, string> = {
  [TARGET_TYPE.REVIEW]:  '리뷰',
  [TARGET_TYPE.POST]:    '게시글',
  [TARGET_TYPE.COMMENT]: '댓글',
};

export default function ReportListPage() {
  const list = useAdminList({ extraFilterKeys: ['targetType', 'searchType'] });
  const {
    currentPage, setCurrentPage, totalPages, setTotalPages,
    statusFilter, setStatusFilterAndReset,
    extraFilters, setExtraFilter,
    loading, setLoading,
    keyword, searchTerm, setSearchTerm, handleKeyDown, submitSearch
  } = list;

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  /* ── 모달/토스트 상태 ── */
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [toastMessage, setToastMessage] = useState('');

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

  /* ── 데이터 로드 ── */
  const fetchReports = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        size: 10,
      };
      if (statusFilter) params.status = statusFilter;
      if (extraFilters.targetType) params.targetType = extraFilters.targetType;
      if (extraFilters.searchType && extraFilters.searchType !== 'ALL') params.searchType = extraFilters.searchType;
      if (keyword) params.keyword = keyword;

      const { data } = await adminApi.get<{ data: ReportListResponse }>('/reports', { params });
      const result = data.data;

      setReports(result.content);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.pendingCount + result.resolvedCount + result.rejectedCount);
      setPendingCount(result.pendingCount);
      setResolvedCount(result.resolvedCount);
      setRejectedCount(result.rejectedCount);
    } catch (err) {
      console.error('신고 목록 조회 실패:', err);
      if (!isPolling) setReports([]);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [currentPage, statusFilter, extraFilters.targetType, extraFilters.searchType, keyword, setLoading, setTotalPages]);

  useEffect(() => {
    fetchReports(false);

    // 30초마다 목록 실시간 갱신 (폴링)
    const intervalId = setInterval(() => fetchReports(true), 30000);
    return () => clearInterval(intervalId);
  }, [fetchReports]);

  /* ── KPI 카드 클릭 ── */
  const handleStatClick = (status: string) => {
    setStatusFilterAndReset(statusFilter === status ? '' : status);
  };

  return (
    <div className={common.container}>
      {/* ── 페이지 헤더 ── */}
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>🚨 사용자 신고 관리</h1>
          <p className={common.pageSubtitle}>신고된 콘텐츠를 확인하고 처리합니다</p>
        </div>
        {pendingCount > 0 && (
          <span style={{
            background: '#fef2f2', color: '#dc2626',
            padding: '6px 16px', borderRadius: 20,
            fontSize: 13, fontWeight: 700,
          }}>
            {pendingCount}건 대기중
          </span>
        )}
      </div>

      {/* ── KPI 카드 ── */}
      <div className={common.card}>
        <div className={common.statGrid}>
          <div
            className={`${common.statCard} ${common.statTotal} ${common.statCardInteractive} ${statusFilter === '' ? common.statActive : ''}`}
            onClick={() => handleStatClick('')}
          >
            <div className={common.statLabel}>전체</div>
            <div className={common.statValue}>{totalCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statUpcoming} ${common.statCardInteractive} ${statusFilter === REPORT_STATUS.PENDING ? common.statActive : ''}`}
            onClick={() => handleStatClick(REPORT_STATUS.PENDING)}
          >
            <div className={common.statLabel}>대기중</div>
            <div className={`${common.statValue} ${common.textPurple}`}>{pendingCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statOngoing} ${common.statCardInteractive} ${statusFilter === REPORT_STATUS.RESOLVED ? common.statActive : ''}`}
            onClick={() => handleStatClick(REPORT_STATUS.RESOLVED)}
          >
            <div className={common.statLabel}>처리완료</div>
            <div className={`${common.statValue} ${common.textGreen}`}>{resolvedCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statEnded} ${common.statCardInteractive} ${statusFilter === REPORT_STATUS.REJECTED ? common.statActive : ''}`}
            onClick={() => handleStatClick(REPORT_STATUS.REJECTED)}
          >
            <div className={common.statLabel}>반려</div>
            <div className={`${common.statValue} ${common.textGray}`}>{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* ── 필터 바 ── */}
      <div className={common.filterBar}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            className={common.filterSelect}
            style={{ minWidth: 130 }}
            value={statusFilter}
            onChange={(e) => setStatusFilterAndReset(e.target.value)}
          >
            <option value="">전체 상태</option>
            <option value={REPORT_STATUS.PENDING}>대기중</option>
            <option value={REPORT_STATUS.RESOLVED}>처리완료</option>
            <option value={REPORT_STATUS.REJECTED}>반려</option>
          </select>

          <select
            className={common.filterSelect}
            style={{ minWidth: 130 }}
            value={extraFilters.targetType || ''}
            onChange={(e) => setExtraFilter('targetType', e.target.value)}
          >
            <option value="">전체 유형</option>
            <option value={TARGET_TYPE.REVIEW}>리뷰</option>
            <option value={TARGET_TYPE.POST}>게시글</option>
            <option value={TARGET_TYPE.COMMENT}>댓글</option>
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
            <option value="REPORTER">신고자</option>
            <option value="DESCRIPTION">신고 내용</option>
            <option value="REASON">신고 사유</option>
          </select>
          <input
            type="text"
            className={common.searchInput}
            style={{ width: 240 }}
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
              <col style={{ width: '130px' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '110px' }} />
            </colgroup>
            <thead>
              <tr className={common.tableHeaderRow}>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>No</th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>신고자</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>유형</th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>신고 사유</th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>상세 내용</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>신고 날짜</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>상태</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>관리</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className={common.emptyRow}>
                    신고 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                reports.map((report, idx) => (
                  <tr
                    key={report.id}
                    className={`${common.tableRow} ${common.tableRowHover}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {(currentPage - 1) * 10 + idx + 1}
                    </td>
                    <td className={`${common.tableCell} ${common.cellPrimary}`}>
                      {report.reporterNickname}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <span className={`${common.statusBadge} ${common.badgeUpcoming}`}>
                        {TARGET_TYPE_MAP[report.targetType] || report.targetType}
                      </span>
                    </td>
                    <td className={common.tableCell}>
                      {REPORT_REASON_LABELS[report.reason] || report.reason}
                    </td>
                    <td className={`${common.tableCell} ${s.ellipsisCell}`}>
                      {report.description || '-'}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {report.createdAt?.slice(0, 10)}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <span className={`${common.statusBadge} ${common[REPORT_STATUS_LABELS[report.status]?.className || 'badgePending'] || ''}`}>
                        {REPORT_STATUS_LABELS[report.status]?.label || report.status}
                      </span>
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <button
                        className={report.status === REPORT_STATUS.PENDING ? common.btnPrimary : common.btnCancel}
                        style={{ padding: '4px 12px', fontSize: 11 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                      >
                        {report.status === REPORT_STATUS.PENDING ? '처리하기' : '이력 보기'}
                      </button>
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

      {/* ── 상세 모달 ── */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onProcessed={() => {
            setSelectedReport(null);
            setToastMessage('처리가 완료되었습니다.');
            setTimeout(() => setToastMessage(''), 3000);
            fetchReports();
          }}
        />
      )}

      {/* ── Toast 메시지 ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          background: '#334155', color: '#fff', padding: '12px 24px',
          borderRadius: 8, fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999,
          animation: 'fadeInOut 3s forwards'
        }}>
          ✅ {toastMessage}
        </div>
      )}
    </div>
  );
}
