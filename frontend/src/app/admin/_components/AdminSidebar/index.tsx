'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './AdminSidebar.module.css';

const MENU_ITEMS = [
  { label: '🏠 대시보드', href: '/admin' },
  { label: '🌐 공공축제 리스트', href: '/admin/festivals' },
  { label: '🎪 자체기획 축제', href: '/admin/festivals/custom' },
  { label: '🚨 신고 관리', href: '/admin/reports' },
  { label: '📢 공지/팝업', href: '/admin/notices' },
  { label: '💬 문의 관리', href: '/admin/inquiries' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.pinOuter}>
          <span className={styles.pinInner} />
        </span>
        IEUM 관리자
      </div>

      <div className={styles.divider}>관리</div>

      <nav>
        <ul className={styles.menu}>
          {MENU_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : item.href === '/admin/festivals'
                ? pathname === '/admin/festivals'
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
