"use client";

import React, { useState } from 'react';
import styles from '../mypage.module.css';
import api from '@/lib/api';

export default function NotificationSection() {
  // 알림 상태 (설계서 v2.0 규격 반영)
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    festivalStart: true,
    festivalEnd: true,
    notice: true,
    comment: true
  });

  /**
   * 알림 토글 핸들러 (FCM 연동 포함)
   */
  const handleToggle = async (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    
    // 1. 시각적 피드백 우선 반영 (Optimistic Update)
    const prevNotifications = { ...notifications };
    setNotifications(prev => ({
      ...prev,
      [key]: newValue
    }));

    try {
      // 2. 마스터 토글 ON 시 FCM 권한 요청 및 토큰 등록
      if (key === 'pushEnabled' && newValue === true) {
        // Firebase 유틸은 동적 임포트하여 필요할 때만 로드 (Next.js 최적화)
        const { requestFcmToken } = await import('@/lib/firebase');
        const token = await requestFcmToken();
        
        if (token) {
          await api.post('/api/users/me/fcm-token', { token });
        } else {
          // 권한 거부 시 원상복구 및 안내
          alert('알림 권한이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
          setNotifications(prevNotifications);
          return;
        }
      }

      // 3. 알림 설정 서버 동기화 (PATCH)
      await api.patch('/api/users/me/notifications/settings', {
        ...notifications,
        [key]: newValue
      });
      
    } catch (error) {
      console.error('알림 설정 변경 실패:', error);
      // 에러 발생 시 UI 롤백
      setNotifications(prevNotifications);
      alert('설정 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <section className={styles.settingsSection}>
      <h3 className={styles.settingsHeader}>
        기능별 알림 (Push) 동의 설정
      </h3>

      {/* 1. 마스터 토글 */}
      <div className={styles.toggleItem}>
        <div>
          <div className={styles.toggleLabel} style={{ color: 'var(--color-primary-600)' }}>전체 푸시 알림</div>
          <div className={styles.toggleDesc}>앱에서 발송하는 모든 알림 수신을 일시적으로 제어합니다.</div>
        </div>
        <div 
          className={`${styles.switch} ${notifications.pushEnabled ? styles.switchActive : ''}`}
          onClick={() => handleToggle('pushEnabled')}
        >
          <div className={styles.switchHandle} />
        </div>
      </div>

      {/* 세부 항목 (마스터가 꺼지면 비활성화) */}
      <div className={!notifications.pushEnabled ? styles.disabledSection : ''}>
        <div className={styles.toggleItem}>
          <div>
            <div className={styles.toggleLabel}>즐겨찾기 축제 시작 알림</div>
            <div className={styles.toggleDesc}>찜한 축제가 시작되기 1일 전에 미리 알려드립니다.</div>
          </div>
          <div 
            className={`${styles.switch} ${notifications.festivalStart ? styles.switchActive : ''}`}
            onClick={() => handleToggle('festivalStart')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        <div className={styles.toggleItem}>
          <div>
            <div className={styles.toggleLabel}>축제 종료 및 후기 유도</div>
            <div className={styles.toggleDesc}>축제 종료 시 잊지 않게 후기 작성을 안내합니다.</div>
          </div>
          <div 
            className={`${styles.switch} ${notifications.festivalEnd ? styles.switchActive : ''}`}
            onClick={() => handleToggle('festivalEnd')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        <div className={styles.toggleItem}>
          <div>
            <div className={styles.toggleLabel}>공지사항 알림</div>
            <div className={styles.toggleDesc}>주요 공지 및 서비스 업데이트 소식을 발송합니다.</div>
          </div>
          <div 
            className={`${styles.switch} ${notifications.notice ? styles.switchActive : ''}`}
            onClick={() => handleToggle('notice')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        <div className={styles.toggleItem}>
          <div>
            <div className={styles.toggleLabel}>댓글 및 활동 알림</div>
            <div className={styles.toggleDesc}>게시글/리뷰에 새로운 댓글이 등록되면 알려드립니다.</div>
          </div>
          <div 
            className={`${styles.switch} ${notifications.comment ? styles.switchActive : ''}`}
            onClick={() => handleToggle('comment')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>
      </div>
    </section>
  );
}
