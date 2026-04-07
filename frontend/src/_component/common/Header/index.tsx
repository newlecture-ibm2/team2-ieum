"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bell, User, Shield } from "lucide-react";
import api from "@/lib/api";
import NotificationDropdown from "../NotificationDropdown";
import styles from "./Header.module.css";

interface NavItem {
  label: string;
  href: string;
  /** pathname이 이 prefix로 시작하면 active */
  match: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "전국축제", href: "/", match: "/festivals" },
  { label: "지난축제", href: "/pastFestivals", match: "/pastFestivals" },
  { label: "달력", href: "/calendar", match: "/calendar" },
  { label: "커뮤니티", href: "/community", match: "/community" },
  { label: "공지", href: "/notices", match: "/notices" },
];

export default function Header() {
  const pathname = usePathname();
  const [popupConfig, setPopupConfig] = useState<{ msg: string; reload: boolean } | null>(null);

  const closePopup = () => {
    const shouldReload = popupConfig?.reload;
    setPopupConfig(null);
    if (shouldReload) {
      window.location.reload();
    }
  };
  const [isNotiOpen, setIsNotiOpen] = useState(false);

  /* ===== 인증 상태 (iron-session 기반) ===== */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  /* ===== 알림 읽지않음 여부 (로컬 state) ===== */
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // 1) 로그인 상태 확인 — iron-session 세션 쿠키 기반
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.isLoggedIn);
        setUserNickname(data.user?.nickname ?? null);
        setUserRole(data.user?.role ?? null);

        // 2) 로그인 상태면 읽지 않은 알림 확인
        if (data.isLoggedIn) {
          api
            .get("/api/users/me/notifications")
            .then((res) => {
              const unreadCount = res.data?.data?.unreadCount || 0;
              setHasUnread(unreadCount > 0);
            })
            .catch(() => {}); // 에러 무시
        }
      })
      .catch(() => {}); // 비로그인 or 에러 무시
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* ① 브랜드 로고 — E1: 클릭 시 홈 이동 */}
        <Link href="/" className={styles.logo} aria-label="이음 홈으로 이동">
          <Image
            src="/logo/logo-ieum-transparent.png"
            alt="이음 로고"
            width={110}
            height={110}
            className={styles.logoImg}
            priority
          />
          <span className={styles.srOnly}>이음</span>
        </Link>

        {/* ② 메인 네비게이션 — E2: 메뉴 클릭 시 라우팅 + active 스타일 */}
        <nav className={styles.nav} aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.match + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ③④ 우측 액션 영역 */}
        <div className={styles.actions}>
          {/* ⚙️ [DEV] 축제 상태 최신화 버튼 — 개발 완료 후 제거 */}
          <button
            className={styles.devRefreshBtn}
            onClick={async () => {
              try {
                const res = await api.patch('/api/festivals/refresh-status');
                const data = res.data;
                setPopupConfig({
                  msg: `✅ ${data.message} (${data.updatedCount}건 변경)`,
                  reload: true,
                });
              } catch (err) {
                setPopupConfig({
                  msg: '❌ 상태 최신화 실패: ' + err,
                  reload: false,
                });
              }
            }}
            title="[DEV] 축제 status DB 일괄 갱신"
          >
            🔄 상태 최신화
          </button>

          {/* ③ 알림 아이콘 — E3: 클릭 시 알림 드롭다운 토글 */}
          {isLoggedIn && (
            <div className={styles.bellWrapper}>
              <button
                type="button"
                className={styles.bellBtn}
                aria-label="알림"
                onClick={() => setIsNotiOpen((prev) => !prev)}
              >
                <Bell strokeWidth={1.8} />
                {hasUnread && (
                  <span className={styles.bellDot} aria-label="읽지 않은 알림 있음" />
                )}
              </button>

              {/* 알림 드롭다운 */}
              {isNotiOpen && (
                <NotificationDropdown onClose={() => setIsNotiOpen(false)} />
              )}
            </div>
          )}

          {/* ④-1 관리자 버튼 — role이 ROLE_ADMIN일 때만 표시 */}
          {isLoggedIn && userRole === "ROLE_ADMIN" && (
            <Link
              href="/admin"
              className={styles.adminBtn}
              aria-label="관리자 페이지"
            >
              <Shield size={18} strokeWidth={2} />
            </Link>
          )}

          {/* ④-2 마이페이지 / 로그인 — E4 */}
          {isLoggedIn ? (
            <Link
              href="/myPage"
              className={styles.userBtn}
              aria-label="마이페이지"
            >
              <User strokeWidth={2} />
            </Link>
          ) : (
            <Link href="/auth/login" className={styles.loginBtn}>
              로그인
            </Link>
          )}
        </div>
      </div>

      {/* 팝업 모달 */}
      {popupConfig && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalText}>{popupConfig.msg}</p>
            <button className={styles.modalBtn} onClick={closePopup}>
              확인
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
