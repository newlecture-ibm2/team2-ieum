import React from 'react';
import RegisterForm from './_components/RegisterForm';
import styles from './register.module.css';

export const metadata = {
  title: '회원가입 - 이음(IEUM)',
  description: '전국축제 플랫폼 이음에 회원가입하세요.',
};

export default function RegisterPage() {
  return (
    <main className={styles.container}>
      <RegisterForm />
    </main>
  );
}
