import React from 'react';
import FindPasswordForm from './_components/FindPasswordForm';
import styles from './find-password.module.css';

export const metadata = {
  title: '비밀번호 찾기 | 이음(IEUM)',
  description: '가입하신 이메일 인증을 통해 비밀번호를 안전하게 재설정할 수 있습니다.',
};

export default function FindPasswordPage() {
  return (
    <div className={styles.container}>
      <FindPasswordForm />
    </div>
  );
}
