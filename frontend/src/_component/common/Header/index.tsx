"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bell, User } from "lucide-react";
import api from "@/lib/api";
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

  if (pathname.startsWith("/admin")) return null;


  // TODO: 실제 인증 상태는 zustand store 또는 iron-session에서 가져옴
  const isLoggedIn = false;
  const hasUnreadNotifications = true;

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

          {/* ③ 알림 아이콘 — E3: 클릭 시 알림 목록 / 비회원은 로그인 유도 */}
          <Link
            href={isLoggedIn ? "/notifications" : "/auth/login"}
            className={styles.bellBtn}
            aria-label="알림"
          >
            <Bell strokeWidth={1.8} />
            {isLoggedIn && hasUnreadNotifications && (
              <span className={styles.bellDot} aria-label="읽지 않은 알림 있음" />
            )}
          </Link>

          {/* ④ 마이페이지 / 로그인 — E4 */}
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
          <dialog open className={styles.modalBox} style={{ border: 'none' }}>
            <p className={styles.modalText}>{popupConfig.msg}</p>
            <button className={styles.modalBtn} onClick={closePopup}>
              확인
            </button>
          </dialog>
        </div>
      )}
    </header>
  );
}

