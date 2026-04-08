"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import styles from '../find-password.module.css';

type Step = 1 | 2 | 3 | 4; // 4는 완료 상태

export default function FindPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1단계: 인증 코드 요청
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await axios.post('/api/auth/password-recovery', { action: 'request', email });
      setStep(2);
      setSuccessMsg('인증 코드가 발송되었습니다. (서버 로그 확인)');
    } catch (err: any) {
      setError(err.response?.data?.message || '가입된 이메일을 찾을 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 코드 검증
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await axios.post('/api/auth/password-recovery', { action: 'verify', email, code });
      setStep(3);
      setSuccessMsg('');
    } catch (err: any) {
      setError(err.response?.data?.message || '인증 코드가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3단계: 비밀번호 재설정
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await axios.post('/api/auth/password-recovery', { action: 'reset', email, newPassword });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgress = () => {
    const steps = [
      { id: 1, label: '이메일 입력' },
      { id: 2, label: '인증 확인' },
      { id: 3, label: '비밀번호 재설정' }
    ];

    return (
      <div className={styles.progressContainer}>
        <div className={styles.progressLine} />
        <div 
          className={styles.progressLineActive} 
          style={{ width: `${((step - 1) / 2) * 100}%` }} 
        />
        {steps.map((s) => (
          <div key={s.id} className={styles.stepWrapper}>
            <div className={`${styles.stepCircle} ${step >= s.id ? styles.stepCircleActive : ''} ${step > s.id ? styles.stepCircleCompleted : ''}`}>
              {step > s.id ? <ShieldCheck size={16} /> : s.id}
            </div>
            <span className={`${styles.stepLabel} ${step === s.id ? styles.stepLabelActive : ''}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.pinIcon}><div className={styles.pinInner}></div></div>
          이음
        </div>
        <h2 className={styles.title}>비밀번호 찾기</h2>
        <p className={styles.subtitle}>
          {step === 4 ? '재설정이 완료되었습니다' : '안전하게 비밀번호를 재설정하세요'}
        </p>
      </div>

      {step !== 4 && renderProgress()}

      {step === 1 && (
        <form className={styles.form} onSubmit={handleRequestCode}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>이메일 주소</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input 
                type="email" 
                className={styles.input} 
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? '요청 중...' : '인증 코드 받기'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form className={styles.form} onSubmit={handleVerifyCode}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>인증 코드 (6자리)</label>
            <div className={styles.inputWrapper}>
              <ShieldCheck className={styles.inputIcon} />
              <input 
                type="text" 
                className={styles.input} 
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>
          {successMsg && <p className={styles.successMessage}>{successMsg}</p>}
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? '확인 중...' : '인증 확인'}
          </button>
        </form>
      )}

      {step === 3 && (
        <form className={styles.form} onSubmit={handleResetPassword}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>새 비밀번호</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input 
                type={showPassword ? "text" : "password"} 
                className={styles.input} 
                placeholder="8자 이상 입력"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>비밀번호 확인</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input 
                type={showPassword ? "text" : "password"} 
                className={styles.input} 
                placeholder="비밀번호 재입력"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, border: 'none', background: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      )}

      {step === 4 && (
        <div className={styles.footer} style={{ marginTop: '20px' }}>
          <div style={{ color: 'var(--color-primary-500)', marginBottom: '10px' }}>
            <CheckCircle2 size={48} strokeWidth={1.5} style={{ margin: '0 auto' }} />
          </div>
          <p style={{ fontSize: '15px', color: 'var(--color-gray-700)', marginBottom: '20px' }}>
            비밀번호가 성공적으로 변경되었습니다.<br/>새로운 비밀번호로 로그인해주세요.
          </p>
          <Link href="/login" className={styles.submitBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
            로그인하러 가기
          </Link>
        </div>
      )}

      {step !== 4 && (
        <div className={styles.footer}>
          <Link href="/login" className={styles.backLink}>
            <ArrowLeft size={16} /> 로그인으로 돌아가기
          </Link>
          <Link href="/" className={styles.backLink}>
            홈으로 돌아가기
          </Link>
        </div>
      )}
    </div>
  );
}
