"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from '../mypage.module.css';
import MyPageSidebar, { MenuType } from './MyPageSidebar';
import PostList from './PostList';
import FavoriteList from './FavoriteList';
import ReviewList from './ReviewList';
import CommentList from './CommentList';
import InquiryList from './InquiryList';
import ReportList from './ReportList';
import SettingsForm from './SettingsForm';

interface UserInfo {
  userId: number;
  id: string; // loginId
  nickname: string;
  name?: string;
  role: string;
}

export default function MyPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuType>('posts');

  // 메뉴 변경 시 URL의 페이지 파라미터 초기화
  const handleMenuChange = (menu: MenuType) => {
    setActiveMenu(menu);
    // 메뉴가 바뀔 때 page query param이 남아있으면 엉뚱한 페이지의 데이터를 요청하게 되므로 초기화
    router.replace(pathname, { scroll: false });
  };

  useEffect(() => {
    // 🛡️ API 경로를 /api/users/me로 수정하고, ApiResponse 규격이 아닌 UserDto 직접 응답을 처리합니다.
    fetch('/api/users/me')
      .then((res) => {
        if (!res.ok) {
          throw new Error('인증 실패');
        }
        return res.json();
      })
      .then((data) => {
        // 백엔드 AuthRes.UserDto 규격 반영 (userId 필드 포함)
        if (!data || !data.userId) {
          router.push('/login');
          return;
        }
        setUser(data);
      })
      .catch((err) => {
        console.error('MyPage auth check failed:', err);
        router.push('/login');
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) return <div className={styles.loading}>사용자 정보를 불러오는 중...</div>;
  if (!user) return null;

  // 메뉴에 따른 컨텐츠 렌더링 매핑
  const renderContent = () => {
    switch (activeMenu) {
      case 'favorites': return <FavoriteList />;
      case 'posts': return <PostList />;
      case 'reviews': return <ReviewList />;
      case 'comments': return <CommentList />;
      case 'inquiries': return <InquiryList />;
      case 'reports': return <ReportList />;
      case 'settings': return <SettingsForm user={user} />;
      default: return <PostList />;
    }
  };

  const menuTitles: Record<MenuType, string> = {
    favorites: '❤️ 나의 찜 목록',
    posts: '📝 내 게시글 목록',
    reviews: '⭐ 내 리뷰 목록',
    comments: '💬 내 댓글 목록',
    inquiries: '❓ 내 문의 보기',
    reports: '🛡️ 내 신고 내역',
    settings: '⚙️ 설정 관리'
  };

  return (
    <div className={styles.mypageContainer}>
      {/* 1. 사이드바 내비게이션 */}
      <MyPageSidebar 
        user={user} 
        activeMenu={activeMenu} 
        onMenuChange={handleMenuChange} 
      />

      {/* 2. 컨텐츠 영역 */}
      <main className={styles.contentArea}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <h2 className={styles.contentTitle}>{menuTitles[activeMenu]}</h2>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
