'use client';

import { useEffect, useState, useCallback } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import { useAdminList } from '@/app/admin/festivals/useAdminList';
import adminApi from '@/lib/adminApi';
import type { InquiryItem, InquiryListResponse } from '@/types/admin-inquiry';
import InquiryDetailModal from '../InquiryDetailModal';
import s from './InquiryListPage.module.css';
import { INQUIRY_STATUS, INQUIRY_STATUS_LABELS } from '@/constants/statusLabels';
import Pagination from '@/_component/common/Pagination';



export default function InquiryListPage() {
  const list = useAdminList({ extraFilterKeys: ['searchType'] });
  const {
    currentPage, setCurrentPage, totalPages, setTotalPages,
    statusFilter, setStatusFilterAndReset,
    extraFilters, setExtraFilter,
    loading, setLoading,
    keyword, searchTerm, setSearchTerm, handleKeyDown, submitSearch
  } = list;

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [newTodayCount, setNewTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  /* ── 모달/토스트 상태 ── */
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
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
  const fetchInquiries = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        size: 10,
      };
      if (statusFilter) params.status = statusFilter;
      if (extraFilters.searchType && extraFilters.searchType !== 'ALL') params.searchType = extraFilters.searchType;
      if (keyword) params.keyword = keyword;

      const { data } = await adminApi.get<{ data: InquiryListResponse }>('/inquiries', { params });
      const result = data.data;

      setInquiries(result.content);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.pendingCount + result.answeredCount);
      setPendingCount(result.pendingCount);
      setAnsweredCount(result.answeredCount);
      setNewTodayCount(result.newTodayCount || 0);
    } catch (err) {
      console.error('문의 목록 조회 실패:', err);
      // do not blindly clear inquiries array on polling fail to prevent ui empty flash
      if (!isPolling) setInquiries([]);
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [currentPage, statusFilter, extraFilters.searchType, keyword, setLoading, setTotalPages]);

  useEffect(() => {
    fetchInquiries(false);

    // 30초마다 목록 실시간 갱신 (폴링)
    const intervalId = setInterval(() => fetchInquiries(true), 30000);
    return () => clearInterval(intervalId);
  }, [fetchInquiries]);

  /* ── KPI 카드 클릭 ── */
  const handleStatClick = (status: string) => {
    setStatusFilterAndReset(statusFilter === status ? '' : status);
  };

  return (
    <div className={common.container}>
      {/* ── 페이지 헤더 ── */}
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>💬 사용자 문의 관리</h1>
          <p className={common.pageSubtitle}>사용자가 등록한 1:1 문의를 확인하고 답변합니다</p>
        </div>
        {pendingCount > 0 && (
          <span style={{
            background: '#eff6ff', color: '#2563eb',
            padding: '6px 16px', borderRadius: 20,
            fontSize: 13, fontWeight: 700,
          }}>
            {pendingCount}건 미답변
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
            className={`${common.statCard} ${common.statCardInteractive} ${statusFilter === 'NEW_TODAY' ? common.statActive : ''}`}
            style={{ 
              backgroundColor: statusFilter === 'NEW_TODAY' ? '#dbeafe' : '#eff6ff', 
              border: '1px solid #bfdbfe' 
            }}
            onClick={() => handleStatClick('NEW_TODAY')}
          >
            <div className={common.statLabel} style={{ color: '#1e3a8a' }}>오늘 신규 접수</div>
            <div className={common.statValue} style={{ color: '#2563eb' }}>{newTodayCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statUpcoming} ${common.statCardInteractive} ${statusFilter === INQUIRY_STATUS.PENDING ? common.statActive : ''}`}
            onClick={() => handleStatClick(INQUIRY_STATUS.PENDING)}
          >
            <div className={common.statLabel}>대기중</div>
            <div className={`${common.statValue} ${common.textPurple}`}>{pendingCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statOngoing} ${common.statCardInteractive} ${statusFilter === INQUIRY_STATUS.ANSWERED ? common.statActive : ''}`}
            onClick={() => handleStatClick(INQUIRY_STATUS.ANSWERED)}
          >
            <div className={common.statLabel}>답변완료</div>
            <div className={`${common.statValue} ${common.textGreen}`}>{answeredCount}</div>
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
            <option value="NEW_TODAY">오늘 신규 접수</option>
            <option value={INQUIRY_STATUS.PENDING}>대기중</option>
            <option value={INQUIRY_STATUS.ANSWERED}>답변완료</option>
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
            <option value="AUTHOR">작성자</option>
            <option value="CONTENT">문의 내용</option>
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

      {/* ── 리스트 ── */}
      <section className={common.card}>
        <div className={common.desktopOnly}>
        <table className={common.table} style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '110px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '110px' }} />
            </colgroup>
            <thead>
              <tr className={common.tableHeaderRow}>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>No</th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>제목</th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>작성자</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>작성일</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>상태</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>관리</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className={common.emptyRow}>
                    문의 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry, idx) => (
                  <tr
                    key={inquiry.id}
                    className={`${common.tableRow} ${common.tableRowHover}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {(currentPage - 1) * 10 + idx + 1}
                    </td>
                    <td className={`${common.tableCell} ${common.textLeft} ${common.cellPrimary} ${s.ellipsisCell}`}>
                      {inquiry.title}
                    </td>
                    <td className={`${common.tableCell} ${common.textLeft}`}>
                      {inquiry.authorNickname}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {inquiry.createdAt?.slice(0, 10)}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <span className={`${common.statusBadge} ${common[INQUIRY_STATUS_LABELS[inquiry.status]?.className || 'badgePending'] || ''}`}>
                        {INQUIRY_STATUS_LABELS[inquiry.status]?.label || inquiry.status}
                      </span>
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <button
                        className={inquiry.status === INQUIRY_STATUS.PENDING ? common.btnPrimary : common.btnCancel}
                        style={{ padding: '4px 12px', fontSize: 11 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedInquiry(inquiry); }}
                      >
                        {inquiry.status === INQUIRY_STATUS.PENDING ? '답변' : '보기'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>

      <div className={`${common.listGrid} ${common.mobileOnly}`}>
          {loading ? (
            <div className={common.emptyRow} style={{ gridColumn: '1 / -1' }}>로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className={common.emptyRow} style={{ gridColumn: '1 / -1' }}>문의 내역이 없습니다.</div>
          ) : (
            inquiries.map((inquiry) => (
              <div 
                key={inquiry.id} 
                className={common.listCard}
                onClick={() => setSelectedInquiry(inquiry)}
                style={{ cursor: 'pointer' }}
              >
                <div className={common.listCardTop}>
                  <span className={`${common.statusBadge} ${common[INQUIRY_STATUS_LABELS[inquiry.status]?.className || 'badgePending'] || ''}`}>
                    {INQUIRY_STATUS_LABELS[inquiry.status]?.label || inquiry.status}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {inquiry.createdAt?.slice(0, 10)}
                  </span>
                </div>

                <div className={common.listCardTitle}>
                  {inquiry.title}
                </div>

                <div className={common.listCardInfo}>
                  <div className={common.listCardInfoRow}>
                    <span className={common.listCardIcon}>👤</span>
                    <span className={common.listCardValue}>작성자: {inquiry.authorNickname}</span>
                  </div>
                </div>

                <div className={common.listCardActions}>
                  <button
                    className={`${common.listCardActionBtn} ${inquiry.status === INQUIRY_STATUS.PENDING ? '' : 'danger'}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedInquiry(inquiry); }}
                  >
                    {inquiry.status === INQUIRY_STATUS.PENDING ? '답변' : '보기'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── 페이지네이션 ── */}
        {!loading && (
          <div style={{ marginTop: '20px' }}>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </section>

      {/* ── 상세 모달 ── */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
          onAnswered={() => {
            setSelectedInquiry(null);
            setToastMessage('답변이 등록되었습니다.');
            setTimeout(() => setToastMessage(''), 3000);
            fetchInquiries();
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
