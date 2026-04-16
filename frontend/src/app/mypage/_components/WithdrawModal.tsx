"use client";

import React, { useState } from 'react';
import { Modal } from '@/_component/common/Modal';
import styles from '../mypage.module.css';
import api from '@/lib/api';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONFIRM_STEPS = [
  {
    emoji: '😢',
    message: '진짜 탈퇴할꺼야..?',
    confirmText: '응...',
    cancelText: '아니, 안 할래!',
  },
  {
    emoji: '🥺',
    message: '진짜로..?',
    confirmText: '어... 진짜로...',
    cancelText: '다시 생각해볼게!',
  },
  {
    emoji: '😭',
    message: '다시 한번 더 생각해주면 안돼?',
    confirmText: '미안... 결심했어',
    cancelText: '그래, 좀 더 써볼게!',
  },
  {
    emoji: '💔',
    message: '안돼....',
    confirmText: '정말 탈퇴할게',
    cancelText: '알겠어, 남을게!',
  },
];

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0); // 0: 기본 모달, 1~4: 확인 단계
  const [alertMsg, setAlertMsg] = useState<string | null>(null); // alert 대체 모달 메시지

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(0);
    setPassword('');
    setAlertMsg(null);
    onClose();
  };

  const handleWithdraw = async () => {
    if (!password.trim()) {
      setAlertMsg('본인 확인을 위해 비밀번호를 입력해주세요.');
      return;
    }

    // 아직 확인 단계가 남아있으면 다음 단계로
    if (step < CONFIRM_STEPS.length) {
      setStep(step + 1);
      return;
    }

    // 모든 확인 단계 완료 → 실제 탈퇴 진행
    try {
      setIsSubmitting(true);

      // ✅ 회원 탈퇴 API 호출 (백엔드: DELETE /api/auth/me)
      // Axios DELETE 요청에 바디를 실을 때는 { data: ... } 형식을 사용해야 합니다.
      await api.delete('/api/auth/me', { data: { password } });

      // ✅ 탈퇴 후 로그아웃 처리 (iron-session 정리)
      await fetch("/api/auth/logout", { method: "POST" });

      setAlertMsg('탈퇴가 되었습니다.\n그동안 이음을 이용해주셔서 감사합니다.\n\n📌 30일 이내에 다시 로그인하시면\n계정이 자동으로 복구됩니다.\n30일이 지나면 모든 데이터가\n영구 삭제되오니 참고해 주세요.');
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      const errorMsg = error.response?.data?.message || '탈퇴 처리 중 오류가 발생했습니다.\n비밀번호를 다시 확인해 주세요.';
      setAlertMsg(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // alert 대체 모달
  const handleAlertClose = () => {
    const msg = alertMsg;
    setAlertMsg(null);
    // 탈퇴 성공 메시지인 경우 메인으로 이동
    if (msg?.includes('탈퇴가 되었습니다')) {
      window.location.href = '/login';
    }
  };

  return (
    <>
      {/* alert 대체 모달 */}
      {alertMsg && (
        <Modal title="알림" size="small" onClose={handleAlertClose}>
          <p style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: '20px' }}>
            {alertMsg}
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className={styles.confirmBtn}
              style={{ flex: 'none', padding: '8px 24px' }}
              onClick={handleAlertClose}
            >
              확인
            </button>
          </div>
        </Modal>
      )}

      {/* 확인 단계 모달 (1~4단계) */}
      {step >= 1 && step <= CONFIRM_STEPS.length && !alertMsg && (() => {
        const currentStep = CONFIRM_STEPS[step - 1];
        const isLastStep = step === CONFIRM_STEPS.length;

        return (
          <div className={styles.modalOverlay}>
            <div
              className={styles.modal}
              onClick={isLastStep ? handleWithdraw : (e) => e.stopPropagation()}
              style={isLastStep ? { cursor: 'pointer' } : undefined}
            >
              <div className={styles.confirmStepWrapper}>
                <div className={styles.confirmEmoji} key={step}>{currentStep.emoji}</div>
                <p className={styles.confirmMessage} key={`msg-${step}`}>{currentStep.message}</p>
              </div>
              <div className={styles.buttonGroup}>
                {isLastStep ? (
                  <button
                    className={styles.cancelBtn}
                    onClick={(e) => { e.stopPropagation(); handleClose(); }}
                    style={{ flex: 1 }}
                  >
                    구라얌😜
                  </button>
                ) : (
                  <>
                    <button
                      className={styles.cancelBtn}
                      onClick={handleClose}
                    >
                      {currentStep.cancelText}
                    </button>
                    <button
                      className={styles.confirmBtn}
                      onClick={() => setStep(step + 1)}
                      disabled={isSubmitting}
                    >
                      {currentStep.confirmText}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 기본 모달 (step 0) */}
      {step === 0 && !alertMsg && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>회원 탈퇴</h2>

            <div className={styles.modalContent}>
              이음을 떠나신다니 아쉬워요. 전국의 축제 정보와 이웃과의 소중한 소통이 중단됩니다.
              정말로 탈퇴하시겠습니까?
            </div>

            <div className={styles.warningBox}>
              <p className={styles.warningText}>
                ⚠️ 탈퇴 후 30일 동안은 기존 아이디로 로그인 시 계정 복구가 가능합니다.<br />
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
                onClick={handleClose}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleWithdraw}
                disabled={isSubmitting}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
