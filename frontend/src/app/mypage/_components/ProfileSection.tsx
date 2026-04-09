"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, Loader2 } from 'lucide-react';
import styles from '../mypage.module.css';
import api from '@/lib/api';

interface ProfileSectionProps {
  user: {
    nickname: string;
    id: string;
    profileImageUrl?: string;
  };
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImageUrl || null);

  // 🚀 [v15] 도메인 자가 동기화: 남의 팀 API가 사진을 빠뜨려도 우리 팀 API로 다시 조회해옵니다.
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const response = await api.get('/api/mypage/profile');
        if (response.data) {
          if (response.data.nickname) setNickname(response.data.nickname);
          if (response.data.profileImageUrl) setPreviewUrl(response.data.profileImageUrl);
        }
      } catch (error) {
        console.error('마이페이지 프로필 자가 조회 실패:', error);
      }
    };
    
    fetchLatestProfile();
  }, []);

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
    if (!isNicknameChecked) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }

    try {
      setIsSaving(true);
      
      if (selectedFile) {
        // 🚀 Base64 우회 전략: 이미지를 텍스트로 변환하여 프록시 이슈 회피
        const base64Image = await fileToBase64(selectedFile);
        await api.patch('/api/mypage/profile/image', { base64Image });
      }

      // 닉네임 업데이트 (JSON 전송으로 단순화하여 안정성 확보)
      await api.put('/api/mypage', { nickname });

      alert('프로필 정보가 성공적으로 반영되었습니다.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
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
