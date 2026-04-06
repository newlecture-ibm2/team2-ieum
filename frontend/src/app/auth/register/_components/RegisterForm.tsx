"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import styles from '../register.module.css';

export default function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // 약관 동의
  const [allAgreed, setAllAgreed] = useState(false);
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [errors, setErrors] = useState({
    email: '',
    nickname: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    global: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // 전체 동의 핸들러
  const handleAllAgree = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAllAgreed(checked);
    setAgreements({
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  // 개별 동의 핸들러
  const handleAgree = (key: keyof typeof agreements) => {
    const newAgreements = { ...agreements, [key]: !agreements[key] };
    setAgreements(newAgreements);
    setAllAgreed(newAgreements.terms && newAgreements.privacy && newAgreements.marketing);
  };

  const validate = () => {
    let isValid = true;
    const newErrors = { email: '', nickname: '', phone: '', password: '', passwordConfirm: '', global: '' };

    // 이메일 검증
    // eslint-disable-next-line
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = '이메일을 입력해주세요.';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
      isValid = false;
    }

    // 닉네임 검증
    if (!nickname || nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상 입력해주세요.';
      isValid = false;
    }

    // 전화번호 재포맷팅 및 검증
    const phoneClean = phone.replace(/[^0-9]/g, '');
    if (!phoneClean || phoneClean.length < 10) {
      newErrors.phone = '올바른 전화번호를 입력해주세요.';
      isValid = false;
    }

    // 비밀번호 검증 (8자 이상, 영문 숫자 포함)
    const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
      isValid = false;
    } else if (!pwRegex.test(password)) {
      newErrors.password = '8자 이상, 영문+숫자 기호를 포함해야 합니다.';
      isValid = false;
    }

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
      isValid = false;
    }

    // 필수 약관 검증
    if (!agreements.terms || !agreements.privacy) {
      newErrors.global = '필수 이용약관에 동의해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    let formatted = val;
    if (val.length > 3 && val.length <= 7) {
      formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
    } else if (val.length > 7) {
      formatted = `${val.slice(0, 3)}-${val.slice(3, 7)}-${val.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      // 방금 구축한 백엔드 회원가입 API 연동
      const response = await axios.post('/api/auth/signup', {
        email,
        password,
        nickname,
        phone
      });

      if (response.data.status === 'SUCCESS') {
        alert('회원가입이 성공적으로 완료되었습니다.');
        router.push('/auth/login');
      } else {
        setErrors(prev => ({ ...prev, global: response.data.message || '가입 실패' }));
      }
    } catch (error: any) {
      setErrors(prev => ({ 
        ...prev, 
        global: error.response?.data?.message || '이미 가입된 이메일이거나 닉네임입니다.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !email || !password || !nickname || !agreements.terms || !agreements.privacy || isLoading;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.pinIcon}><div className={styles.pinInner}></div></div>
          이음
        </div>
        <h2 className={styles.title}>회원가입</h2>
        <p className={styles.subtitle}>축제 플랫폼에 오신 것을 환영합니다</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 이메일 */}
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.inputLabel}>이메일 (아이디)</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} />
            <input 
              id="email"
              type="email" 
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`} 
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
        </div>

        {/* 닉네임 */}
        <div className={styles.inputGroup}>
          <label htmlFor="nickname" className={styles.inputLabel}>닉네임</label>
          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} />
            <input 
              id="nickname"
              type="text" 
              className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`} 
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          {errors.nickname && <div className={styles.errorMessage}>{errors.nickname}</div>}
        </div>

        {/* 전화번호 */}
        <div className={styles.inputGroup}>
          <label htmlFor="phone" className={styles.inputLabel}>전화번호</label>
          <div className={styles.inputWrapper}>
            <Phone className={styles.inputIcon} />
            <input 
              id="phone"
              type="text" 
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`} 
              placeholder="010-1234-5678"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={13}
            />
          </div>
          {errors.phone && <div className={styles.errorMessage}>{errors.phone}</div>}
        </div>

        {/* 비밀번호 */}
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.inputLabel}>비밀번호</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} />
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`} 
              placeholder="8자 이상, 영문+숫자 포함"
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
          {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
        </div>

        {/* 비밀번호 확인 */}
        <div className={styles.inputGroup}>
          <label htmlFor="passwordConfirm" className={styles.inputLabel}>비밀번호 확인</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} />
            <input 
              id="passwordConfirm"
              type={showPasswordConfirm ? "text" : "password"} 
              className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ''}`} 
              placeholder="비밀번호 재입력"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            <button 
              type="button" 
              className={styles.eyeButton}
              onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            >
              {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.passwordConfirm && <div className={styles.errorMessage}>{errors.passwordConfirm}</div>}
        </div>

        {/* 약관 동의 */}
        <div className={styles.termsBox}>
          <label className={styles.termsAll}>
            <input type="checkbox" className={styles.checkbox} checked={allAgreed} onChange={handleAllAgree} />
            전체 동의
          </label>
          <label className={styles.termsItem}>
            <input type="checkbox" className={styles.checkbox} checked={agreements.terms} onChange={() => handleAgree('terms')} />
            [필수] 이용약관 동의
            <a href="#">&gt;</a>
          </label>
          <label className={styles.termsItem}>
            <input type="checkbox" className={styles.checkbox} checked={agreements.privacy} onChange={() => handleAgree('privacy')} />
            [필수] 개인정보 처리방침 동의
            <a href="#">&gt;</a>
          </label>
          <label className={styles.termsItem}>
            <input type="checkbox" className={styles.checkbox} checked={agreements.marketing} onChange={() => handleAgree('marketing')} />
            [선택] 마케팅 정보 수신 동의
            <a href="#">&gt;</a>
          </label>
        </div>

        {errors.global && (
          <div className={styles.errorMessage} style={{textAlign: 'center', marginBottom: '8px', fontSize: '13px'}}>
            {errors.global}
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isSubmitDisabled}>
          {isLoading ? '가입 처리 중...' : '회원가입'}
        </button>
      </form>

      <div className={styles.footer}>
        이미 계정이 있으신가요? 
        <Link href="/auth/login" className={styles.loginLink}>
          로그인
        </Link>
      </div>
    </div>
  );
}
