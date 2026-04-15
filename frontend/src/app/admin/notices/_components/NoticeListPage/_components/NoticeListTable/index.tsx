import common from '@/app/admin/_styles/admin-common.module.css';
import type { AdminNoticeItem } from '@/types/admin-notice';
import s from './NoticeListTable.module.css';

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  GENERAL: { label: '일반', color: '#4b5563', bg: '#f3f4f6' },
  EVENT: { label: '행사', color: '#7c3aed', bg: '#ede9fe' },
  UPDATE: { label: '업데이트', color: '#2563eb', bg: '#dbeafe' },
  URGENT: { label: '긴급', color: '#dc2626', bg: '#fee2e2' },
};

interface Props {
  loading: boolean;
  notices: AdminNoticeItem[];
  totalElements: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number | ((p: number) => number)) => void;
  onDetailClick: (notice: AdminNoticeItem) => void;
  onEditClick: (notice: AdminNoticeItem) => void;
  onDeleteClick: (notice: AdminNoticeItem) => void;
}

export default function NoticeListTable({
  loading, notices, totalElements, currentPage, totalPages, setCurrentPage,
  onDetailClick, onEditClick, onDeleteClick
}: Props) {
  const formatDate = (dt: string) => dt?.slice(0, 10) || '-';

  return (
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
              <th className={`${common.tableHeaderCell} ${common.textCenter}`}>카테고리</th>
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
                <td colSpan={10} className={common.emptyRow}>
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
                    onClick={() => onDetailClick(notice)}
                  >
                    {notice.isPinned && <span className={s.pinIcon}>📌</span>}
                    {notice.title}
                  </td>
                  <td className={`${common.tableCell} ${common.textCenter}`}>
                    {(() => {
                      const cat = CATEGORY_LABELS[notice.category] || CATEGORY_LABELS.GENERAL;
                      return (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: cat.color,
                          background: cat.bg,
                          whiteSpace: 'nowrap',
                        }}>
                          {cat.label}
                        </span>
                      );
                    })()}
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
                        onClick={() => onEditClick(notice)}
                      >
                        수정
                      </button>
                      <button
                        className={common.btnCancel}
                        style={{ padding: '4px 12px', fontSize: 11, color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => onDeleteClick(notice)}
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
  );
}
