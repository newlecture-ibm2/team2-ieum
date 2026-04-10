"use client";

import React, { useState } from 'react';
import styles from '../mypage.module.css';
import WithdrawModal from './WithdrawModal';
import ProfileSection from './ProfileSection';
import NotificationSection from './NotificationSection';

interface SettingsFormProps {
  user: {
    nickname: string;
    id: string;
    profileImageUrl?: string;
  };
}

/**
 * ⚙️ 마이페이지 설정 관리 (Container)
 * 프로필 관리와 알림 설정을 도메인별로 분리하여 관리하는 최상위 설정 폼입니다.
 */
export default function SettingsForm({ user }: SettingsFormProps) {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  return (
    <div className={styles.settingsGrid}>
      {/* 1. 프로필 관리 영역 (닉네임, 이미지 등) */}
      <ProfileSection user={user} />

      {/* 2. 알림 설정 영역 (FCM, 푸시 동의 등) */}
      <NotificationSection />

      {/* 🛑 배타적인 영역: 회원 탈퇴 링크 (세션 하단 유지) */}
      <div className={styles.withdrawWrapper}>
        <span 
          className={styles.withdrawLink} 
          onClick={() => setIsWithdrawModalOpen(true)}
        >
          ⚠️ 서비스 이용 탈퇴하기
        </span>
      </div>

      {/* 탈퇴 전용 모달 */}
      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
      />
    </div>
  );
}
