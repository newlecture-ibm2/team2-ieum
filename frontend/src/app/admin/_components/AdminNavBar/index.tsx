'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './AdminNavBar.module.css';
import { fetchDashboardData } from '@/app/admin/(dashboard)/_api/fetchDashboardData';

const MENU_ITEMS = [
  { label: '🏠 대시보드', href: '/admin', id: 'dashboard' },
  { label: '🌐 공공축제 리스트', href: '/admin/festivals', id: 'public-festivals' },
  { label: '🎪 축제 관리', href: '/admin/managedFestivals', id: 'managed-festivals' },
  { label: '🚨 신고 관리', href: '/admin/reports', id: 'reports' },
  { label: '💬 문의 관리', href: '/admin/inquiries', id: 'inquiries' },
  { label: '📢 공지/팝업', href: '/admin/notices', id: 'notices' },
  { label: '👥 회원 관리', href: '/admin/members', id: 'members' },
];

export default function AdminNavBar() {
  const pathname = usePathname();
  const [pendingReports, setPendingReports] = useState(0);
  const [pendingInquiries, setPendingInquiries] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const result = await fetchDashboardData();
        if (result?.kpi) {
          setPendingReports(result.kpi.pendingReports || 0);
          setPendingInquiries(result.kpi.pendingInquiries || 0);
        }
      } catch (err) {
        console.error('네브바 폴링 에러:', err);
      }
    };

    fetchCounts();
    const intervalId = setInterval(fetchCounts, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.brand} style={{ textDecoration: 'none' }}>
          <span className={styles.pinOuter}>
            <span className={styles.pinInner} />
          </span>
          IEUM 관리자
        </Link>
        
        <ul className={styles.menu}>
          {MENU_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            // 뱃지 개수 판별
            let badgeCount = 0;
            if (item.id === 'reports') badgeCount = pendingReports;
            if (item.id === 'inquiries') badgeCount = pendingInquiries;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                >
                  <span>{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={styles.notificationBadge}>{badgeCount > 99 ? '99+' : badgeCount}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
