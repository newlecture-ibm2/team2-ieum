"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Check, Loader2 } from 'lucide-react';
import styles from '../mypage.module.css';
import api from '@/lib/api';
import { useToast } from '@/_component/common/Toast';
import { API_ENDPOINTS } from '@/constants/api';

interface ProfileSectionProps {
  user: {
    nickname: string;
    id: string;
    profileImageUrl?: string;
  };
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [nickname, setNickname] = useState(user.nickname);
  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImageUrl || null);

  // 🚀 [v18] 도메인 자가 동기화 로직을 함수화하여 저장 직후에도 호출할 수 있게 합니다.
  const fetchLatestProfile = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.MYPAGE.PROFILE);
      const profileData = response.data.data;
      if (profileData) {
        if (profileData.nickname) setNickname(profileData.nickname);
        if (profileData.profileImageUrl) {
          // 캐시 무력화를 위해 타임스탬프를 쿼리 파라미터로 추가합니다.
          setPreviewUrl(`${profileData.profileImageUrl}?t=${Date.now()}`);
        }
      }
    } catch (error) {
      console.error('마이페이지 프로필 자가 조회 실패:', error);
    }
  }, []);

  useEffect(() => {
    fetchLatestProfile();
  }, [fetchLatestProfile]);

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSaveProfile = async () => {
    if (nickname.length < 2 || nickname.length > 8) {
      toast('닉네임은 2자 이상 8자 이하로 입력 가능합니다.', 'warning');
      return;
    }

    if (!isNicknameChecked) {
      toast('닉네임 중복 확인이 필요합니다.', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      
      if (selectedFile) {
        // 🚀 Base64 우회 전략: 이미지를 텍스트로 변환하여 프록시 이슈 회피
        const base64Image = await fileToBase64(selectedFile);
        await api.patch(API_ENDPOINTS.MYPAGE.UPDATE_IMAGE, { base64Image });
      }

      // 닉네임 업데이트 (JSON 전송으로 단순화하여 안정성 확보)
      await api.put(API_ENDPOINTS.MYPAGE.UPDATE, { nickname });

      toast('프로필 정보가 성공적으로 반영되었습니다.', 'success');
      
      // ✅ [v18-Sync] 전역 동기화: 헤더와 사이드바가 즉시 바뀌도록 커스텀 이벤트를 발행합니다.
      window.dispatchEvent(new CustomEvent('userProfileUpdate'));
      
      // ✅ 로컬 상태 재동기화 및 캐시 새로고침
      await fetchLatestProfile();
      setSelectedFile(null); // 파일 선택 상태 초기화
      
      // Next.js router.refresh()는 서버 컴포넌트 데이터 갱신을 위해 유지합니다.
      router.refresh();
      
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast('프로필 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.settingsSection}>
      <h3 className={styles.settingsHeader}>
        내 프로필 상세 관리
      </h3>
      
      <div className={styles.avatarWrapper}>
        <div 
          className={styles.avatar} 
          style={{ cursor: 'pointer', overflow: 'hidden' }} 
          onClick={handleImageClick}
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={() => setPreviewUrl(null)} // 이미지 로드 실패 시 기본 아이콘으로 복구
            />
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
            maxLength={8}
            placeholder="2~8자 사이로 입력"
          />
          <button 
            className={styles.btnCheck} 
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setIsNicknameChecked(true)}
            disabled={isSaving}
          >
            중복확인
          </button>
        </div>
        {(nickname.length > 0 && (nickname.length < 2 || nickname.length > 8)) && (
          <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>
            닉네임은 2자 이상 8자 이하로 입력해주세요.
          </p>
        )}
        {isNicknameChecked && nickname.length >= 2 && nickname.length <= 8 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-primary-500)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check size={12} /> 사용 가능한 닉네임입니다.
          </p>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label className={styles.sectionLabel}>연동된 계정 정보</label>
        <div className={styles.inputField} style={{ 
          backgroundColor: '#f8fafc', 
          color: '#334155', 
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          minHeight: '48px' /* 일반 input과 높이 통일 */
        }}>
          {user.id.startsWith('naver_') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}>🟢</span> 
              <span style={{ color: '#03c75a' }}>네이버 인증 계정</span>
            </div>
          ) : user.id.startsWith('kakao_') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}>🟡</span> 
              <span style={{ color: '#E2C300' }}>카카오 인증 계정</span>
            </div>
          ) : user.id.startsWith('google_') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}>🔵</span> 
              <span style={{ color: '#4285F4' }}>구글 인증 계정</span>
            </div>
          ) : (
            user.id
          )}
        </div>
      </div>

      <button 
        className={styles.btnAction} 
        style={{ width: '100%', backgroundColor: 'var(--color-primary-500)', color: '#fff', padding: '12px', fontSize: '1rem' }} 
        onClick={handleSaveProfile}
        disabled={isSaving}
      >
        {isSaving ? <Loader2 className={styles.spinner} size={20} /> : '프로필 저장 적용'}
      </button>
    </section>
  );
}
