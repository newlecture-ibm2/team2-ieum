"use client";

import { useNotificationDropdown, type Notification } from "./useNotificationDropdown";
import styles from "./NotificationDropdown.module.css";

interface Props {
  onClose: () => void;
  refreshKey?: number;
  onUnreadChange?: (hasUnread: boolean) => void;
}

/* ===== 유틸 ===== */
function getIcon(type: string) {
  if (type.includes("FESTIVAL")) return { emoji: "🎪", cls: styles.iconFestival };
  if (type.includes("NOTICE"))   return { emoji: "📢", cls: styles.iconNotice };
  if (type.includes("REPORT"))   return { emoji: "🛡️", cls: styles.iconDefault };
  if (type.includes("COMMENT") || type.includes("COMMUNITY"))
    return { emoji: "💬", cls: styles.iconCommunity };
  return { emoji: "🔔", cls: styles.iconDefault };
}

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)  return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)  return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7)  return `${diffDay}일 전`;
  return date.toLocaleDateString("ko-KR");
}

function getTargetUrl(n: Notification) {
  if (n.targetType === "FESTIVAL" && n.targetId) return `/festivals/${n.targetId}`;
  if (n.targetType === "NOTICE" && n.targetId)   return `/notices/${n.targetId}`;
  if (n.targetType === "COMMUNITY" && n.targetId) return `/community/${n.targetId}`;
  if (n.targetType === "REPORT") return `/mypage?tab=reports`;
  return "#";
}

/* ===== 컴포넌트 ===== */
export default function NotificationDropdown({ onClose, refreshKey, onUnreadChange }: Props) {
  const { data, loading, error, handleReadAll, handleItemClick, handleDeleteClick } = useNotificationDropdown({
    refreshKey,
    onUnreadChange,
    onClose,
  });

  /* 개별 알림 삭제 클릭 */
  const onDeleteClick = (e: React.MouseEvent, notification: any) => {
    e.stopPropagation(); // 부모 항목 클릭 이벤트 방지
    handleDeleteClick(notification);
  };

  /* ===== 렌더링 ===== */
  return (
    <>
      {/* 배경 오버레이 — 클릭 시 닫기 */}
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.dropdown}>
        {/* 헤더 */}
        <div className={styles.header}>
          <h3 className={styles.title}>🔔 알림</h3>
          {data && data.unreadCount > 0 && (
            <button
              type="button"
              className={styles.readAllBtn}
              onClick={handleReadAll}
            >
              모두 읽음 처리
            </button>
          )}
        </div>

        {/* 리스트 */}
        <div className={styles.list}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : !data || data.notifications.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔕</div>
              <div className={styles.emptyText}>
                새로운 알림이 없습니다.
              </div>
            </div>
          ) : (
            data.notifications.map((n) => {
              const { emoji, cls } = getIcon(n.type);
              return (
                <div
                  key={n.id}
                  className={`${styles.item} ${!n.isRead ? styles.itemUnread : ""}`}
                  onClick={() => handleItemClick(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleItemClick(n);
                  }}
                >
                  <div className={`${styles.icon} ${cls}`}>{emoji}</div>
                  <div className={styles.content}>
                    <div className={styles.message}>{n.message}</div>
                    <div className={styles.time}>{timeAgo(n.createdAt)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!n.isRead && <div className={styles.unreadDot} />}
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(e) => onDeleteClick(e, n)}
                      title="알림 삭제"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 푸터 — 전체 알림 보기 */}
        {/* <div className={styles.footer}>
          <a href="/notifications" className={styles.footerLink}>
            전체 알림 보기 →
          </a>
        </div> */}
      </div>
    </>
  );
}
