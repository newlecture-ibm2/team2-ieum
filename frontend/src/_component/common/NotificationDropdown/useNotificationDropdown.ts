import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface Notification {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  targetType: string | null;
  targetId: number | null;
  createdAt: string;
}

export interface NotificationsResponse {
  unreadCount: number;
  notifications: Notification[];
}

interface UseNotificationDropdownProps {
  refreshKey?: number;
  onUnreadChange?: (hasUnread: boolean) => void;
  onClose: () => void;
}

export function useNotificationDropdown({ refreshKey, onUnreadChange, onClose }: UseNotificationDropdownProps) {
  const [data, setData] = useState<NotificationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/api/users/me/notifications");
      setData(res.data.data);
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
  }, [fetchNotifications, refreshKey]);

  const handleReadAll = async () => {
    try {
      await api.patch("/api/users/me/notifications/read");
      if (data) {
        setData({
          unreadCount: 0,
          notifications: data.notifications.map((n) => ({ ...n, isRead: true })),
        });
      }
      onUnreadChange?.(false);
    } catch {
      // 에러 무시
    }
  };

  const getTargetUrl = (n: Notification) => {
    if (n.targetType === "FESTIVAL" && n.targetId) return `/festivals/${n.targetId}`;
    if (n.targetType === "NOTICE" && n.targetId)   return `/notices/${n.targetId}`;
    if (n.targetType === "COMMUNITY" && n.targetId) return `/community/${n.targetId}`;
    if (n.targetType === "REPORT") return `/mypage?tab=reports`;
    return "#";
  };

  const handleItemClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await api.patch("/api/users/me/notifications/read", {
          notificationIds: [notification.id],
        });
        const newUnread = Math.max(0, (data?.unreadCount ?? 1) - 1);
        if (data) {
          setData({
            unreadCount: newUnread,
            notifications: data.notifications.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n
            ),
          });
        }
        onUnreadChange?.(newUnread > 0);
      } catch {
        // 에러 무시
      }
    }

    const url = getTargetUrl(notification);
    if (url !== "#") {
      window.location.href = url;
    }
    onClose();
  };

  const handleDeleteClick = async (notification: Notification) => {
    try {
      await api.delete(`/api/users/me/notifications/${notification.id}`);
      if (data) {
        const newUnread = notification.isRead ? data.unreadCount : Math.max(0, data.unreadCount - 1);
        setData({
          unreadCount: newUnread,
          notifications: data.notifications.filter((n) => n.id !== notification.id),
        });
        onUnreadChange?.(newUnread > 0);
      }
    } catch {
      // 에러 무시
    }
  };

  return {
    data,
    loading,
    error,
    handleReadAll,
    handleItemClick,
    handleDeleteClick,
  };
}
