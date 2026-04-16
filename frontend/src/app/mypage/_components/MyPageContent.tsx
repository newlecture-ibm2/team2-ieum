"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from '../mypage.module.css';
import api from '@/lib/api';
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
  const searchParams = useSearchParams();
  
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🚀 URL의 ?tab= 파라미터와 동기화 (없으면 기본값 'posts')
  const activeMenu = (searchParams.get('tab') as MenuType) || 'posts';

  /**
   * 메뉴 변경 시 URL 업데이트 (탭 영속성 부여 및 페이지 초기화)
   */
  const handleMenuChange = (menu: MenuType) => {
    // 탭 전환 시 page 파라미터는 제거되도록 설계 (1페이지부터 시작)
    const params = new URLSearchParams();
    params.set('tab', menu);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /**
   * 사용자 정보 및 인증 체크 (표준 api 유틸리티 적용)
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<UserInfo>('/api/users/me');
      
      if (res.data && res.data.userId) {
        setUser(res.data);
      } else {
        router.push('/login');
      }
    } catch (err) {
      console.error('MyPage auth check failed:', err);
      // api interceptor가 401 등을 처리하지만 안전을 위해 추가 리다이렉트
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * 🚀 [v18-Sync] 프로필 변경 시 사이드바 정보 재동기화 리스너
   */
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log("MyPageContent received userProfileUpdate event");
      checkAuth();
    };

    window.addEventListener('userProfileUpdate', handleProfileUpdate);
    return () => window.removeEventListener('userProfileUpdate', handleProfileUpdate);
  }, []);

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

      {/* 2. 컨텐츠 영역 (인라인 스타일 제거 및 전용 클래스 적용) */}
      <main className={styles.contentArea}>
        <div className={styles.contentAreaWrapper}>
          <h2 className={styles.contentTitle}>{menuTitles[activeMenu]}</h2>
          <div className={styles.contentInner}>
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
