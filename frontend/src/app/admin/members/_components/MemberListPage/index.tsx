'use client';

import { useEffect, useState, useCallback } from 'react';
import common from '@/app/admin/_styles/admin-common.module.css';
import { useAdminList } from '@/app/admin/festivals/useAdminList';
import adminApi from '@/lib/adminApi';
import type { MemberItem, MemberListResponse } from '@/types/admin-member';
import MemberDetailModal from '../MemberDetailModal';
import s from './MemberListPage.module.css';
import { USER_STATUS, USER_ROLE } from '@/constants/userStatus';
import Pagination from '@/_component/common/Pagination';

/* ── 상태 배지 매핑 ── */
const STATUS_MAP: Record<string, { label: string; className: string }> = {
  [USER_STATUS.ACTIVE]:    { label: '정상 회원', className: 'badgeOngoing' },
  [USER_STATUS.SUSPENDED]: { label: '정지 회원', className: 'badgePending' },
  [USER_STATUS.WITHDRAWAL]: { label: '탈퇴 유예', className: 'badgeEnded' },
  [USER_STATUS.DELETED]:   { label: '탈퇴 대기', className: 'badgeEnded' },
};

/* ── 역할 매핑 ── */
const ROLE_MAP: Record<string, string> = {
  [USER_ROLE.USER]:  '일반회원',
  [USER_ROLE.ADMIN]: '관리자',
};

/* ── 가입 방식(provider) 표시 매핑 ── */
const PROVIDER_MAP: Record<string, { label: string; color: string; bg: string }> = {
  KAKAO:  { label: '카카오', color: '#3B1C0C', bg: '#FEE500' },
  NAVER:  { label: '네이버', color: '#fff',    bg: '#03C75A' },
  GOOGLE: { label: '구글',   color: '#fff',    bg: '#4285F4' },
};

/** provider별 리스트 아이디 컬럼 표시 */
const getLoginDisplay = (member: MemberItem) => {
  const provider = member.provider || 'LOCAL';
  if (provider === 'LOCAL') return member.loginId;
  const info = PROVIDER_MAP[provider];
  if (!info) return member.loginId;
  return info.label;
};

