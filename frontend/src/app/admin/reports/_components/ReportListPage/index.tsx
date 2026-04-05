'use client';

import { useEffect, useState, useCallback } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import styles from './ReportListPage.module.css';
import { useAdminList } from '@/app/admin/_hooks/useAdminList';
import adminApi from '@/lib/adminApi';
import type { ReportItem, ReportListResponse } from '@/types/admin-report';

/* ── 상태 배지 매핑 ── */
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING:  { label: '대기중',   className: 'badgePending' },
  RESOLVED: { label: '처리완료', className: 'badgeOngoing' },
  REJECTED: { label: '반려',     className: 'badgeDismissed' },
};

/* ── 대상 타입 ── */
const TARGET_TYPE_MAP: Record<string, string> = {
  REVIEW:  '리뷰',
  POST:    '게시글',
  COMMENT: '댓글',
};

/* ── 신고 사유 ── */
const REASON_MAP: Record<string, string> = {
  SPAM:          '스팸',
  ABUSE:         '욕설/비방',
  INAPPROPRIATE: '부적절한 콘텐츠',
  FALSE_INFO:    '허위 정보',
  OTHER:         '기타',
};

export default function ReportListPage() {
  const list = useAdminList({ extraFilterKeys: ['targetType'] });
  const {
    currentPage, setCurrentPage, totalPages, setTotalPages,
    statusFilter, setStatusFilterAndReset,
    extraFilters, setExtraFilter,
    loading, setLoading,
  } = list;

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  /* ── 상세 패널 ── */
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [processing, setProcessing] = useState(false);

  /* ── 데이터 로드 ── */
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        size: 10,
      };
      if (statusFilter) params.status = statusFilter;
      if (extraFilters.targetType) params.targetType = extraFilters.targetType;

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
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, extraFilters.targetType, setLoading, setTotalPages]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  /* ── 신고 처리 ── */
  const handleProcess = async (reportId: number, action: string) => {
    const confirmMsg = action === 'DELETE'
      ? '해당 콘텐츠를 삭제하고 신고를 처리하시겠습니까?'
      : '이 신고를 반려(기각) 하시겠습니까?';
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      await adminApi.patch(`/reports/${reportId}`, { action });
      setSelectedReport(null);
      await fetchReports();
    } catch (err) {
      console.error('신고 처리 실패:', err);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

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
          <p className={common.pageSubtitle}>신고된 콘텐츠를 검토하고 처리합니다</p>
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
            className={`${common.statCard} ${common.statUpcoming} ${common.statCardInteractive} ${statusFilter === 'PENDING' ? common.statActive : ''}`}
            onClick={() => handleStatClick('PENDING')}
          >
            <div className={common.statLabel}>대기중</div>
            <div className={`${common.statValue} ${common.textPurple}`}>{pendingCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statOngoing} ${common.statCardInteractive} ${statusFilter === 'RESOLVED' ? common.statActive : ''}`}
            onClick={() => handleStatClick('RESOLVED')}
          >
            <div className={common.statLabel}>처리완료</div>
            <div className={`${common.statValue} ${common.textGreen}`}>{resolvedCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statEnded} ${common.statCardInteractive} ${statusFilter === 'REJECTED' ? common.statActive : ''}`}
            onClick={() => handleStatClick('REJECTED')}
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
            value={statusFilter}
            onChange={(e) => setStatusFilterAndReset(e.target.value)}
          >
            <option value="">전체 상태</option>
            <option value="PENDING">대기중</option>
            <option value="RESOLVED">처리완료</option>
            <option value="REJECTED">반려</option>
          </select>

          <select
            className={common.filterSelect}
            value={extraFilters.targetType || ''}
            onChange={(e) => setExtraFilter('targetType', e.target.value)}
          >
            <option value="">전체 유형</option>
            <option value="REVIEW">리뷰</option>
            <option value="POST">게시글</option>
            <option value="COMMENT">댓글</option>
          </select>
        </div>
      </div>

      {/* ── 테이블 ── */}
      <div className={common.tableCard}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <span className={common.spinner} /> 불러오는 중...
          </div>
        ) : (
          <table className={common.table}>
            <thead>
              <tr className={common.tableHeaderRow}>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`} style={{ width: '5%' }}>No</th>
                <th className={`${common.tableHeaderCell}`} style={{ width: '13%' }}>신고자</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`} style={{ width: '10%' }}>유형</th>
                <th className={`${common.tableHeaderCell}`} style={{ width: '22%' }}>신고 사유</th>
                <th className={`${common.tableHeaderCell}`} style={{ width: '15%' }}>상세 내용</th>
                <th className={`${common.tableHeaderCell}`} style={{ width: '12%' }}>신고 날짜</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`} style={{ width: '10%' }}>상태</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`} style={{ width: '13%' }}>관리</th>
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
                    className={`${common.tableRow} ${common.tableRowHover} ${selectedReport?.id === report.id ? styles.selectedRow : ''}`}
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
                      {REASON_MAP[report.reason] || report.reason}
                    </td>
                    <td className={`${common.tableCell} ${common.cellEllipsis}`}>
                      {report.description || '-'}
                    </td>
                    <td className={common.tableCell}>
                      {report.createdAt?.slice(0, 10)}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <span className={`${common.statusBadge} ${common[STATUS_MAP[report.status]?.className || 'badgePending'] || ''}`}>
                        {STATUS_MAP[report.status]?.label || report.status}
                      </span>
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {report.status === 'PENDING' ? (
                        <div className={common.actionGroup} style={{ justifyContent: 'center' }}>
                          <button
                            className={common.btnPrimary}
                            style={{ padding: '4px 12px', fontSize: 11 }}
                            onClick={() => setSelectedReport(
                              selectedReport?.id === report.id ? null : report
                            )}
                          >
                            검토
                          </button>
                          <button
                            className={common.btnDanger}
                            style={{ padding: '4px 12px', fontSize: 11 }}
                            onClick={() => handleProcess(report.id, 'DELETE')}
                            disabled={processing}
                          >
                            제재
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#16a34a', fontSize: 18 }}>✅</span>
                      )}
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

      {/* ── 상세 검토 패널 ── */}
      {selectedReport && (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          marginTop: 16,
          border: '2px dashed #fca5a5',
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#dc2626', marginBottom: 16 }}>
            🔍 신고 상세 검토
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '10px 20px',
            fontSize: 13,
            lineHeight: 1.7,
          }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>신고 대상:</span>
            <span style={{ color: '#1e293b' }}>
              {TARGET_TYPE_MAP[selectedReport.targetType] || selectedReport.targetType} #{selectedReport.targetId}
            </span>

            <span style={{ color: '#64748b', fontWeight: 600 }}>신고자:</span>
            <span style={{ color: '#1e293b' }}>{selectedReport.reporterNickname}</span>

            <span style={{ color: '#64748b', fontWeight: 600 }}>신고 사유:</span>
            <span style={{ color: '#1e293b' }}>
              {REASON_MAP[selectedReport.reason] || selectedReport.reason}
            </span>

            <span style={{ color: '#64748b', fontWeight: 600 }}>상세 내용:</span>
            <span style={{ color: '#1e293b' }}>
              {selectedReport.description || '(상세 내용 없음)'}
            </span>

            <span style={{ color: '#64748b', fontWeight: 600 }}>신고 일시:</span>
            <span style={{ color: '#1e293b' }}>
              {selectedReport.createdAt?.replace('T', ' ').slice(0, 19)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #e2e8f0',
          }}>
            <button
              className={common.btnCancel}
              onClick={() => setSelectedReport(null)}
            >
              닫기
            </button>
            <button
              className={common.btnCancel}
              style={{ borderColor: '#0284c7', color: '#0284c7' }}
              onClick={() => handleProcess(selectedReport.id, 'DISMISS')}
              disabled={processing}
            >
              반려 (DISMISS)
            </button>
            <button
              className={common.btnDanger}
              onClick={() => handleProcess(selectedReport.id, 'DELETE')}
              disabled={processing}
            >
              {processing ? '처리 중...' : '삭제 처리 (DELETE)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
