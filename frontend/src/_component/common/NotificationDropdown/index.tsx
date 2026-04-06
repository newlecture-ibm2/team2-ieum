"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import styles from "./NotificationDropdown.module.css";

/* ===== 타입 정의 ===== */
interface Notification {
  id: number;
  type: string;        // "FESTIVAL_START" | "NOTICE" | "COMMENT" 등
  message: string;
  isRead: boolean;
  targetType: string | null;  // "FESTIVAL" | "NOTICE" | "COMMUNITY"
  targetId: number | null;
  createdAt: string;   // ISO datetime
}

interface NotificationsResponse {
  unreadCount: number;
  notifications: Notification[];
}

interface Props {
  onClose: () => void;
}

/* ===== 유틸 ===== */
function getIcon(type: string) {
  if (type.includes("FESTIVAL")) return { emoji: "🎪", cls: styles.iconFestival };
  if (type.includes("NOTICE"))   return { emoji: "📢", cls: styles.iconNotice };
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
  return "#";
}

/* ===== 컴포넌트 ===== */
export default function NotificationDropdown({ onClose }: Props) {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* 알림 목록 조회 */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/users/me/notifications");
      setData(res.data.data); // ApiResponse<data>
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("로그인이 필요합니다.");
      } else {
        setError("알림을 불러올 수 없습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* 모두 읽음 처리 */
  const handleReadAll = async () => {
    try {
      await api.patch("/api/users/me/notifications/read");
      // 로컬 상태 업데이트
      if (data) {
        setData({
          unreadCount: 0,
          notifications: data.notifications.map((n) => ({ ...n, isRead: true })),
        });
      }
    } catch {
      // 에러 무시 (이미 보여주고 있는 리스트 유지)
    }
  };

  /* 개별 알림 클릭 */
  const handleItemClick = async (notification: Notification) => {
    // 읽지 않은 알림이면 읽음 처리
    if (!notification.isRead) {
      try {
        await api.patch("/api/users/me/notifications/read", {
          notificationIds: [notification.id],
        });
        if (data) {
          setData({
            unreadCount: Math.max(0, data.unreadCount - 1),
            notifications: data.notifications.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n
            ),
          });
        }
      } catch {
        // 에러 무시
      }
    }

    // 해당 페이지로 이동
    const url = getTargetUrl(notification);
    if (url !== "#") {
      window.location.href = url;
    }
    onClose();
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
                  {!n.isRead && <div className={styles.unreadDot} />}
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
