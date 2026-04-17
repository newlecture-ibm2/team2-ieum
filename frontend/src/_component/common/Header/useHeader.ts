import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { onMessage } from "firebase/messaging";
import api from "@/lib/api";
import { messaging } from "@/lib/firebase";

export function useHeader() {
  const pathname = usePathname();
  const [popupConfig, setPopupConfig] = useState<{ msg: string; reload: boolean } | null>(null);
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  /* ===== 어두운 히어로 판별 + body data attribute 동기화 ===== */
  const isDarkHeroPage =
    // 전국축제 메인 및 상세 (/festivals/map 지도 페이지 제외)
    pathname === "/" ||
    (pathname.startsWith("/festivals") && !pathname.startsWith("/festivals/map") && !pathname.includes("/reviews")) ||
    // 지난축제
    pathname === "/pastFestivals" ||
    // 커뮤니티 메인 및 글쓰기 (상세 페이지 /community/[id] 제외)
    pathname === "/community" ||
    pathname === "/community/write";

  useEffect(() => {
    if (isDarkHeroPage) {
      document.body.setAttribute("data-hero-theme", "dark");
    } else {
      document.body.removeAttribute("data-hero-theme");
    }
    return () => document.body.removeAttribute("data-hero-theme");
  }, [isDarkHeroPage]);

  /* ===== 인증 상태 ===== */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);

  /* ===== 알림 상태 ===== */
  const [hasUnread, setHasUnread] = useState(false);
  const [notiRefreshKey, setNotiRefreshKey] = useState(0);

  /**
   * 🚀 [v18-Sync] 최신 프로필 정보만 따로 재조회하는 함수
   */
  const refetchProfile = async () => {
    try {
      const profileRes = await api.get("/api/mypage/profile");
      const profileData = profileRes.data.data;
      if (profileData) {
        if (profileData.profileImageUrl) {
          // 헤더 이미지도 즉시 바뀌도록 타임스탬프 추가
          setUserProfileImage(`${profileData.profileImageUrl}?t=${Date.now()}`);
        }
        if (profileData.nickname) setUserNickname(profileData.nickname);
      }
    } catch (err) {
      console.error("헤더 프로필 상세 조회 실패:", err);
    }
  };

  const closePopup = () => {
    const shouldReload = popupConfig?.reload;
    setPopupConfig(null);
    if (shouldReload) window.location.reload();
  };

  useEffect(() => {
    // 🚀 [v18] 세션 조회 표준화: 로우 레벨 fetch 대신 api 라이브러리 활용
    api.get("/api/auth/me")
      .then(async (response) => {
        // 🚀 [v18-Final] 유연한 데이터 추출:ApiResponse(data.data) 또는 직렬 데이터(data) 모두 대응
        const responseData = response.data;
        const sessionData = responseData.data || responseData;

        if (!sessionData || typeof sessionData.isLoggedIn === 'undefined') return;

        setIsLoggedIn(sessionData.isLoggedIn);
        
        if (sessionData.isLoggedIn && sessionData.user) {
          setUserNickname(sessionData.user.nickname ?? null);
          setUserRole(sessionData.user.role ?? null);
          if (sessionData.user.profileImage) setUserProfileImage(sessionData.user.profileImage);

          // 알림 조회 (표준 규격 대응)
          api.get("/api/users/me/notifications")
            .then((res) => {
              const unreadCount = res.data?.data?.unreadCount || 0;
              setHasUnread(unreadCount > 0);
            })
            .catch(() => {});

          try {
            // 🚀 [v17] 헤더 프로필 자가 동기화 (최신 정보 보장)
            const profileRes = await api.get("/api/mypage/profile");
            const profileData = profileRes.data.data;
            if (profileData) {
              if (profileData.profileImageUrl) setUserProfileImage(profileData.profileImageUrl);
              if (profileData.nickname) setUserNickname(profileData.nickname);
            }
          } catch (err) {
            console.error("헤더 프로필 상세 조회 실패:", err);
          }

          // FCM 토큰 등록 로직
          try {
            if (typeof Notification !== "undefined" && Notification.permission === "default") {
              await Notification.requestPermission();
            }
            if (typeof Notification !== "undefined" && Notification.permission === "granted") {
              const { requestFcmToken } = await import("@/lib/firebase");
              const fcmToken = await requestFcmToken();
              if (fcmToken) {
                await api.post("/api/users/me/fcm-token", { token: fcmToken });
              }
            }
          } catch (err) {}
        }
      })
      .catch((err) => {
        console.error("세션 확인 실패:", err);
        setIsLoggedIn(false);
      });
  }, []);

  /**
   * 🚀 [v18-Sync] 전역 프로필 업데이트 이벤트 리스너
   */
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log("Header received userProfileUpdate event");
      refetchProfile();
    };

    window.addEventListener('userProfileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdate', handleProfileUpdate);
  }, []);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      setHasUnread(true);
      setNotiRefreshKey((prev) => prev + 1);

      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification(payload.data?.title || "이음 알림", {
          body: payload.data?.body || "새로운 알림이 있습니다.",
          icon: payload.data?.icon || "/favicon/favicon-ieum-transparent.png",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
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
    isDarkHeroPage,
  };
}
