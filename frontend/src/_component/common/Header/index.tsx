"use client";


import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, User, LogOut, Shield, Home, CalendarDays, MessageCircle, Megaphone, History } from "lucide-react";
import NotificationDropdown from "../NotificationDropdown";
import { useHeader } from "./useHeader";
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

  const {
    isLoggedIn, userNickname, userRole, userProfileImage, hasUnread, setHasUnread,
    isNotiOpen, setIsNotiOpen, notiRefreshKey, popupConfig,
    closePopup, logout, devRefreshFestivals, isDarkHeroPage
  } = useHeader();

  if (pathname.startsWith("/admin")) return null;



  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
        {/* ① 브랜드 로고 — E1: 클릭 시 홈 이동 */}
        <Link href="/" className={styles.logo} aria-label="이음 홈으로 이동">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/logo-ieum-transparent.png"
            alt="이음 로고"
            className={styles.logoImg}
            data-logo-theme="dark"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/logo-ieum-white.png"
            alt="이음 로고"
            className={styles.logoImg}
            data-logo-theme="light"
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
            onClick={devRefreshFestivals}
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
                <NotificationDropdown onClose={() => setIsNotiOpen(false)} refreshKey={notiRefreshKey} onUnreadChange={setHasUnread} />
              )}
            </div>
          )}

          {/* ④-1 관리자 버튼 — role이 ROLE_ADMIN 또는 ADMIN일 때만 표시 */}
          {isLoggedIn && (userRole === "ROLE_ADMIN" || userRole === "ADMIN") && (
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
            <>
              <Link
                href="/mypage"
                className={styles.userBtn}
                aria-label="마이페이지"
              >
                <div className={styles.userIconWrapper} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {userProfileImage ? (
                    <img src={userProfileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User strokeWidth={2.5} />
                  )}
                </div>
                {userNickname && (
                  <span className={styles.userName}>{userNickname}님</span>
                )}
              </Link>
              <button
                type="button"
                className={styles.logoutBtn}
                aria-label="로그아웃"
                title="로그아웃"
                onClick={logout}
              >
                <LogOut strokeWidth={2} size={20} />
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.loginBtn}>
              로그인
            </Link>
          )}
        </div>
      </div>



      {/* 팝업 모달 */}
      {popupConfig && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalText}>{popupConfig?.msg}</p>
            <button className={styles.modalBtn} onClick={closePopup}>
              확인
            </button>
          </div>
        </div>
      )}

      </header>

      {/* ⑧ 모바일 하단 플로팅 네비게이션 바 (Mobile Exclusive) */}
      <nav className={styles.mBottomNav}>
        <div className={styles.mBottomNavInner}>
          <Link href="/" className={`${styles.mBottomNavItem} ${pathname === '/' ? styles.mBottomNavActive : ''}`}>
            <Home size={22} className={styles.mBottomNavIcon} />
            <span className={styles.mBottomNavLabel}>홈</span>
          </Link>
          <Link href="/pastFestivals" className={`${styles.mBottomNavItem} ${pathname.startsWith('/pastFestivals') ? styles.mBottomNavActive : ''}`}>
            <History size={22} className={styles.mBottomNavIcon} />
            <span className={styles.mBottomNavLabel}>지난축제</span>
          </Link>
          <Link href="/calendar" className={`${styles.mBottomNavItem} ${pathname.startsWith('/calendar') ? styles.mBottomNavActive : ''}`}>
            <CalendarDays size={22} className={styles.mBottomNavIcon} />
            <span className={styles.mBottomNavLabel}>달력</span>
          </Link>
          <Link href="/community" className={`${styles.mBottomNavItem} ${pathname.startsWith('/community') ? styles.mBottomNavActive : ''}`}>
            <MessageCircle size={22} className={styles.mBottomNavIcon} />
            <span className={styles.mBottomNavLabel}>커뮤니티</span>
          </Link>
          <Link href="/notices" className={`${styles.mBottomNavItem} ${pathname.startsWith('/notices') ? styles.mBottomNavActive : ''}`}>
            <Megaphone size={22} className={styles.mBottomNavIcon} />
            <span className={styles.mBottomNavLabel}>공지</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
