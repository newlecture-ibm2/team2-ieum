"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Phone, Lock, Eye, EyeOff, HelpCircle } from 'lucide-react';
import axios from 'axios';
import styles from '../register.module.css';
import { useToast } from '@/_component/common/Toast';
import { API_STATUS, API_ENDPOINTS } from '@/constants/api';

export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [id, setId] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  
  // 보안 질문
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const SECURITY_QUESTIONS = [
    "가장 기억에 남는 장소는?",
    "나의 고향은 어디인가요?",
    "나의 첫 반려동물 이름은?",
    "가장 좋아하는 색깔은?",
    "나만의 소중한 기념일은?"
  ];

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
    securityQuestion: '',
    securityAnswer: '',
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
        if (!value) error = '닉네임을 입력해주세요.';
        else if (value.length < 2 || value.length > 8) error = '닉네임은 2자 이상 8자 이하로 입력해주세요.';
        else if (/[ㄱ-ㅎ|ㅏ-ㅣ]/.test(value)) error = '닉네임은 완성된 한글로 입력해주세요.';
        else if (!/^[가-힣a-zA-Z0-9]+$/.test(value)) error = '영문, 숫자, 한글만 사용 가능합니다.';
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
      case 'securityQuestion':
        if (!value) error = '보안 질문을 선택해주세요.';
        break;
      case 'securityAnswer':
        if (!value) error = '보안 답변을 입력해주세요.';
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
<<<<<<< HEAD

=======
    const isQuestionValid = validateField('securityQuestion', securityQuestion);
    const isAnswerValid = validateField('securityAnswer', securityAnswer);
    
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
    let isAgreed = true;
    if (!agreements.terms || !agreements.privacy) {
      setErrors(prev => ({ ...prev, global: '필수 이용약관에 동의해주세요.' }));
      isAgreed = false;
    }

    return isIdValid && isNicknameValid && isPhoneValid && isPasswordValid && isPasswordConfirmValid && isQuestionValid && isAnswerValid && isAgreed;
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
      const response = await axios.post(API_ENDPOINTS.AUTH.SIGNUP, {
        id,
        password,
        nickname,
        phone: phone.replace(/[^0-9]/g, ''), 
        termsAgreed: true,
        securityQuestion,
        securityAnswer
      });

      if (response.data.status === API_STATUS.SUCCESS) {
        toast('회원가입이 성공적으로 완료되었습니다.', 'success');
        router.push('/login');
      } else {
        setErrors(prev => ({ ...prev, global: response.data.message || '가입 처리 중 오류가 발생했습니다.' }));
      }
    } catch (error: any) {
<<<<<<< HEAD
      setErrors(prev => ({
        ...prev,
        global: error.response?.data?.message || '이미 가입된 아이디이거나 닉네임입니다.'
=======
      // 🛠️ 백엔드 응답 상태 코드에 따라 사용자에게 명확한 안내 문구 제공
      const status = error.response?.status;
      let globalError = '가입 처리 중 오류가 발생했습니다.';

      if (status === 409) {
        globalError = '이미 가입된 아이디입니다.';
      } else if (status === 500) {
        globalError = '서버 에러로 인하여 관리자에게 문의해주세요.';
      } else if (error.response?.data?.errorMessage) {
        globalError = error.response.data.errorMessage;
      }
      
      setErrors(prev => ({ 
        ...prev, 
        global: globalError
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = !id || !password || !nickname || !securityQuestion || !securityAnswer || !agreements.terms || !agreements.privacy || isLoading;

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
<<<<<<< HEAD
            <Mail className={styles.inputIcon} />
            <input
=======
            <User className={styles.inputIcon} />
            <input 
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
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
<<<<<<< HEAD
              type="text"
              className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`}
              placeholder="닉네임을 입력하세요"
=======
              type="text" 
              className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`} 
              placeholder="닉네임을 입력하세요 (2~8자)"
>>>>>>> ce61236a579d796cf9a033f8ad18fdff8f7fdc97
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                validateField('nickname', e.target.value);
              }}
              maxLength={8}
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

        {/* 보안 질문 */}
        <div className={styles.inputGroup}>
          <label htmlFor="securityQuestion" className={styles.inputLabel}>보안 질문 (비밀번호 찾기용)</label>
          <div className={styles.inputWrapper}>
            <HelpCircle className={styles.inputIcon} />
            <select 
              id="securityQuestion"
              className={`${styles.input} ${errors.securityQuestion ? styles.inputError : ''}`}
              value={securityQuestion}
              onChange={(e) => {
                setSecurityQuestion(e.target.value);
                validateField('securityQuestion', e.target.value);
              }}
              style={{ appearance: 'none', cursor: 'pointer' }}
            >
              <option value="" disabled>질문을 선택하세요</option>
              {SECURITY_QUESTIONS.map((q, idx) => (
                <option key={idx} value={q}>{q}</option>
              ))}
            </select>
            <div className={styles.eyeButton} style={{ pointerEvents: 'none' }}>
              <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--color-gray-400)' }}></div>
            </div>
          </div>
          {errors.securityQuestion && <div className={styles.errorMessage}>{errors.securityQuestion}</div>}
        </div>

        {/* 보안 답변 */}
        <div className={styles.inputGroup}>
          <label htmlFor="securityAnswer" className={styles.inputLabel}>보안 답변</label>
          <div className={styles.inputWrapper}>
            <HelpCircle className={styles.inputIcon} />
            <input 
              id="securityAnswer"
              type="text" 
              className={`${styles.input} ${errors.securityAnswer ? styles.inputError : ''}`} 
              placeholder="답변을 입력하세요"
              value={securityAnswer}
              onChange={(e) => {
                setSecurityAnswer(e.target.value);
                validateField('securityAnswer', e.target.value);
              }}
            />
          </div>
          {errors.securityAnswer && <div className={styles.errorMessage}>{errors.securityAnswer}</div>}
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
          <div className={styles.errorMessage} style={{ textAlign: 'center', marginBottom: '8px', fontSize: '13px', width: '100%' }}>
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
