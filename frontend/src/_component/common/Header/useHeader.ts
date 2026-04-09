import { useState, useEffect } from "react";
import { onMessage } from "firebase/messaging";
import api from "@/lib/api";
import { messaging } from "@/lib/firebase";

export function useHeader() {
  const [popupConfig, setPopupConfig] = useState<{ msg: string; reload: boolean } | null>(null);
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  /* ===== 인증 상태 ===== */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);

  /* ===== 알림 상태 ===== */
  const [hasUnread, setHasUnread] = useState(false);
  const [notiRefreshKey, setNotiRefreshKey] = useState(0);

  const closePopup = () => {
    const shouldReload = popupConfig?.reload;
    setPopupConfig(null);
    if (shouldReload) window.location.reload();
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(async (data) => {
        setIsLoggedIn(data.isLoggedIn);
        setUserNickname(data.user?.nickname ?? null);
        setUserRole(data.user?.role ?? null);

        if (data.isLoggedIn) {
          api
            .get("/api/users/me/notifications")
            .then((res) => {
              const unreadCount = res.data?.data?.unreadCount || 0;
              setHasUnread(unreadCount > 0);
            })
            .catch(() => {});

          try {
            // 🚀 [v17] 헤더 프로필 동기화: 사진뿐만 아니라 최신 닉네임도 우리 전용 API에서 가져옵니다.
            const profileRes = await api.get("/api/mypage/profile");
            if (profileRes.data) {
              if (profileRes.data.profileImageUrl) setUserProfileImage(profileRes.data.profileImageUrl);
              if (profileRes.data.nickname) setUserNickname(profileRes.data.nickname);
            }
          } catch (err) {
            console.error("헤더 프로필 조회 실패:", err);
          }

          try {
            if (typeof Notification !== "undefined" && Notification.permission === "default") {
              await Notification.requestPermission();
            }
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              const { requestFcmToken } = await import("@/lib/firebase");
              const fcmToken = await requestFcmToken();
              if (fcmToken) {
                await api.post("/api/users/me/fcm-token", { token: fcmToken });
                console.log("✅ FCM 토큰 백엔드 등록 완료");
              }
            }
          } catch (err) {
            console.warn("FCM 토큰 등록 실패 (무시):", err);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("🔔 포그라운드 알림 수신:", payload);
      setHasUnread(true);
      setNotiRefreshKey((prev) => prev + 1);

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(payload.notification?.title || "이음 알림", {
          body: payload.notification?.body || "새로운 알림이 있습니다.",
          icon: "/favicon.ico",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const devRefreshFestivals = async () => {
    try {
      const res = await api.patch('/api/festivals/refresh-status');
      const payload = res.data.data || res.data;
      setPopupConfig({ msg: `✅ ${payload.message} (${payload.updatedCount}건 변경)`, reload: true });
    } catch (err) {
      setPopupConfig({ msg: '❌ 상태 최신화 실패: ' + err, reload: false });
    }
  };

  return {
    isLoggedIn,
    userNickname,
    userRole,
    userProfileImage,
    hasUnread,
    setHasUnread,
    isNotiOpen,
    setIsNotiOpen,
    notiRefreshKey,
    popupConfig,
    closePopup,
    logout,
    devRefreshFestivals,
  };
}
