"use client";

import React from 'react';
import { 
  Heart, 
  FileText, 
  Star, 
  MessageSquare, 
  HelpCircle, 
  ShieldCheck,
  Settings, 
  User 
} from 'lucide-react';
import styles from '../mypage.module.css';

export type MenuType = 'favorites' | 'posts' | 'reviews' | 'comments' | 'inquiries' | 'reports' | 'settings';

export const MENU_LABELS: Record<MenuType, string> = {
  favorites: '❤️ 찜 목록',
  posts: '📝 내 게시글 목록',
  reviews: '⭐ 내 리뷰 목록',
  comments: '💬 내 댓글 목록',
  inquiries: '❓ 내 문의 보기',
  reports: '🛡️ 내 신고 내역',
  settings: '⚙️ 설정 관리',
};

interface MyPageSidebarProps {
  user: {
    nickname: string;
    id: string; // email or loginId
  };
  activeMenu: MenuType;
  onMenuChange: (menu: MenuType) => void;
}

const MENU_ITEMS = [
  { id: 'favorites' as MenuType, label: '찜', icon: Heart },
  { id: 'posts' as MenuType, label: '내 게시글 목록', icon: FileText },
  { id: 'reviews' as MenuType, label: '내 리뷰 목록', icon: Star },
  { id: 'comments' as MenuType, label: '내 댓글 목록', icon: MessageSquare },
  { id: 'inquiries' as MenuType, label: '내 문의 보기', icon: HelpCircle },
  { id: 'reports' as MenuType, label: '내 신고 내역', icon: ShieldCheck },
  { id: 'settings' as MenuType, label: '설정 관리', icon: Settings },
];

export default function MyPageSidebar({ user, activeMenu, onMenuChange }: MyPageSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {/* 프로필 섹션 */}
      <div className={styles.profileSection}>
        <div className={styles.avatar}>
          <User size={40} strokeWidth={1.5} />
        </div>
        <div className={styles.nickname}>{user.nickname}</div>
        <div className={styles.email}>{user.id}</div>
      </div>

      {/* 내비게이션 메뉴 */}
      <nav className={styles.navMenu}>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;
          
          return (
            <div
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              onClick={() => onMenuChange(item.id)}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
