import React from 'react';
import LoginForm from './_components/LoginForm';
import styles from './login.module.css';

export const metadata = {
  title: '로그인 - 이음(IEUM)',
  description: '전국축제 플랫폼 이음에 로그인하세요.',
};

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <LoginForm />
    </main>
  );
}
