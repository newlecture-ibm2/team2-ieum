'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import adminApi from '@/lib/adminApi';
import styles from './AdminSidebar.module.css';

const MENU_ITEMS = [
  { label: '🏠 대시보드', href: '/admin', id: 'dashboard' },
  { label: '🌐 공공축제 리스트', href: '/admin/festivals', id: 'public-festivals' },
  { label: '🎪 축제 관리', href: '/admin/managedFestivals', id: 'managed-festivals' },
  { label: '🚨 신고 관리', href: '/admin/reports', id: 'reports' },
  { label: '📢 공지/팝업', href: '/admin/notices', id: 'notices' },
  { label: '💬 문의 관리', href: '/admin/inquiries', id: 'inquiries' },
  { label: '👥 회원 관리', href: '/admin/members', id: 'members' },
];

import { fetchDashboardData } from '@/app/admin/(dashboard)/_api/fetchDashboardData';

export default function AdminSidebar() {
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
        console.error('사이드바 폴링 에러:', err);
      }
    };

    fetchCounts();
    const intervalId = setInterval(fetchCounts, 30000);
    return () => clearInterval(intervalId);
  }, []);
  return (
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand} style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className={styles.pinOuter}>
          <span className={styles.pinInner} />
        </span>
        IEUM 관리자
      </Link>

      <div className={styles.divider}>관리</div>

      <nav>
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
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <span className={styles.notificationBadge}>{badgeCount > 99 ? '99+' : badgeCount}</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
