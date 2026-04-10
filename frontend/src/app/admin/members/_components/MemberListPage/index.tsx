'use client';

import { useEffect, useState, useCallback } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import { useAdminList } from '@/app/admin/festivals/useAdminList';
import adminApi from '@/lib/adminApi';
import type { MemberItem, MemberListResponse } from '@/types/admin-member';
import MemberDetailModal from '../MemberDetailModal';
import s from './MemberListPage.module.css';

/* ── 상태 배지 매핑 ── */
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: '정상 회원', className: 'badgeOngoing' },
  SUSPENDED: { label: '정지 회원', className: 'badgePending' },
  DELETED:   { label: '탈퇴 대기', className: 'badgeEnded' },
};

/* ── 역할 매핑 ── */
const ROLE_MAP: Record<string, string> = {
  USER:  '일반회원',
  ADMIN: '관리자',
};

export default function MemberListPage() {
  const list = useAdminList({ extraFilterKeys: ['role', 'searchType'] });
  const {
    currentPage, setCurrentPage, totalPages, setTotalPages,
    statusFilter, setStatusFilterAndReset,
    extraFilters, setExtraFilter,
    loading, setLoading,
    keyword, searchTerm, setSearchTerm, handleKeyDown, submitSearch
  } = list;

  const [members, setMembers] = useState<MemberItem[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [suspendedCount, setSuspendedCount] = useState(0);
  const [deletedCount, setDeletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  /* ── 모달/토스트 상태 ── */
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
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
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        size: 10,
      };
      if (statusFilter) params.status = statusFilter;
      if (extraFilters.role) params.role = extraFilters.role;
      if (extraFilters.searchType && extraFilters.searchType !== 'ALL') params.searchType = extraFilters.searchType;
      if (keyword) params.keyword = keyword;

      const { data } = await adminApi.get<{ data: MemberListResponse }>('/members', { params });
      const result = data.data;

      setMembers(result.content);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.activeCount + result.suspendedCount + result.deletedCount);
      setActiveCount(result.activeCount);
      setSuspendedCount(result.suspendedCount);
      setDeletedCount(result.deletedCount);
    } catch (err) {
      console.error('회원 목록 조회 실패:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, extraFilters.role, extraFilters.searchType, keyword, setLoading, setTotalPages]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* ── KPI 카드 클릭 ── */
  const handleStatClick = (status: string) => {
    setStatusFilterAndReset(statusFilter === status ? '' : status);
  };

  /* ── 신고 횟수 스타일 ── */
  const getReportCountClass = (count: number) => {
    if (count >= 5) return s.reportCountHigh;
    if (count >= 2) return s.reportCountMedium;
    return s.reportCountNormal;
  };

  return (
    <div className={common.container}>
      {/* ── 페이지 헤더 ── */}
      <div className={common.pageHeader}>
        <div>
          <h1 className={common.pageTitle}>👥 회원 관리</h1>
          <p className={common.pageSubtitle}>등록된 회원 정보를 조회하고 상태를 관리합니다</p>
        </div>
        {suspendedCount > 0 && (
          <span style={{
            background: '#fef9c3', color: '#ca8a04',
            padding: '6px 16px', borderRadius: 20,
            fontSize: 13, fontWeight: 700,
          }}>
            {suspendedCount}명 정지중
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
            className={`${common.statCard} ${common.statOngoing} ${common.statCardInteractive} ${statusFilter === 'ACTIVE' ? common.statActive : ''}`}
            onClick={() => handleStatClick('ACTIVE')}
          >
            <div className={common.statLabel}>정상 회원</div>
            <div className={`${common.statValue} ${common.textGreen}`}>{activeCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statUpcoming} ${common.statCardInteractive} ${statusFilter === 'SUSPENDED' ? common.statActive : ''}`}
            onClick={() => handleStatClick('SUSPENDED')}
          >
            <div className={common.statLabel}>정지 회원</div>
            <div className={`${common.statValue} ${common.textPurple}`}>{suspendedCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statEnded} ${common.statCardInteractive} ${statusFilter === 'DELETED' ? common.statActive : ''}`}
            onClick={() => handleStatClick('DELETED')}
          >
            <div className={common.statLabel}>탈퇴 대기</div>
            <div className={`${common.statValue} ${common.textGray}`}>{deletedCount}</div>
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
            <option value="ACTIVE">정상 회원</option>
            <option value="SUSPENDED">정지 회원</option>
            <option value="DELETED">탈퇴 대기</option>
          </select>

          <select
            className={common.filterSelect}
            style={{ minWidth: 130 }}
            value={extraFilters.role || ''}
            onChange={(e) => setExtraFilter('role', e.target.value)}
          >
            <option value="">전체 역할</option>
            <option value="USER">일반회원</option>
            <option value="ADMIN">관리자</option>
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
            <option value="NAME">이름</option>
            <option value="NICKNAME">닉네임</option>
            <option value="LOGIN_ID">아이디</option>
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
              <col style={{ width: '150px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '110px' }} />
            </colgroup>
            <thead>
              <tr className={common.tableHeaderRow}>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>No</th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>닉네임</th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>아이디</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>역할</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>가입일</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>신고</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>상태</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>관리</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={8} className={common.emptyRow}>
                    회원 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((member, idx) => (
                  <tr
                    key={member.userId}
                    className={`${common.tableRow} ${common.tableRowHover} ${member.status === 'DELETED' ? common.hiddenRow : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedMember(member)}
                  >
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {(currentPage - 1) * 10 + idx + 1}
                    </td>
                    <td className={`${common.tableCell} ${common.cellPrimary}`}>
                      <div className={s.profileCell}>
                        {member.profileImage ? (
                          <img src={member.profileImage} alt="" className={s.profileImage} />
                        ) : (
                          <span className={s.profilePlaceholder}>👤</span>
                        )}
                        {member.nickname}
                      </div>
                    </td>
                    <td className={`${common.tableCell} ${s.ellipsisCell}`}>
                      {member.loginId}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <span className={`${common.statusBadge} ${member.role === 'ADMIN' ? common.badgeUpcoming : common.badgeDismissed}`}>
                        {ROLE_MAP[member.role] || member.role}
                      </span>
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {member.createdAt?.slice(0, 10)}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <span className={getReportCountClass(member.reportedCount)}>
                        {member.reportedCount}
                      </span>
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <span className={`${common.statusBadge} ${common[STATUS_MAP[member.status]?.className || 'badgeEnded'] || ''}`}>
                        {STATUS_MAP[member.status]?.label || member.status}
                      </span>
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <button
                        className={common.btnPrimary}
                        style={{ padding: '4px 12px', fontSize: 11 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                      >
                        상세보기
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
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onStatusChanged={() => {
            setSelectedMember(null);
            setToastMessage('상태가 변경되었습니다.');
            setTimeout(() => setToastMessage(''), 3000);
            fetchMembers();
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
