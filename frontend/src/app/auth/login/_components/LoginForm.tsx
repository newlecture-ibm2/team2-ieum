"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import styles from '../login.module.css';

export default function LoginForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [autoLogin, setAutoLogin] = useState(false);
  const [saveId, setSaveId] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  // 아이디 저장된 값 로드
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setSaveId(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    
    // 이메일 정규식 및 단순 검증
    if (!email || !password) {
      setGlobalError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    // eslint-disable-next-line
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setGlobalError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      // Next.js (iron-session) API 호출
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (response.status === 200) {
        if (saveId) {
          localStorage.setItem('savedEmail', email);
        } else {
          localStorage.removeItem('savedEmail');
        }

        window.location.href = '/';
      } else {
        setGlobalError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      // 401 Unauthorized 에러 캐치
      if (error.response?.status === 401) {
        setGlobalError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else {
        setGlobalError('서버와의 통신에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>이음 (IEUM)</h1>
        <p className={styles.subtitle}>당신의 축제를 이어주는 통합 플랫폼</p>
      </div>

      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.inputLabel}>이메일</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} />
            <input 
              id="email"
              type="email" 
              className={`${styles.input} ${globalError.includes('이메일') ? styles.inputError : ''}`} 
              placeholder="example@ieum.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.inputLabel}>비밀번호</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} />
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              className={`${styles.input} ${globalError.includes('일치하지') ? styles.inputError : ''}`} 
              placeholder="8자 이상 영문/숫자 조합"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {globalError && (
          <div className={styles.errorMessage}>
            {globalError}
          </div>
        )}

        <div className={styles.options}>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                className={styles.checkbox}
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
              />
              자동 로그인
            </label>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                className={styles.checkbox}
                checked={saveId}
                onChange={(e) => setSaveId(e.target.checked)}
              />
              아이디 저장
            </label>
          </div>
          <Link href="/auth/forgot" className={styles.forgotLink}>
            비밀번호 찾기
          </Link>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? '인증 중...' : '로그인'}
        </button>
      </form>

      <div className={styles.divider}>
        <span>또는</span>
      </div>

      <div className={styles.socialGroup}>
        <button type="button" className={`${styles.socialBtn} ${styles.kakaoBtn}`}>
          <div className={styles.socialIcon} style={{ background: '#000', opacity: 0.1 }}></div>
          카카오 로그인
        </button>
        <button type="button" className={`${styles.socialBtn} ${styles.naverBtn}`}>
          <div className={styles.socialIcon} style={{ background: '#fff' }}></div>
          네이버 로그인
        </button>
      </div>

      <div className={styles.footer}>
        계정이 없으신가요? 
        <Link href="/auth/register" className={styles.signupLink}>
          회원가입
        </Link>
      </div>
    </div>
  );
}
