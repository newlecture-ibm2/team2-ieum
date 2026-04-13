"use client";

import React, { useState, useEffect } from 'react';
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
import api from '@/lib/api';

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
    id: string; // loginId
  };
  activeMenu: MenuType;
  onMenuChange: (menu: MenuType) => void;
}

const MENU_ITEMS = [
  { id: 'favorites' as MenuType, label: '찜', icon: Heart },
  { id: 'posts' as MenuType, label: '내 게시글 목록', icon: FileText },
  { id: 'comments' as MenuType, label: '내 댓글 목록', icon: MessageSquare },
  { id: 'reviews' as MenuType, label: '내 리뷰 목록', icon: Star },
  { id: 'inquiries' as MenuType, label: '내 문의 보기', icon: HelpCircle },
  { id: 'reports' as MenuType, label: '내 신고 내역', icon: ShieldCheck },
  { id: 'settings' as MenuType, label: '설정 관리', icon: Settings },
];

export default function MyPageSidebar({ user, activeMenu, onMenuChange }: MyPageSidebarProps) {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState(user.nickname);

  // 🚀 [v17] 사이드바 자가 동기화: 사진뿐만 아니라 최신 닉네임도 우리 전용 API에서 가져옵니다.
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/mypage/profile');
        const profileData = response.data.data;
        if (profileData) {
          if (profileData.profileImageUrl) setProfileImageUrl(profileData.profileImageUrl);
          if (profileData.nickname) setNickname(profileData.nickname);
        }
      } catch (error) {
        console.error('사이드바 프로필 조회 실패:', error);
      }
    };
    fetchProfile();
  }, [user.nickname]);

  return (
    <aside className={styles.sidebar}>
      {/* 프로필 섹션 */}
      <div className={styles.profileSection}>
        <div className={styles.avatar} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={40} strokeWidth={1.5} />
          )}
        </div>
        <div className={styles.nickname}>{nickname}</div>
        <div className={styles.loginId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {user.id.startsWith('naver_') ? (
            <><span style={{ fontSize: '10px', marginTop: '-1px' }}>🟢</span> <span style={{ color: '#03c75a', fontWeight: 600 }}>네이버 인증 계정</span></>
          ) : user.id.startsWith('kakao_') ? (
            <><span style={{ fontSize: '10px', marginTop: '-1px' }}>🟡</span> <span style={{ color: '#E2C300', fontWeight: 600 }}>카카오 인증 계정</span></>
          ) : user.id.startsWith('google_') ? (
            <><span style={{ fontSize: '10px', marginTop: '-1px' }}>🔵</span> <span style={{ color: '#4285F4', fontWeight: 600 }}>구글 인증 계정</span></>
          ) : (
            user.id
          )}
        </div>
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
