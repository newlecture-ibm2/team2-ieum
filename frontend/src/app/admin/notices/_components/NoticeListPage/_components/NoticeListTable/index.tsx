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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className={s.cardGrid}>
        {loading ? (
          <div className={s.loadingState}>
            <span className={common.spinner} /> 불러오는 중...
          </div>
        ) : notices.length === 0 ? (
          <div className={s.emptyState}>
            등록된 공지/팝업이 없습니다.
          </div>
        ) : (
          notices.map((notice, idx) => {
            const cat = CATEGORY_LABELS[notice.category] || CATEGORY_LABELS.GENERAL;
            const now = new Date();
            let statusText = '활성';
            let statusClass = common.badgeOngoing;
            let statusStyle: React.CSSProperties | undefined = { backgroundColor: '#e8f5e9', color: '#2e7d32' };

            if (notice.isActive === false) {
              statusText = '비활성';
              statusClass = common.badgeEnded;
              statusStyle = undefined;
            } else if (notice.startDate && new Date(notice.startDate) > now) {
              statusText = '예약';
              statusClass = common.badgeUpcoming;
              statusStyle = undefined;
            } else if (notice.endDate && new Date(notice.endDate) < now) {
              statusText = '종료';
              statusClass = common.badgeEnded;
              statusStyle = undefined;
            } else if (notice.isPopup) {
              statusText = '팝업';
              statusClass = common.badgeOngoing;
              statusStyle = undefined;
            }

            return (
              <div
                key={notice.id}
                className={`${s.noticeCard} ${notice.isPinned ? s.pinnedCard : ''}`}
              >
                {/* 상단: 상태 / 핀 / 카테고리 */}
                <div className={s.cardTop}>
                  <div className={s.badgeGroup}>
                    <span 
                      className={`${common.statusBadge} ${statusClass}`}
                      style={statusStyle}
                    >
                      {statusText}
                    </span>
                    {notice.isPinned && <span className={`${common.statusBadge} ${common.badgeUpcoming}`}>고정</span>}
                    {notice.isPopup && <span className={`${common.statusBadge} ${common.badgeOngoing}`}>팝업</span>}
                  </div>
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
                </div>

                {/* 제목 */}
                <div className={s.cardTitle} onClick={() => onDetailClick(notice)}>
                  {notice.isPinned && <span className={s.pinIcon}>📌</span>}
                  {notice.title}
                </div>

                {/* 정보 */}
                <div className={s.cardInfo}>
                  <div className={s.cardInfoRow}>
                    <span className={s.cardInfoIcon}>👁️</span>
                    <span className={s.cardInfoValue}>조회수 {notice.viewCount?.toLocaleString() || 0}</span>
                  </div>
                  <div className={s.cardInfoRow}>
                    <span className={s.cardInfoIcon}>📅</span>
                    <span className={s.cardInfoValue}>{formatDate(notice.createdAt)}</span>
                  </div>
                  {notice.isPushed && (
                    <div className={s.cardInfoRow}>
                      <span className={s.cardInfoIcon}>🔔</span>
                      <span className={s.cardInfoValue}>푸시알림 발송됨</span>
                    </div>
                  )}
                </div>

                {/* 하단 액션 */}
                <div className={s.cardActions}>
                  <button
                    className={s.actionBtn}
                    onClick={() => onEditClick(notice)}
                  >
                    수정
                  </button>
                  <button
                    className={`${s.actionBtn} ${s.deleteBtn}`}
                    onClick={() => onDeleteClick(notice)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

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
