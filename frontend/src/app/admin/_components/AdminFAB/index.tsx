'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Tent, AlertTriangle, MessageSquare, Users } from 'lucide-react';
import styles from './AdminFAB.module.css';

const FAB_ITEMS = [
  { label: '축제 관리', href: '/admin/managedFestivals', icon: Tent, color: '#6c5ce7' },
  { label: '신고 관리', href: '/admin/reports', icon: AlertTriangle, color: '#ef4444' },
  { label: '문의 관리', href: '/admin/inquiries', icon: MessageSquare, color: '#f59e0b' },
  { label: '회원 관리', href: '/admin/members', icon: Users, color: '#10b981' },
];

export default function AdminFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const fabRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 페이지 이동 시 닫기
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className={styles.fabContainer} ref={fabRef}>
      {/* 오버레이 */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      {/* 서브 메뉴 */}
      <div className={`${styles.subMenu} ${isOpen ? styles.subMenuOpen : ''}`}>
        {FAB_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.subMenuItem} ${isActive ? styles.subMenuItemActive : ''}`}
              style={{ 
                transitionDelay: isOpen ? `${idx * 50}ms` : '0ms',
              }}
            >
              <span className={styles.subMenuIcon} style={{ background: item.color }}>
                <Icon size={18} color="#fff" />
              </span>
              <span className={styles.subMenuLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* FAB 버튼 */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="관리 메뉴 열기"
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
