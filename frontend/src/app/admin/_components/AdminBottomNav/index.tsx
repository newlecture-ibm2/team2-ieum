'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Globe, Megaphone } from 'lucide-react';
import styles from './AdminBottomNav.module.css';

const BOTTOM_MENU_ITEMS = [
  { label: '대시보드', href: '/admin', icon: LayoutDashboard },
  { label: '공공축제', href: '/admin/festivals', icon: Globe },
  { label: '공지/팝업', href: '/admin/notices', icon: Megaphone },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.mBottomNav}>
      <div className={styles.mBottomNavInner}>
        {BOTTOM_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/admin' 
            ? pathname === '/admin' 
            : pathname.startsWith(item.href);
            
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.mBottomNavItem} ${isActive ? styles.mBottomNavActive : ''}`}
            >
              <Icon size={22} className={styles.mBottomNavIcon} />
              <span className={styles.mBottomNavLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