export default function MemberListPage() {
  const list = useAdminList({ extraFilterKeys: ['role', 'provider'] });
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
  const [withdrawalCount, setWithdrawalCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  /* ── 모달/토스트 상태 ── */
  const [selectedMember, setSelectedMember] = useState<MemberItem | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  /* ── 정렬 상태 ── */
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const getSortIndicator = (field: string) => {
    if (sortBy !== field) return ' ↕';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const onSearchSubmit = () => {
    submitSearch();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  const handleReset = () => {
    setSortBy('createdAt');
    setSortDirection('desc');
    setStatusFilterAndReset('');
    setSearchTerm('');
    setExtraFilter('provider', '');
    setExtraFilter('role', '');
    
    // 이 시점에 searchTerm은 아직 상태에 반영이 안될 수 있지만 빈 문자열로 하드 리셋
    // submitSearch는 searchTerm을 바라보므로 잠시 끕니다. 
    // fetchMembers는 useEffect 배열에 포함되어 있으니 상태가 변하면 알아서 로드됩니다.
    // 임시 방편으로 페이지 파라미터를 날리기 위해 location.href 사용 가능하나 SPA 유지 위해 개별 set
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
      if (extraFilters.provider) params.provider = extraFilters.provider;
      if (keyword) params.keyword = keyword;
      if (sortBy) params.sortBy = sortBy;
      if (sortDirection) params.sortDirection = sortDirection;

      const { data } = await adminApi.get<{ data: MemberListResponse }>('/members', { params });
      const result = data.data;

      setMembers(result.content);
      setTotalPages(result.totalPages || 1);
      setTotalCount(result.activeCount + result.suspendedCount + result.withdrawalCount);
      setActiveCount(result.activeCount);
      setSuspendedCount(result.suspendedCount);
      setWithdrawalCount(result.withdrawalCount);
    } catch (err) {
      console.error('회원 목록 조회 실패:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, extraFilters.role, extraFilters.provider, keyword, sortBy, sortDirection, setLoading, setTotalPages]);

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
            className={`${common.statCard} ${common.statOngoing} ${common.statCardInteractive} ${statusFilter === USER_STATUS.ACTIVE ? common.statActive : ''}`}
            onClick={() => handleStatClick(USER_STATUS.ACTIVE)}
          >
            <div className={common.statLabel}>정상 회원</div>
            <div className={`${common.statValue} ${common.textGreen}`}>{activeCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statUpcoming} ${common.statCardInteractive} ${statusFilter === USER_STATUS.SUSPENDED ? common.statActive : ''}`}
            onClick={() => handleStatClick(USER_STATUS.SUSPENDED)}
          >
            <div className={common.statLabel}>정지 회원</div>
            <div className={`${common.statValue} ${common.textPurple}`}>{suspendedCount}</div>
          </div>
          <div
            className={`${common.statCard} ${common.statEnded} ${common.statCardInteractive} ${statusFilter === USER_STATUS.WITHDRAWAL ? common.statActive : ''}`}
            onClick={() => handleStatClick(USER_STATUS.WITHDRAWAL)}
          >
            <div className={common.statLabel}>탈퇴 유예</div>
            <div className={`${common.statValue} ${common.textGray}`}>{withdrawalCount}</div>
          </div>
        </div>
      </div>

      {/* ── 필터 바 ── */}
      <div className={common.filterBar}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            className={common.filterSelect}
            style={{ minWidth: 130 }}
            value={extraFilters.provider || ''}
            onChange={(e) => setExtraFilter('provider', e.target.value)}
          >
            <option value="">전체 가입 방식</option>
            <option value="LOCAL">일반 가입</option>
            <option value="KAKAO">카카오</option>
            <option value="NAVER">네이버</option>
            <option value="GOOGLE">구글</option>
          </select>

          <select
            className={common.filterSelect}
            style={{ minWidth: 130 }}
            value={extraFilters.role || ''}
            onChange={(e) => setExtraFilter('role', e.target.value)}
          >
            <option value="">전체 역할</option>
            <option value={USER_ROLE.USER}>일반회원</option>
            <option value={USER_ROLE.ADMIN}>관리자</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className={common.searchInput}
            style={{ width: 240 }}
            placeholder="이름/닉네임/아이디"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button type="button" className={common.searchBtn} onClick={onSearchSubmit}>
            검색
          </button>
          <button 
            type="button"
            style={{ 
              width: 36, height: 36, padding: 0, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '50%',
              cursor: 'pointer', fontSize: 18, color: '#4b5563'
            }}
            onClick={() => {
              handleReset();
              setTimeout(() => submitSearch(), 0);
            }}
            title="조건 초기화"
          >
            ↻
          </button>
        </div>
      </div>

      {/* ── 리스트 ── */}
      <section className={common.card}>
        <div className={common.mobileOnly}>
          <div style={{ display: 'flex', gap: '8px', padding: '0 4px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <button 
              type="button"
              style={{
                padding: '6px 12px', borderRadius: '16px', border: '1px solid #e2e8f0',
                background: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
              }}
              onClick={() => handleSort('nickname')}
            >
              닉네임 <span style={{ fontSize: '11px', color: '#94a3b8' }}>{getSortIndicator('nickname')}</span>
            </button>
            <button 
              type="button"
              style={{
                padding: '6px 12px', borderRadius: '16px', border: '1px solid #e2e8f0',
                background: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
              }}
              onClick={() => handleSort('createdAt')}
            >
              가입일 <span style={{ fontSize: '11px', color: '#94a3b8' }}>{getSortIndicator('createdAt')}</span>
            </button>
            <button 
              type="button"
              style={{
                padding: '6px 12px', borderRadius: '16px', border: '1px solid #e2e8f0',
                background: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer'
              }}
              onClick={() => handleSort('reportedCount')}
            >
              신고수 <span style={{ fontSize: '11px', color: '#94a3b8' }}>{getSortIndicator('reportedCount')}</span>
            </button>
          </div>
        </div>
        <div className={common.desktopOnly}>
        <table className={common.table} style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: 'auto' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '80px' }} />
              <col style={{ width: '100px' }} />
            </colgroup>
            <thead>
              <tr className={common.tableHeaderRow}>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>No</th>
                <th
                  className={`${common.tableHeaderCell} ${common.textLeft}`}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('nickname')}
                  title="닉네임 기준 정렬"
                >
                  닉네임{getSortIndicator('nickname')}
                </th>
                <th className={`${common.tableHeaderCell} ${common.textLeft}`}>아이디</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>역할</th>
                <th
                  className={`${common.tableHeaderCell} ${common.textCenter}`}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('createdAt')}
                  title="가입일 기준 정렬"
                >
                  가입일{getSortIndicator('createdAt')}
                </th>
                <th
                  className={`${common.tableHeaderCell} ${common.textCenter}`}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('reportedCount')}
                  title="신고수 기준 정렬"
                >
                  신고{getSortIndicator('reportedCount')}
                </th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>상태</th>
                <th className={`${common.tableHeaderCell} ${common.textCenter}`}>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading && members.length === 0 ? (
                <tr>
                  <td colSpan={8} className={common.emptyRow}>
                    로딩 중...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={8} className={common.emptyRow}>
                    회원 정보가 없습니다.
                  </td>
                </tr>
              ) : (
                members.map((member, idx) => (
                  <tr
                    key={member.userId}
                    className={`${common.tableRow} ${common.tableRowHover} ${member.status === USER_STATUS.DELETED ? common.hiddenRow : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedMember(member)}
                  >
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      {(currentPage - 1) * 10 + idx + 1}
                    </td>
                    <td className={`${common.tableCell} ${common.textLeft} ${common.cellPrimary} ${s.ellipsisCell}`}>
                      <div className={s.profileCell}>
                        {member.profileImage ? (
                          <img src={member.profileImage} alt="" className={s.profileImage} />
                        ) : (
                          <span className={s.profilePlaceholder}>👤</span>
                        )}
                        <span 
                          style={{ 
                            fontWeight: 500, 
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }} 
                          title={member.nickname}
                        >
                          {member.nickname}
                        </span>
                      </div>
                    </td>
                    <td className={`${common.tableCell} ${common.textLeft} ${s.ellipsisCell}`}>
                      {(member.provider && member.provider !== 'LOCAL') ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600,
                          background: PROVIDER_MAP[member.provider]?.bg || '#e2e8f0',
                          color: PROVIDER_MAP[member.provider]?.color || '#334155',
                          padding: '2px 10px', borderRadius: 12,
                        }}>
                          {PROVIDER_MAP[member.provider]?.label || member.provider}
                        </span>
                      ) : (
                        member.loginId
                      )}
                    </td>
                    <td className={`${common.tableCell} ${common.textCenter}`}>
                      <span className={`${common.statusBadge} ${member.role === USER_ROLE.ADMIN ? common.badgeUpcoming : common.badgeDismissed}`}>
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
      </div>

      <div className={`${common.listGrid} ${common.mobileOnly}`}>
          {loading && members.length === 0 ? (
            <div className={common.emptyRow} style={{ gridColumn: '1 / -1' }}>로딩 중...</div>
          ) : members.length === 0 ? (
            <div className={common.emptyRow} style={{ gridColumn: '1 / -1' }}>회원 정보가 없습니다.</div>
          ) : (
            members.map((member) => (
              <div 
                key={member.userId} 
                className={`${common.listCard} ${member.status === USER_STATUS.DELETED ? common.hiddenRow : ''}`}
                onClick={() => setSelectedMember(member)}
                style={{ cursor: 'pointer' }}
              >
                <div className={common.listCardTop}>
                  <div className={s.profileCell} style={{ gap: '8px' }}>
                    {member.profileImage ? (
                      <img src={member.profileImage} alt="" className={s.profileImage} />
                    ) : (
                      <span className={s.profilePlaceholder}>👤</span>
                    )}
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {member.nickname}
                    </span>
                  </div>
                  <span className={`${common.statusBadge} ${common[STATUS_MAP[member.status]?.className || 'badgeEnded'] || ''}`}>
                    {STATUS_MAP[member.status]?.label || member.status}
                  </span>
                </div>

                <div className={common.listCardInfo}>
                  <div className={common.listCardInfoRow}>
                    <span className={common.listCardIcon}>🆔</span>
                    <span className={common.listCardValue}>
                      {(member.provider && member.provider !== 'LOCAL') ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600,
                          background: PROVIDER_MAP[member.provider]?.bg || '#e2e8f0',
                          color: PROVIDER_MAP[member.provider]?.color || '#334155',
                          padding: '2px 10px', borderRadius: 12,
                        }}>
                          {PROVIDER_MAP[member.provider]?.label || member.provider}
                        </span>
                      ) : (
                        member.loginId
                      )}
                    </span>
                  </div>
                  <div className={common.listCardInfoRow}>
                    <span className={common.listCardIcon}>🔑</span>
                    <span className={common.listCardValue}>
                      <span className={`${common.statusBadge} ${member.role === USER_ROLE.ADMIN ? common.badgeUpcoming : common.badgeDismissed}`}>
                        {ROLE_MAP[member.role] || member.role}
                      </span>
                    </span>
                  </div>
                  <div className={common.listCardInfoRow}>
                    <span className={common.listCardIcon}>📅</span>
                    <span className={common.listCardValue}>{member.createdAt?.slice(0, 10)}</span>
                  </div>
                  <div className={common.listCardInfoRow}>
                    <span className={common.listCardIcon}>🚨</span>
                    <span className={common.listCardValue}>
                      신고 횟수 <span className={getReportCountClass(member.reportedCount)}>{member.reportedCount}</span>회
                    </span>
                  </div>
                </div>

                <div className={common.listCardActions}>
                  <button
                    className={common.listCardActionBtn}
                    onClick={(e) => { e.stopPropagation(); setSelectedMember(member); }}
                  >
                    상세보기
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
