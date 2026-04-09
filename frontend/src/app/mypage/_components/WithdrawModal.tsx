"use client";

import React, { useState } from 'react';
import styles from '../mypage.module.css';
import api from '@/lib/api';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = async () => {
    if (!password.trim()) {
      alert('본인 확인을 위해 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // ✅ 회원 탈퇴 API 호출 (백엔드: DELETE /api/auth/me)
      // Axios DELETE 요청에 바디를 실을 때는 { data: ... } 형식을 사용해야 합니다.
      await api.delete('/api/auth/me', { data: { password } });
      
      // ✅ 탈퇴 후 로그아웃 처리 (iron-session 정리)
      await fetch("/api/auth/logout", { method: "POST" });
      
      alert('그동안 이음을 이용해주셔서 감사합니다. 소중한 의견을 바탕으로 더 나은 서비스가 되도록 노력하겠습니다.');
      
      // 메인 페이지로 이동 및 새로고침
      window.location.href = '/';
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      const errorMsg = error.response?.data?.message || '탈퇴 처리 중 오류가 발생했습니다. 비밀번호를 다시 확인해 주세요.';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>회원 탈퇴</h2>
        
        <div className={styles.modalContent}>
          이음을 떠나신다니 아쉬워요. 전국의 축제 정보와 이웃과의 소중한 소통이 중단됩니다. 
          정말로 탈퇴하시겠습니까?
        </div>

        <div className={styles.warningBox}>
          <p className={styles.warningText}>
            ⚠️ 탈퇴 후 30일 동안은 기존 아이디로 로그인 시 계정 복구가 가능합니다.<br/>
            ⚠️ 30일이 경과하면 모든 데이터가 복구 불가능하게 삭제됩니다.
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label className={styles.sectionLabel} style={{ marginBottom: '8px', display: 'block' }}>본인 확인을 위해 비밀번호를 입력해주세요.</label>
          <input 
            type="password" 
            className={styles.inputField}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            style={{ width: '100%' }}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            disabled={isSubmitting}
          >
            취소
          </button>
          <button 
            className={styles.confirmBtn} 
            onClick={handleWithdraw}
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
