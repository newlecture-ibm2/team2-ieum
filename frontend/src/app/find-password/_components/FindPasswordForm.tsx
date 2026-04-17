"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import styles from '../find-password.module.css';

type Step = 1 | 2 | 3 | 4; // 4는 완료 상태

export default function FindPasswordForm() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [id, setId] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1단계: 질문 요청
  const handleRequestQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      setError('아이디를 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      // 📡 백엔드 규격: POST /api/auth/password-recovery/request { id: string }
      // ApiResponse<PasswordRecoveryQuestion> 형태의 응답을 받음
      const response = await axios.post('/api/auth/password-recovery/request', { id });
      setSecurityQuestion(response.data.data.question);
      setStep(2);
      setSuccessMsg('');
    } catch (err: any) {
      setError(err.response?.data?.message || '가입 정보를 찾을 수 없거나 보안 질문이 등록되지 않았습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2단계: 답변 검증
  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer) {
      setError('답변을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      // 📡 백엔드 규격: POST /api/auth/password-recovery/verify { id: string, answer: string }
      await axios.post('/api/auth/password-recovery/verify', { id, answer });
      setStep(3);
      setSuccessMsg('');
    } catch (err: any) {
      setError(err.response?.data?.message || '답변이 일치하지 않습니다.');
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
      // 📡 백엔드 규격: POST /api/auth/password-recovery/reset { id: string, newPassword: string }
      await axios.post('/api/auth/password-recovery/reset', { id, newPassword });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProgress = () => {
    const steps = [
      { id: 1, label: '정보 입력' },
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
        <form className={styles.form} onSubmit={handleRequestQuestion}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>아이디</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input 
                type="text" 
                className={styles.input} 
                placeholder="아이디를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                required
              />
            </div>
          </div>
          <p className={styles.inputDesc}>비밀번호를 찾으려는 계정의 아이디를 입력해주세요.</p>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? '확인 중...' : '다음 단계'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form className={styles.form} onSubmit={handleVerifyAnswer}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>보안 질문</label>
            <div className={styles.questionBox}>
              "{securityQuestion}"
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>답변 입력</label>
            <div className={styles.inputWrapper}>
              <ShieldCheck className={styles.inputIcon} />
              <input 
                type="text" 
                className={styles.input} 
                placeholder="회원가입 시 설정한 답변"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? '확인 중...' : '본인 확인'}
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
