"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import styles from '../register.module.css';

export default function RegisterForm() {
  const router = useRouter();

  const [id, setId] = useState('');
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
  });

  const [errors, setErrors] = useState({
    id: '',
    nickname: '',
    phone: '',
    password: '',
    passwordConfirm: '',
    global: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // 개별 필드 실시간 검증 로직
  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'id':
        if (!value) error = '아이디를 입력해주세요.';
        else if (value.length < 4) error = '아이디는 4자 이상 입력해주세요.';
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = '영문과 숫자만 사용 가능합니다.';
        break;
      case 'nickname':
        if (!value || value.length < 2) error = '닉네임은 2자 이상 입력해주세요.';
        break;
      case 'password':
        const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!value) error = '비밀번호를 입력해주세요.';
        else if (!pwRegex.test(value)) error = '8자 이상, 영문+숫자를 포함해야 합니다.';
        break;
      case 'passwordConfirm':
        if (value !== password) error = '비밀번호가 일치하지 않습니다.';
        break;
      case 'phone':
        const phoneClean = value.replace(/[^0-9]/g, '');
        if (!phoneClean || phoneClean.length < 10) error = '올바른 전화번호를 입력해주세요.';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  // 전체 동의 핸들러
  const handleAllAgree = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAllAgreed(checked);
    setAgreements({
      terms: checked,
      privacy: checked,
    });
    if (checked) setErrors(prev => ({ ...prev, global: '' }));
  };

  // 개별 동의 핸들러
  const handleAgree = (key: keyof typeof agreements) => {
    const newAgreements = { ...agreements, [key]: !agreements[key] };
    setAgreements(newAgreements);
    setAllAgreed(newAgreements.terms && newAgreements.privacy);
    if (newAgreements.terms && newAgreements.privacy) setErrors(prev => ({ ...prev, global: '' }));
  };

  const validateAll = () => {
    const isIdValid = validateField('id', id);
    const isNicknameValid = validateField('nickname', nickname);
    const isPhoneValid = validateField('phone', phone);
    const isPasswordValid = validateField('password', password);
    const isPasswordConfirmValid = validateField('passwordConfirm', passwordConfirm);
    
    let isAgreed = true;
    if (!agreements.terms || !agreements.privacy) {
      setErrors(prev => ({ ...prev, global: '필수 이용약관에 동의해주세요.' }));
      isAgreed = false;
    }

    return isIdValid && isNicknameValid && isPhoneValid && isPasswordValid && isPasswordConfirmValid && isAgreed;
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
    validateField('phone', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/signup', {
        id,
        password,
        nickname,
        phone: phone.replace(/[^0-9]/g, '') // 📱 백엔드와 정합성을 위해 숫자만 추출해서 전송
      });

      if (response.data.status === 'SUCCESS') {
        alert('회원가입이 성공적으로 완료되었습니다.');
        router.push('/login');
      } else {
        setErrors(prev => ({ ...prev, global: response.data.message || '가입 처리 중 오류가 발생했습니다.' }));
      }
    } catch (error: any) {
      // 🛠️ 백엔드에서 전달한 구체적인 에러 메시지(아이디/전화번호 중복 등)를 그대로 표시
      const serverMessage = error.response?.data?.message || '이미 등록된 정보이거나 가입 형식이 올바르지 않습니다.';
      setErrors(prev => ({ 
        ...prev, 
        global: serverMessage
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !id || !password || !nickname || !agreements.terms || !agreements.privacy || isLoading;

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
        {/* 아이디 */}
        <div className={styles.inputGroup}>
          <label htmlFor="id" className={styles.inputLabel}>아이디</label>
          <div className={styles.inputWrapper}>
            <User className={styles.inputIcon} />
            <input 
              id="id"
              type="text" 
              className={`${styles.input} ${errors.id ? styles.inputError : ''}`} 
              placeholder="영문, 숫자 4자 이상"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                validateField('id', e.target.value);
              }}
            />
          </div>
          {errors.id && <div className={styles.errorMessage}>{errors.id}</div>}
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
              onChange={(e) => {
                setNickname(e.target.value);
                validateField('nickname', e.target.value);
              }}
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
              onChange={(e) => {
                setPassword(e.target.value);
                validateField('password', e.target.value);
              }}
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
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                validateField('passwordConfirm', e.target.value);
              }}
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
        </div>

        {errors.global && (
          <div className={styles.errorMessage} style={{textAlign: 'center', marginBottom: '8px', fontSize: '13px', width: '100%'}}>
            {errors.global}
          </div>
        )}

        <button type="submit" className={styles.submitBtn} disabled={isSubmitDisabled}>
          {isLoading ? '가입 처리 중...' : '회원가입'}
        </button>
      </form>

      <div className={styles.footer}>
        이미 계정이 있으신가요? 
        <Link href="/login" className={styles.loginLink}>
          로그인
        </Link>
      </div>
    </div>
  );
}
