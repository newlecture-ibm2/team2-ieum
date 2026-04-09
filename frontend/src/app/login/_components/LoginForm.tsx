"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import styles from '../login.module.css';

export default function LoginForm() {
  const router = useRouter();
  
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [autoLogin, setAutoLogin] = useState(false);
  const [saveId, setSaveId] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false); // 소셜 로그인 전용 로딩 상태
  const [globalError, setGlobalError] = useState('');

  // 🛡️ 뒤로 가기로 돌아왔을 때 모든 로딩 상태를 강제로 해제합니다 (bfcache 관련)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setIsLoading(false);
        setIsSocialLoading(false);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // 아이디 저장된 값 로드
  useEffect(() => {
    const savedId = localStorage.getItem('savedId');
    if (savedId) {
      setId(savedId);
      setSaveId(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    
    if (!id || !password) {
      setGlobalError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        id,
        password
      });

      if (response.status === 200) {
        if (saveId) {
          localStorage.setItem('savedId', id);
        } else {
          localStorage.removeItem('savedId');
        }

        // 🌟 백엔드에서 전달된 메시지(예: 계정 복구 안내)가 있으면 알림 표시
        const successMsg = response.data?.data?.message;
        if (successMsg) {
          alert(successMsg);
        }

        window.location.href = '/';
      } else {
        setGlobalError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setGlobalError('아이디 또는 비밀번호가 일치하지 않습니다.');
      } else {
        setGlobalError('서버와의 통신에 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 로그인 클릭 시 로딩 표시
  const handleSocialClick = () => {
    setIsSocialLoading(true);
  };

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.logo}>이음 (IEUM)</h1>
        <p className={styles.subtitle}>당신의 축제를 이어주는 통합 플랫폼</p>
      </div>

      <form className={styles.form} onSubmit={handleLogin}>
        <div className={styles.inputGroup}>
          <label htmlFor="id" className={styles.inputLabel}>아이디</label>
          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} />
            <input 
              id="id"
              type="text" 
              className={`${styles.input} ${globalError.includes('아이디') ? styles.inputError : ''}`} 
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
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
              placeholder="비밀번호를 입력하세요"
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
          <Link href="/find-password" className={styles.forgotLink}>
            비밀번호 찾기
          </Link>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading || isSocialLoading}>
          {isLoading ? '인증 중...' : '로그인'}
        </button>
      </form>

      <div className={styles.divider}>
        <span>또는</span>
      </div>

      <div className={styles.socialGroup}>
        {/* ✨ 카카오 로그인 (표준 링크 방식으로 뒤로 가기 문제 해결 및 로고 추가) */}
        <a 
          href={`${API_BASE_URL}/oauth2/authorization/kakao`}
          className={`${styles.socialBtn} ${styles.kakaoBtn} ${isSocialLoading ? styles.btnDisabled : ''}`}
          onClick={handleSocialClick}
        >
          {/* 카카오 공식 로고 SVG */}
          <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3C7.029 3 3 6.12 3 9.967C3 12.43 4.54 14.591 6.84 15.892L6.34 19.528C6.315 19.743 6.438 19.98 6.643 20.082C6.732 20.126 6.83 20.148 6.927 20.148C7.072 20.148 7.215 20.098 7.327 20.007L11.503 16.591C11.666 16.608 11.831 16.618 12 16.618C16.971 16.618 21 13.498 21 9.651C21 5.804 16.971 2.684 12 2.684V3Z" fill="#000000"/>
          </svg>
          {isSocialLoading ? '인증 진행 중...' : '카카오 로그인'}
        </a>

        {/* ✨ 네이버 로그인 (정방향 로고 수정 및 중앙 정렬 최적화) */}
        <a 
          href={`${API_BASE_URL}/oauth2/authorization/naver`}
          className={`${styles.socialBtn} ${styles.naverBtn} ${isSocialLoading ? styles.btnDisabled : ''}`}
          onClick={handleSocialClick}
        >
          {/* 네이버 공식 로고 SVG (정방향 수정) */}
          <svg className={styles.socialIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.273 12.845L7.376 0H0V24H7.727V11.155L16.624 24H24V0H16.273V12.845Z" fill="#FFFFFF"/>
          </svg>
          {isSocialLoading ? '인증 진행 중...' : '네이버 로그인'}
        </a>
      </div>

      <div className={styles.footer}>
        계정이 없으신가요? 
        <Link href="/register" className={styles.signupLink}>
          회원가입
        </Link>
      </div>
    </div>
  );
}
