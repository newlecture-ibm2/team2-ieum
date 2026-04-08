"use client";

import React, { useState, useRef } from 'react';
import { Camera, Check, AlertCircle, Loader2 } from 'lucide-react';
import styles from '../mypage.module.css';
import WithdrawModal from './WithdrawModal';
import api from '@/lib/api';

interface SettingsFormProps {
  user: {
    nickname: string;
    id: string;
    profileImageUrl?: string;
  };
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // 이미지 업로드 관련 상태
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImageUrl || null);
  
  // 알림 상태 (Mock)
  const [notifications, setNotifications] = useState({
    marketing: true,
    activity: true,
    customer: false
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!isNicknameChecked) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }

    try {
      setIsSaving(true);
      const formData = new FormData();
      
      // JSON 데이터 추가 (Blob으로 감싸서 application/json 타입 명시)
      const updateData = { nickname };
      formData.append('data', new Blob([JSON.stringify(updateData)], { type: 'application/json' }));
      
      // 이미지 파일 추가
      if (selectedFile) {
        formData.append('profileImg', selectedFile);
      }

      await api.put('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('프로필 정보가 성공적으로 반영되었습니다.');
      window.location.reload(); // 이미지 및 정보 갱신을 위해 새로고침
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.settingsGrid}>
      {/* 왼쪽: 프로필 관리 */}
      <section className={styles.settingsSection}>
        <h3 className={styles.sectionLabel} style={{ fontSize: '1.1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px' }}>
          내 프로필 상세 관리
        </h3>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className={styles.avatar} style={{ width: '100px', height: '100px', cursor: 'pointer', overflow: 'hidden' }} onClick={handleImageClick}>
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <Camera size={32} />
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleImageChange}
          />
          <button 
            className={styles.btnEdit} 
            style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px' }}
            onClick={handleImageClick}
            disabled={isSaving}
          >
            사진 업데이트
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label className={styles.sectionLabel}>닉네임 변경</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className={styles.inputField} 
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsNicknameChecked(false);
              }}
              disabled={isSaving}
            />
            <button 
              className={styles.btnEdit} 
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => setIsNicknameChecked(true)}
              disabled={isSaving}
            >
              중복확인
            </button>
          </div>
          {isNicknameChecked && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-500)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={12} /> 사용 가능한 닉네임입니다.
            </p>
          )}
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label className={styles.sectionLabel}>등록된 이메일 계정</label>
          <div className={styles.inputField} style={{ backgroundColor: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
            {user.id}
          </div>
        </div>

        <button className={styles.btnAction} style={{ width: '100%', backgroundColor: 'var(--color-primary-500)', color: '#fff', padding: '12px', fontSize: '1rem' }} onClick={handleSaveProfile}>
          프로필 저장 적용
        </button>

        <div className={styles.withdrawLink} onClick={() => setIsWithdrawModalOpen(true)}>
          ⚠️ 회원 탈퇴 진행
        </div>
      </section>

      {/* 오른쪽: 알림 설정 */}
      <section className={styles.settingsSection}>
        <h3 className={styles.sectionLabel} style={{ fontSize: '1.1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px' }}>
          수신 / 알림 (Push) 동의 여부
        </h3>

        <div className={styles.toggleItem}>
          <div>
            <div className={styles.toggleLabel}>마케팅 정보 수신</div>
            <div className={styles.toggleDesc}>이벤트, 프로모션 안내 등 광고성 정보 수신</div>
          </div>
          <div 
            className={`${styles.switch} ${notifications.marketing ? styles.switchActive : ''}`}
            onClick={() => handleToggle('marketing')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        <div className={styles.toggleItem}>
          <div>
            <div className={styles.toggleLabel}>내 콘텐츠 반응 알림</div>
            <div className={styles.toggleDesc}>내 글/리뷰에 답글 작성 시 알림</div>
          </div>
          <div 
            className={`${styles.switch} ${notifications.activity ? styles.switchActive : ''}`}
            onClick={() => handleToggle('activity')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>

        <div className={styles.toggleItem}>
          <div>
            <div className={styles.toggleLabel}>고객센터 처리 상태 알림</div>
            <div className={styles.toggleDesc}>1:1 문의답변 등록 시 푸시 수신</div>
          </div>
          <div 
            className={`${styles.switch} ${notifications.customer ? styles.switchActive : ''}`}
            onClick={() => handleToggle('customer')}
          >
            <div className={styles.switchHandle} />
          </div>
        </div>
      </section>

      {/* 탈퇴 모달 */}
      <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} />
    </div>
  );
}
